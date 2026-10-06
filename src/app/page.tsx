import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export default function LandingPage() {
  return (
    <>
      <section className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="home-hero-img"
          src="/references/hero-portrait.png"
          alt="Glossy red and yellow latex catsuit portrait"
        />
        <div className="home-hero-scrim" />
        <header className="home-hero-nav">
          <Logo />
          <span className="micro micro-faint">COLOUR VISUALISATION</span>
        </header>
        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <h1>Explore latex.</h1>
            <div className="home-sub">Create your own colour combinations.</div>
            <p>
              Choose a garment, experiment with colours and see what works
              together.
            </p>
            <Link href="/create" className="btn btn-primary home-cta">
              Explore →
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="home-about">
          <div className="micro micro-faint">ABOUT LATEXLABS</div>
          <div className="home-about-grid">
            <p>
              LatexLabs is a visualisation tool. It lets you explore how latex
              colours work together on considered garment designs.
            </p>
            <p>
              LatexLabs does not manufacture or sell garments. Visualisations
              are for exploring colour combinations.
            </p>
            <p>
              Colours are based on real manufacturer references, so what you see
              represents real materials. Availability may vary by manufacturer.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
