import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/HomeNavbar";
import Reveal from "@/components/ui/Reveal";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Born in Germany, inspired by the world: Entdecke die Geschichte, Haltung und Community von PadelVision — verwurzelt in Konstanz am Bodensee.",
};

const aboutHeroImage = {
  src: "/images/padelvision-club.png",
  alt: "Padel-Courts und Clubterrasse in warmem Abendlicht",
};
// TODO: Eigenes Konstanz-/Bodensee-Brandfoto unter /public/images/about/ ablegen und hier eintragen.
const aboutKonstanzImage: string | null = null;
const aboutCommunityImage = {
  src: "/images/community.jpg",
  alt: "Freundinnen und Freunde verbringen nach dem Match Zeit miteinander",
};
const aboutLifestyleImage = {
  src: "/images/club.jpg",
  alt: "Clubterrasse und Padel-Courts in mediterraner Atmosphäre",
};
// TODO: Originalfotos für Marbella und Santorini unter /public/images/about/ ergänzen.
const aboutMarbellaImage: string | null = null;
const aboutSantoriniImage: string | null = null;

const locations = [
  { name: "Konstanz", note: "Ursprung · Deutschland", origin: true },
  { name: "Marbella", note: "Costa del Sol" },
  { name: "Porto-Vecchio", note: "Korsika" },
  { name: "Santorini", note: "Kykladen" },
  { name: "Chania", note: "Kreta" },
];

export default function AboutPage() {
  return (
    <>
      <HomeNavbar />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          <Image
            src={aboutHeroImage.src}
            alt={aboutHeroImage.alt}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroContent}>
            <p className={styles.kicker}>PADELVISION · OUR STORY</p>
            <h1 id="about-title">
              More than
              <br />
              a game.
              <br />
              <em>A way to connect.</em>
            </h1>
            <div className={styles.heroFooter}>
              <p>
                Verwurzelt am Bodensee. Offen für die Welt.
                <br />
                Ein gemeinsamer Platz für das, was uns verbindet.
              </p>
              <a className={styles.scrollLink} href="#roots">
                DISCOVER OUR STORY <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <span className={styles.heroIndex} aria-hidden="true">
            BRAND STORY / 01
          </span>
        </section>

        <Reveal as="section" direction="up" className={styles.roots} >
          <div className={styles.sectionLabel}>
            <span>01 — OUR ROOTS</span>
            <span>GERMANY, WITH A VIEW OF THE WORLD</span>
          </div>
          <div className={styles.rootsGrid} id="roots">
            <div className={styles.rootsCopy}>
              <p className={styles.kickerDark}>BORN IN KONSTANZ</p>
              <h2>
                Born in Germany.
                <br />
                <em>Inspired by the world.</em>
              </h2>
              <p className={styles.lead}>
                PadelVision hat seinen Ursprung und sein Stammhaus in Konstanz
                am Bodensee.
              </p>
              <p>
                Hier beginnt unsere Perspektive: mit dem Anspruch, Dinge
                sorgfältig zu gestalten und verlässlich umzusetzen. Von diesem
                Zuhause aus richtet sich der Blick nach draußen — auf neue
                Orte, andere Kulturen und die gemeinsame Sprache des Sports.
              </p>
              <p>
                Nicht als Gegensatz, sondern als Verbindung: deutsche
                Klarheit und mediterrane Leichtigkeit. Immer mit Raum für
                Begegnungen, die über den Court hinausgehen.
              </p>
              <Link className={styles.textLink} href="/courts">
                Unsere Orte entdecken <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <figure className={styles.originFigure}>
              {aboutKonstanzImage ? (
                <Image
                  src={aboutKonstanzImage}
                  alt="PadelVision in Konstanz am Bodensee"
                  fill
                  sizes="(max-width: 800px) 100vw, 48vw"
                  className={styles.coverImage}
                />
              ) : (
                <div className={styles.originArtwork} aria-hidden="true">
                  <span className={`${styles.orbit} ${styles.orbitOne}`} />
                  <span className={`${styles.orbit} ${styles.orbitTwo}`} />
                  <span className={`${styles.orbit} ${styles.orbitThree}`} />
                  <span className={styles.originDot} />
                  <span className={styles.originWord}>K</span>
                  <span className={styles.originWater}>BODENSEE</span>
                  <span className={styles.originNorth}>SOUTHERN GERMANY</span>
                </div>
              )}
              <figcaption>
                <span>ROOTED IN</span>
                <strong>Konstanz, Germany</strong>
                <span className={styles.captionMark} aria-hidden="true">
                  01
                </span>
              </figcaption>
            </figure>
          </div>
        </Reveal>

        <section className={styles.philosophy} aria-labelledby="philosophy-title">
          <div className={styles.philosophyInner}>
            <Reveal as="div" direction="up" className={styles.philosophyIntro}>
              <p className={styles.kicker}>02 — OUR PHILOSOPHY</p>
              <h2 id="philosophy-title">
                Three ideas.
                <br />
                <em>One feeling.</em>
              </h2>
              <p>
                Was PadelVision ausmacht, steckt in jedem Match — und in allem,
                was davor und danach passiert.
              </p>
            </Reveal>
            <div className={styles.values}>
              <Reveal as="div" direction="up" className={styles.valueRow} delay={40}>
                <span className={styles.valueNumber}>01</span>
                <h3>PLAY</h3>
                <p>
                  Die Freude am Spiel. An der nächsten Rallye, am Dazulernen
                  und an dem Moment, in dem alles zusammenkommt.
                </p>
                <span className={styles.valueNote}>THE GAME, FULLY LIVED</span>
              </Reveal>
              <Reveal as="div" direction="up" className={styles.valueRow} delay={100}>
                <span className={styles.valueNumber}>02</span>
                <h3>CONNECT</h3>
                <p>
                  Padel bringt Menschen zusammen — ganz selbstverständlich,
                  über Generationen, Sprachen und Grenzen hinweg.
                </p>
                <span className={styles.valueNote}>BETTER, TOGETHER</span>
              </Reveal>
              <Reveal as="div" direction="up" className={styles.valueRow} delay={160}>
                <span className={styles.valueNumber}>03</span>
                <h3>BELONG</h3>
                <p>
                  Ein Ort, an dem man gern ankommt, länger bleibt und sich
                  schnell als Teil des Ganzen fühlt.
                </p>
                <span className={styles.valueNote}>A PLACE TO CALL YOURS</span>
              </Reveal>
            </div>
          </div>
          <span className={styles.philosophyMark} aria-hidden="true">
            PV
          </span>
        </section>

        <Reveal as="section" direction="up" className={styles.beyond}>
          <div className={styles.beyondHeading}>
            <p className={styles.kickerDark}>03 — BEYOND THE COURT</p>
            <h2>
              It&apos;s never just
              <br />
              <em>about the court.</em>
            </h2>
          </div>
          <div className={styles.beyondGrid}>
            <figure className={styles.communityFigure}>
              <Image
                src={aboutCommunityImage.src}
                alt={aboutCommunityImage.alt}
                fill
                sizes="(max-width: 800px) 90vw, 48vw"
                className={styles.coverImage}
              />
              <figcaption>THE BEST PART HAPPENS TOGETHER</figcaption>
            </figure>
            <div className={styles.beyondCopy}>
              <span className={styles.beyondQuote} aria-hidden="true">
                “
              </span>
              <p className={styles.lead}>
                Ein guter Tag auf dem Court endet nicht mit dem letzten Punkt.
              </p>
              <p>
                Er geht weiter — am Rand des Spielfelds, an einem langen Tisch,
                im Wiedersehen mit bekannten Gesichtern. Aus Matches werden
                Geschichten. Aus Begegnungen wird Gemeinschaft.
              </p>
              <Link className={styles.textLink} href="/courts">
                Gemeinsam spielen <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <figure className={styles.lifestyleFigure}>
              <Image
                src={aboutLifestyleImage.src}
                alt={aboutLifestyleImage.alt}
                fill
                sizes="(max-width: 800px) 72vw, 30vw"
                className={styles.coverImage}
              />
              <figcaption>PLAY. STAY. SHARE.</figcaption>
            </figure>
          </div>
        </Reveal>

        <Reveal as="section" direction="up" className={styles.places}>
          <div className={styles.placesHeader}>
            <div>
              <p className={styles.kickerDark}>04 — FROM KONSTANZ OUTWARD</p>
              <h2>
                One vision.
                <br />
                <em>Different places.</em>
              </h2>
            </div>
            <p>
              Jeder Ort hat seinen eigenen Rhythmus. Was sie verbindet, ist die
              gemeinsame Idee von Sport, Design und echter Gastfreundschaft.
            </p>
          </div>
          <div className={styles.placesGrid}>
            <div className={styles.placesImage}>
              {aboutMarbellaImage ? (
                <Image
                  src={aboutMarbellaImage}
                  alt="PadelVision Standort Marbella"
                  fill
                  sizes="(max-width: 800px) 100vw, 56vw"
                  className={styles.coverImage}
                />
              ) : (
                <Image
                  src={aboutHeroImage.src}
                  alt="Padel-Courts in einer mediterranen Clubanlage"
                  fill
                  sizes="(max-width: 800px) 100vw, 56vw"
                  className={styles.coverImage}
                />
              )}
              <span className={styles.placesImageLabel}>
                ROOTED IN KONSTANZ
                <br />
                CONNECTED EVERYWHERE
              </span>
              <span className={styles.placesImageIndex}>GERMANY / MEDITERRANEAN</span>
              <span className={styles.placesInset} aria-hidden="true">
                <Image
                  src={aboutSantoriniImage ?? aboutLifestyleImage.src}
                  alt=""
                  fill
                  sizes="140px"
                  className={styles.coverImage}
                />
                <span>THE MEDITERRANEAN, IN MANY MOODS</span>
              </span>
            </div>
            <ol className={styles.locationList}>
              {locations.map((location, index) => (
                <li
                  key={location.name}
                  className={location.origin ? styles.originLocation : undefined}
                >
                  <span className={styles.locationIndex}>
                    0{index + 1}
                  </span>
                  <span className={styles.locationName}>{location.name}</span>
                  <span className={styles.locationNote}>{location.note}</span>
                  {location.origin && (
                    <span className={styles.originTag}>THE ROOTS</span>
                  )}
                </li>
              ))}
              <li className={styles.locationCta}>
                <Link href="/courts">
                  Alle Standorte ansehen <ArrowUpRight aria-hidden="true" />
                </Link>
              </li>
            </ol>
          </div>
        </Reveal>

        <Reveal as="section" direction="up" className={styles.manifesto}>
          <p className={styles.kicker}>05 — OUR PROMISE</p>
          <p className={styles.manifestoLine}>
            Thoughtfully designed.
            <br />
            <em>Made to be shared.</em>
          </p>
          <p className={styles.manifestoText}>
            Mit Sorgfalt gestaltet. Für das Spiel gemacht. Und immer am
            schönsten, wenn wir es miteinander teilen.
          </p>
          <span className={styles.manifestoRule} aria-hidden="true" />
        </Reveal>

        <section className={styles.finalCta} aria-labelledby="cta-title">
          <Image
            src={aboutHeroImage.src}
            alt=""
            fill
            sizes="100vw"
            className={styles.ctaImage}
          />
          <div className={styles.ctaShade} aria-hidden="true" />
          <div className={styles.ctaContent}>
            <p className={styles.kicker}>YOUR PLACE IS WAITING</p>
            <h2 id="cta-title">
              Come for the game.
              <br />
              <em>Stay for the feeling.</em>
            </h2>
            <div className={styles.ctaLinks}>
              <Link className={styles.ctaPrimary} href="/courts">
                Find your court <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link className={styles.ctaSecondary} href="/padel">
                Padel entdecken <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <span className={styles.ctaIndex}>PADELVISION · MORE PEOPLE. BETTER GAMES.</span>
        </section>
      </main>
      <Footer />
    </>
  );
}
