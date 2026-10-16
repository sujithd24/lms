"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Presentation } from "lucide-react";
import { hasDemoAccounts } from "./DemoLogin";

/** On the sign-up page: skip registration and jump to a pre-filled demo sign-in. */
const DemoSignupHint = () => {
  if (!hasDemoAccounts) return null;

  return (
    <div className="glass w-full max-w-[400px] rounded-2xl p-5">
      <h3 className="text-center font-display text-lg font-semibold text-white-100">
        Just exploring?
      </h3>
      <p className="mb-4 mt-1 text-center text-xs text-customgreys-dirtyGrey">
        Skip sign-up and try a ready-made demo account
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/signin?demo=student"
          className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white-100 transition-all hover:-translate-y-0.5 hover:border-primary-400/50 hover:bg-primary-500/10"
        >
          <GraduationCap className="h-4 w-4 text-primary-300" /> Student
          <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/signin?demo=teacher"
          className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white-100 transition-all hover:-translate-y-0.5 hover:border-secondary-400/50 hover:bg-secondary-500/10"
        >
          <Presentation className="h-4 w-4 text-secondary-300" /> Teacher
          <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default DemoSignupHint;
