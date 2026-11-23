"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import HomeNavbar from "@/components/layout/HomeNavbar";
import Reveal from "@/components/ui/Reveal";
import styles from "./community.module.css";

const moments = [
  {
    date: "14. Juni 2026",
    dateTime: "2026-06-14",
    title: "Courtside Summer",
    location: "Konstanz · Clubterrasse",
    category: "Community Evening",
    text:
      "Ein langer Sommerabend mit lockeren Mixed-Matches, neuen Spielpartnern und einem letzten Drink am Wasser.",
    image: "/images/community/event-padelmatch.png",
    alt: "Gäste treffen sich zu Mixed-Matches auf dem Padel-Court",
  },
];

const testimonials = [
  {
    quote:
      "Ich kannte niemanden am Platz und hatte trotzdem sofort das Gefühl, dazuzugehören.",
    name: "Mia",
    detail: "Seit einem Jahr bei PadelVision",
  },
  {
    quote:
      "Die Mixed-Abende sind unkompliziert: kurz ankommen, gute Partien, neue Gesichter.",
    name: "Jonas",
    detail: "Spielt zweimal pro Monat",
  },
  {
    quote:
      "Nach dem Match bleibt man oft einfach noch zusammen. Genau diese Mischung gefällt mir.",
    name: "Leonie",
    detail: "Erste Turnierteilnahme im Sommer",
  },
];

const socialLinks: Array<{ label: string; handle: string; href: string | null }> = [
  { label: "Instagram", handle: "PadelVision", href: null },
  { label: "YouTube", handle: "PadelVision", href: null },
];

export default function CommunityPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [newsletterStatus, setNewsletterStatus] = useState("");

  function showPrevious() {
    setTestimonialIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  }

  function showNext() {
    setTestimonialIndex((current) => (current + 1) % testimonials.length);
  }

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterStatus(
      "Die Anmeldung ist noch nicht verfügbar. Deine E-Mail-Adresse wurde nicht gespeichert.",
    );
  }

  const testimonial = testimonials[testimonialIndex];

  return (
    <>
      <a
        href="#community-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-on-accent"
      >
        Zum Inhalt springen
      </a>
      <HomeNavbar />

      <main id="community-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="community-title">
          <div className={`${styles.heroCopy} ${styles.heroEnterCopy}`}>
            <h1 id="community-title">
              <span className={styles.heroIntro}>JOIN THE</span>
              <span className={styles.heroTitle}>COMMUNITY.</span>
            </h1>
            <p className={styles.heroText}>
              Lerne neue Leute kennen, spiel zusammen und werde Teil der Runde.
            </p>
            <a className={styles.scrollLink} href="#moments">
              COMMUNITY MOMENTS
              <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <figure className={`${styles.heroImageMain} ${styles.heroEnterMain}`}>
            <Image
              src="/images/padel/community-2.jpg"
              alt="Padel-Spielerinnen und -Spieler verbringen gemeinsam Zeit auf der Clubterrasse"
              fill
              priority
              sizes="(max-width: 800px) 92vw, 54vw"
              className={styles.coverImage}
            />
            <figcaption>
              <span>PADELVISION · KONSTANZ</span>
              <strong>More than the match.</strong>
            </figcaption>
          </figure>

          <figure className={`${styles.heroImageSmall} ${styles.heroEnterSmall}`}>
            <Image
              src="/images/community/event-padelmatch.png"
              alt="Spielerinnen und Spieler genießen ein gemeinsames Mixed-Match"
              fill
              sizes="(max-width: 800px) 70vw, 22vw"
              className={styles.coverImage}
            />
          </figure>
        </section>

        <section className={styles.journal} id="moments" aria-label="Vergangene Community-Momente">
          <div className={styles.sectionLabel}>
            <span>01 — COMMUNITY MOMENTS</span>
            <span>KONSTANZ, DE</span>
          </div>

          <div className={styles.journalGrid}>
            {moments.map((moment) => (
              <article className={styles.featureMoment} key={moment.title}>
                <figure className={styles.featureImage}>
                  <Image
                    src={moment.image}
                    alt={moment.alt}
                    fill
                    sizes="(max-width: 800px) 100vw, 58vw"
                    className={styles.coverImage}
                  />
                  <span className={styles.imageIndex} aria-hidden="true">01</span>
                </figure>
                <div className={styles.featureCopy}>
                  <p className={styles.eventMeta}>
                    <time dateTime={moment.dateTime}>{moment.date}</time>
                    <span>{moment.category}</span>
                  </p>
                  <h2>{moment.title}</h2>
                  <p className={styles.location}>{moment.location}</p>
                  <p className={styles.momentText}>{moment.text}</p>
                </div>
              </article>
            ))}

            <figure className={styles.secondaryMoment}>
              <Image
                src="/images/community/event-horizontal-split.png"
                alt="Mixed-Doppel und Zuschauer bei einer geselligen Event-Runde"
                fill
                sizes="(max-width: 800px) 100vw, 34vw"
                className={styles.coverImage}
              />
              <figcaption>
                <span>09. MAI 2026</span>
                <strong>Saturday Mix</strong>
                <small>
                  Spontane Mixed-Matches, die bis zum Sonnenuntergang weitergingen.
                </small>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.voices} aria-labelledby="voices-title">
          <div className={styles.voicesTop}>
            <p className={styles.kickerDark}>02 — COMMUNITY VOICES</p>
            <p className={styles.slideCount} aria-live="polite">
              {String(testimonialIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </p>
          </div>

          <div className={styles.quoteGrid}>
            <h2 id="voices-title">In their words</h2>
            <div className={styles.quoteWrap} aria-live="polite">
              <blockquote key={testimonialIndex}>
                “{testimonial.quote}”
              </blockquote>
              <p className={styles.person}>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.detail}</span>
              </p>
            </div>
          </div>

          <div className={styles.carouselNav}>
            <button type="button" onClick={showPrevious} aria-label="Vorherige Community-Stimme">
              <ArrowLeft aria-hidden="true" />
            </button>
            <div className={styles.pagination} aria-hidden="true">
              {testimonials.map((item, index) => (
                <span
                  key={item.name}
                  className={index === testimonialIndex ? styles.activeDot : undefined}
                />
              ))}
            </div>
            <button type="button" onClick={showNext} aria-label="Nächste Community-Stimme">
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>

        <Reveal as="section" direction="up" className={styles.social}>
          <p className={styles.kickerDark}>03 — STAY CONNECTED</p>
          <div className={styles.socialGrid}>
            <h2>
              Beyond
              <br />
              <em>the score.</em>
            </h2>
            <div className={styles.socialLinks}>
              {socialLinks.map((social) =>
                social.href ? (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{social.label}</strong>
                      <small>{social.handle}</small>
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : (
                  <div key={social.label} aria-label={`${social.label}: Kanal wird noch vorbereitet`}>
                    <span>
                      <strong>{social.label}</strong>
                      <small>{social.handle}</small>
                    </span>
                    <span className={styles.preparing}>Link folgt</span>
                  </div>
                ),
              )}
            </div>
          </div>
          <p className={styles.socialNote}>
            Einblicke vom Court und Momente danach — dort, wo wir bald wieder
            zusammenkommen.
          </p>
        </Reveal>

        <section className={styles.newsletter} aria-labelledby="newsletter-title">
          <div className={styles.newsletterMark} aria-hidden="true">
            <span>PV</span>
          </div>
          <div className={styles.newsletterCopy}>
            <p className={styles.kicker}>04 — NEWSLETTER</p>
            <h2 id="newsletter-title">Stay in the loop.</h2>
            <p>
              Updates zu neuen Spielmöglichkeiten, Community-Aktivitäten und den
              besten Momenten aus Konstanz.
            </p>

            <form className={styles.newsletterForm} onSubmit={submitNewsletter}>
              <label htmlFor="community-email">E-Mail-Adresse</label>
              <div className={styles.inputRow}>
                <div className={styles.emailField}>
                  <Mail aria-hidden="true" />
                  <input
                    id="community-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="deine@email.de"
                    aria-describedby="newsletter-status"
                  />
                </div>
                <button type="submit">
                  Anmelden
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
              <p id="newsletter-status" className={styles.formStatus} role="status">
                {newsletterStatus}
              </p>
            </form>

            <p className={styles.dataNote} id="newsletter-note">
              Noch kein Newsletter-Versand. Beim Absenden wird nichts gespeichert.
            </p>
          </div>
          <div className={styles.newsletterImage} aria-hidden="true">
            <Link href="/courts" tabIndex={-1} aria-label="Padel-Courts entdecken">
              <Image
                src="/images/courts/courts-cta.jpg"
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 38vw"
                className={styles.coverImage}
              />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
