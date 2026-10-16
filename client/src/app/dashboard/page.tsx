"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";

/**
 * Post-sign-in landing route. The role is only known once Clerk has a user,
 * so the sign-in/up forms redirect here and this page forwards by role.
 */
export default function DashboardRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    const role = user.publicMetadata?.userType;
    router.replace(role === "teacher" ? "/teacher/courses" : "/user/courses");
  }, [isLoaded, user, router]);

  return <Loading />;
}
