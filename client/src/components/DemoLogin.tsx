"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardPaste, GraduationCap, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoAccounts, type DemoRole } from "@/hooks/useDemoAccounts";

type Role = DemoRole;

// Passwords are not in the bundle: they are fetched from /api/demo-accounts at runtime,
// and the panel hides itself when the host has no demo passwords configured.
const DEMO_ACCOUNTS: Record<
  Role,
  { label: string; email: string; icon: typeof GraduationCap }
> = {
  student: { label: "Student", email: "student@demo.com", icon: GraduationCap },
  teacher: { label: "Teacher", email: "teacher@demo.com", icon: Presentation },
};

const isVisible = (el: HTMLElement | null) =>
  !!el && el.offsetParent !== null && el.getAttribute("aria-hidden") !== "true";

/**
 * Clerk's inputs are React-controlled, so assigning `.value` directly is
 * ignored. Use the native setter and dispatch an `input` event so Clerk's
 * internal state picks up the new value.
 */
const fillClerkInput = (name: string, value: string) => {
  const input = Array.from(
    document.querySelectorAll<HTMLInputElement>(`.cl-rootBox input[name="${name}"]`)
  ).find(isVisible);
  if (!input) return false;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
  return true;
};

const detectStep = (): "identifier" | "password" | "other" => {
  const identifier = document.querySelector<HTMLInputElement>(
    '.cl-rootBox input[name="identifier"]'
  );
  if (isVisible(identifier)) return "identifier";
  const password = document.querySelector<HTMLInputElement>(
    '.cl-rootBox input[name="password"]'
  );
  if (isVisible(password)) return "password";
  return "other";
};

const DemoLogin = () => {
  const { enabled: hasDemoAccounts, passwords } = useDemoAccounts();
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<"identifier" | "password" | "other">("identifier");
  const [filled, setFilled] = useState<"email" | "password" | null>(null);

  // Follow Clerk's multi-step form as it re-renders.
  useEffect(() => {
    const update = () => setStep(detectStep());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFilled(null);
  }, [step]);

  // `/signin?demo=student|teacher` (linked from the sign-up page) pre-fills that account once
  const searchParams = useSearchParams();
  const requested = searchParams.get("demo");
  const autoFilled = useRef(false);
  useEffect(() => {
    if (autoFilled.current || !hasDemoAccounts || step !== "identifier") return;
    if (requested !== "student" && requested !== "teacher") return;
    if (fillClerkInput("identifier", DEMO_ACCOUNTS[requested].email)) {
      autoFilled.current = true;
      setRole(requested);
      setFilled("email");
    }
  }, [requested, step, hasDemoAccounts]);

  if (!hasDemoAccounts || step === "other") return null;

  const handleRole = (selected: Role) => {
    setRole(selected);
    if (fillClerkInput("identifier", DEMO_ACCOUNTS[selected].email)) {
      setFilled("email");
    }
  };

  const handlePassword = () => {
    if (!role || !passwords) return;
    if (fillClerkInput("password", passwords[role])) {
      setFilled("password");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass w-full max-w-[400px] rounded-2xl p-5"
    >
      <AnimatePresence mode="wait">
        {step === "identifier" ? (
          <motion.div
            key="identifier"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-center font-display text-lg font-semibold text-white-100">
              Try a demo account
            </h3>
            <p className="mb-4 mt-1 text-center text-xs text-customgreys-dirtyGrey">
              Pick a role to fill in the email, then press Continue
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((key) => {
                const account = DEMO_ACCOUNTS[key];
                const active = role === key && filled === "email";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRole(key)}
                    className={cn(
                      "group flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all duration-300 hover:-translate-y-0.5",
                      active
                        ? "border-primary-400/70 bg-primary-500/15 shadow-glow"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl text-white-100 transition-transform duration-300 group-hover:scale-110",
                        key === "student"
                          ? "bg-gradient-to-br from-indigo-500 to-violet-500"
                          : "bg-gradient-to-br from-cyan-500 to-sky-500"
                      )}
                    >
                      {active ? <Check className="h-5 w-5" /> : <account.icon className="h-5 w-5" />}
                    </span>
                    <span className="text-sm font-semibold text-white-100">
                      {account.label}
                    </span>
                    <span className="font-mono text-[11px] text-customgreys-dirtyGrey">
                      {account.email}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-center font-display text-lg font-semibold text-white-100">
              Demo password
            </h3>
            {role ? (
              <>
                <p className="mb-4 mt-1 text-center text-xs text-customgreys-dirtyGrey">
                  Fill in the {DEMO_ACCOUNTS[role].label.toLowerCase()} password, then
                  press Continue
                </p>
                <button
                  type="button"
                  onClick={handlePassword}
                  className="btn-glow w-full"
                >
                  {filled === "password" ? (
                    <>
                      <Check className="h-4 w-4" /> Password filled
                    </>
                  ) : (
                    <>
                      <ClipboardPaste className="h-4 w-4" /> Paste{" "}
                      {DEMO_ACCOUNTS[role].label} password
                    </>
                  )}
                </button>
              </>
            ) : (
              <p className="mt-2 text-center text-xs text-customgreys-dirtyGrey">
                Go back and choose Student or Teacher to use a demo password.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DemoLogin;
