"use client";

import CoursePreview from "@/components/CoursePreview";
import Loading from "@/components/Loading";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowRight, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";

const CheckoutDetailsPage = () => {
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { navigateToStep } = useCheckoutNavigation();

  if (isLoading) return <Loading />;
  if (isError) return <div>Failed to fetch course data</div>;
  if (!selectedCourse) return <div>Course not found</div>;

  return (
    <div className="checkout-details">
      <div className="checkout-details__container">
        <div className="checkout-details__preview">
          <CoursePreview course={selectedCourse} />
        </div>

        <div className="checkout-details__options">
          {isSignedIn && user ? (
            <div className="checkout-details__guest">
              <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white-100 shadow-glow">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="checkout-details__title">Ready to checkout</h2>
              <p className="checkout-details__subtitle">
                Signed in as{" "}
                <span className="font-medium text-white-100">
                  {user.primaryEmailAddress?.emailAddress ?? user.username}
                </span>
                . The course will be added to your account after payment.
              </p>
              <button
                type="button"
                onClick={() => navigateToStep(2)}
                className="checkout-details__submit"
              >
                <CreditCard className="h-4 w-4" /> Continue to payment
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="flex items-center justify-center gap-2 text-xs text-customgreys-dirtyGrey">
                <LockKeyhole className="h-3.5 w-3.5" /> Payments are processed
                securely by Stripe
              </p>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: window.location.href })}
                className="mx-auto mt-6 block text-xs text-primary-300 hover:text-primary-200"
              >
                Not you? Switch account
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-details__guest !py-8">
                <h2 className="checkout-details__title">Sign in to continue</h2>
                <p className="checkout-details__subtitle !mb-0">
                  Your purchase is linked to your account so you can access the
                  course and track your progress.
                </p>
              </div>
              <div className="checkout-details__auth">
                {showSignUp ? <SignUpComponent /> : <SignInComponent />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
