"use client";

import React, { useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  ListChecks,
  NotebookPen,
  PlayCircle,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";
import CourseCardSearch from "@/components/CourseCardSearch";
import { courseCategories } from "@/lib/utils";
import {
  CountUp,
  Reveal,
  Stagger,
  StaggerItem,
  handleSpotlightMove,
} from "@/components/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const HERO_IMAGES = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];

const TOPICS = [
  "React & Next.js",
  "Python",
  "Machine Learning",
  "System Design",
  "JavaScript",
  "SQL",
  "Cloud & DevOps",
  "UI/UX",
  "Data Structures",
  "Ethical Hacking",
];

const FEATURES = [
  {
    icon: PlayCircle,
    title: "HD video lessons",
    text: "Stream every chapter in a distraction-free player that remembers how far you got.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    text: "Chapters complete themselves as you watch, with section-level progress at a glance.",
    gradient: "from-cyan-500 to-sky-500",
  },
  {
    icon: ListChecks,
    title: "Chapter quizzes",
    text: "Check your understanding with quick multiple-choice quizzes and instant feedback.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Code2,
    title: "Built-in compiler",
    text: "Run C, C++, Python, Java, JavaScript and SQL right next to the lesson.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: NotebookPen,
    title: "Notes that travel",
    text: "Take notes while you learn and download them whenever you need to revise.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Award,
    title: "Certificates",
    text: "Finish a course and generate a certificate you can proudly share.",
    gradient: "from-violet-500 to-indigo-500",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Find your course",
    text: "Browse by category, preview every section and chapter, then enroll in a couple of clicks.",
  },
  {
    icon: BookOpen,
    title: "Learn at your pace",
    text: "Watch lessons, take notes, practise in the compiler and test yourself with quizzes — on your schedule.",
  },
  {
    icon: Award,
    title: "Earn your certificate",
    text: "Track every completed chapter and claim your certificate when you cross the finish line.",
  },
];

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-cyan-500 to-sky-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
];

/* --------------------------------------------------------------------- */

const HeroTitle = () => {
  const line1 = ["Learn", "without", "limits,"];
  const line2 = ["build", "your", "future."];
  const word = {
    hidden: { y: "110%", opacity: 0 },
    show: (i: number) => ({
      y: "0%",
      opacity: 1,
      transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 },
    }),
  };

  return (
    <h1 className="landing__title">
      {[line1, line2].map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.map((w, i) => (
            <span
              key={w}
              className="inline-block overflow-hidden pb-[0.08em] align-bottom"
            >
              <motion.span
                className={`landing__title-word ${
                  lineIndex === 1 ? "text-gradient" : ""
                }`}
                variants={word}
                initial="hidden"
                animate="show"
                custom={lineIndex * line1.length + i}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
};

const HeroVisual = ({ currentImage }: { currentImage: number }) => {
  // Pointer-driven 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
      className="landing__visual"
      style={{ perspective: 1200 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="landing__visual-ring" />
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div className="landing__hero-images">
          {HERO_IMAGES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Students learning ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 90vw, 520px"
              className={`landing__hero-image ${
                index === currentImage ? "landing__hero-image--active" : ""
              }`}
            />
          ))}
          <div className="landing__hero-shade" />
          <div className="landing__hero-dots">
            {HERO_IMAGES.map((src, index) => (
              <span
                key={src}
                className={`landing__hero-dot ${
                  index === currentImage ? "landing__hero-dot--active" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div
          className="landing__chip -left-4 top-10 animate-float sm:-left-10"
        >
          <span className="landing__chip-icon bg-gradient-to-br from-indigo-500 to-violet-500">
            <PlayCircle className="h-5 w-5" />
          </span>
          <span>
            Video lessons
            <small>Watch & learn</small>
          </span>
        </div>
        <div
          className="landing__chip -right-3 top-1/2 animate-float [animation-delay:1.5s] sm:-right-8"
        >
          <span className="landing__chip-icon bg-gradient-to-br from-emerald-500 to-teal-500">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <span>
            Chapter complete
            <small>Progress saved</small>
          </span>
        </div>
        <div
          className="landing__chip bottom-14 left-6 animate-float [animation-delay:3s] sm:-left-6"
        >
          <span className="landing__chip-icon bg-gradient-to-br from-amber-500 to-orange-500">
            <Award className="h-5 w-5" />
          </span>
          <span>
            Certificate earned
            <small>Ready to share</small>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TopicMarquee = ({ onSelect }: { onSelect: () => void }) => {
  const rowA = [...courseCategories.map((c) => c.label), ...TOPICS.slice(0, 3)];
  const rowB = [...TOPICS.slice(3), ...courseCategories.map((c) => c.label).slice(0, 3)];

  const Row = ({ items, reverse }: { items: string[]; reverse?: boolean }) => (
    <div className="marquee">
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className={`marquee__track ${reverse ? "marquee__track--reverse" : ""}`}
        >
          {items.map((item) => (
            <button key={`${copy}-${item}`} onClick={onSelect} className="landing__tag">
              <Sparkles className="h-3.5 w-3.5 text-primary-300" />
              {item}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <section className="landing__tags" aria-label="Popular topics">
      <Row items={rowA} />
      <Row items={rowB} reverse />
    </section>
  );
};

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section ref={ref} className="landing__steps">
      <div className="landing__steps-sticky">
        <Reveal>
          <span className="eyebrow">
            <span className="eyebrow__dot" /> How it works
          </span>
          <h2 className="section-title mt-5">
            From curious to <span className="text-gradient">certified</span> in
            three steps.
          </h2>
          <p className="section-subtitle">
            A learning flow designed to keep you moving forward — no friction,
            no guesswork.
          </p>
        </Reveal>
        <div className="landing__steps-rail">
          <motion.div
            className="landing__steps-rail-fill"
            style={{ scaleY: fill }}
          />
        </div>
      </div>

      <div className="landing__steps-list">
        {STEPS.map((step, index) => (
          <motion.article
            key={step.title}
            className="landing__step spotlight"
            onMouseMove={handleSpotlightMove}
            initial={{ opacity: 0, x: 60, rotate: 1.5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="flex items-start justify-between">
              <span className="landing__step-number">0{index + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white-100 shadow-glow">
                <step.icon className="h-6 w-6" />
              </span>
            </div>
            <h3 className="landing__step-title">{step.title}</h3>
            <p className="landing__step-text">{step.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------- */

const Landing = () => {
  const router = useRouter();
  const currentImage = useCarousel({ totalImages: HERO_IMAGES.length });
  const { data: courses, isLoading } = useGetCoursesQuery({});

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(heroProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const visualY = useTransform(heroProgress, [0, 1], [0, -90]);
  const visualScale = useTransform(heroProgress, [0, 1], [1, 0.9]);

  const stats = useMemo(() => {
    const list = courses ?? [];
    return {
      courses: list.length,
      learners: list.reduce((sum, c) => sum + (c.enrollments?.length ?? 0), 0),
      lessons: list.reduce(
        (sum, c) =>
          sum + (c.sections ?? []).reduce((s, sec) => s + sec.chapters.length, 0),
        0
      ),
      instructors: new Set(list.map((c) => c.teacherName)).size,
      teacherInitials: Array.from(new Set(list.map((c) => c.teacherName)))
        .slice(0, 4)
        .map((name) => name?.[0] ?? "?"),
    };
  }, [courses]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`, { scroll: false });
  };

  return (
    <div className="landing">
      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} className="landing__hero">
        <motion.div
          className="landing__hero-content"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="eyebrow__dot" /> New courses added regularly
          </motion.span>

          <HeroTitle />

          <motion.p
            className="landing__description"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
          >
            Expert-led courses in development, AI, data, cloud and design —
            with video lessons, quizzes, a built-in compiler and certificates
            to prove what you&apos;ve learned.
          </motion.p>

          <motion.div
            className="landing__cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
          >
            <Link href="/search" scroll={false} className="landing__cta-button">
              Explore courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" scroll={false} className="btn-ghost">
              Start for free
            </Link>
          </motion.div>

          {stats.instructors > 0 && (
            <motion.div
              className="landing__trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <div className="landing__trust-avatars">
                {stats.teacherInitials.map((initial, i) => (
                  <span
                    key={i}
                    className={`landing__trust-avatar bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <span>
                Taught by{" "}
                <strong className="text-white-100">{stats.instructors}</strong>{" "}
                expert instructor{stats.instructors === 1 ? "" : "s"}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div style={{ y: visualY, scale: visualScale }}>
          <HeroVisual currentImage={currentImage} />
        </motion.div>

        <div className="landing__scroll-cue">
          <span>Scroll</span>
          <span className="landing__scroll-cue-line" />
        </div>
      </section>

      {/* ---------------- TOPICS MARQUEE ---------------- */}
      <TopicMarquee onSelect={() => router.push("/search", { scroll: false })} />

      {/* ---------------- STATS ---------------- */}
      {!isLoading && courses && courses.length > 0 && (
        <Stagger className="landing__stats">
          {[
            { label: "Courses", value: stats.courses },
            { label: "Enrollments", value: stats.learners },
            { label: "Lessons", value: stats.lessons },
            { label: "Instructors", value: stats.instructors },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="landing__stat" onMouseMove={handleSpotlightMove}>
                <div className="landing__stat-value">
                  <CountUp value={stat.value} />
                </div>
                <div className="landing__stat-label">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* ---------------- FEATURES ---------------- */}
      <section className="landing__section">
        <Reveal className="landing__section-head">
          <span className="eyebrow">
            <span className="eyebrow__dot" /> Everything included
          </span>
          <h2 className="section-title mt-5">
            One place to <span className="text-gradient">learn, practise</span>{" "}
            and prove it.
          </h2>
          <p className="section-subtitle">
            Every course comes with the tools you need to actually master the
            material — not just watch it.
          </p>
        </Reveal>

        <Stagger className="landing__features" stagger={0.08}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div
                className="landing__feature group h-full"
                onMouseMove={handleSpotlightMove}
              >
                <div
                  className={`landing__feature-icon bg-gradient-to-br ${feature.gradient}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="landing__feature-title">{feature.title}</h3>
                <p className="landing__feature-text">{feature.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <HowItWorks />

      {/* ---------------- FEATURED COURSES ---------------- */}
      <section className="landing__featured">
        <Reveal className="landing__featured-head">
          <div>
            <span className="eyebrow">
              <span className="eyebrow__dot" /> Featured
            </span>
            <h2 className="landing__featured-title mt-5">
              Courses learners <span className="text-gradient">love</span>
            </h2>
            <p className="landing__featured-description">
              From beginner to advanced, hand-picked courses to start your
              journey today.
            </p>
          </div>
          <Link href="/search" scroll={false} className="btn-ghost shrink-0">
            View all courses <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        {isLoading ? (
          <div className="landing__courses">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="landing-skeleton__course-card" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <Stagger className="landing__courses">
            {courses.slice(0, 4).map((course) => (
              <StaggerItem key={course.courseId} className="h-full">
                <CourseCardSearch
                  course={course}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="landing__courses">
            <div className="landing__empty">
              No courses yet — check back soon.
            </div>
          </div>
        )}
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="landing__cta-band">
        <Reveal>
          <div className="landing__cta-card">
            <h2 className="section-title mx-auto max-w-3xl">
              Your next skill is <span className="text-gradient">one click</span>{" "}
              away.
            </h2>
            <p className="section-subtitle mx-auto">
              Create a free account, enroll in a course and start learning in
              minutes.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/signup" scroll={false} className="btn-glow">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/search" scroll={false} className="btn-ghost">
                Browse catalog
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default Landing;
