"use client";

import Loading from "@/components/Loading";
import { useEnrollFreeMutation, useGetCoursesQuery } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { useUser } from "@clerk/nextjs";

const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data: courses, isLoading, isError } = useGetCoursesQuery({});
  // Track the selection by id so it always reflects the latest fetched data
  // (e.g. the enrollment list after enrolling).
  const [selectedId, setSelectedId] = useState<string | null>(id);
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [enrollFree, { isLoading: isEnrolling }] = useEnrollFreeMutation();

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const selectedCourse =
    courses.find((c) => c.courseId === selectedId) ?? courses[0] ?? null;

  const isEnrolled =
    !!user &&
    !!selectedCourse?.enrollments?.some((e) => e.userId === user.id);

  const isPaid = (selectedCourse?.price ?? 0) > 0;

  const handleEnrollNow = async (courseId: string) => {
    if (isEnrolled) {
      router.push("/user/courses", { scroll: false });
      return;
    }

    // Paid courses go through the Stripe checkout wizard, which also
    // handles sign-in for visitors who aren't logged in yet.
    if (isPaid) {
      router.push(`/checkout?step=1&id=${courseId}&showSignUp=false`, {
        scroll: false,
      });
      return;
    }

    if (!isSignedIn || !user) {
      router.push("/signin", { scroll: false });
      return;
    }

    try {
      await enrollFree({ courseId, userId: user.id }).unwrap();
      router.push("/user/courses", { scroll: false });
    } catch (error) {
      // The API layer already shows an error toast.
      console.error("Error enrolling in course:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <h1 className="search__title">
        Explore <span className="text-gradient">courses</span>
      </h1>
      <h2 className="search__subtitle">{courses.length} courses available</h2>
      <div className="search__content">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="search__courses-grid"
        >
          {courses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => setSelectedId(course.courseId)}
            />
          ))}
        </motion.div>

        {selectedCourse && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="search__selected-course"
          >
            <SelectedCourse
              course={selectedCourse}
              handleEnrollNow={handleEnrollNow}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              isSignedIn={!!isSignedIn}
              isPaid={isPaid}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
