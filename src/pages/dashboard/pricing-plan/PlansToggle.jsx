import { Switch } from "@/components/ui/switch";

export const PlansToggle = ({
    isMonthly,
    onToggle,
    annualLabel = "Annually",
    monthlyLabel = "Monthly",
    showAnnualBadge = true,
    annualBadgeText = "Save 20%",
}) => {
    return (
        <div className="flex items-center justify-center mb-8 gap-4 mt-10">
            <span
                className={`text-sm font-medium ${isMonthly ? "text-[#7C35F1]" : "text-gray-500"
                    }`}
            >
                {monthlyLabel}
            </span>
            <Switch
                checked={!isMonthly}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-[#7C35F1] "
            />
            <span
                className={`text-sm font-medium ${!isMonthly ? "text-[#7C35F1]" : "text-gray-500"
                    }`}
            >
                {annualLabel}
                {showAnnualBadge && (
                    <span className="ml-2 bg-[#7C35F1] text-white text-xs px-2 py-0.5 rounded-full">
                        {annualBadgeText}
                    </span>
                )}
            </span>
        </div>
    );
};

export default PlansToggle;