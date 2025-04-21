import { cn } from "@/lib/utils"
import { PAYMENT_RECURRING_PERIOD } from "@/constant"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PlanCard({
  id,
  name,
  price,
  promoPrice,
  promoPeriod,
  features,
  billingPeriod,
  isPopular = false,
  isSelected = false,
  isCurrentPlan = false,
  isFree = false,
  isUserSubscribed = false,
  onSelectPlan,
}) {

  const navigate = useNavigate()

  const { MONTHLY, ANNUALY } = PAYMENT_RECURRING_PERIOD
  const hasPromo = promoPeriod && promoPrice && billingPeriod === MONTHLY

  const handlePlanSelection = () => {
    if (isFree) {
      navigate("/billing")
    } else {
      !isCurrentPlan && onSelectPlan(id, name, price, billingPeriod)
    }
  }

  return (
    <div
      className={cn("rounded-lg p-8 py-10 shadow-sm flex flex-col h-full relative", {
        "bg-white dark:bg-black": !isPopular,
        "bg-[linear-gradient(to_bottom,#5038ED_0%,#9181F4_100%)] shadow-lg": isPopular,
        "ring-2 ring-[#7C35F1]": (isSelected || isCurrentPlan) && !isPopular,
        "ring-2 ring-white": (isSelected || isCurrentPlan) && isPopular,
      })}
    >
      {isPopular && (
        <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white dark:bg-black px-2 py-1 rounded-full">
          <p className="text-xs font-bold text-[#7C35F1]">MOST POPULAR</p>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
          <div className="bg-purple-500 rounded-full p-1.5">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}


      <div className="mb-6 h-[120px] flex flex-col justify-center">
        <h3
          className={cn(
            "text-lg font-medium text-center uppercase tracking-wide",
            isPopular ? "text-white" : "text-[#7C35F1]",
          )}
        >
          {name}
        </h3>

        {isCurrentPlan && (
          <div className="mt-1 mb-1">
            <p className={cn("text-xs text-center font-medium", isPopular ? "text-white" : "text-green-500")}>
              CURRENT PLAN
            </p>
          </div>
        )}

        {hasPromo ? (
          <div className="flex flex-col items-center mt-2">
            <div
              className={cn(
                "flex items-center justify-center font-extrabold text-2xl 2xl:text-3xl",
                isPopular ? "text-white" : "text-black dark:text-white",
              )}
            >
              <p className="tracking-tight">${promoPrice}/</p>
              <p className="ml-1 tracking-tight">MONTH</p>
            </div>
            <p className={cn("text-xs mt-0.5", isPopular ? "text-white/80" : "text-gray-600 dark:text-white")}>
              For first {promoPeriod} months
            </p>
            <div
              className={cn(
                "flex items-center justify-center font-medium text-sm mt-0.5",
                isPopular ? "text-white/90" : "text-gray-700 dark:text-white",
              )}
            >
              <p>Then ${price}/MONTH</p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center font-extrabold text-2xl 2xl:text-3xl mt-2",
              isPopular ? "text-white" : "text-black dark:text-white",
            )}
          >
            <p className="tracking-tight">${price}/</p>
            <p className="ml-1 tracking-tight">{billingPeriod === ANNUALY ? "YEAR" : "MONTH"}</p>
          </div>
        )}
      </div>

      <ul className="space-y-2 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className={cn("w-1.5 h-1.5 rounded-full mr-3", isPopular ? "bg-white" : "bg-black dark:bg-white")} />
            <p className={cn("text-sm", isPopular ? "text-white" : "text-black dark:text-white")}>{feature}</p>
          </li>
        ))}
      </ul>

      <Button
        onClick={handlePlanSelection}
        variant={isPopular ? "popular" : isSelected ? "selected" : "defaultPlan"}
        className={cn("mt-8 block w-full py-2", {
          "opacity-80 cursor-default": isCurrentPlan,
        })}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : isSelected ? "Selected" : isFree ? "Downgrade" : isUserSubscribed ? "Upgrade" : "Select"}
      </Button>
    </div>
  )
}
