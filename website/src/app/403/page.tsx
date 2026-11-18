import Link from "next/link";
import LogoMark from "@/components/layout/LogoMark";
import styles from "./page.module.css";

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

export default function ForbiddenPage() {
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

      <section className={styles.scene} aria-labelledby="forbidden-title">
        <div className={styles.message}>
          <p className={styles.eyebrow}>PRIVATE MATCH <span>—</span> 403</p>
          <p className={styles.number} aria-hidden="true">403</p>
          <h1 id="forbidden-title">Sorry, you&apos;re not on the list.</h1>
          <p className={styles.description}>
            Dieser Bereich ist nicht öffentlich zugänglich. 
            Da macht selbst unser Türsteher keine Ausnahme.
          </p>
          <Link className={styles.primaryAction} href="/">
            Back to the game <ArrowIcon />
          </Link>
        </div>

        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.background}>
            <div className={styles.court}>
              <div className={styles.courtSign}>
                <span>FORBIDDEN</span>
                <strong>403</strong>
              </div>
              <div className={styles.courtGlass}>
                <span className={styles.glassDivider} />
              </div>
              <div className={styles.courtFloor}>
                <span className={styles.floorLine} />
              </div>
            </div>
            <div className={styles.rug} />
          </div>
          <div className={styles.foreground}>
            <div className={styles.bouncer}>
              <div className={styles.head}>
                <div className={styles.neck} />
                <span className={styles.eyeLeft} />
                <span className={styles.eyeRight} />
                <div className={styles.ear} />
              </div>
              <div className={styles.body} />
              <div className={styles.arm} />
            </div>
            <div className={styles.poles}>
              <div className={styles.poleLeft} />
              <div className={styles.poleRight} />
              <div className={styles.rope} />
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>PADELVISION <span aria-hidden="true">/</span> PLAY. CONNECT. BELONG.</span>
        <Link href="/about">Mehr über uns <ArrowIcon /></Link>
      </footer>
    </main>
  );
}
