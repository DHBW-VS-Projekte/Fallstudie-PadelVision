import type { Metadata } from "next";
import CommunityPage from "@/components/community/CommunityPage";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Gemeinsame Padel-Momente, Stimmen aus der Community und Highlights von PadelVision.",
};

export default function Community() {
  return <CommunityPage />;
}
