import React, { useState } from "react";
import type { PaymentIntent, StripeError } from "@stripe/stripe-js";
import StripeProvider, {
  isStripeTestMode,
  useClientSecret,
} from "./StripeProvider";
import TestCardPanel from "./TestCardPanel";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/CoursePreview";
import { CreditCard, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const PaymentPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  const clientSecret = useClientSecret();
  const [isProcessing, setIsProcessing] = useState(false);

  // Shared by the card form and the test-card button
  const runPayment = async (
    confirm: () => Promise<{
      error?: StripeError;
      paymentIntent?: PaymentIntent;
    }>
  ) => {
    if (isProcessing) return; // guard against double submission
    setIsProcessing(true);

    try {
      const result = await confirm();

      if (result.error) {
        // Card declined, invalid details, etc.
        toast.error(result.error.message ?? "Payment failed. Please try again.");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        const transactionData: Partial<Transaction> = {
          transactionId: result.paymentIntent.id,
          userId: user?.id,
          courseId: courseId,
          paymentProvider: "stripe",
          amount: course?.price || 0,
        };

        await createTransaction(transactionData).unwrap();
        navigateToStep(3);
      } else {
        toast.error(
          `Payment ${result.paymentIntent?.status ?? "was not completed"}. Please try again.`
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      return;
    }

    await runPayment(() =>
      stripe.confirmPayment({
        elements,
        confirmParams: {
          // Only used if the payment method needs a redirect
          return_url: `${window.location.origin}/checkout?step=3&id=${courseId}`,
        },
        redirect: "if_required",
      })
    );
  };

  // Test mode only: confirm with one of Stripe's built-in test cards
  // (e.g. "pm_card_visa") instead of typing card details.
  const payWithTestCard = async (testPaymentMethod: string) => {
    if (!stripe || !clientSecret) {
      toast.error("Stripe service is not available");
      return;
    }
    await runPayment(() =>
      stripe.confirmCardPayment(clientSecret, {
        payment_method: testPaymentMethod,
      })
    );
  };

  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  if (!course) return null;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Order Summary */}
        <div className="payment__preview">
          <CoursePreview course={course} />
        </div>

        {/* Pyament Form */}
        <div className="payment__form-container">
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="payment__form"
          >
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">
                Fill out the payment details below to complete your purchase.
              </p>

              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>

                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>

              {isStripeTestMode && (
                <TestCardPanel
                  onPay={() => payWithTestCard("pm_card_visa")}
                  onDecline={() => payWithTestCard("pm_card_chargeDeclined")}
                  disabled={!stripe || !clientSecret || isProcessing}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="payment__actions">
        <Button
          className="hover:bg-white-50/10"
          onClick={handleSignOutAndNavigate}
          variant="outline"
          type="button"
        >
          Switch Account
        </Button>

        <Button
          form="payment-form"
          type="submit"
          className="payment__submit"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            <>
              <LockKeyhole className="h-4 w-4" /> Pay {formatPrice(course.price)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;
