// cspell:words supabase SupabaseClient
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  displayName: "",
  username: "",
  email: "",
  avatar: null,
};
function getProviderAvatar(user, provider) {
  const identity = user?.identities?.find((item) => item.provider === provider);

  const data = identity?.identity_data ?? {};

  return data.avatar_url || data.picture || data.avatar || null;
}
function getGoogleProfile(user) {
  const metadata = user?.user_metadata ?? {};
  const googleIdentity =
    user?.identities?.find((identity) => identity.provider === "google")
      ?.identity_data ?? {};

  return {
    displayName:
      metadata.full_name ||
      metadata.name ||
      googleIdentity.full_name ||
      googleIdentity.name ||
      "",
    avatar:
      metadata.avatar_url ||
      metadata.picture ||
      googleIdentity.avatar_url ||
      googleIdentity.picture ||
      null,
  };
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const providerAvatars = {
    google: getProviderAvatar(user, "google"),
    discord: getProviderAvatar(user, "discord"),
  };

  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("profiles")
      .select("display_name, username, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;

        const googleProfile = getGoogleProfile(user);

        if (error) {
          console.error("Failed to load profile:", error);

          setProfile({
            ...DEFAULT_PROFILE,
            displayName: googleProfile.displayName,
            email: user.email || "",
            avatar: googleProfile.avatar,
          });
        } else {
          setProfile({
            displayName: data?.display_name || googleProfile.displayName,
            username: data?.username || "",
            email: user.email || "",
            avatar: data?.avatar_url || googleProfile.avatar,
          });
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const uploadAvatar = async (blob) => {
    const filePath = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    // Cache-bust so the new avatar shows immediately instead of a stale CDN copy
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    let avatarUrl = updates.avatar;

    if (updates.avatar instanceof Blob) {
      avatarUrl = await uploadAvatar(updates.avatar);
    } else if (
      typeof updates.avatar === "string" &&
      updates.avatar.startsWith("data:")
    ) {
      avatarUrl = await uploadAvatar(dataUrlToBlob(updates.avatar));
    }

    const dbUpdates = {};

    if (updates.displayName !== undefined) {
      dbUpdates.display_name = updates.displayName;
    }

    // The database generates username from display_name.
    // Do not allow the handle to be edited independently.
    if (avatarUrl !== undefined) {
      dbUpdates.avatar_url = avatarUrl;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", user.id)
      .select("display_name, username, avatar_url")
      .single();

    if (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }

    setProfile((prev) => ({
      ...prev,
      displayName: data.display_name || "",
      username: data.username || "",
      avatar: data.avatar_url || prev.avatar,
    }));
  };

  const resetProfile = () => setProfile(DEFAULT_PROFILE);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        providerAvatars,
        loading,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
