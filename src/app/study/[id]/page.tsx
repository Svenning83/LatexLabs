import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import StudyActions from "@/components/StudyActions";
import StudyProgress from "@/components/StudyProgress";
import { getColours } from "@/lib/colours";
import { getGarment } from "@/lib/garments";
import { getStudy } from "@/lib/studies";

export const dynamic = "force-dynamic";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const study = await getStudy(id);
  if (!study) notFound();

  const garmentName =
    study.garment_name ??
    getGarment(study.garment_template)?.display_name ??
    study.garment_title;
  const names = study.selected_colour_names.join(" · ");

  if (study.status !== "ready") {
    return (
      <div className="container">
        <Nav right="03 — CREATE" />
        <StudyProgress
          studyId={study.study_id}
          subtitle={`${garmentName} — ${names}`}
        />
      </div>
    );
  }

  const colours = getColours(study.selected_colours);

  return (
    <div className="container">
      <Nav right="YOUR COLOUR STUDY" />

      <section className="section" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div className="study-head">
          <div className="micro micro-faint">YOUR COLOUR STUDY</div>
          <h1 className="study-title">{garmentName}</h1>
          <div className="micro" style={{ color: "var(--muted)", marginTop: 6 }}>
            {names.toUpperCase()}
          </div>
        </div>

        <div className="study-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/studies/${study.study_id}/image`}
            alt={`${garmentName} Colour Study — ${names}`}
          />
        </div>

        <div className="study-meta">
          <div>
            <div className="micro micro-faint" style={{ marginBottom: 10 }}>
              SELECTED COLOURS
            </div>
            <div className="study-colours">
              {colours.map((c) => (
                <div className="study-col" key={c.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.references[0]} alt={c.display_name} />
                  <div>
                    <div className="n">{c.display_name}</div>
                    <div className="c">
                      {c.manufacturer} · {c.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <StudyActions
            studyId={study.study_id}
            garmentId={study.garment_template}
            colourIds={study.selected_colours}
            colourNames={[garmentName, ...study.selected_colour_names]}
          />
        </div>

        <div className="study-foot">
          <div className="micro micro-faint">
            STUDY {study.study_id.toUpperCase()}
            {" · "}
            {new Date(study.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
