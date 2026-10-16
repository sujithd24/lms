"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import UnenrollDialog from "./UnenrollDialog";

const CourseCard = ({ course, onGoToCourse }: CourseCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Card className="course-card group" onClick={() => onGoToCourse(course)}>
        <button
          type="button"
          className="course-card__menu"
          aria-label={`Unenroll from ${course.title}`}
          onClick={(e) => {
            e.stopPropagation(); // don't open the course
            setConfirmOpen(true);
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> Unenroll
        </button>
        <CardHeader className="course-card__header">
          <Image
            src={course.image || "/placeholder.png"}
            alt={course.title}
            width={400}
            height={350}
            className="course-card__image"
            priority
          />
        </CardHeader>
        <CardContent className="course-card__content">
          <CardTitle className="course-card__title">
            {course.title}: {course.description}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage alt={course.teacherName} />
              <AvatarFallback className="bg-secondary-700 text-black">
                {course.teacherName[0]}
              </AvatarFallback>
            </Avatar>

            <p className="text-sm text-customgreys-dirtyGrey">
              {course.teacherName}
            </p>
          </div>

          <CardFooter className="course-card__footer">
            <div className="course-card__category">{course.category}</div>
            <span className="course-card__price">
              {formatPrice(course.price)}
            </span>
          </CardFooter>
        </CardContent>
      </Card>

      {/* Rendered outside the card so dialog clicks don't bubble to the card's onClick */}
      <UnenrollDialog
        course={course}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
};

export default CourseCard;
