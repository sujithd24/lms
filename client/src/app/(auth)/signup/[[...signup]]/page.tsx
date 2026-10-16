import SignUpComponent from "@/components/SignUp";
import DemoSignupHint from "@/components/DemoSignupHint";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <SignUpComponent />
      <DemoSignupHint />
    </div>
  );
}
