import Link from "next/link";
import LogoMark from "@/components/layout/LogoMark";
import PadelBallCourt from "@/components/ui/PadelBallCourt";
import styles from "./not-found.module.css";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="PadelVision Startseite">
          <LogoMark className={styles.logoMark} />
          <span>
            PADELVISION
            <small>SPORT. COMMUNITY. PADEL.</small>
          </span>
        </Link>
        <Link className={styles.headerLink} href="/courts">
          Courts <ArrowIcon />
        </Link>
      </header>

      <section className={styles.content} aria-labelledby="not-found-title">
        <div className={styles.message}>
          <p className={styles.eyebrow}>WRONG TURN <span>—</span> 404</p>
          <p className={styles.number} aria-hidden="true">404</p>
          <h1 id="not-found-title">
            Du bist hier
            <br />
            <em>falsch abgebogen.</em>
          </h1>
          <p className={styles.description}>
            Diese Seite gibt&apos;s hier nicht. Aber dein nächstes Match ist nur
            einen Klick entfernt.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/courts">
              Court finden <ArrowIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/">
              Zur Startseite
            </Link>
          </div>
        </div>
        <PadelBallCourt className={styles.illustration} />
      </section>

      <footer className={styles.footer}>
        <span>PADELVISION <span aria-hidden="true">/</span> PLAY. CONNECT. BELONG.</span>
        <Link href="/about">Mehr über uns <ArrowIcon /></Link>
      </footer>
    </main>
  );
}
