# LMS Platform - Learning Management System

A full-stack Learning Management System built with Next.js 15, Express.js, TypeScript, and AWS DynamoDB. Features course creation, Stripe payments, Clerk authentication, video hosting, progress tracking, and more.

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
- **Transaction Recording**: All purchases logged in DynamoDB
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
| Database | AWS DynamoDB (via Dynamoose ORM) |
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
│   │   ├── models/          # DynamoDB models (Dynamoose)
│   │   ├── routes/          # API routes
│   │   ├── seed/            # Database seed data
│   │   └── utils/           # Utility functions
│   └── dist/                # Compiled output
├── render.yaml              # Render deployment config
└── package.json             # Root workspace config
```

---

## DynamoDB Tables

| Table | Hash Key | Range Key | Description |
|-------|----------|-----------|-------------|
| `Course` | `courseId` | - | Courses with sections, chapters, enrollments |
| `Transaction` | `userId` | `transactionId` | Payment records |
| `UserCourseProgress` | `userId` | `courseId` | Chapter completion tracking |

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=8001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-client.onrender.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
CLOUDFRONT_DOMAIN=https://your-domain.cloudfront.net
CLERK_SECRET_KEY=sk_...
STRIPE_SECRET_KEY=sk_...
SEED_ON_START=true
```

### Client (`client/.env`)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-server.onrender.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Java (for DynamoDB Local)
- npm

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
# 1. Start DynamoDB Local
cd server
java "-Djava.library.path=../dynamodb_local_latest/DynamoDBLocal_lib" \
  -jar "../dynamodb_local_latest/DynamoDBLocal.jar" -port 8000

# 2. Seed the database (new terminal)
cd server
npm run build
node dist/seed/seedDynamodb.js

# 3. Start the server (new terminal)
cd server
node dist/index.js

# 4. Start the client (new terminal)
cd client
npx next dev -p 3001
```

Open **http://localhost:3001**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | Student123! |
| Teacher | teacher@demo.com | Teacher123! |

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

Run `cd server && npm run build && node dist/seed/seedDynamodb.js` to populate the database.

---

## License

This project is for educational purposes.
