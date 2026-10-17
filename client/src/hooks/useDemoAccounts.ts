"use client";

import { useEffect, useState } from "react";

export type DemoRole = "student" | "teacher";
type DemoConfig = { enabled: boolean; passwords?: Record<DemoRole, string> };

// One request per page load, shared by every demo component
let cached: Promise<DemoConfig> | null = null;
const loadDemoConfig = () => {
  if (!cached) {
    cached = fetch("/api/demo-accounts", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .catch(() => ({ enabled: false }));
  }
  return cached;
};

/** Demo-account passwords served at runtime by /api/demo-accounts (null until loaded). */
export const useDemoAccounts = () => {
  const [config, setConfig] = useState<DemoConfig | null>(null);
  useEffect(() => {
    let active = true;
    loadDemoConfig().then((c) => active && setConfig(c));
    return () => {
      active = false;
    };
  }, []);
  return {
    enabled: !!config?.enabled,
    passwords: config?.passwords,
  };
};
