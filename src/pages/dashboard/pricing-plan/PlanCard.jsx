import { cn } from "@/lib/utils"
import { PAYMENT_RECURRING_PERIOD } from "@/constant"


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
  onSelectPlan,
}) {
  const { MONTHLY, ANNUALY } = PAYMENT_RECURRING_PERIOD
  const hasPromo = promoPeriod && promoPrice && billingPeriod === MONTHLY

  return (
    <div
      className={cn("rounded-lg p-8 py-10 shadow-sm flex flex-col h-full relative", {
        "dark:bg-white bg-black": !isPopular,
        "bg-[linear-gradient(to_bottom,#5038ED_0%,#9181F4_100%)] shadow-lg": isPopular,
        "ring-2 ring-[#7C35F1]": isSelected && !isPopular,
        "ring-2 ring-white": isSelected && isPopular,
      })}
    >
      {isPopular && (
        <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2 dark:bg-white bg-black px-2 py-1 rounded-full">
          <p className="text-xs font-bold text-[#7C35F1]">MOST POPULAR</p>
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

        {hasPromo ? (
          <div className="flex flex-col items-center mt-2">
            <div
              className={cn(
                "flex items-center justify-center font-extrabold text-2xl lg:text-3xl",
                isPopular ? "text-white" : "text-black",
              )}
            >
              <p className="tracking-tight">${promoPrice}/</p>
              <p className="ml-1 tracking-tight">MONTH</p>
            </div>
            <p className={cn("text-xs mt-0.5", isPopular ? "text-white/80" : "text-gray-600")}>
              For first {promoPeriod} months
            </p>
            <div
              className={cn(
                "flex items-center justify-center font-medium text-sm mt-0.5",
                isPopular ? "text-white/90" : "text-gray-700",
              )}
            >
              <p>Then ${price}/MONTH</p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center font-extrabold text-2xl lg:text-3xl mt-2",
              isPopular ? "text-white" : "dark:text-black text-white",
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
            <div className={cn("w-1.5 h-1.5 rounded-full mr-3", isPopular ? "bg-white" : "dark:bg-black bg-white")} />
            <p className={cn("text-sm", isPopular ? "text-white" : "dark:text-black text-white")}>{feature}</p>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelectPlan(id)}
        className={cn(
          "mt-8 block w-full rounded-md py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            "bg-white text-[#7C35F1] hover:bg-gray-50 focus:ring-white focus:ring-offset-[#7C35F1]": isPopular,
            "bg-[#813af5] text-white hover:bg-[#7C35F1] focus:ring-purple-500": isSelected && !isPopular,
            "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-[#7C35F1]":
              !isSelected && !isPopular,
          },
        )}
      >
        {isSelected ? "Selected" : "Select Plan"}
      </button>
    </div>
  )
}
