"use client";

import { CustomFormField } from "@/components/CustomFormField";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  courseCategories,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  EyeOff,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Save,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { buildSampleCourse } from "@/lib/sampleCourse";
import { useForm } from "react-hook-form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
    },
  });

  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        // New courses start as "Uncategorized", which isn't an option: show the placeholder
        courseCategory: courseCategories.some((c) => c.value === course.category)
          ? course.category
          : "",
        coursePrice: centsToDollars(course.price),
        courseStatus: course.status === "Published",
      });
      dispatch(setSections(course.sections || []));
    }
  }, [course, methods]); // eslint-disable-line react-hooks/exhaustive-deps

  const [loadingSample, setLoadingSample] = useState(false);
  // Which button is saving right now (shows its spinner and locks both buttons)
  const [savingAs, setSavingAs] = useState<"Draft" | "Published" | null>(null);
  const isPublished = course?.status === "Published";

  // Each button saves the form with the status its label promises
  const saveAs = (status: "Draft" | "Published") => {
    methods.setValue("courseStatus", status === "Published");
    methods.handleSubmit(async (data) => {
      setSavingAs(status);
      try {
        await onSubmit(data);
      } finally {
        setSavingAs(null);
      }
    })();
  };

  // Fill the editor with a ready-made course (sample videos + a sample quiz).
  // Nothing is saved until the teacher clicks Save.
  const handleLoadSample = async () => {
    const hasContent =
      sections.length > 0 ||
      (methods.getValues("courseDescription") ?? "").trim().length > 0;
    if (
      hasContent &&
      !window.confirm(
        "Replace this course's details and sections with the sample course? Nothing is saved until you click Save."
      )
    ) {
      return;
    }

    setLoadingSample(true);
    const sample = buildSampleCourse();
    methods.reset(sample.form);
    dispatch(setSections(sample.sections));

    // Attach a topic quiz to every sample chapter
    const results = await Promise.allSettled(
      sample.quizzes.map(({ chapterId, questions }) => {
        const formData = new FormData();
        formData.append(
          "jsonFile",
          new File([JSON.stringify({ questions })], "sample-quiz.json", {
            type: "application/json",
          })
        );
        return axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/${chapterId}`,
          formData
        );
      })
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error("Sample quiz uploads failed:", results);
      toast.error(`Sample loaded, but ${failed} of ${results.length} quizzes could not be uploaded`);
    }

    setLoadingSample(false);
    toast.success("Sample course loaded. Review it, then click Save Draft to keep it.");
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      const updatedSections = await uploadAllVideos(
        sections,
        id,
        getUploadVideoUrl
      );

      const formData = createCourseFormData(data, updatedSections, course?.level);

      await updateCourse({
        courseId: id,
        formData,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2 cursor-pointer hover:bg-customgreys-dirtyGrey hover:text-white-100 text-customgreys-dirtyGrey"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>

      <Form {...methods}>
        <form
          onSubmit={(e) => {
            // Enter in a field saves but keeps the current status (never publishes by accident)
            e.preventDefault();
            saveAs(isPublished ? "Published" : "Draft");
          }}
        >
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`course-status ${
                    isPublished ? "course-status--published" : "course-status--draft"
                  }`}
                >
                  <span className="course-status__dot" />
                  {isPublished ? "Published" : "Draft"}
                </span>
                {isPublished ? (
                  <>
                    <button
                      type="button"
                      onClick={() => saveAs("Draft")}
                      disabled={savingAs !== null}
                      className="btn-ghost px-5 py-2.5 text-sm disabled:opacity-60"
                      title="Hide the course from students and keep it as a draft"
                    >
                      {savingAs === "Draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
                      Unpublish
                    </button>
                    <button
                      type="button"
                      onClick={() => saveAs("Published")}
                      disabled={savingAs !== null}
                      className="btn-glow px-5 py-2.5 text-sm disabled:opacity-60"
                    >
                      {savingAs === "Published" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => saveAs("Draft")}
                      disabled={savingAs !== null}
                      className="btn-ghost px-5 py-2.5 text-sm disabled:opacity-60"
                    >
                      {savingAs === "Draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={() => saveAs("Published")}
                      disabled={savingAs !== null}
                      className="btn-glow px-5 py-2.5 text-sm disabled:opacity-60"
                      title="Save and make the course visible to students"
                    >
                      {savingAs === "Published" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                      Publish
                    </button>
                  </>
                )}
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField
                  name="courseTitle"
                  label="Course Title"
                  type="text"
                  placeholder="Write course title here"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Course Description"
                  type="textarea"
                  placeholder="Write course description here"
                  initialValue={course?.description}
                />

                <CustomFormField
                  name="courseCategory"
                  label="Course Category"
                  type="select"
                  placeholder="Select category here"
                  options={[...courseCategories]}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Course Price"
                  type="number"
                  placeholder="0"
                  initialValue={course?.price}
                />
              </div>
            </div>

            <div className="glass mt-4 md:mt-0 p-5 rounded-2xl basis-1/2">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h2 className="font-display text-2xl font-semibold text-white-100">
                  Sections
                </h2>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadSample}
                    disabled={loadingSample}
                    className="text-customgreys-dirtyGrey hover:text-white-100"
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    Sample course
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      dispatch(openSectionModal({ sectionIndex: null }))
                    }
                    className="border-none text-primary-400 group"
                  >
                    <Plus className="mr-1 h-4 w-4 text-primary-400 group-hover:white-100" />
                    <span className="text-primary-400 group-hover:white-100">
                      Add Section
                    </span>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <div className="sections-empty">
                  <div className="sections-empty__icon">
                    <Layers className="h-6 w-6" />
                  </div>
                  <p className="sections-empty__title">No sections yet</p>
                  <p className="sections-empty__text">
                    Add a section and its chapters, or start from a ready-made
                    sample course with videos and a quiz.
                  </p>
                  <div className="sections-empty__actions">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      disabled={loadingSample}
                      className="btn-glow px-5 py-2.5 text-sm disabled:opacity-60"
                    >
                      {loadingSample ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Load sample course
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(openSectionModal({ sectionIndex: null }))
                      }
                      className="btn-ghost px-5 py-2.5 text-sm"
                    >
                      <Plus className="h-4 w-4" /> Add section
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
