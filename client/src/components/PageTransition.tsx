"use client";

import { motion } from "framer-motion";
import React from "react";

/**
 * Entrance animation applied to every page via route-group templates.
 * Deliberately avoids `filter`: a lingering filter would become the containing
 * block for `position: fixed` children (modals, loading overlay).
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="w-full"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
