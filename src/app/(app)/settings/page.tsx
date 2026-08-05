import type { Metadata } from "next";

import { auth } from "@/auth";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your account and profile.
        </p>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-white/[0.08] bg-[#141417] p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Profile
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Your name is shown next to the decisions and changelog entries you
            create.
          </p>
          <ProfileForm
            name={session?.user?.name ?? ""}
            email={session?.user?.email ?? ""}
          />
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#141417] p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Password
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Choose a strong password you don&apos;t use anywhere else.
          </p>
          <PasswordForm />
        </section>

        <section className="rounded-xl border border-red-500/15 bg-red-500/[0.03] p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Delete Account
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Deleting your account permanently removes it along with all
            decisions and changelog entries you created. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  );
}
