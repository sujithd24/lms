import Link from "next/link";
import React from "react";
import { GraduationCap } from "lucide-react";

const footerColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Browse courses", href: "/search" },
      { label: "Create account", href: "/signup" },
      { label: "Log in", href: "/signin" },
    ],
  },
  {
    heading: "Learning",
    links: [
      { label: "My courses", href: "/user/courses" },
      { label: "Teach on LMS", href: "/teacher/courses" },
      { label: "Settings", href: "/user/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="footer__inner">
        <div>
          <Link
            href="/"
            className="nondashboard-navbar__brand"
            scroll={false}
          >
            <span className="nondashboard-navbar__brand-mark">
              <GraduationCap className="h-5 w-5 text-white-100" />
            </span>
            LMS <span className="text-gradient">Academy</span>
          </Link>
          <p className="footer__tagline">
            Video lessons, quizzes, an in-browser compiler and certificates —
            everything you need to learn a new skill, in one place.
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.heading}>
            <h4 className="footer__heading">{column.heading}</h4>
            <div className="footer__links">
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer__link"
                  scroll={false}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} LMS Academy. All rights reserved.</p>
        <p>Built for curious minds.</p>
      </div>
    </footer>
  );
};

export default Footer;
