"use client";

import Toolbar from "@/components/Toolbar";
import CourseCard from "@/components/CourseCard";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import Loading from "@/components/Loading";
import { Stagger, StaggerItem } from "@/components/Motion";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  RotateCw,
  Search,
  SearchX,
} from "lucide-react";

const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
    // Always reflect enrollments made elsewhere (e.g. on /search)
    refetchOnMountOrArgChange: true,
  });

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false,
        }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  if (!isLoaded || isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view your courses.</div>;

  const firstName = user.firstName ? `, ${user.firstName}` : "";

  if (isError) {
    return (
      <div className="user-courses">
        <Header title="My Courses" subtitle="View your enrolled courses" />
        <EmptyState
          tone="error"
          icon={AlertTriangle}
          title="We couldn't load your courses"
          text="Something went wrong while talking to the server. Check your connection and try again."
          action={
            <button type="button" onClick={() => refetch()} className="btn-glow">
              <RotateCw className="h-4 w-4" /> Try again
            </button>
          }
        />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="user-courses">
        <Header
          title={`Welcome${firstName}`}
          subtitle="Your learning journey starts here"
        />
        <EmptyState
          icon={BookOpen}
          title="You're not enrolled in any courses yet"
          text="Browse the catalog, enroll in a course, and it will show up here with your progress."
          action={
            <Link href="/search" scroll={false} className="btn-glow">
              <Search className="h-4 w-4" /> Browse courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="user-courses">
      <Header title="My Courses" subtitle="View your enrolled courses" />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      {filteredCourses.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title="No courses match your filters"
          text="Try a different search term or category."
        />
      ) : (
        <Stagger className="user-courses__grid" stagger={0.07}>
          {filteredCourses.map((course) => (
            <StaggerItem key={course.courseId}>
              <CourseCard course={course} onGoToCourse={handleGoToCourse} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
};

export default Courses;
