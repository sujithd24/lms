import SignInComponent from "@/components/SignIn";
import DemoLogin from "@/components/DemoLogin";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <SignInComponent />
      <DemoLogin />
    </div>
  );
}
