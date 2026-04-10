import { FiMenu, FiSearch, FiBell, FiCalendar } from "react-icons/fi";
import { MdLanguage } from "react-icons/md";
import { BsMoon } from "react-icons/bs";
import "./Navbar.css";
import { useSidebar } from "../../Context/SidebarContext";
import logo from "../../asset/image/dtgLogoImg.png";
import hamburger from "../../asset/image/Navbar/hamburgerIcon.png";

const Navbar = () => {
  const { toggleSidebar, collapsed } = useSidebar();

  return (
    <header className="app-navbar">
      {/* LEFT */}
      <div className="nav-left">
        <img src={logo} alt="Datatech Genius" className="navbar-logo" />
        <button className="menu-btn" onClick={toggleSidebar}>
          <img
            src={hamburger}
            alt="hamburger"
            className={`hamburger-icon ${collapsed ? "collapsed" : "expanded"}`}
          />
        </button>
      </div>

      <div className="search-box">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search Keyword" />
      </div>
      {/* RIGHT */}
      <div className="nav-right">
        <button className="icon-btn">
          <MdLanguage />
        </button>
        <button className="icon-btn">
          <BsMoon />
        </button>
        <button className="icon-btn">
          <FiCalendar />
        </button>

        <button className="icon-btn notification">
          <FiBell />
          <span className="dot" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
