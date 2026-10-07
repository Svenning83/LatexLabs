import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Logo height={16} />
        <a
          className="back-link"
          href="https://instagram.com/latex.labs"
          target="_blank"
          rel="noopener noreferrer"
        >
          INSTAGRAM — @LATEX.LABS
        </a>
      </div>
    </footer>
  );
}
