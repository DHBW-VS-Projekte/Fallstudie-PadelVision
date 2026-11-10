import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./Footer.module.css";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/courts", label: "Courts" },
  { href: "/padel", label: "Padel entdecken" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.signature}>
          <Link className={styles.wordmark} href="/" aria-label="PadelVision Startseite">
            PADEL<span>VISION</span>
          </Link>
          <p className={styles.signOff}>
            See you
            <br />
            <em>on court.</em>
          </p>
        </div>

        <div className={styles.footerDetails}>
          <nav className={styles.navigation} aria-label="Footer Navigation">
            <span className={styles.label}>EXPLORE</span>
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className={styles.bookingLink} href="/courts">
              Find your court <ArrowUpRight aria-hidden="true" />
            </Link>
          </nav>

          <div className={styles.legal}>
            <span className={styles.label}>RECHTLICHES</span>
            <p>
              PADELVISION ist eine Fallstudie und Konzeptdarstellung. Rechtliche
              Angaben werden im finalen Markenauftritt ergänzt.
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} PADELVISION · FALLSTUDIE / KONZEPT</span>
          <a href="#top">
            BACK TO TOP
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5m-7 7 7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
