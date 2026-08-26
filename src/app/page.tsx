import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "RatioLog — Remember why you decided",
  description:
    "A lightweight log of your project's technical decisions — the context, the call, and the tradeoffs. Capture decisions in minutes and let the changelog write itself.",
  openGraph: {
    title: "RatioLog — Remember why you decided",
    description:
      "A lightweight log of your project's technical decisions — the context, the call, and the tradeoffs.",
    type: "website",
    siteName: "RatioLog",
  },
  twitter: {
    card: "summary",
    title: "RatioLog — Remember why you decided",
    description:
      "A lightweight log of your project's technical decisions — the context, the call, and the tradeoffs.",
  },
};

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/decisions");
  }

  return <LandingPage />;
}
