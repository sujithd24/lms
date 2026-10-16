"use client";

import React, { useState } from "react";
import { Check, Copy, FlaskConical, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const TEST_CARD = [
  { label: "Card number", value: "4242 4242 4242 4242", copy: "4242424242424242" },
  { label: "Expiry", value: "12 / 34", copy: "1234" },
  { label: "CVC", value: "123", copy: "123" },
];

/**
 * Shown only with Stripe test keys. Stripe's card fields live in a secure
 * cross-origin iframe that page scripts cannot type into, so this offers a
 * one-click payment with Stripe's built-in test card plus copy buttons for
 * typing the card manually.
 */
const TestCardPanel = ({
  onPay,
  onDecline,
  disabled,
  isProcessing,
}: {
  onPay: () => void;
  onDecline: () => void;
  disabled: boolean;
  isProcessing: boolean;
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — please type it in");
    }
  };

  return (
    <div className="test-card">
      <div className="test-card__header">
        <span className="test-card__badge">
          <FlaskConical className="h-3.5 w-3.5" /> Test mode
        </span>
        <span className="text-xs text-customgreys-dirtyGrey">
          No real money is charged
        </span>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className="btn-glow w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" /> Pay with test card
          </>
        )}
      </button>

      <p className="test-card__hint">Or type Stripe&apos;s test card into the form above:</p>
      <div className="test-card__fields">
        {TEST_CARD.map((field) => (
          <button
            key={field.label}
            type="button"
            onClick={() => handleCopy(field.label, field.copy)}
            className="test-card__chip"
            title={`Copy ${field.label.toLowerCase()}`}
          >
            <span className="test-card__chip-label">{field.label}</span>
            <span className="test-card__chip-value">
              {field.value}
              {copied === field.label ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-60" />
              )}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onDecline}
        disabled={disabled}
        className="test-card__decline"
      >
        Simulate a declined card
      </button>
    </div>
  );
};

export default TestCardPanel;
