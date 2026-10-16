import AccordionSections from "@/components/AccordionSections";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LogIn,
} from "lucide-react";
import React, { useState } from "react";
import UnenrollDialog from "@/components/UnenrollDialog";

const SelectedCourse = ({
  course,
  handleEnrollNow,
  isEnrolled = false,
  isEnrolling = false,
  isSignedIn = false,
  isPaid = false,
}: SelectedCourseProps) => {
  const enrollmentCount = course.enrollments?.length ?? 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const renderButtonContent = () => {
    if (isEnrolling) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Enrolling…
        </>
      );
    }
    if (isEnrolled) {
      return (
        <>
          <CheckCircle2 className="h-4 w-4" /> Go to my courses
          <ArrowRight className="h-4 w-4" />
        </>
      );
    }
    if (isPaid) {
      return (
        <>
          <CreditCard className="h-4 w-4" /> Enroll Now
          <ArrowRight className="h-4 w-4" />
        </>
      );
    }
    if (!isSignedIn) {
      return (
        <>
          <LogIn className="h-4 w-4" /> Sign in to enroll
        </>
      );
    }
    return (
      <>
        Enroll for free <ArrowRight className="h-4 w-4" />
      </>
    );
  };

  return (
    <div className="selected-course">
      <div>
        <h3 className="selected-course__title">{course.title}</h3>
        <p className="selected-course__author">
          By {course.teacherName} |{" "}
          <span className="selected-course__enrollment-count">
            {enrollmentCount}
          </span>{" "}
          enrolled
        </p>
        {isEnrolled && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> You&apos;re enrolled
          </span>
        )}
      </div>

      <div className="selected-course__content">
        <p className="selected-course__description">{course.description}</p>

        <div className="selected-course__sections">
          <h4 className="selected-course__sections-title">Course Content</h4>
          <AccordionSections sections={course.sections} />
        </div>

        <div className="selected-course__footer">
          <span className="selected-course__price">
            {isPaid ? formatPrice(course.price) : "Free"}
          </span>
          <Button
            onClick={() => handleEnrollNow(course.courseId)}
            disabled={isEnrolling}
            className={
              isEnrolled
                ? "rounded-xl bg-emerald-500/90 hover:bg-emerald-500"
                : "btn-glow h-auto"
            }
          >
            {renderButtonContent()}
          </Button>
        </div>

        {isEnrolled && (
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-xs text-customgreys-dirtyGrey underline-offset-4 transition-colors hover:text-red-300 hover:underline"
            >
              Unenroll from this course
            </button>
          </div>
        )}
      </div>

      <UnenrollDialog
        course={course}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
};

export default SelectedCourse;
