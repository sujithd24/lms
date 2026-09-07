import SignInComponent from "@/components/SignIn";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <SignInComponent />

      <div className="w-full max-w-[400px] rounded-lg border border-customgreys-primarybg bg-customgreys-secondarybg p-5 shadow-md">
        <h3 className="mb-3 text-center text-lg font-semibold text-white-50">
          Demo Login Credentials
        </h3>
        <div className="space-y-3">
          <div className="rounded-md bg-customgreys-primarybg p-3">
            <p className="text-sm font-medium text-primary-400">Student Account</p>
            <p className="mt-1 text-sm text-white-50">
              Email: <span className="font-mono text-white-100">student@demo.com</span>
            </p>
            <p className="text-sm text-white-50">
              Password: <span className="font-mono text-white-100">Student123!</span>
            </p>
          </div>
          <div className="rounded-md bg-customgreys-primarybg p-3">
            <p className="text-sm font-medium text-primary-400">Teacher Account</p>
            <p className="mt-1 text-sm text-white-50">
              Email: <span className="font-mono text-white-100">teacher@demo.com</span>
            </p>
            <p className="text-sm text-white-50">
              Password: <span className="font-mono text-white-100">Teacher123!</span>
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-white-50">
          Sign up with these credentials or create a new account
        </p>
      </div>
    </div>
  );
}
