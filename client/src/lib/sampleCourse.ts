import { v4 as uuidv4 } from "uuid";
import { SAMPLE_VIDEO_URL } from "./quiz";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

// One quiz per sample chapter, matching that chapter's topic
const QUIZZES: Record<string, QuizQuestion[]> = {
  welcome: [
    { id: 1, question: "What will you build in this course?", options: ["Websites with HTML, CSS and JavaScript", "Mobile games", "Database servers", "Operating systems"], correctAnswer: 0 },
    { id: 2, question: "Where can you check your understanding after each lesson?", options: ["The Quiz tab", "The Billing page", "The Settings page", "The sign-in page"], correctAnswer: 0 },
    { id: 3, question: "What is the best way to learn web development?", options: ["Practise by building small projects", "Only read about it", "Memorise every tag", "Skip the exercises"], correctAnswer: 0 },
  ],
  web: [
    { id: 1, question: "What does a browser send to a server to get a web page?", options: ["An HTTP request", "An email", "A database table", "A CSS file"], correctAnswer: 0 },
    { id: 2, question: "Which three files make up most web pages?", options: ["HTML, CSS and JavaScript", "PDF, DOC and TXT", "SQL, CSV and XML", "EXE, DLL and BAT"], correctAnswer: 0 },
    { id: 3, question: "What does a web server send back to the browser?", options: ["A response such as an HTML page", "A new browser", "A printed page", "Nothing at all"], correctAnswer: 0 },
    { id: 4, question: "What does HTTPS add to HTTP?", options: ["Encryption", "Colours", "Animations", "Images"], correctAnswer: 0 },
  ],
  firstPage: [
    { id: 1, question: "Which HTML tag creates the largest heading?", options: ["<h1>", "<h6>", "<head>", "<p>"], correctAnswer: 0 },
    { id: 2, question: "Which CSS property changes the text colour?", options: ["color", "font-size", "background", "margin"], correctAnswer: 0 },
    { id: 3, question: "Which tag creates a link to another page?", options: ["<a>", "<link>", "<nav>", "<href>"], correctAnswer: 0 },
    { id: 4, question: "How do you add JavaScript to an HTML page?", options: ["With a <script> tag", "With a <style> tag", "With a <meta> tag", "With a <div> tag"], correctAnswer: 0 },
  ],
  recap: [
    { id: 1, question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Transfer Machine Language", "Hyperlink and Text Management Language", "Home Tool Markup Language"], correctAnswer: 0 },
    { id: 2, question: "Which language is mainly used to style web pages?", options: ["Python", "CSS", "SQL", "Java"], correctAnswer: 1 },
    { id: 3, question: "Which keyword declares a variable that cannot be reassigned in JavaScript?", options: ["var", "let", "const", "static"], correctAnswer: 2 },
    { id: 4, question: "Which HTTP method is typically used to create a new resource?", options: ["GET", "POST", "DELETE", "HEAD"], correctAnswer: 1 },
    { id: 5, question: "In React, what stores data that changes over time inside a component?", options: ["Props", "State", "Routes", "Styles"], correctAnswer: 1 },
  ],
};

/**
 * Ready-made course content for the "Load sample course" button in the course
 * editor. Fresh ids every time, so the same sample can be loaded into many courses.
 * Every chapter comes with a quiz.
 */
export const buildSampleCourse = () => {
  const ids = {
    welcome: uuidv4(),
    web: uuidv4(),
    firstPage: uuidv4(),
    recap: uuidv4(),
  };

  const sections: Section[] = [
    {
      sectionId: uuidv4(),
      sectionTitle: "Getting Started",
      sectionDescription: "Set up your tools and learn how the web works.",
      chapters: [
        {
          chapterId: ids.welcome,
          type: "Video",
          title: "Welcome to the course",
          content:
            "Meet your instructor, see what you will build, and learn how to get the most out of each lesson.",
          video: SAMPLE_VIDEO_URL,
        },
        {
          chapterId: ids.web,
          type: "Text",
          title: "How the web works",
          content:
            "Browsers request pages from servers over HTTP. The server responds with HTML, CSS and JavaScript, which the browser turns into the page you see.",
          video: "",
        },
      ],
    },
    {
      sectionId: uuidv4(),
      sectionTitle: "HTML, CSS and JavaScript",
      sectionDescription: "The three building blocks of every web page.",
      chapters: [
        {
          chapterId: ids.firstPage,
          type: "Video",
          title: "Building your first page",
          content:
            "Write semantic HTML, style it with CSS, and add interactivity with a few lines of JavaScript.",
          video: SAMPLE_VIDEO_URL,
        },
        {
          chapterId: ids.recap,
          type: "Video",
          title: "Check your knowledge",
          content:
            "Watch the recap, then open the Quiz tab to test what you have learned in this section.",
          video: SAMPLE_VIDEO_URL,
        },
      ],
    },
  ];

  return {
    form: {
      courseTitle: "Web Development Fundamentals",
      courseDescription:
        "A beginner-friendly introduction to building websites with HTML, CSS and JavaScript, with video lessons and a quiz in every chapter.",
      courseCategory: "Web Development",
      coursePrice: "0",
      courseStatus: false,
    },
    sections,
    // Uploaded right after loading, one quiz per chapter
    quizzes: [
      { chapterId: ids.welcome, questions: QUIZZES.welcome },
      { chapterId: ids.web, questions: QUIZZES.web },
      { chapterId: ids.firstPage, questions: QUIZZES.firstPage },
      { chapterId: ids.recap, questions: QUIZZES.recap },
    ],
  };
};
