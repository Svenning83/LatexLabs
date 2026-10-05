import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export default function LandingPage() {
  return (
    <div className="container">
      <Nav right="COLOUR VISUALISATION" />

      <section className="home-hero">
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
      </section>

      <section className="home-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/references/hero_study_views.png"
          alt="LatexLabs colour study — translucent blue and black catsuit, four views"
        />
      </section>

      <section className="home-steps">
        <div className="home-step">
          <div className="micro micro-faint">01</div>
          <div className="home-step-t">Garment</div>
          <div className="home-step-d">Catsuit, singlet or shorts.</div>
        </div>
        <div className="home-step">
          <div className="micro micro-faint">02</div>
          <div className="home-step-t">Colours</div>
          <div className="home-step-d">
            Explore up to three real material references on the colour wheel.
          </div>
        </div>
        <div className="home-step">
          <div className="micro micro-faint">03</div>
          <div className="home-step-t">Colour Study</div>
          <div className="home-step-d">
            Your combination, brought to life as a finished visualisation.
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="micro micro-faint">ABOUT LATEXLABS</div>
        <div className="home-about-grid">
          <p>
            LatexLabs is a visualisation tool. It lets you explore how latex
            colours work together on considered garment designs.
          </p>
          <p>
            LatexLabs does not manufacture or sell garments. Visualisations are
            for exploring colour combinations.
          </p>
          <p>
            Colours are based on real manufacturer references, so what you see
            represents real materials. Availability may vary by manufacturer.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
