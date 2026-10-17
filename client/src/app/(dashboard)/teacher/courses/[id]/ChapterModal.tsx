import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChapterFormData, chapterSchema } from "@/lib/schemas";
import { addChapter, closeChapterModal, editChapter } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  Film,
  Sparkles,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { SAMPLE_QUIZ_PATH, SAMPLE_VIDEO_URL, validateQuiz } from "@/lib/quiz";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ChapterModal = () => {
  const dispatch = useAppDispatch();
  const {
    isChapterModalOpen,
    selectedSectionIndex,
    selectedChapterIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const chapter =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  const [chapterId, setChapterId] = useState<string>(chapter?.chapterId || uuidv4());
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  // What the quiz field shows: the saved quiz, a checked file ready to upload, or a problem
  const [quizStatus, setQuizStatus] = useState<
    | { kind: "none" }
    | { kind: "saved"; count: number }
    | { kind: "ready"; count: number; name: string }
    | { kind: "error"; problems: string[] }
  >({ kind: "none" });
  const [fileInputKey, setFileInputKey] = useState(0); // resets the file inputs

  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: "",
    },
  });

  useEffect(() => {
    if (chapter) {
      setChapterId(chapter.chapterId);
      methods.reset({
        title: chapter.title,
        content: chapter.content,
        video: chapter.video || "",
      });
    } else {
      setChapterId(uuidv4());
      methods.reset({
        title: "",
        content: "",
        video: "",
      });
    }
  }, [chapter, methods]);

  // Reset the quiz field when the modal opens for a chapter, and show its saved quiz
  useEffect(() => {
    if (!isChapterModalOpen) return;
    setJsonFile(null);
    setFileInputKey((k) => k + 1);
    setQuizStatus({ kind: "none" });
    if (!chapter?.chapterId) return;
    let cancelled = false;
    axios
      .get(`${API_BASE}/api/json/${chapter.chapterId}`)
      .then((res) => {
        const count = res.data?.data?.questions?.length ?? 0;
        if (!cancelled && count > 0) setQuizStatus({ kind: "saved", count });
      })
      .catch(() => {}); // 404 = this chapter has no quiz yet
    return () => {
      cancelled = true;
    };
  }, [isChapterModalOpen, chapter?.chapterId]);

  const onClose = () => {
    dispatch(closeChapterModal());
  };

  // Check a quiz file in the browser before it is uploaded
  const selectQuizFile = async (file: File | null) => {
    if (!file) {
      setJsonFile(null);
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      const problems = validateQuiz(data);
      if (problems.length > 0) {
        setJsonFile(null);
        setQuizStatus({ kind: "error", problems });
        return;
      }
      setJsonFile(file);
      setQuizStatus({ kind: "ready", count: data.questions.length, name: file.name });
    } catch {
      setJsonFile(null);
      setQuizStatus({ kind: "error", problems: ["This file is not valid JSON"] });
    }
  };

  const loadSampleQuiz = async () => {
    try {
      const text = await (await fetch(SAMPLE_QUIZ_PATH)).text();
      await selectQuizFile(new File([text], "sample-quiz.json", { type: "application/json" }));
    } catch {
      toast.error("Couldn't load the sample quiz");
    }
  };

  const uploadJsonFile = async () => {
    if (!jsonFile) return;

    const formData = new FormData();
    formData.append("jsonFile", jsonFile);

    try {
      await axios.post(`${API_BASE}/api/upload/${chapterId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Quiz uploaded successfully");
    } catch (error) {
      console.error("Error uploading quiz:", error);
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Quiz upload failed";
      toast.error(message);
    }
  };

  const onSubmit = async (data: ChapterFormData) => {
    if (selectedSectionIndex === null) return;

    const newChapter = {
      chapterId: chapterId,
      title: data.title,
      content: data.content,
      type: (data.video ? "Video" : "Text") as "Text" | "Quiz" | "Video",
      video: data.video || "",
    };

    if (selectedChapterIndex === null) {
      dispatch(addChapter({ sectionIndex: selectedSectionIndex, chapter: newChapter }));
    } else {
      dispatch(editChapter({ sectionIndex: selectedSectionIndex, chapterIndex: selectedChapterIndex, chapter: newChapter }));
    }

    toast.success("Chapter saved successfully");

    // Upload JSON separately without affecting video upload
    await uploadJsonFile();

    onClose();
  };

  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="chapter-modal">
        <div className="chapter-modal__header">
          <h2 className="chapter-modal__title">Add/Edit Chapter</h2>
          <button onClick={onClose} className="chapter-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="chapter-modal__form">
            <CustomFormField 
              name="title" 
              label="Chapter Title" 
              placeholder="Write chapter title here" 
            />
            
            <CustomFormField 
              name="content" 
              label="Chapter Content" 
              type="textarea" 
              placeholder="Write chapter content here" 
            />

            {/* Chapter video: upload an MP4 (sent to S3 on save) or use the sample */}
            <FormField
              control={methods.control}
              name="video"
              render={({ field: { onChange, value } }) => (
                <FormItem className="upload-field">
                  <div className="upload-field__head">
                    <FormLabel className="upload-field__label">
                      <Film className="h-4 w-4" /> Chapter video
                    </FormLabel>
                    <button
                      type="button"
                      className="upload-field__sample"
                      onClick={() => onChange(SAMPLE_VIDEO_URL)}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Use sample video
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      key={`video-${fileInputKey}`}
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange(file);
                      }}
                      className="upload-field__input"
                    />
                  </FormControl>
                  <p className="upload-field__hint">
                    MP4 file, uploaded to cloud storage when you save the course.
                  </p>
                  {typeof value === "string" && value && (
                    <div className="upload-field__status upload-field__status--ok">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {value === SAMPLE_VIDEO_URL
                          ? "Sample video selected"
                          : `Current video: ${value.split("/").pop()}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChange("")}
                        className="upload-field__clear"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {value instanceof File && (
                    <div className="upload-field__status upload-field__status--ok">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Selected: {value.name}</span>
                    </div>
                  )}
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Chapter quiz: a JSON file, checked in the browser before upload */}
            <FormItem className="upload-field">
              <div className="upload-field__head">
                <FormLabel className="upload-field__label">
                  <FileJson className="h-4 w-4" /> Chapter quiz (JSON)
                </FormLabel>
                <div className="flex items-center gap-3">
                  <a
                    href={SAMPLE_QUIZ_PATH}
                    download="sample-quiz.json"
                    className="upload-field__sample"
                  >
                    <Download className="h-3.5 w-3.5" /> Sample file
                  </a>
                  <button
                    type="button"
                    className="upload-field__sample"
                    onClick={loadSampleQuiz}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Use sample quiz
                  </button>
                </div>
              </div>
              <FormControl>
                <Input
                  key={`quiz-${fileInputKey}`}
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => selectQuizFile(e.target.files?.[0] || null)}
                  className="upload-field__input"
                />
              </FormControl>
              <p className="upload-field__hint">
                Format: <code>{'{ "questions": [ { "id", "question", "options": [...], "correctAnswer": 0 } ] }'}</code>.
                {" "}<code>correctAnswer</code> is the index of the right option.
              </p>
              {quizStatus.kind === "saved" && (
                <div className="upload-field__status upload-field__status--ok">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  This chapter has a quiz with {quizStatus.count} questions. Upload a
                  file to replace it.
                </div>
              )}
              {quizStatus.kind === "ready" && (
                <div className="upload-field__status upload-field__status--ok">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {quizStatus.name}: {quizStatus.count} questions ready. Uploaded
                  when you save the chapter.
                </div>
              )}
              {quizStatus.kind === "error" && (
                <div className="upload-field__status upload-field__status--error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <ul className="space-y-0.5">
                    {quizStatus.problems.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </FormItem>

            <div className="chapter-modal__actions">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary-500">Save</Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
