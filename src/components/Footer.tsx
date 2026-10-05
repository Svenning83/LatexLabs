import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Logo height={16} />
        <div className="micro micro-faint">COLOURS REFERENCED FROM LIBIDEX</div>
      </div>
    </footer>
  );
}
