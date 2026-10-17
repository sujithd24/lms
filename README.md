# LMS Platform - Learning Management System

A full-stack Learning Management System built with Next.js 15, Express.js, TypeScript, and MongoDB. Features course creation, Stripe payments, Clerk authentication, video hosting, progress tracking, and more.

---

## Features

### Authentication & Authorization
- Clerk-based authentication with role system (Student / Teacher)
- Role selection during sign-up
- Role-based routing (students → `/user/courses`, teachers → `/teacher/courses`)
- Protected API routes with `requireAuth()` middleware
- User profile management via Clerk UserProfile component

### Course Management
- **Teacher Dashboard**: Create, edit, delete courses with full editor
- **Course Editor**: Title, description, category, price, status (Draft/Published)
- **8 Categories**: Computer Science, AI, Web Development, Data Science, Mobile Development, Cloud Computing, Cybersecurity, Design
- **Section & Chapter Management**: Add, edit, delete sections and chapters
- **Chapter Types**: Text, Video, Quiz
- **Drag-and-Drop Reorder**: Sections and chapters via `@hello-pangea/dnd`
- **Course Image Upload**: Multer-based image upload on course update
- **Video Upload**: Presigned S3 URLs for direct-to-S3 video uploads
- **JSON Quiz Upload**: Upload quiz files per chapter

### Student Dashboard
- **Enrolled Courses**: Grid view with search and category filter
- **Chapter Viewer**: Breadcrumb navigation, video player, notes, quiz, compiler, search
- **Video Player**: ReactPlayer with auto-complete at 80% watched
- **Progress Tracking**: Per-chapter completion, overall progress percentage, section-level progress bars
- **Chapters Sidebar**: Collapsible sidebar with section/chapter tree, completion status, progress bars
- **Generate Certificate**: PDF certificate generation with jsPDF + html2canvas

### Payments (Stripe)
- **Stripe Integration**: Payment Intent with automatic payment methods
- **3-Step Checkout Wizard**: Details → Payment → Confirmation
- **Free Course Enrollment**: No payment required for free courses
- **Transaction Recording**: All purchases logged in MongoDB
- **Payment History**: Both students and teachers can view billing history
- **Guest Checkout**: Available as a stretch feature

### Online Code Compiler
- Judge0 CE API integration via RapidAPI
- Supported languages: C, C++, Python, Java, JavaScript, SQL, MongoDB
- In-browser code editor with run button and output display

### Quiz System
- JSON-based quiz data per chapter
- Multiple-choice questions with radio selection
- Previous/Next navigation
- Results page with score percentage and correct answer display
- Retake quiz functionality

### Notes & Search
- Per-chapter notes with download as `.txt`
- In-chapter Google search integration
- Course catalog search by title and category

### Notification Settings
- Course Notifications, Email Alerts, SMS Alerts toggles
- Notification Frequency: Immediate / Daily / Weekly

### Landing Page
- Hero image carousel with Framer Motion animations
- Featured courses section
- Category tags for browsing

### UI/UX
- Dark theme throughout
- Skeleton loading states
- Toast notifications (sonner)
- Responsive design (mobile-friendly)
- Collapsible sidebar with icon mode

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Redux Toolkit (RTK Query) |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Authentication | Clerk (`@clerk/nextjs`, `@clerk/express`) |
| Payments | Stripe (`stripe`, `@stripe/react-stripe-js`) |
| Database | MongoDB Atlas (via Mongoose) |
| File Storage | AWS S3 + CloudFront |
| Backend | Express.js, TypeScript |
| Compiler API | Judge0 CE (RapidAPI) |
| PDF Generation | jsPDF + html2canvas |
| Animations | Framer Motion |
| Deployment | Docker, Render.com, AWS Lambda |

---

## Project Structure

```
lms/
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Sign-in, Sign-up pages
│   │   │   ├── (dashboard)/ # Teacher & Student dashboards
│   │   │   └── (nondashboard)/ # Landing, Search, Checkout
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities, API, types
│   └── public/              # Static assets
├── server/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB models (Mongoose)
│   │   ├── routes/          # API routes
│   │   ├── seed/            # Database seed data
│   │   └── utils/           # Utility functions
│   └── dist/                # Compiled output
├── render.yaml              # Render deployment config
└── package.json             # Root workspace config
```

---

## MongoDB Collections

| Collection | Unique key | Indexes | Description |
|------------|------------|---------|-------------|
| `courses` | `courseId` | `teacherId`, `category` | Courses with sections, chapters, enrollments |
| `transactions` | `transactionId` | `userId`, `courseId` | Payment records |
| `usercourseprogresses` | `userId` + `courseId` | `userId` | Chapter completion tracking |

Models are defined with Mongoose in `server/src/models`. Host the database on
[MongoDB Atlas](https://www.mongodb.com/atlas) (a free M0 cluster is enough).

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=8001
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lms?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://your-client.onrender.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
CLOUDFRONT_DOMAIN=https://your-domain.cloudfront.net
CLERK_SECRET_KEY=sk_...
STRIPE_SECRET_KEY=sk_...
SEED_ON_START=true   # optional: loads sample courses only if the database is empty
```

### Client (`client/.env`)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-server.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key
DEMO_STUDENT_PASSWORD="..."   # optional demo-login buttons, read at runtime (quote values containing #)
DEMO_TEACHER_PASSWORD="..."
```

`NEXT_PUBLIC_*` values are baked in at build time: after changing them on Render,
redeploy the client service.

---

## Local Development

### Prerequisites
- Node.js 18+
- npm
- MongoDB: a free MongoDB Atlas cluster, or a local MongoDB server on port 27017

### Setup

```bash
# Clone the repo
git clone https://github.com/sujithd24/lms.git
cd lms

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Run Locally

```bash
# 1. Point the server at MongoDB: set MONGODB_URI in server/.env
#    (leave it unset to use a local server at mongodb://127.0.0.1:27017/lms)

# 2. Load the sample data (only fills empty collections)
cd server
npm run seed            # or: npm run seed:reset  to wipe and reload

# 3. Start the server
npm run build && node dist/index.js

# 4. Start the client (new terminal)
cd client
npx next dev -p 3001
```

Open **http://localhost:3001**

### Demo Accounts

The sign-in page has **Student** / **Teacher** buttons that fill in a demo account's
email, and a **Paste password** button on the password step.

| Role | Email | Clerk `publicMetadata.userType` |
|------|-------|----------|
| Student | student@demo.com | `student` |
| Teacher | teacher@demo.com | `teacher` |

1. Create both users in your Clerk instance with the role above (Clerk rejects
   breached passwords such as `Student123!`, so pick unique ones).
2. Set their passwords as `DEMO_STUDENT_PASSWORD` and `DEMO_TEACHER_PASSWORD` in `client/.env`
   (locally) or on the client service (Render). They are read at runtime, so a restart is
   enough. The panel stays hidden until both are set.

---

## Deployment to Render

### 1. Server Service
1. New Web Service → Connect GitHub repo → Branch: `updated`
2. Build: `cd server && npm install && npm run build`
3. Start: `cd server && node dist/index.js`
4. Health Check: `/health`
5. Add all server environment variables

### 2. Client Service
1. New Web Service → Connect GitHub repo → Branch: `updated`
2. Build: `cd client && npm install && npm run build`
3. Start: `cd client && npx next start -p 3001`
4. Add all client environment variables

### 3. Post-Deploy
- Update `ALLOWED_ORIGINS` with your actual client URL
- Add client URL to Clerk's allowed redirect URLs

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses` | No | List all courses |
| POST | `/courses` | Yes | Create course |
| GET | `/courses/:courseId` | No | Get course |
| PUT | `/courses/:courseId` | Yes | Update course |
| DELETE | `/courses/:courseId` | Yes | Delete course |
| POST | `/courses/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url` | Yes | Get S3 upload URL |
| PUT | `/users/clerk/:userId` | Yes | Update user |
| GET | `/transactions` | No | List transactions |
| POST | `/transactions` | No | Create transaction |
| POST | `/transactions/free` | No | Free enrollment |
| POST | `/transactions/stripe/payment-intent` | No | Create Stripe PaymentIntent |
| GET | `/users/course-progress/:userId/enrolled-courses` | Yes | Get enrolled courses |
| GET | `/users/course-progress/:userId/courses/:courseId` | Yes | Get course progress |
| PUT | `/users/course-progress/:userId/courses/:courseId` | Yes | Update progress |
| POST | `/api/upload/:chapterId` | No | Upload quiz JSON |
| GET | `/api/json/:chapterId` | No | Get quiz JSON |

---

## Seed Data

The project includes seed data with:
- **8 courses** across all categories
- **14 transactions**
- **12 user course progress records**

Run `cd server && npm run seed` to populate an empty database (`npm run seed:reset` wipes it first).



---

## License

This project is for educational purposes.
