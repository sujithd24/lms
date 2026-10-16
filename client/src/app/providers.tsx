"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import StoreProvider from "@/state/redux";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      {/* Honor the OS "reduce motion" setting across every framer-motion animation */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </StoreProvider>
  );
};

export default Providers;
