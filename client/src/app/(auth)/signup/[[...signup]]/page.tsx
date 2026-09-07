import SignUpComponent from "@/components/SignUp";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <SignUpComponent />

      <div className="w-full max-w-[400px] rounded-lg border border-customgreys-primarybg bg-customgreys-secondarybg p-5 shadow-md">
        <h3 className="mb-3 text-center text-lg font-semibold text-white-50">
          Create Your Account
        </h3>
        <p className="mb-3 text-center text-sm text-white-50">
          Sign up to access courses, track your progress, and earn certificates.
        </p>
        <div className="rounded-md bg-customgreys-primarybg p-3">
          <p className="text-sm font-medium text-primary-400">Quick Start</p>
          <p className="mt-1 text-sm text-white-50">
            Choose <span className="font-semibold text-white-100">Student</span> to
            browse and enroll in courses.
          </p>
          <p className="text-sm text-white-50">
            Choose <span className="font-semibold text-white-100">Teacher</span> to
            create and manage courses.
          </p>
        </div>
      </div>
    </div>
  );
}
