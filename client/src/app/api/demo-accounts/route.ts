import { NextResponse } from "next/server";

// Read at request time, so setting the env vars on the host only needs a restart,
// not a rebuild (NEXT_PUBLIC_* values are otherwise frozen into the build).
export const dynamic = "force-dynamic";

// Bracket access with a computed name keeps Next.js from inlining the value at build time
const readEnv = (...names: string[]) => {
  const env = process.env as Record<string, string | undefined>;
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
};

/**
 * Demo accounts for the one-click demo login on /signin and /signup.
 * Accepts DEMO_STUDENT_PASSWORD or NEXT_PUBLIC_DEMO_STUDENT_PASSWORD (same for teacher).
 * These are throwaway demo credentials, intentionally shown to visitors.
 */
export function GET() {
  const student = readEnv("DEMO_STUDENT_PASSWORD", "NEXT_PUBLIC_DEMO_STUDENT_PASSWORD");
  const teacher = readEnv("DEMO_TEACHER_PASSWORD", "NEXT_PUBLIC_DEMO_TEACHER_PASSWORD");

  if (!student || !teacher) {
    return NextResponse.json({ enabled: false });
  }
  return NextResponse.json({
    enabled: true,
    passwords: { student, teacher },
  });
}
