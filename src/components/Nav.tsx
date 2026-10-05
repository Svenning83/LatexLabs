import Link from "next/link";
import Logo from "./Logo";

export default function Nav({ right }: { right?: React.ReactNode }) {
  return (
    <div className="nav">
      <Link href="/" className="nav-logo" aria-label="LatexLabs home">
        <Logo />
      </Link>
      <div className="micro micro-faint">{right ?? "LATEX COLOUR VISUALISATION"}</div>
    </div>
  );
}
