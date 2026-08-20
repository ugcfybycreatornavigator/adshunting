"use client";

import { Card } from "@/components/ui";
import { WorkspaceEntitlement } from "@/lib/billing/subscription-state";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatBillingDate } from "@/lib/format/date";

type BillingStep =
  | "idle"
  | "preparing"
  | "creating_subscription"
  | "opening_checkout"
  | "authorizing"
  | "confirming"
  | "success"
  | "error";

type BillingError = {
  code?: string;
  message: string;
  requestId?: string;
};

// Cached promise for checkout script
let checkoutScriptPromise: Promise<boolean> | null = null;

const loadCheckoutScript = (): Promise<boolean> => {
  if (checkoutScriptPromise) return checkoutScriptPromise;
  
  if (typeof window !== "undefined" && (window as unknown as { Razorpay: unknown }).Razorpay) {
    checkoutScriptPromise = Promise.resolve(true);
    return checkoutScriptPromise;
  }

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      checkoutScriptPromise = null;
      reject(new Error("CHECKOUT_LOAD_FAILED"));
    };
    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
};

export function PlanCard({
  entitlement,
  config,
}: {
  entitlement: WorkspaceEntitlement;
  config: { name: string; amountDisplay: string | number; interval: string; };
}) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [step, setStep] = useState<BillingStep>("idle");
  const [error, setError] = useState<BillingError | null>(null);

  const hasAccess = entitlement.hasAccess === true && (entitlement.accessSource === "trial" || entitlement.accessSource === "subscription");
  const isTrial = entitlement.reason === "trial" || entitlement.accessSource === "trial";
  const isNotStarted = !hasAccess && entitlement.accessSource !== "legacy_grace";
  const isLegacyGrace = entitlement.accessSource === "legacy_grace";

  // Prevent multiple reconciliation polling
  const isPolling = useRef(false);

  const pollReconciliation = async () => {
    if (isPolling.current) return;
    isPolling.current = true;
    
    const delays = [1000, 2000, 3000, 5000, 8000];
    let success = false;
    
    for (const delay of delays) {
      await new Promise(r => setTimeout(r, delay));
      
      const { data: verifyRes, error: verifyError } = await supabase.functions.invoke('billing-reconcile-subscription', {
        method: 'POST',
      });
      
      if (!verifyError && verifyRes?.status && (verifyRes.status === "trialing" || verifyRes.status === "active")) {
        success = true;
        break;
      }
    }
    
    isPolling.current = false;
    
    if (success) {
      setStep("success");
      router.refresh();
    } else {
      setStep("error");
      setError({ message: "Your authorization was received, but we're still confirming it. Please check back in a few minutes." });
    }
  };

  const handleStartTrial = async () => {
    if (step !== "idle" && step !== "error") return;
    
    setStep("preparing");
    setError(null);
    try {
      try {
        await loadCheckoutScript();
      } catch {
        throw new Error("Secure checkout could not be loaded. Please check your connection and try again.");
      }

      if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
        throw new Error("Secure checkout could not be loaded. Please check your connection and try again.");
      }

      setStep("creating_subscription");
      const { data, error: invokeError } = await supabase.functions.invoke('billing-create-subscription', {
        method: 'POST',
      });

      if (invokeError || !data?.ok) {
        throw new Error(data?.message || "We couldn't start your trial. Please try again.");
      }

      setStep("opening_checkout");

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Ads Hunting",
        description: "Ads Hunting Pro Subscription",
        prefill: {
          name: user?.fullName || undefined,
          email: user?.primaryEmailAddress?.emailAddress || undefined,
        },
        handler: function () {
          setStep("confirming");
          pollReconciliation();
        },
        modal: {
          ondismiss: function() {
             setStep("idle");
          }
        },
        theme: {
          color: "#e11d48",
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, handler: () => void) => void; open: () => void; } }).Razorpay(options);
      rzp.on('payment.failed', function () {
         setStep("error");
         setError({ message: "We couldn't complete the authorization. Please try another payment method or retry." });
      });
      
      setStep("authorizing");
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStep("error");
      setError({ message });
    }
  };

  const getButtonText = () => {
    switch (step) {
      case "preparing": return "Preparing secure checkout…";
      case "creating_subscription": return "Setting up your trial…";
      case "opening_checkout": return "Opening secure checkout…";
      case "authorizing": return "Opening secure checkout…";
      case "confirming": return "Confirming your trial…";
      case "success": return "Trial activated!";
      default: return "Start 7-Day Trial";
    }
  };

  const isButtonDisabled = step !== "idle" && step !== "error";

  if (isNotStarted) {
    if (step === "confirming") {
       return (
         <Card className="p-5 md:p-8 border-border/50 shadow-sm relative w-full">
           <div className="max-w-xl">
             <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground break-words">
               Confirming your trial
             </h3>
             <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
               Your AutoPay authorization was successful.
               <br />
               We&apos;re waiting for confirmation from Razorpay. This usually takes a few seconds.
             </p>
             <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
               <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
               Confirming subscription...
             </div>
           </div>
         </Card>
       );
    }
    
    return (
      <Card className="p-5 md:p-8 border-border/50 shadow-sm relative w-full">
        <div className="max-w-xl">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground break-words">
            {isLegacyGrace ? "Complimentary access" : "Activate your Ads Hunting trial"}
          </h3>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            {isLegacyGrace ? (
              <>
                You have full Ads Hunting access through 31 August 2026.<br/>
                Ads Hunting Pro will require billing setup from 1 September.
              </>
            ) : (
              <>
                Set up AutoPay to unlock your 7-day trial.<br/>
                ₹{config.amountDisplay}/{config.interval} after the trial.
              </>
            )}
          </p>
          
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground break-words">
            <li className="flex items-center gap-3">
              <span className="text-green-600 flex-shrink-0">✓</span> Full Discover Ads access
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 flex-shrink-0">✓</span> Save ads to Swipe Files
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 flex-shrink-0">✓</span> Share ads & Brand intelligence
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 flex-shrink-0">✓</span> Download supported creatives
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 flex-shrink-0">✓</span> Cancel before your first billing date
            </li>
          </ul>

          {step === "error" && error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-semibold text-red-900">We couldn&apos;t activate your trial</h4>
              <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap break-words">{error.message}</p>
            </div>
          )}

          <button
            onClick={handleStartTrial}
            disabled={isButtonDisabled}
            className="mt-8 w-full md:w-auto bg-black hover:bg-black/90 text-white px-6 min-h-[44px] py-2.5 rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{getButtonText()}</span>
          </button>
          
          <p className="mt-4 text-xs text-muted-foreground max-w-sm">
            Secure payments powered by Razorpay. A small refundable authorization transaction may be required to activate AutoPay.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 md:p-8 border-border/50 shadow-sm relative w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
             <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground break-words">{config.name}</h3>
             <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
               {isTrial ? "TRIAL ACTIVE" : entitlement.billingStatus.toUpperCase()}
             </span>
          </div>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            ₹{config.amountDisplay} / {config.interval}
          </p>
          <p className="mt-4 text-sm text-muted-foreground max-w-md break-words">
            Full access to Ads Hunting&apos;s ads intelligence platform.
          </p>
          
          {isTrial && entitlement.trialEndsAt && (
             <div className="mt-6 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Trial ends {formatBillingDate(entitlement.trialEndsAt)}
                </p>
             </div>
          )}
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
        </div>
      </div>
    </Card>
  );
}
