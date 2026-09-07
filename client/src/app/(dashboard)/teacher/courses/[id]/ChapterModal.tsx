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
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

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

  const onClose = () => {
    dispatch(closeChapterModal());
  };

  const uploadJsonFile = async () => {
    if (!jsonFile) return;

    const formData = new FormData();
    formData.append("jsonFile", jsonFile);
    formData.append("chapterId", chapterId);

    try {
      await axios.post(
        `http://localhost:8001/api/upload/${chapterId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("JSON file uploaded successfully");
    } catch (error) {
      console.error("Error uploading JSON file:", error);
      toast.error("JSON file upload failed");
    }
  };

  const onSubmit = async (data: ChapterFormData) => {
    if (selectedSectionIndex === null) return;

    const newChapter = {
      chapterId: chapterId,
      title: data.title,
      content: data.content,
      type: data.video ? "Video" : "Text",
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

            {/* Video Upload (UNCHANGED) */}
            <FormField
              control={methods.control}
              name="video"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel className="text-customgreys-dirtyGrey text-sm">
                    Chapter Video
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="border-none bg-customgreys-darkGrey py-2 cursor-pointer"
                      />
                      {typeof value === "string" && value && (
                        <div className="my-2 text-sm text-gray-600">
                          Current video: {value.split("/").pop()}
                        </div>
                      )}
                      {value instanceof File && (
                        <div className="my-2 text-sm text-gray-600">
                          Selected file: {value.name}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* JSON File Upload Field */}
            <FormItem>
              <FormLabel className="text-customgreys-dirtyGrey text-sm">
                Upload JSON File
              </FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="application/json" 
                  onChange={(e) => setJsonFile(e.target.files?.[0] || null)} 
                  className="border-none bg-customgreys-darkGrey py-2 cursor-pointer" 
                />
              </FormControl>
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
