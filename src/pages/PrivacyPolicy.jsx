
import BackButton from "../components/common/BackButton";

function PrivacyPolicy() {
  return (
    <div className="px-8 pb-16">
      <BackButton />

      <h1 className="mt-4 text-2xl font-bold text-white">
        Privacy Policy
      </h1>

      <p className="mt-1 text-gray-400">Last updated October 2026</p>

      <div className="mt-6 max-w-3xl space-y-6 text-sm leading-relaxed text-gray-300">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            1. Introduction
          </h2>
          <p>
            Welcome to CineVault. Your privacy matters to us. This Privacy
            Policy explains what information CineVault collects, how it is
            used, where it is stored, and the choices you have when using
            the application.
          </p>
          <p>
            By using CineVault, you acknowledge the practices described in
            this policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            2. Information We Collect
          </h2>
          <p>
            Depending on how you use CineVault, the following information
            may be collected or stored:
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Account information:</strong>{" "}
              Information used to create and manage your account, such as
              your email address and authentication details.
            </li>
            <li>
              <strong className="text-white">Profile information:</strong>{" "}
              Information associated with your CineVault profile.
            </li>
            <li>
              <strong className="text-white">Watchlist and favorites:</strong>{" "}
              Movies and TV shows you save, mark as favorites, or track.
            </li>
            <li>
              <strong className="text-white">Ratings and preferences:</strong>{" "}
              Ratings, viewing preferences, and other settings you configure.
            </li>
            <li>
              <strong className="text-white">Notifications:</strong>{" "}
              Notification settings, notification records, and related
              information used to provide app notifications.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            3. How We Use Your Information
          </h2>
          <p>Information collected by CineVault is used to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Create and manage user accounts.</li>
            <li>Authenticate users and maintain secure sessions.</li>
            <li>Save and synchronize watchlists and favorites.</li>
            <li>Store ratings and user preferences.</li>
            <li>Provide notification features.</li>
            <li>Maintain, troubleshoot, and improve the application.</li>
          </ul>
          <p>
            CineVault does not sell your personal information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            4. Where Your Information Is Stored
          </h2>
          <p>
            CineVault uses{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Supabase
            </a>{" "}
            for authentication and database services. Account information,
            profiles, watchlists, ratings, preferences, and notification
            records may be stored securely through these services.
          </p>
          <p>
            CineVault is hosted using{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Vercel
            </a>
            . These service providers process information as necessary to
            provide their infrastructure and services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            5. Third-Party Services
          </h2>
          <p>
            CineVault relies on third-party services to provide certain
            features:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">The Movie Database (TMDB):</strong>{" "}
              Movie and TV information, including titles, posters, ratings,
              cast, and other metadata, is retrieved through the TMDB API.
              This product uses the TMDB API but is not endorsed or certified
              by TMDB.
            </li>
            <li>
              <strong className="text-white">Supabase:</strong>{" "}
              Provides account authentication and database services.
            </li>
            <li>
              <strong className="text-white">Vercel:</strong>{" "}
              Provides application hosting and delivery infrastructure.
            </li>
          </ul>
          <p>
            These third-party services have their own privacy policies and
            practices. We encourage you to review them.
          </p>
          <p>
            <a
              href="https://www.themoviedb.org/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              TMDB Privacy Policy
            </a>
            {" · "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Supabase Privacy Policy
            </a>
            {" · "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Vercel Privacy Policy
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            6. Data Security
          </h2>
          <p>
            We take reasonable steps to protect information stored and
            processed by CineVault. However, no method of online transmission
            or electronic storage is completely secure, and absolute security
            cannot be guaranteed.
          </p>
          <p>
            Users should keep their account credentials confidential and
            avoid sharing access to their accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            7. Data Retention and Account Deletion
          </h2>
          <p>
            Your account information and associated data are retained while
            your account remains active, unless a longer retention period is
            required for legitimate purposes or applicable legal obligations.
          </p>
          <p>
            You can request deletion of your account through the Delete
            Account option in Settings, where available. Account deletion
            removes your account and associated CineVault records, subject
            to any information that must be retained by law or by service
            providers under their own retention policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            8. Your Privacy Choices
          </h2>
          <p>
            You may access and update information through your account
            settings where those features are available. You may also request
            account deletion using the available account deletion feature.
          </p>
          <p>
            Depending on your location, you may have additional rights to
            access, correct, delete, or request a copy of your personal
            information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            9. Children's Privacy
          </h2>
          <p>
            CineVault is not knowingly designed to collect personal
            information from children without appropriate authorization.
            If you believe a child has provided personal information without
            the required consent, please contact us so the matter can be
            reviewed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            10. Changes to This Policy
          </h2>
          <p>
            This Privacy Policy may be updated as CineVault develops or its
            data practices change. Any changes will be reflected on this page
            with an updated revision date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">
            11. Contact
          </h2>
          <p>
            If you have questions, concerns, or requests regarding this
            Privacy Policy or your personal information, please contact the
            CineVault project owner through the available project contact
            channel.
          </p>
        </section>

        <p className="border-t border-white/10 pt-4 text-xs text-gray-500">
          CineVault is an independent movie and TV discovery project.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
