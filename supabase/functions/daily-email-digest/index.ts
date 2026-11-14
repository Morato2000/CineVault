import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SITE_URL = "https://cinetome.odderaticstudio.com";
const SENDER = "Cinetome <digest@mail.odderaticstudio.com>";
const TMDB_API = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

type Notification = {
  id: number;
  title: string | null;
  message: string | null;
  image: string | null;
  link: string | null;
  created_at: string;
};

type WatchlistItem = {
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  first_air_date: string | null;
  status: string | null;
  genre_ids: number[] | null;
};

type RatingItem = {
  media_type: string;
  genre_ids: number[] | null;
};

type DigestItem = {
  title: string;
  date?: string;
  image?: string | null;
  link: string;
  description?: string;
};

type DigestSections = {
  notifications: Notification[];
  upcoming: DigestItem[];
  available: DigestItem[];
  episodes: DigestItem[];
  recommendations: DigestItem[];
  news: DigestItem[];
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

function safeDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null): string {
  const date = safeDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getLagosDate(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isRecentCalendarDate(value?: string | null): boolean {
  if (!value) return false;

  const date = value.slice(0, 10);
  const today = getLagosDate();
  const yesterday = addDays(today, -1);

  return date >= yesterday && date <= today;
}

function tmdbImage(path?: string | null): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}${path}`;
}

function safeInternalLink(value: string): string | null {
  try {
    const url = new URL(value, SITE_URL);

    if (url.origin !== new URL(SITE_URL).origin) return null;

    return url.toString();
  } catch {
    return null;
  }
}

async function tmdbRequest(path: string, token: string): Promise<any | null> {
  try {
    const response = await fetch(`${TMDB_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("TMDB request failed:", {
        path,
        status: response.status,
      });

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Could not contact TMDB:", path, error);
    return null;
  }
}

function renderNotification(item: Notification): string {
  const title = escapeHtml(item.title || "Cinetome update");
  const message = escapeHtml(item.message || "");
  const link = item.link ? safeInternalLink(item.link) : null;

  return `
    <div style="padding:18px 0;border-bottom:1px solid #26334c;">
      <div style="font-size:15px;font-weight:700;color:#ffffff;">
        ${title}
      </div>

      <p style="margin:8px 0;color:#aab5c9;font-size:14px;line-height:1.6;">
        ${message}
      </p>

      ${
        link
          ? `<a href="${escapeHtml(link)}"
               style="color:#a78bfa;text-decoration:none;font-size:13px;">
               View update →
             </a>`
          : ""
      }
    </div>
  `;
}

function renderDigestItem(item: DigestItem): string {
  const image = item.image
    ? `<img src="${escapeHtml(item.image)}"
         width="76" height="108"
         alt=""
         style="display:block;width:76px;height:108px;object-fit:cover;border-radius:7px;background:#151d30;">`
    : "";

  const link = safeInternalLink(item.link);

  return `
    <tr>
      <td width="88" valign="top" style="padding:12px 12px 12px 0;">
        ${image}
      </td>

      <td valign="top" style="padding:12px 0;">
        <div style="font-size:15px;font-weight:700;color:#ffffff;">
          ${escapeHtml(item.title)}
        </div>

        ${
          item.date
            ? `<div style="font-size:12px;color:#a78bfa;margin-top:6px;">
                 ${escapeHtml(formatDate(item.date))}
               </div>`
            : ""
        }

        ${
          item.description
            ? `<div style="font-size:13px;color:#aab5c9;margin-top:6px;line-height:1.5;">
                 ${escapeHtml(item.description)}
               </div>`
            : ""
        }

        ${
          link
            ? `<a href="${escapeHtml(link)}"
                 style="display:inline-block;margin-top:9px;color:#a78bfa;font-size:13px;text-decoration:none;">
                 Explore →
               </a>`
            : ""
        }
      </td>
    </tr>
  `;
}

function renderSection(title: string, content: string): string {
  if (!content) return "";

  return `
    <section style="margin-top:30px;">
      <h2 style="font-size:17px;color:#ffffff;margin:0 0 12px;">
        ${escapeHtml(title)}
      </h2>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
          ${content}
        </tbody>
      </table>
    </section>
  `;
}

function buildEmail(name: string, sections: DigestSections): string {
  const sectionsHtml = [
    renderSection(
      "Your unread updates",
      sections.notifications.map(renderNotification).join(""),
    ),
    renderSection(
      "Coming up next",
      sections.upcoming.map(renderDigestItem).join(""),
    ),
    renderSection(
      "Now available",
      sections.available.map(renderDigestItem).join(""),
    ),
    renderSection(
      "New episodes",
      sections.episodes.map(renderDigestItem).join(""),
    ),
    renderSection(
      "Picked for you",
      sections.recommendations.map(renderDigestItem).join(""),
    ),
    renderSection(
      "Cinetome news & features",
      sections.news.map(renderDigestItem).join(""),
    ),
  ].join("");

  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello,";

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#080d17;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
        <div style="max-width:620px;margin:0 auto;padding:30px 20px;">

          <div style="padding:25px;background:linear-gradient(135deg,#17112d,#101c36);border:1px solid #3d5b9e;border-radius:14px;">

            <div style="font-size:25px;font-weight:800;letter-spacing:-1px;">
              Cine<span style="color:#a855f7;">tome</span>
            </div>

            <div style="margin-top:24px;color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;">
              YOUR DAILY ENTERTAINMENT BRIEFING
            </div>

            <h1 style="font-size:25px;line-height:1.3;margin:12px 0;">
              Your day in entertainment.
            </h1>

            <p style="font-size:14px;line-height:1.7;color:#c0c9dc;margin:0;">
              ${greeting}<br>
              Here's what's happening around your watchlist.
            </p>
          </div>

          ${sectionsHtml}

          <div style="margin-top:35px;padding:22px;background:#0b0f1a;border:1px solid #26334c;border-radius:12px;text-align:center;">
            <p style="font-size:14px;color:#c0c9dc;line-height:1.6;">
              Your watchlist, your discoveries, all in one place.
            </p>

            <a href="${SITE_URL}/watchlist"
               style="display:inline-block;background:linear-gradient(90deg,#a855f7,#3b82f6);color:#ffffff;padding:12px 22px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:700;">
              Open Cinetome
            </a>
          </div>

          <div style="margin-top:30px;text-align:center;color:#75819a;font-size:11px;line-height:1.8;">
            You're receiving this because Email Notifications are enabled
            in your Cinetome preferences.<br>

            <a href="${SITE_URL}/settings"
               style="color:#a78bfa;text-decoration:none;">
              Manage email preferences
            </a>

            <br><br>
            © ${new Date().getFullYear()} Cinetome
          </div>

        </div>
      </body>
    </html>
  `;
}

async function buildSections(
  db: any,
  userId: string,
  tmdbToken: string,
): Promise<DigestSections> {
  const sections: DigestSections = {
    notifications: [],
    upcoming: [],
    available: [],
    episodes: [],
    recommendations: [],
    news: [],
  };

  // Unread notifications created within the last 24 hours.
  const notificationCutoff = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: notifications, error: notificationError } = await db
    .from("notifications")
    .select("id,title,message,image,link,created_at")
    .eq("user_id", userId)
    .eq("read", false)
    .eq("emailed", false)
    .gte("created_at", notificationCutoff)
    .order("created_at", { ascending: false })
    .limit(20);

  if (notificationError) {
    throw new Error("Could not retrieve notifications.");
  }

  sections.notifications = notifications ?? [];

  // Retrieve the user's watchlist.
  const { data: watchlist, error: watchlistError } = await db
    .from("watchlist_items")
    .select(
      "tmdb_id,media_type,title,poster_path,release_date,first_air_date,status,genre_ids",
    )
    .eq("user_id", userId)
    .limit(100);

  if (watchlistError) {
    console.error("Watchlist query failed:", {
      code: watchlistError.code,
      message: watchlistError.message,
      details: watchlistError.details,
      hint: watchlistError.hint,
    });

    throw new Error(`Could not retrieve watchlist: ${watchlistError.message}`);
  }

  const items = (watchlist ?? []) as WatchlistItem[];

  const today = getLagosDate();
  const yesterday = addDays(today, -1);
  const upcomingLimit = addDays(today, 30);

  // Fetch TV details in small parallel batches.
  const tvItems = items.filter((item) => item.media_type === "tv");

  const tvDetails = new Map<number, any>();

  for (let i = 0; i < tvItems.length; i += 8) {
    const batch = tvItems.slice(i, i + 8);

    const results = await Promise.all(
      batch.map(async (item) => ({
        id: item.tmdb_id,
        details: await tmdbRequest(`/tv/${item.tmdb_id}`, tmdbToken),
      })),
    );

    for (const result of results) {
      if (result.details) {
        tvDetails.set(result.id, result.details);
      }
    }
  }

  for (const item of items) {
    const isMovie = item.media_type === "movie";
    const isTv = item.media_type === "tv";

    if (!isMovie && !isTv) continue;

    const title = item.title;
    const image = tmdbImage(item.poster_path);

    // Actual Cinetome detail routes.
    const link = `${SITE_URL}/${item.media_type}/${item.tmdb_id}`;

    if (isMovie) {
      const releaseDate = item.release_date;

      if (releaseDate && releaseDate > today && releaseDate <= upcomingLimit) {
        sections.upcoming.push({
          title,
          date: releaseDate,
          image,
          link,
          description: "Upcoming movie on your watchlist",
        });
      }

      if (item.status === "Released" && isRecentCalendarDate(releaseDate)) {
        sections.available.push({
          title,
          date: releaseDate!,
          image,
          link,
          description: "Recently released movie on your watchlist",
        });
      }
    }

    if (isTv) {
      const details = tvDetails.get(item.tmdb_id);

      if (!details) continue;

      const firstAirDate = details.first_air_date || item.first_air_date;

      if (
        firstAirDate &&
        firstAirDate > today &&
        firstAirDate <= upcomingLimit
      ) {
        sections.upcoming.push({
          title,
          date: firstAirDate,
          image,
          link,
          description: "Upcoming series premiere",
        });
      }

      const nextEpisode = details.next_episode_to_air;

      if (
        nextEpisode?.air_date &&
        nextEpisode.air_date > today &&
        nextEpisode.air_date <= upcomingLimit
      ) {
        sections.upcoming.push({
          title: `${title} — ${
            nextEpisode.name || `Episode ${nextEpisode.episode_number}`
          }`,
          date: nextEpisode.air_date,
          image,
          link,
          description: "Next episode",
        });
      }

      const lastEpisode = details.last_episode_to_air;

      if (lastEpisode?.air_date && isRecentCalendarDate(lastEpisode.air_date)) {
        sections.episodes.push({
          title: `${title} — ${
            lastEpisode.name || `Episode ${lastEpisode.episode_number}`
          }`,
          date: lastEpisode.air_date,
          image,
          link,
          description: "A new episode has aired",
        });
      }

      if (isRecentCalendarDate(firstAirDate)) {
        sections.available.push({
          title,
          date: firstAirDate!,
          image,
          link,
          description: "New series premiere",
        });
      }
    }
  }

  // Personalised recommendations based on saved genres.
  const { data: ratings, error: ratingsError } = await db
    .from("ratings")
    .select("genre_ids,media_type,tmdb_id")
    .eq("user_id", userId)
    .limit(50);

  if (ratingsError) {
    throw new Error("Could not retrieve ratings.");
  }

  // Movie and TV genre IDs are evaluated separately.
  const genreCounts = new Map<string, number>();

  for (const item of [...items, ...(ratings ?? [])]) {
    if (item.media_type !== "movie" && item.media_type !== "tv") {
      continue;
    }

    for (const genreId of item.genre_ids ?? []) {
      const key = `${item.media_type}:${genreId}`;

      genreCounts.set(key, (genreCounts.get(key) ?? 0) + 1);
    }
  }

  const watchedIds = new Map<string, Set<number>>([
    [
      "movie",
      new Set(
        items
          .filter((item) => item.media_type === "movie")
          .map((item) => item.tmdb_id),
      ),
    ],
    [
      "tv",
      new Set(
        items
          .filter((item) => item.media_type === "tv")
          .map((item) => item.tmdb_id),
      ),
    ],
  ]);

  for (const mediaType of ["movie", "tv"]) {
    const preferredGenres = [...genreCounts.entries()]
      .filter(([key]) => key.startsWith(`${mediaType}:`))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key.split(":")[1]);

    if (preferredGenres.length === 0) continue;

    const genreQuery = preferredGenres.join(",");

    const recommendations = await tmdbRequest(
      `/discover/${mediaType}?with_genres=${genreQuery}&sort_by=popularity.desc&include_adult=false&page=1`,
      tmdbToken,
    );

    for (const result of recommendations?.results ?? []) {
      if (sections.recommendations.length >= 5) break;

      if (watchedIds.get(mediaType)?.has(result.id)) continue;

      const recommendationTitle = result.title || result.name;

      if (!recommendationTitle) continue;

      sections.recommendations.push({
        title: recommendationTitle,
        image: tmdbImage(result.poster_path),
        link: `${SITE_URL}/${mediaType}/${result.id}`,
        description: "Selected from genres you enjoy",
      });
    }

    if (sections.recommendations.length >= 5) break;
  }

  return sections;
}

function hasContent(sections: DigestSections): boolean {
  return Object.values(sections).some((items) => items.length > 0);
}

export default {
  fetch: withSupabase({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const tmdbToken = Deno.env.get("TMDB_ACCESS_TOKEN");

    if (!resendApiKey || !tmdbToken) {
      return Response.json(
        { error: "Required email or TMDB configuration is missing." },
        { status: 500 },
      );
    }

    const db = ctx.supabaseAdmin;
    const digestDate = getLagosDate();

    const { data: preferences, error: preferencesError } = await db
      .from("preferences")
      .select("user_id")
      .eq("email_notifications", true);

    if (preferencesError) {
      console.error("Could not retrieve preferences.");

      return Response.json(
        { error: "Could not retrieve preferences." },
        { status: 500 },
      );
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const preference of preferences ?? []) {
      const userId = preference.user_id;

      // Claim this user's digest for the current Lagos day.
      const { error: claimError } = await db.from("digest_deliveries").insert({
        user_id: userId,
        digest_date: digestDate,
        status: "processing",
      });

      if (claimError) {
        if (claimError.code !== "23505") {
          console.error("Could not claim digest delivery:", {
            userId,
            error: claimError.message,
          });

          failed++;
          continue;
        }

        // Only retry a delivery explicitly marked failed.
        const { data: retryClaim } = await db
          .from("digest_deliveries")
          .update({
            status: "processing",
            error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("digest_date", digestDate)
          .eq("status", "failed")
          .select("id")
          .maybeSingle();

        if (!retryClaim) {
          skipped++;
          continue;
        }
      }

      // Once a request is sent to Resend, a network failure
      // can leave delivery uncertain. Do not automatically
      // retry that uncertain request.
      let sendAttempted = false;

      try {
        const { data: userData, error: userError } =
          await db.auth.admin.getUserById(userId);

        if (userError || !userData?.user?.email) {
          throw new Error("Could not retrieve recipient email.");
        }

        const { data: profile } = await db
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .maybeSingle();

        const sections = await buildSections(db, userId, tmdbToken);

        if (!hasContent(sections)) {
          await db
            .from("digest_deliveries")
            .update({
              status: "skipped",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("digest_date", digestDate);

          skipped++;
          continue;
        }

        const totalUpdates =
          sections.notifications.length +
          sections.upcoming.length +
          sections.available.length +
          sections.episodes.length +
          sections.recommendations.length;

        sendAttempted = true;

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: SENDER,
            to: [userData.user.email],
            subject: `Your Cinetome Daily Digest — ${totalUpdates} updates`,
            html: buildEmail(profile?.display_name ?? "", sections),
          }),
        });

        if (!response.ok) {
          const details = await response.text();

          await db
            .from("digest_deliveries")
            .update({
              status: "failed",
              error: `Resend rejected email: ${response.status}`,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("digest_date", digestDate)
            .eq("status", "processing");

          console.error("Resend rejected digest:", {
            userId,
            status: response.status,
            details,
          });

          failed++;
          continue;
        }

        const resendResult = await response.json();

        // Record the accepted email before marking notifications.
        const { data: delivery, error: deliveryError } = await db
          .from("digest_deliveries")
          .update({
            status: "sent",
            resend_email_id: resendResult.id ?? null,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("digest_date", digestDate)
          .eq("status", "processing")
          .select("id")
          .maybeSingle();

        if (deliveryError || !delivery) {
          console.error(
            "Email accepted, but delivery record update failed:",
            userId,
          );

          // Leave processing in place to avoid accidental resend.
          failed++;
          continue;
        }

        const notificationIds = sections.notifications.map((item) => item.id);

        if (notificationIds.length > 0) {
          const { error: notificationUpdateError } = await db
            .from("notifications")
            .update({ emailed: true })
            .eq("user_id", userId)
            .eq("emailed", false)
            .in("id", notificationIds);

          if (notificationUpdateError) {
            console.error(
              "Could not update emailed notification flags:",
              userId,
            );
          }
        }

        sent++;
      } catch (error) {
        console.error("Digest processing failed:", {
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Do not mark uncertain Resend attempts as retryable.
        if (!sendAttempted) {
          await db
            .from("digest_deliveries")
            .update({
              status: "failed",
              error:
                error instanceof Error
                  ? error.message.slice(0, 500)
                  : "Unknown error",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("digest_date", digestDate)
            .eq("status", "processing");
        }

        failed++;
      }
    }

    return Response.json({
      success: failed === 0,
      digestDate,
      usersSent: sent,
      usersSkipped: skipped,
      usersFailed: failed,
    });
  }),
};
