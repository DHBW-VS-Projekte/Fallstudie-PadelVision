"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type PadelEntryLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export default function PadelEntryLink({ onClick, ...props }: PadelEntryLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/padel"
      {...props}
      onClick={(event) => {
        if (pathname !== "/padel") {
          try {
            sessionStorage.setItem("padel-entry-scroll", "1");
          } catch {
            // Navigation should still work when session storage is unavailable.
          }
        }
        onClick?.(event);
      }}
    />
  );
}