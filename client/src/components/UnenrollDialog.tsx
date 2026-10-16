"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, Loader2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUnenrollCourseMutation } from "@/state/api";
import { formatPrice } from "@/lib/utils";

/** Confirmation dialog that removes the signed-in user from a course. */
const UnenrollDialog = ({
  course,
  open,
  onOpenChange,
  onUnenrolled,
}: {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnenrolled?: () => void;
}) => {
  const { user } = useUser();
  const [unenroll, { isLoading }] = useUnenrollCourseMutation();
  const isPaid = (course.price ?? 0) > 0;

  const handleConfirm = async () => {
    if (!user) return;
    try {
      await unenroll({ userId: user.id, courseId: course.courseId }).unwrap();
      onOpenChange(false);
      onUnenrolled?.();
    } catch (error) {
      // The API layer already shows an error toast.
      console.error("Error unenrolling:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <DialogContent className="unenroll-dialog">
        <DialogHeader>
          <div className="unenroll-dialog__icon">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="unenroll-dialog__title">
            Unenroll from this course?
          </DialogTitle>
          <DialogDescription className="unenroll-dialog__text">
            You&apos;ll lose access to{" "}
            <span className="font-semibold text-white-100">{course.title}</span>{" "}
            and all of your progress in it will be deleted.
          </DialogDescription>
        </DialogHeader>

        {isPaid && (
          <p className="unenroll-dialog__warning">
            This course costs {formatPrice(course.price)}. Unenrolling does not
            issue a refund, and you&apos;d need to purchase it again to regain
            access.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="btn-ghost"
          >
            Keep course
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="unenroll-dialog__confirm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Unenrolling…
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" /> Unenroll
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnenrollDialog;
