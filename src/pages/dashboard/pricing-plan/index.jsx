import { useState } from "react";
import PlanCard from "./PlanCard";
import PlansToggle from "./PlansToggle";
import { PAYMENT_RECURRING_PERIOD, PLANS_IDS } from "@/constant";

const PricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [recurringPeriod, setRecurringPeriod] = useState(
    PAYMENT_RECURRING_PERIOD.MONTHLY
  );

  const { MONTHLY, ANNUALY } = PAYMENT_RECURRING_PERIOD;
  const { FREE, PLUS_MONTHLY, PLUS_ANNUALLY, PREMIUM_MONTHLY, PREMIUM_ANNUALLY, STUDENT_MONTHLY, STUDENT_ANNUALLY } = PLANS_IDS
  const isMonthly = recurringPeriod === MONTHLY;

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    console.log(`Selected plan: ${planId}`);
  };

  const toggleBillingPeriod = () => {
    const newPeriod = isMonthly ? ANNUALY : MONTHLY;
    setRecurringPeriod(newPeriod);
  };

  return (
    <div className="min-h-[calc(100vh-280px)] flex items-center flex-col justify-center">

      <PlansToggle isMonthly={isMonthly} onToggle={toggleBillingPeriod} />

      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Free Plan */}
          <PlanCard
            id={FREE}
            name="Vividly Free"
            price={0}
            features={[
              "AI Chat",
              "20 Picture Generation",
              "20 Picture Analysis",
              "No Humanize Support",
              "No Voice Assistant Support",
            ]}
            billingPeriod={MONTHLY}
            isSelected={selectedPlan === "FREE"}
            onSelectPlan={handleSelectPlan}
          />

          {/* Plus Plan */}
          <PlanCard
            id={isMonthly ? PLUS_MONTHLY : PLUS_ANNUALLY}
            name="Vividly Plus"
            price={isMonthly ? 9.99 : 109.99}
            features={[
              "AI Chat",
              "100 Picture Generation",
              "100 Picture Analysis",
              "Humanize Support",
              "Voice Assistant Support",
            ]}
            billingPeriod={recurringPeriod}
            isSelected={
              selectedPlan ===
              (isMonthly ? PLUS_MONTHLY : PLUS_ANNUALLY)
            }
            onSelectPlan={handleSelectPlan}
          />

          {/* Premium Plan */}
          <PlanCard
            id={isMonthly ? PREMIUM_MONTHLY : PREMIUM_ANNUALLY}
            name="Vividly Premium"
            price={isMonthly ? 15.99 : 169.99}
            features={[
              "AI Chat",
              "Unlimited Picture Generation",
              "Unlimited Picture Analysis",
              "Humanize Support",
              "Voice Assistant Support",
            ]}
            billingPeriod={recurringPeriod}
            isPopular={true}
            isSelected={
              selectedPlan === (isMonthly ? PREMIUM_MONTHLY : PREMIUM_ANNUALLY)
            }
            onSelectPlan={handleSelectPlan}
          />

          {/* Student Plan with special pricing */}
          <PlanCard
            id={isMonthly ? STUDENT_MONTHLY : STUDENT_ANNUALLY}
            name="Vividly Student"
            price={isMonthly ? 9.99 : 59.99}
            promoPrice={5.99}
            promoPeriod={2}
            features={[
              "AI Chat",
              "Unlimited Picture Generation",
              "Unlimited Picture Analysis",
              "Humanize Support",
              "Voice Assistant Support",
            ]}
            billingPeriod={recurringPeriod}
            isSelected={
              selectedPlan ===
              (isMonthly ? STUDENT_MONTHLY : STUDENT_ANNUALLY)
            }
            onSelectPlan={handleSelectPlan}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
