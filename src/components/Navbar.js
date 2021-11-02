import React, { useEffect } from "react";
import "./navbar.scss";
import Logo from "./FLECS-Logo.png";

const Navbar = () => {
  const [scrolled, setScrolled] = React.useState(false);

  const handleScroll = () => {
    const offset = window.scrollY;

    setScrolled(true);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  });

  let x = ["navbar"];
  if (scrolled) {
    x.push("scrolled");
  }
  return (
    <header className={x.join(" ")}>
      <div className="logo">
        <img src={Logo} alt="Logo" title="Logo" />
      </div>

      <nav className="navigation">
        <ul>
          <li>
            <a href="#post1">User</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
