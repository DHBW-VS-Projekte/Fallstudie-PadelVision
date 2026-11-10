import Link from "next/link";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/HomeNavbar";

const courtsPath = "/courts";
const communityPath = "/about#philosophy-title";
const eventsPath = "/courts#events";

function Arrow({ direction = "up-right" }: { direction?: "up-right" | "down" }) {
  return (
    <svg
      aria-hidden="true"
      className="pv-arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "down" ? (
        <path d="M12 4v16m-7-7 7 7 7-7" />
      ) : (
        <path d="M7 17 17 7M7 7h10v10" />
      )}
    </svg>
  );
}

function PaddleIcon() {
  return (
    <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="29" cy="21" rx="13" ry="17" transform="rotate(35 29 21)" />
      <path d="m20 34-12 13m17-36 2 4m5-2 2 4m-14 2 3 4m7-2 3 4m-13 4 3 3" strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="26" cy="13" r="6" />
      <circle cx="11" cy="20" r="5" />
      <circle cx="41" cy="20" r="5" />
      <path d="M15 41v-7a11 11 0 0 1 22 0v7H15ZM2 41v-8a9 9 0 0 1 10-9m38 17v-8a9 9 0 0 0-10-9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="7" y="11" width="38" height="34" rx="3" />
      <path d="M7 21h38M17 7v8M35 7v8M17 28h5m6 0h5m-16 8h5m6 0h5" />
    </svg>
  );
}

const experiences = [
  {
    number: "01 / PLAY",
    title: "Courts",
    description: "Indoor oder unter freiem Himmel. Dein nächstes Match beginnt hier.",
    label: "Courts entdecken",
    href: courtsPath,
    className: "pv-offer-courts",
    icon: <PaddleIcon />,
  },
  {
    number: "02 / CONNECT",
    title: "Community",
    description: "Spielpartner finden, gemeinsam besser werden und gern länger bleiben.",
    label: "PadelVision erleben",
    href: communityPath,
    className: "pv-offer-community",
    icon: <PeopleIcon />,
  },
  {
    number: "03 / BELONG",
    title: "Events",
    description: "Turniere und Begegnungen, die aus einem Spiel mehr machen.",
    label: "Events entdecken",
    href: eventsPath,
    className: "pv-offer-events",
    icon: <CalendarIcon />,
  },
];

export default function Home() {
  return (
    <main className="pv" id="top">
      <HomeNavbar />

      <section className="pv-hero" aria-labelledby="pv-title">
        <div className="pv-hero-copy pv-animate" style={{ animationDelay: "0.05s" }}>
          <div className="pv-eyebrow">SPORT. COMMUNITY. LIFESTYLE.</div>
          <h1 id="pv-title">
            More People.
            <br />
            <span>Better Games.</span>
          </h1>
          <p>
            Padel, das Menschen verbindet. Entdecke Courts, Community und
            gemeinsame Erlebnisse — in einer Atmosphäre, die zum Bleiben einlädt.
          </p>
          <div className="pv-hero-actions">
            <Link className="pv-btn pv-btn-dark" href={courtsPath}>
              Court finden <Arrow />
            </Link>
            <Link className="pv-btn pv-btn-outline" href="/about">
              PadelVision entdecken <Arrow />
            </Link>
          </div>
          <a className="pv-scroll" href="#experience">
            <span /> SCROLL TO EXPLORE <Arrow direction="down" />
          </a>
        </div>
        <div
          className="pv-hero-photo pv-animate"
          role="img"
          aria-label="Padel-Courts und Clubterrasse in mediterraner Atmosphäre"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="pv-photo-label">
            <span>THE PADELVISION EXPERIENCE</span>
            <strong>Play. Connect. Belong.</strong>
          </div>
        </div>
        <div className="pv-hero-edge" aria-hidden="true" />
      </section>

      <section className="pv-story pv-container" id="experience" aria-labelledby="experience-title">
        <div className="pv-story-art pv-animate" style={{ animationDelay: "0.12s" }}>
          <div
            className="pv-story-photo"
            role="img"
            aria-label="Einladende PadelVision Clubterrasse mit mediterranem Flair"
          />
          <div className="pv-story-plaque">
            <span>MORE THAN THE MATCH</span>
            <strong>
              Make room
              <br />
              for good days.
            </strong>
          </div>
        </div>
        <div className="pv-story-text pv-animate" style={{ animationDelay: "0.22s" }}>
          <span className="pv-eyebrow">THE PADELVISION EXPERIENCE</span>
          <h2 id="experience-title">
            Ein Match ist
            <br />
            erst der <em>Anfang.</em>
          </h2>
          <p className="pv-lead">
            Gute Courts. Gute Menschen. Zeit, die gern ein bisschen länger dauert.
          </p>
          <p>
            Wir bringen Sport und Zusammensein an einem Ort zusammen. Für deine
            erste Rallye, vertraute Gesichter und das Gefühl, genau richtig zu sein.
          </p>
          <Link className="pv-link" href="/about">
            Unsere Haltung entdecken <Arrow />
          </Link>
        </div>
      </section>

      <section className="pv-offer" id="discover" aria-labelledby="discover-title">
        <div className="pv-container">
          <div className="pv-section-heading pv-animate" style={{ animationDelay: "0.1s" }}>
            <div>
              <span className="pv-eyebrow">PLAY / CONNECT / BELONG</span>
              <h2 id="discover-title">
                Find your
                <br />
                <em>experience.</em>
              </h2>
            </div>
            <p>
              Dein Einstieg in PadelVision — such dir aus, was dich heute auf
              den Court bringt.
            </p>
          </div>
          <div className="pv-offer-grid">
            {experiences.map((experience, index) => (
              <Link
                className={`pv-offer-card ${experience.className} pv-animate`}
                href={experience.href}
                key={experience.title}
                style={{ animationDelay: `${0.12 + index * 0.1}s` }}
              >
                <div className="pv-card-top">
                  <span>{experience.number}</span>
                  <Arrow />
                </div>
                <div className="pv-card-content">
                  {experience.icon}
                  <h3>{experience.title}</h3>
                  <p>{experience.description}</p>
                  <span className="pv-card-link">
                    {experience.label} <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pv-last-call" aria-labelledby="ready-title">
        <div className="pv-container pv-last-call-inner">
          <div>
            <span className="pv-eyebrow">READY TO PLAY?</span>
            <h2 id="ready-title">
              Dein nächstes Match
              <br />
              wartet schon<span>.</span>
            </h2>
            <p>Finde deinen Court und bring dein Spiel ins Rollen.</p>
          </div>
          <Link className="pv-btn pv-btn-cream" href={courtsPath}>
            Courts entdecken <Arrow />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
