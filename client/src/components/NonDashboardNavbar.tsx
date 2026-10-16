"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  Bell,
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

const NonDashboardNavbar = () => {
  const { user, isSignedIn } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  const pathname = usePathname();

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  // Close the mobile menu after navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dashboardHref =
    userRole === "teacher" ? "/teacher/courses" : "/user/courses";

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore courses", href: "/search", icon: Compass },
    ...(isSignedIn
      ? [
          {
            label: userRole === "teacher" ? "Teacher dashboard" : "My Courses",
            href: dashboardHref,
            icon: userRole === "teacher" ? LayoutDashboard : BookOpen,
          },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "nondashboard-navbar",
        (scrolled || mobileOpen) && "nondashboard-navbar--scrolled"
      )}
    >
      <div className="nondashboard-navbar__container">
        <div className="nondashboard-navbar__search">
          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            <span className="nondashboard-navbar__brand-mark">
              <GraduationCap className="h-5 w-5 text-white-100" />
            </span>
            <span className="hidden sm:inline">
              LMS <span className="text-gradient">Academy</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <ul className="nondashboard-navbar__links">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    scroll={false}
                    className={cn(
                      "nondashboard-navbar__link",
                      active && "nondashboard-navbar__link--active"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="nondashboard-navbar__link-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <link.icon className="relative h-4 w-4" />
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nondashboard-navbar__actions">
          <button
            className="nondashboard-navbar__notification-button"
            aria-label="Notifications"
          >
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell className="nondashboard-navbar__notification-icon" />
          </button>

          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier:
                    "text-customgreys-dirtyGrey hidden sm:block",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              showName={true}
              userProfileMode="navigation"
              userProfileUrl={
                userRole === "teacher" ? "/teacher/profile" : "/user/profile"
              }
            />
          </SignedIn>
          <SignedOut>
            <Link
              href="/signin"
              className="nondashboard-navbar__auth-button--login"
              scroll={false}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="nondashboard-navbar__auth-button--signup"
              scroll={false}
            >
              Sign up
            </Link>
          </SignedOut>

          <button
            type="button"
            className="nondashboard-navbar__menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="nondashboard-navbar__mobile"
          >
            {navLinks.map((link, i) => (
              <motion.li
                key={link.href}
                initial={{ x: -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={link.href}
                  scroll={false}
                  className={cn(
                    "nondashboard-navbar__mobile-link",
                    isActive(link.href) && "nondashboard-navbar__mobile-link--active"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </motion.li>
            ))}
            <SignedOut>
              <li>
                <Link
                  href="/signup"
                  scroll={false}
                  className="nondashboard-navbar__auth-button--signup"
                >
                  Sign up free
                </Link>
              </li>
            </SignedOut>
          </motion.ul>
        )}
      </AnimatePresence>

      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
    </motion.nav>
  );
};

export default NonDashboardNavbar;
