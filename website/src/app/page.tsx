import Link from "next/link";
import HomeNavbar from "@/components/layout/HomeNavbar";
import LogoMark from "@/components/layout/LogoMark";
import PadelEntryLink from "@/components/layout/PadelEntryLink";

const bookingPath = "/booking";
const clubPath = "/about";
const courtsPath = "/courts";
const eventsPath = "/events";
const communityPath = "/community";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function PaddleIcon() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <ellipse cx="29" cy="21" rx="13" ry="17" transform="rotate(35 29 21)" />
      <path
        d="m20 34-12 13m17-36 2 4m5-2 2 4m-14 2 3 4m7-2 3 4m-13 4 3 3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="26" cy="13" r="6" />
      <circle cx="11" cy="20" r="5" />
      <circle cx="41" cy="20" r="5" />
      <path d="M15 41v-7a11 11 0 0 1 22 0v7H15ZM2 41v-8a9 9 0 0 1 10-9m38 17v-8a9 9 0 0 0-10-9" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="7" y="11" width="38" height="34" rx="3" />
      <path d="M7 21h38M17 7v8M35 7v8M17 28h5m6 0h5m-16 8h5m6 0h5" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M9 43C9 18 24 9 46 7c0 22-10 37-32 37M9 43c10-16 20-23 34-31" />
    </svg>
  );
}
const features = [
  {
    icon: <PaddleIcon />,
    title: "Indoor & Outdoor",
    caption: "Padel für jeden Moment.",
  },
  {
    icon: <PeopleIcon />,
    title: "Echte Community",
    caption: "Zusammen spielen, länger bleiben.",
  },
  {
    icon: <CalendarIcon />,
    title: "Events & Matches",
    caption: "Gemeinsam mehr erleben.",
  },
  {
    icon: <LeafIcon />,
    title: "Mediterranes Feeling",
    caption: "Sport trifft Lebensgefühl.",
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
            Entdecke Padel in einer neuen Atmosphäre. Moderne Courts,
            mediterranes Lebensgefühl und eine Community, die weit über das
            Spielfeld hinaus verbindet.
          </p>
          <div className="pv-hero-actions">
            <a className="pv-btn pv-btn-dark" href={bookingPath}>
              Court buchen <Arrow />
            </a>
            <a className="pv-btn pv-btn-outline" href={clubPath}>
              Discover the Club <Arrow />
            </a>
          </div>
          <a className="pv-scroll" href="#what-makes-us">
            <span /> SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div
          className="pv-hero-photo pv-animate"
          role="img"
          aria-label="Mediterraner Padel-Club mit Courts, Olivenbaum, Terrasse und Spielern"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="pv-photo-label">
            <span>THE PADELVISION WAY</span>
            <strong>Play. Connect. Belong.</strong>
          </div>
        </div>
        <div className="pv-hero-edge" aria-hidden="true" />
      </section>

      <section className="pv-feature-strip" aria-label="PadelVision Highlights">
        <div className="pv-container pv-features">
          {features.map((feature, index) => (
            <div
              className="pv-feature pv-animate"
              key={feature.title}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="pv-feature-icon">{feature.icon}</div>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pv-story pv-container" id="what-makes-us">
        <div className="pv-story-art pv-animate" style={{ animationDelay: "0.15s" }}>
          <div
            className="pv-story-photo"
            role="img"
            aria-label="Sonnige Terrasse eines mediterranen Padel-Clubs"
          />
          <div className="pv-story-plaque">
            <span>EST. FOR THE LOVE OF PADEL</span>
            <strong>
              Good people.
              <br />
              Great games.
            </strong>
          </div>
        </div>
        <div className="pv-story-text pv-animate" style={{ animationDelay: "0.25s" }}>
          <span className="pv-eyebrow">THE CLUB / 01</span>
          <h2>
            Mehr als nur
            <br />
            ein <em>Padel-Club.</em>
          </h2>
          <p className="pv-lead">
            Ein Ort, an dem aus einem Match ein guter Tag wird.
          </p>
          <p>
            PadelVision steht für Bewegung, Begegnung und echtes Miteinander.
            Für den ersten Aufschlag, die letzte Rallye und die Gespräche
            danach. Alles in einer Atmosphäre, die sich nach Urlaub anfühlt.
          </p>
          <a className="pv-link" href={clubPath}>
            Unsere Geschichte entdecken <Arrow />
          </a>
        </div>
      </section>

      <section className="pv-offer" id="discover">
        <div className="pv-container">
          <div className="pv-section-heading pv-animate" style={{ animationDelay: "0.1s" }}>
            <div>
              <span className="pv-eyebrow">PLAY / CONNECT / BELONG</span>
              <h2>
                Find your
                <br />
                <em>kind of play.</em>
              </h2>
            </div>
            <p>
              Ob sportlicher Ausgleich, neue Kontakte oder dein nächstes
              Lieblingsevent: Hier beginnt dein Padel-Erlebnis.
            </p>
          </div>
          <div className="pv-offer-grid">
            <a className="pv-offer-card pv-offer-courts pv-animate" href={courtsPath} style={{ animationDelay: "0.1s" }}>
              <div className="pv-card-top">
                <span>01 / PLAY</span>
                <Arrow />
              </div>
              <div className="pv-card-content">
                <PaddleIcon />
                <h3>Courts</h3>
                <p>Indoor und Outdoor. Dein Platz für das nächste Match.</p>
                <span className="pv-card-link">Courts entdecken ↗</span>
              </div>
            </a>
            <a
              className="pv-offer-card pv-offer-community pv-animate"
              href={communityPath}
              style={{ animationDelay: "0.22s" }}
            >
              <div className="pv-card-top">
                <span>02 / CONNECT</span>
                <Arrow />
              </div>
              <div className="pv-card-content">
                <PeopleIcon />
                <h3>Community</h3>
                <p>Neue Leute kennenlernen. Gemeinsam besser werden.</p>
                <span className="pv-card-link">Community erleben ↗</span>
              </div>
            </a>
            <a className="pv-offer-card pv-offer-events pv-animate" href={eventsPath} style={{ animationDelay: "0.34s" }}>
              <div className="pv-card-top">
                <span>03 / BELONG</span>
                <Arrow />
              </div>
              <div className="pv-card-content">
                <CalendarIcon />
                <h3>Events</h3>
                <p>Matches, Turniere und Momente, die bleiben.</p>
                <span className="pv-card-link">Events entdecken ↗</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="pv-manifesto pv-animate" aria-label="Unser Motto" style={{ animationDelay: "0.1s" }}>
        <div className="pv-container pv-manifesto-inner">
          <span className="pv-eyebrow">THE PADELVISION FEELING</span>
          <p>
            “It&apos;s not just about
            <br />
            the game. It&apos;s about
            <br />
            <em>who you play it with.</em>”
          </p>
          <span className="pv-asterisk" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>

      <section className="pv-last-call pv-animate" style={{ animationDelay: "0.15s" }}>
        <div className="pv-container pv-last-call-inner">
          <div>
            <span className="pv-eyebrow">READY TO PLAY?</span>
            <h2>
              Dein nächstes Match
              <br />
              wartet schon<span>.</span>
            </h2>
            <p>Die besten Geschichten beginnen auf dem Court.</p>
          </div>
          <a className="pv-btn pv-btn-cream" href={bookingPath}>
            Court buchen <Arrow />
          </a>
        </div>
      </section>

      <footer className="pv-footer">
        <div className="pv-container">
          <div className="pv-footer-main">
            <div>
              <Link className="pv-logo pv-logo-footer" href="/">
                <LogoMark variant="light" />
                <span>
                  PADELVISION<small>PADEL & COMMUNITY</small>
                </span>
              </Link>
              <p>
                More People. Better Games.
                <br />
                Sport. Community. Lifestyle.
              </p>
            </div>
            <nav aria-label="Footer Navigation">
              <a href={courtsPath}>Courts</a>
              <PadelEntryLink>Padel entdecken</PadelEntryLink>
              <a href={communityPath}>Community</a>
              <a href={eventsPath}>Events</a>
              <a href={clubPath}>About</a>
              <a href={bookingPath}>Court buchen</a>
            </nav>
            <p className="pv-footer-signature">
              See you
              <br />
              <em>on court.</em>
            </p>
          </div>
          <div className="pv-footer-bottom">
            <span>© 2026 PADELVISION · FALLSTUDIE / KONZEPT</span>
            <a href="#top">BACK TO TOP ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
