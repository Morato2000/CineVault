import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type DigestNotification = {
  id: number;
  title: string;
  message: string;
  image: string | null;
  link: string | null;
  created_at: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function buildEmail(notifications: DigestNotification[]): string {
  const items = notifications
    .map((notification) => {
      const title = escapeHtml(notification.title);
      const message = escapeHtml(notification.message);
      const link = safeUrl(notification.link);

      return `
      <li style="margin-bottom:20px;">
        <strong>${title}</strong>
        <p>${message}</p>
        ${
          link
            ? `<p><a href="${escapeHtml(link)}">View in CineVault</a></p>`
            : ""
        }
        <small>${escapeHtml(
          new Date(notification.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }),
        )}</small>
      </li>
    `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033;">
      <h1>CineVault Daily Digest</h1>
      <p>Here are your latest updates from CineVault.</p>
      <ul style="padding-left:20px;">${items}</ul>
      <p>You are receiving this email because email notifications are enabled
      in your CineVault preferences.</p>
    </div>
  `;
}

export default {
  fetch: withSupabase({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return Response.json(
        { error: "Email service is not configured" },
        { status: 500 },
      );
    }

    const db = ctx.supabaseAdmin;

    const { data: preferences, error: preferencesError } = await db
      .from("preferences")
      .select("user_id")
      .eq("email_notifications", true);

    if (preferencesError) {
      console.error("Could not retrieve email preferences:", preferencesError);
      return Response.json(
        { error: "Could not retrieve preferences" },
        { status: 500 },
      );
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const preference of preferences ?? []) {
      const userId = preference.user_id;
      const testUserId = Deno.env.get("RESEND_TEST_USER_ID");

      if (!testUserId || userId !== testUserId) {
        skipped++;
        continue;
      }

      const { data: notifications, error: notificationsError } = await db
        .from("notifications")
        .select("id,title,message,image,link,created_at")
        .eq("user_id", userId)
        .eq("emailed", false)
        .order("created_at", { ascending: true })
        .limit(20);

      if (notificationsError) {
        console.error("Could not retrieve a user's notifications.");
        failed++;
        continue;
      }

      const items = (notifications ?? []) as DigestNotification[];

      if (items.length === 0) {
        skipped++;
        continue;
      }

      const { data: userData, error: userError } =
        await db.auth.admin.getUserById(userId);

      if (userError) {
        console.error("Could not retrieve a digest recipient.");
        failed++;
        continue;
      }

      const email = userData?.user?.email;
      const testRecipient = Deno.env
        .get("RESEND_TEST_RECIPIENT")
        ?.trim()
        .toLowerCase();

      if (!email || !testRecipient) {
        skipped++;
        continue;
      }

      let response: Response;

      try {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CineVault <onboarding@resend.dev>",
            to: [testRecipient],
            subject: `Your CineVault Daily Digest (${items.length} updates)`,
            html: buildEmail(items),
          }),
        });
      } catch {
        console.error("Could not contact the email provider.");
        failed++;
        continue;
      }

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Email provider rejected a digest:", {
          status: response.status,
          details: errorDetails,
        });
        failed++;
        continue;
      }

      // Mark only the notification IDs included in the successful email.
      const notificationIds = items.map((item) => item.id);

      const { error: updateError } = await db
        .from("notifications")
        .update({ emailed: true })
        .eq("user_id", userId)
        .eq("emailed", false)
        .in("id", notificationIds);

      if (updateError) {
        // The email was sent, but these records may be retried later.
        console.error("Email sent, but notification status update failed.");
        failed++;
        continue;
      }

      sent++;
    }

    return Response.json({
      success: failed === 0,
      usersSent: sent,
      usersSkipped: skipped,
      usersFailed: failed,
    });
  }),
};
