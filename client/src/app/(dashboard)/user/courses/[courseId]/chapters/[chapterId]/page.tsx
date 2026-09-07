"use client";

import { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Chatbot from "@/components/ChatBot";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, XIcon } from "lucide-react";

const languageOptions = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
  sql: 82,
  mongodb: 1001, // Custom ID for MongoDB (if needed)
};

const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();

  const playerRef = useRef(null);
  const [notes, setNotes] = useState("");
  const [googleQuery, setGoogleQuery] = useState("");
  const [compilerCode, setCompilerCode] = useState("");
  const [compilerOutput, setCompilerOutput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Fetch quiz data when the current chapter changes
  useEffect(() => {
    if (currentChapter?.chapterId) {
      fetchQuizData(currentChapter.chapterId);
    }
  }, [currentChapter]);

  // Function to fetch quiz data from the backend
  const fetchQuizData = async (chapterId: string) => {
    setQuizLoading(true);
    setQuizError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/json/${chapterId}`);
      setQuizData(response.data.data);
    } catch (error: unknown) {
      console.error("Error fetching quiz data:", error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      setQuizError(
        axiosError.response?.data?.message || 
        "Failed to load quiz for this chapter. Please try again later."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // Video Progress
  const handleProgress = ({ played }) => {
    if (
      played >= 0.8 &&
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  const handleDownloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "notes.txt";
    document.body.appendChild(element);
    element.click();
  };

  // Google Search
  const handleGoogleSearch = () => {
    if (googleQuery.trim()) {
      window.open(`https://www.google.com/search?q=${googleQuery}`, "_blank");
    }
  };

  // Run Code in Compiler
  const handleRunCode = async () => {
    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: compilerCode,
          language_id: languageOptions[selectedLanguage],
          stdin: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
          },
        }
      );

      const token = response.data.token;

      // Fetch execution result
      setTimeout(async () => {
        const result = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
            },
          }
        );

        setCompilerOutput(result.data.stdout || result.data.stderr || "No output");
      }, 3000);
    } catch (error) {
      setCompilerOutput(`Error: ${error?.message}`);
    }
  };

  // Quiz functions
  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const nextQuestion = () => {
    if (quizData?.questions && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    // Calculate score
    let correctAnswers = 0;
    quizData?.questions.forEach((question, index) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quizData.questions.length) * 100;
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="course">
      <div className="course__container">
        <div className="course__breadcrumb">
          <div className="course__path">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="course__current-chapter">{currentChapter?.title}</span>
          </div>
          <h2 className="course__title">{currentChapter?.title}</h2>
          <div className="course__header">
            <div className="course__instructor">
              <Avatar className="course__avatar">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="course__avatar-fallback">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="course__instructor-name">{course.teacherName}</span>
            </div>
          </div>
        </div>

        <Card className="course__video">
          <CardContent className="course__video-container">
            {currentChapter?.video ? (
              <ReactPlayer
                ref={playerRef}
                url={currentChapter.video}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                config={{ file: { attributes: { controlsList: "nodownload" } } }}
              />
            ) : (
              <div className="course__no-video">No video available for this chapter.</div>
            )}
          </CardContent>
        </Card>

        <div className="course__content">
          <Tabs defaultValue="Notes" className="course__tabs">
            <TabsList className="course__tabs-list">
              <TabsTrigger value="Notes">Notes</TabsTrigger>
              <TabsTrigger value="Resources">Resources</TabsTrigger>
              <TabsTrigger value="GoogleSearch">Google Search</TabsTrigger>
              <TabsTrigger value="OnlineCompiler">Online Compiler</TabsTrigger>
              <TabsTrigger value="Quiz">Quiz</TabsTrigger>
              {/* <TabsTrigger value="Chatbot">Chatbot</TabsTrigger> */}
            </TabsList>

            {/* Notes Section */}
            <TabsContent value="Notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your notes here..."
                  />
                  <Button onClick={handleDownloadNotes} className="bg-blue-500 mt-2">
                    Download Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="Resources">
              <Card>
                <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
                <CardContent>{currentChapter?.content}</CardContent>
              </Card>
            </TabsContent>

            {/* Quiz Section */}
            <TabsContent value="Quiz">
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  {quizLoading && <div className="text-center py-4">Loading quiz...</div>}
                  
                  {quizError && (
                    <div className="text-red-500 py-4">
                      No quiz available for this chapter.
                    </div>
                  )}
                  
                  {!quizLoading && !quizError && !quizData && (
                    <div className="py-4">
                      No quiz available for this chapter.
                    </div>
                  )}
                  
                  {!quizLoading && !quizError && quizData?.questions && (
                    <div className="quiz-container">
                      {quizSubmitted ? (
                        <div className="quiz-results">
                          <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
                          <div className="text-2xl font-bold mb-6">
                            Your Score: {quizScore.toFixed(0)}%
                          </div>
                          
                          <div className="space-y-6">
                            {quizData.questions.map((question, index) => (
                              <div 
                                key={question.id} 
                                className={`p-4 rounded-lg ${
                                  selectedAnswers[question.id] === question.correctAnswer 
                                    ? "bg-green-50" 
                                    : "bg-red-50"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {selectedAnswers[question.id] === question.correctAnswer ? (
                                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                  ) : (
                                    <XIcon className="h-5 w-5 text-red-500 mt-0.5" />
                                  )}
                                  <div>
                                    <p className="font-medium mb-2">
                                      {index + 1}. {question.question}
                                    </p>
                                    <div className="pl-4">
                                      <p className="text-sm">
                                        Your answer: {question.options[selectedAnswers[question.id]]}
                                      </p>
                                      {selectedAnswers[question.id] !== question.correctAnswer && (
                                        <p className="text-sm text-green-600">
                                          Correct answer: {question.options[question.correctAnswer]}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            onClick={resetQuiz} 
                            className="bg-blue-500 mt-6"
                          >
                            Retake Quiz
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex justify-between items-center">
                            <div className="text-sm">
                              Question {currentQuestionIndex + 1} of {quizData.questions.length}
                            </div>
                            <div className="text-sm">
                              {Object.keys(selectedAnswers).length} of {quizData.questions.length} answered
                            </div>
                          </div>
                          
                          <div className="quiz-question mb-6">
                            <h3 className="text-lg font-medium mb-4">
                              {quizData.questions[currentQuestionIndex].question}
                            </h3>
                            
                            <RadioGroup 
                              value={selectedAnswers[quizData.questions[currentQuestionIndex].id]?.toString()}
                              className="space-y-3"
                            >
                              {quizData.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <RadioGroupItem 
                                    id={`option-${optionIndex}`} 
                                    value={optionIndex.toString()}
                                    onClick={() => handleAnswerSelect(quizData.questions[currentQuestionIndex].id, optionIndex)}
                                  />
                                  <Label htmlFor={`option-${optionIndex}`}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button 
                              onClick={previousQuestion} 
                              disabled={currentQuestionIndex === 0}
                              variant="outline"
                            >
                              Previous
                            </Button>
                            
                            {currentQuestionIndex < quizData.questions.length - 1 ? (
                              <Button 
                                onClick={nextQuestion}
                                className="bg-blue-500"
                              >
                                Next
                              </Button>
                            ) : (
                              <Button 
                                onClick={submitQuiz}
                                disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
                                className="bg-green-600"
                              >
                                Submit Quiz
                              </Button>
                            )}
                          </div>
                          
                          {Object.keys(selectedAnswers).length < quizData.questions.length && 
                           currentQuestionIndex === quizData.questions.length - 1 && (
                            <div className="text-sm text-amber-600 mt-2">
                              Please answer all questions before submitting.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Google Search Section */}
            <TabsContent value="GoogleSearch">
              <Card>
                <CardHeader>
                  <CardTitle>Google Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="text"
                    value={googleQuery}
                    onChange={(e) => setGoogleQuery(e.target.value)}
                    className="border p-2 w-full mb-2"
                    placeholder="Enter your search query..."
                  />
                  <Button onClick={handleGoogleSearch} className="bg-blue-500">
                    Search
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Online Compiler Section */}
            <TabsContent value="OnlineCompiler">
              <Card>
                <CardHeader>
                  <CardTitle>Online Compiler</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="border p-2 w-full mb-2 border-input bg-customgreys-primarybg rounded-md text-white appearance-none"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {Object.keys(languageOptions).map((lang) => (
                      <option key={lang} value={lang} className="text-white bg-customgreys-secondarybg">
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <Textarea
                    value={compilerCode}
                    onChange={(e) => setCompilerCode(e.target.value)}
                    placeholder="Write your code here..."
                  />
                  <Button onClick={handleRunCode} className="bg-blue-500 mt-2">
                    Run Code
                  </Button>
                  <pre className="mt-2 p-2 border h-10 rounded-md">{compilerOutput}</pre>
                </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="Chatbot">
              <Chatbot/>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Course;