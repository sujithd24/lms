"use client";

import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centered, animated placeholder for empty lists and failed loads. */
const EmptyState = ({
  icon: Icon,
  title,
  text,
  action,
  tone = "default",
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: React.ReactNode;
  tone?: "default" | "error";
  compact?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className={cn("empty-state", compact && "empty-state--compact")}
  >
    <div className="empty-state__glow" />
    <div
      className={cn(
        "empty-state__icon",
        tone === "error" ? "empty-state__icon--error" : "animate-float"
      )}
    >
      <Icon className="h-7 w-7" />
    </div>
    <h2 className="empty-state__title">{title}</h2>
    <p className="empty-state__text">{text}</p>
    {action && <div className="empty-state__action">{action}</div>}
  </motion.div>
);

export default EmptyState;
