import { supabase } from "../services/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import {
  IoPersonCircleOutline,
  IoCameraOutline,
  IoKeyOutline,
  IoPencilOutline,
  IoNotificationsOutline,
  IoFilmOutline,
  IoColorPaletteOutline,
  IoSparklesOutline,
  IoAppsOutline,
  IoHomeOutline,
  IoSwapVerticalOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoBookmarkOutline,
  IoCloudUploadOutline,
  IoCloudDownloadOutline,
  IoTrashOutline,
  IoShieldOutline,
  IoChevronForward,
  IoChevronDown,
  IoDesktopOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoMailOutline,
  IoGrid,
  IoList,
} from "react-icons/io5";
import setIconRelease from "../assets/icons/set-icon-release.svg";
import setIconUpcoming from "../assets/icons/set-icon-upcoming.svg";
import setIconPersonalized from "../assets/icons/set-icon-personalized.svg";
import setIconNotification from "../assets/icons/set-icon-notbell.svg";
import setIconAbout from "../assets/icons/set-icon-about.svg";
import setIconDanger from "../assets/icons/set-icon-danger.svg";
import setIconPreferences from "../assets/icons/set-icon-preference.svg";
import setIconWatchlist from "../assets/icons/set-icon-watchlist.svg";
import setIconarrow from "../assets/icons/set-icon-arrow.svg";
import setIconClear from "../assets/icons/set-icon-clear.svg";
import setIconDlp from "../assets/icons/set-icon-dlp.svg";
import setIconDs from "../assets/icons/set-icon-ds.svg";
import setIconDv from "../assets/icons/set-icon-dv.svg";
import setIconExport from "../assets/icons/set-icon-export.svg";
import setIconImport from "../assets/icons/set-icon-import.svg";
import setIconMessage from "../assets/icons/set-icon-message.svg";
import setIconPp from "../assets/icons/set-icon-pp.svg";
import setIconProfile from "../assets/icons/set-icon-profile.svg";
import setIconTheme from "../assets/icons/set-icon-theme.svg";
import setIconVersion from "../assets/icons/set-icon-version.svg";
import Avatar from "../components/common/Avatar";
import { useProfile } from "../context/ProfileContext";
import { usePreferences } from "../context/PreferencesContext";
import { useWatchlist } from "../context/WatchlistContext";
import { useFavorites } from "../context/FavoritesContext";
import { useNotifications } from "../context/NotificationsContext";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/common/Toast";

const BADGE_PURPLE = "#7947C0";

function SectionHeader({
  icon: Icon,
  iconSrc,
  iconBg,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg || BADGE_PURPLE }}
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" className="h-6 w-6" />
          ) : (
            Icon && <Icon className="h-5 w-5 text-white" />
          )}
        </span>

        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked
          ? "justify-end bg-linear-to-b from-[#A855F7] to-[#3B82F6]"
          : "justify-start bg-white/15"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

function IconSegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-white/10">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.label)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === opt.label
              ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          <opt.icon className="h-3.5 w-3.5" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          value === "grid"
            ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
            : "border border-white/10 text-gray-400 hover:bg-white/5"
        }`}
      >
        <IoGrid className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={value === "list"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          value === "list"
            ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
            : "border border-white/10 text-gray-400 hover:bg-white/5"
        }`}
      >
        <IoList className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/5"
      >
        {value}
        <IoChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-indigo-500/30 bg-[#0B0F1A] p-1.5 shadow-xl shadow-black/40">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium ${
                  value === opt
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  iconSrc,
  iconBg,
  label,
  description,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" className="h-6 w-6" />
          ) : (
            <Icon className="h-4 w-4 text-white" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{label}</p>
          {description && (
            <p className="truncate text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function LinkRow({
  icon: Icon,
  iconSrc,
  iconBg,
  label,
  description,
  danger,
  onClick,
  href,
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" className="h-6 w-6" />
          ) : (
            Icon && <Icon className="h-4 w-4 text-white" />
          )}
        </span>

        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              danger ? "text-red-400" : "text-white"
            }`}
          >
            {label}
          </p>

          {description && (
            <p className="truncate text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>

      <IoChevronForward className="h-4 w-4 shrink-0 text-gray-500" />
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="flex items-center justify-between gap-4 py-2.5 hover:bg-white/5"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 py-2.5 text-left hover:bg-white/5"
    >
      {content}
    </button>
  );
}

function ConfirmDialog({
  open,
  disabled = false,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-6"
          >
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold text-white"
            >
              {title}
            </h3>

            <div className="mt-2 text-sm text-gray-400">{description}</div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={disabled}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                  danger
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-linear-to-b from-[#A855F7] to-[#3B82F6]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {disabled ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

async function getCroppedAvatar(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = 256;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    size,
    size,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

function Settings() {
  const {
    profile,
    providerAvatars,
    updateProfile,
    loading: profileLoading,
  } = useProfile();
  const { preferences, updatePreference, updateNotification } =
    usePreferences();
  const { items, clearWatchlist, importWatchlist } = useWatchlist();
  const { clearFavorites } = useFavorites();
  const { addNotification } = useNotifications();
  const { logout } = useAuth();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const formInitialized = useRef(false);
  const [form, setForm] = useState({
    displayName: profile.displayName,
    email: profile.email,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!profileLoading && !formInitialized.current) {
      setForm({
        displayName: profile.displayName,
        email: profile.email,
      });

      formInitialized.current = true;
    }
  }, [profile, profileLoading]);

  const [toastMessage, setToastMessage] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropSaving, setCropSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const cropImageUrlRef = useRef(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const showToast = (msg) => setToastMessage(msg);

  const handleChooseProviderAvatar = async (provider) => {
    const avatarUrl = providerAvatars?.[provider];

    if (!avatarUrl) {
      showToast(
        `${provider === "google" ? "Google" : "Discord"} photo is unavailable.`,
      );
      return;
    }

    setAvatarSaving(true);

    try {
      await updateProfile({ avatar: avatarUrl });

      showToast(`${provider === "google" ? "Google" : "Discord"} photo saved.`);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      showToast(error?.message || "Couldn't update profile picture.");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;

      setChangePasswordOpen(false);
      setNewPassword("");
      showToast("Password updated.");
    } catch (err) {
      showToast(err.message || "Failed to update password.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.");
      return;
    }

    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
    }

    const imageUrl = URL.createObjectURL(file);

    cropImageUrlRef.current = imageUrl;

    setCropImage(imageUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropModalOpen(true);

    e.target.value = "";
  };

  const handleCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCropCancel = () => {
    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
      cropImageUrlRef.current = null;
    }

    setCropImage(null);
    setCropModalOpen(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) {
      return;
    }

    setCropSaving(true);

    try {
      const croppedAvatar = await getCroppedAvatar(
        cropImage,
        croppedAreaPixels,
      );

      await updateProfile({
        avatar: croppedAvatar,
      });

      if (cropImageUrlRef.current) {
        URL.revokeObjectURL(cropImageUrlRef.current);
        cropImageUrlRef.current = null;
      }

      setCropImage(null);
      setCropModalOpen(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);

      showToast("Profile picture updated.");
    } catch (error) {
      console.error("Failed to save avatar:", error);
      showToast(error?.message || "Couldn't save avatar. Please try again.");
    } finally {
      setCropSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (savingProfile) return;

    setSavingProfile(true);

    try {
      const emailChanged =
        form.email.trim().toLowerCase() !== profile.email.trim().toLowerCase();

      await updateProfile({
        displayName: form.displayName,
      });

      if (emailChanged) {
        const { error } = await supabase.auth.updateUser({
          email: form.email.trim(),
        });

        if (error) throw error;

        showToast(
          "Profile updated. Check your email for the confirmation link(s).",
        );
      } else {
        showToast("Profile updated.");
      }
    } catch (err) {
      showToast(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "cinevault-watchlist.json";
    a.click();

    URL.revokeObjectURL(url);

    addNotification({
      title: "Watchlist Exported",
      message: `${items.length} ${
        items.length === 1 ? "title was" : "titles were"
      } exported successfully.`,
      link: "/settings",
    });

    showToast("Watchlist exported.");
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        if (!Array.isArray(parsed)) {
          throw new Error("Invalid format");
        }

        importWatchlist(parsed);

        addNotification({
          title: "Watchlist Imported",
          message: `${parsed.length} ${
            parsed.length === 1 ? "title was" : "titles were"
          } imported successfully.`,
          link: "/watchlist",
        });

        showToast(`Imported ${parsed.length} title(s).`);
      } catch {
        showToast(
          "That file couldn't be read — make sure it's a valid export.",
        );
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearWatchlist = () => {
    if (items.length === 0) {
      setConfirmClear(false);
      showToast("Your watchlist is already empty.");
      return;
    }

    clearWatchlist();
    setConfirmClear(false);

    addNotification({
      title: "Watchlist Cleared",
      message: `${items.length} ${
        items.length === 1 ? "title was" : "titles were"
      } removed from your watchlist.`,
      link: "/watchlist",
    });

    showToast("Watchlist cleared.");
  };

  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;

    setDeletingAccount(true);

    try {
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;

      if (!data?.success) {
        throw new Error("Account deletion was not confirmed.");
      }

      clearWatchlist();
      clearFavorites();
      setConfirmDelete(false);

      const { error: logoutError } = await logout();

      if (logoutError) {
        console.error("Account deleted, but sign-out failed:", logoutError);
      }

      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      showToast("Unable to delete your account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cropImageUrlRef.current) {
        URL.revokeObjectURL(cropImageUrlRef.current);
        cropImageUrlRef.current = null;
      }
    };
  }, []);
  return (
    <div className="px-8 pb-16">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-gray-400">
        Manage your account and application preferences.
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconProfile}
            iconBg="#1C121A"
            title="Profile"
            description="Manage your personal information"
            action={
              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-white/5"
              >
                <IoKeyOutline className="h-4 w-4" />
                Change Password
              </button>
            }
          />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-white/10">
                <Avatar
                  src={profile.avatar}
                  name={profile.displayName}
                  className="h-24 w-24"
                />
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
              >
                <IoCameraOutline className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400">
                  Profile picture
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleChooseProviderAvatar("google")}
                    disabled={!providerAvatars?.google || avatarSaving}
                    className="flex items-center gap-2 rounded-full border border-indigo-500/40 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {providerAvatars?.google && (
                      <img
                        src={providerAvatars.google}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    Use Google photo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChooseProviderAvatar("discord")}
                    disabled={!providerAvatars?.discord || avatarSaving}
                    className="flex items-center gap-2 rounded-full border border-indigo-500/40 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {providerAvatars?.discord && (
                      <img
                        src={providerAvatars.discord}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    Use Discord photo
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Choose a linked account photo or upload your own.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Display Name
                </label>

                <input
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  disabled={savingProfile}
                  className="w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Your handle
                  <span className="ml-1 font-medium text-purple-400">
                    @{profile.username || "generating..."}
                  </span>
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={savingProfile}
                  className="w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IoPencilOutline className="h-4 w-4" />
                {savingProfile ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
        {/* Preferences */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconPreferences}
            iconBg="#101234"
            title="Preferences"
            description="Customize your CineVault experience"
          />

          <div className="mt-3 divide-y divide-white/5">
            <SettingsRow
              iconSrc={setIconTheme}
              iconBg="#101234"
              label="Theme"
              description="Only Dark is available right now"
            >
              <IconSegmentedControl
                options={[
                  { label: "System", icon: IoDesktopOutline },
                  { label: "Light", icon: IoSunnyOutline },
                  { label: "Dark", icon: IoMoonOutline },
                ]}
                value={
                  preferences.theme === "dark"
                    ? "Dark"
                    : preferences.theme === "light"
                      ? "Light"
                      : "System"
                }
                onChange={(v) => {
                  if (v !== "Dark") {
                    showToast(`${v} theme isn't available yet — coming soon.`);
                    return;
                  }
                  updatePreference("theme", "dark");
                }}
              />
            </SettingsRow>
            <SettingsRow
              iconSrc={setIconDlp}
              iconBg="#101234"
              label="Default Landing Page"
              description="Choose landing page on login"
            >
              <Dropdown
                options={["Home", "Explore", "My Watchlist", "Stats"]}
                value={preferences.defaultLandingPage}
                onChange={(v) => updatePreference("defaultLandingPage", v)}
              />
            </SettingsRow>
            <SettingsRow
              iconSrc={setIconDv}
              iconBg="#101234"
              label="Default View"
              description="Choose layout for titles"
            >
              <ViewToggle
                value={preferences.defaultView}
                onChange={(v) => updatePreference("defaultView", v)}
              />
            </SettingsRow>
            <SettingsRow
              iconSrc={setIconDs}
              iconBg="#101234"
              label="Default Sort"
              description="Choose how titles are sorted"
            >
              <Dropdown
                options={["Recently Added", "Highest Rated", "A-Z"]}
                value={preferences.defaultSort}
                onChange={(v) => updatePreference("defaultSort", v)}
              />
            </SettingsRow>
          </div>
        </div>
        {/* Notifications */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconNotification}
            iconBg="#101234"
            title="Notifications"
            description="Choose the updates you want to receive"
          />

          <div className="mt-3 divide-y divide-white/5">
            <SettingsRow
              iconSrc={setIconRelease}
              iconBg="#101234"
              label="New Releases"
              description="Get notified when a new release is out"
            >
              <Toggle
                checked={preferences.notifications.newReleases}
                onChange={(v) => updateNotification("newReleases", v)}
              />
            </SettingsRow>
            <SettingsRow
              iconSrc={setIconUpcoming}
              iconBg="#101234"
              label="Upcoming Movies"
              description="Get notified when a new movie is out"
            >
              <Toggle
                checked={preferences.notifications.upcomingMovies}
                onChange={(v) => updateNotification("upcomingMovies", v)}
              />
            </SettingsRow>
            <SettingsRow
              iconSrc={setIconPersonalized}
              iconBg="#101234"
              label="Personalized Discoveries"
              description="Receive personalized recommendations"
            >
              <Toggle
                checked={preferences.notifications.personalizedDiscoveries}
                onChange={(v) =>
                  updateNotification("personalizedDiscoveries", v)
                }
              />
            </SettingsRow>
            <SettingsRow
              icon={IoMailOutline}
              iconBg="#101234"
              label="Email Notifications"
              description="Get a daily digest of your updates by email"
            >
              <Toggle
                checked={preferences.emailNotifications}
                onChange={(v) => updatePreference("emailNotifications", v)}
              />
            </SettingsRow>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Email notifications are currently in testing and are not yet
            available to all users. We'll enable this feature for everyone once
            setup is complete.
          </p>
        </div>

        {/* Watchlist data */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconWatchlist}
            iconBg="#101234"
            title="Watchlist"
            description="Manage your watchlist data"
          />

          <div className="mt-3 divide-y divide-white/5">
            <LinkRow
              iconSrc={setIconExport}
              iconBg="#101234"
              label="Export Watchlist Data"
              description="Export watchlist as a file"
              onClick={handleExport}
            />
            <LinkRow
              iconSrc={setIconImport}
              iconBg="#101234"
              label="Import Watchlist Data"
              description="Import watchlist from a file"
              onClick={() => fileInputRef.current?.click()}
            />
            <LinkRow
              iconSrc={setIconClear}
              iconBg="#1C121A"
              label="Clear Watchlist Data"
              description="Remove all titles from your watchlist"
              danger
              onClick={() => setConfirmClear(true)}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* About */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconAbout}
            iconBg="#1C121A"
            title="About CineVault"
            description="App information and policy"
          />

          <div className="mt-3 divide-y divide-white/5">
            <SettingsRow
              iconSrc={setIconVersion}
              iconBg="#1C121A"
              label="Version"
            >
              <span className="text-sm font-semibold text-white">V0.0.1</span>
            </SettingsRow>
            <LinkRow
              iconSrc={setIconPp}
              iconBg="#1C121A"
              label="Privacy Policy"
              href="/privacy-policy"
            />
            <LinkRow
              iconSrc={setIconMessage}
              iconBg="#1C121A"
              label="Message Us"
              href="/message-us"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/30 bg-[#0B0F1A] p-5">
          <SectionHeader
            iconSrc={setIconDanger}
            iconBg="#1C121A"
            title="Danger Zone"
            description="Irreversible and permanent actions"
          />

          <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div>
              <p className="text-sm font-semibold text-red-400">
                Delete Account
              </p>
              <p className="text-xs text-gray-400">
                This will permanently delete your CineVault account and its
                associated account data. You’ll be signed out, and this action
                cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 rounded-full border border-red-500/50 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] shadow-2xl shadow-black/50">
            <div className="border-b border-white/10 px-5 py-4">
              <h3 className="text-lg font-bold text-white">
                Adjust Profile Picture
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Drag the image to position it and use the slider to zoom.
              </p>
            </div>

            <div className="relative h-[320px] w-full bg-black">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Zoom</span>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-purple-500"
                />

                <span className="w-10 text-right text-xs text-gray-400">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  disabled={cropSaving}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCropSave}
                  disabled={!croppedAreaPixels || cropSaving}
                  className="rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cropSaving ? "Saving..." : "Save Picture"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmClear}
        title="Clear Watchlist Data"
        description="This removes every title from your watchlist. This can't be undone."
        confirmLabel="Clear Watchlist"
        danger
        onConfirm={handleClearWatchlist}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        disabled={deletingAccount}
        title="Delete Account"
        description="This clears your watchlist, favorites, and profile from this browser, and signs you out. This can't be undone."
        confirmLabel="Delete Everything"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={changePasswordOpen}
        title="Change Password"
        description={
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            aria-label="New password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
          />
        }
        confirmLabel="Update Password"
        onConfirm={handleChangePassword}
        onCancel={() => {
          setChangePasswordOpen(false);
          setNewPassword("");
        }}
      />

      <Toast
        message={toastMessage}
        show={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default Settings;
