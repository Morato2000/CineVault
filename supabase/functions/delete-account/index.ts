import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid auth" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Missing required Supabase environment variables");
    return json({ error: "Server configuration error" }, 500);
  }

  const token = authHeader.slice("Bearer ".length);

  const callerClient = createClient(supabaseUrl, anonKey);
  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser(token);

  if (userError || !user) {
    return json({ error: "Invalid session" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Remove the avatar first so a failed cleanup doesn't silently go unnoticed.
  const filePath = `${user.id}/avatar.jpg`;

  const { data: avatarFiles, error: listError } = await adminClient.storage
    .from("avatars")
    .list(user.id, { search: "avatar.jpg" });

  if (listError) {
    console.error("Failed to check avatar:", listError);
    return json({ error: "Could not check account avatar" }, 500);
  }

  const avatarExists = avatarFiles?.some((file) => file.name === "avatar.jpg");

  if (avatarExists) {
    const { error: avatarError } = await adminClient.storage
      .from("avatars")
      .remove([filePath]);

    if (avatarError) {
      console.error("Failed to remove avatar:", avatarError);
      return json({ error: "Could not remove account avatar" }, 500);
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    console.error("Failed to delete account:", deleteError);
    return json({ error: "Failed to delete account" }, 500);
  }

  return json({ success: true });
});
