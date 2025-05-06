import { useEffect, useState } from "react";
import { ChevronRight, CreditCard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import Subscription from "./Subscription";
// import PaymentMethodTab from "./payment-method-tab"
import { useLocation, useNavigate } from "react-router-dom";
import PaymentMethod from "./PaymentMethod";

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab") || "subscription";

  const [activeTab, setActiveTab] = useState(tab);

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/billing?tab=${value}`, { replace: true });
  };

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const tabs = [
    {
      id: "subscription",
      label: "Subscription",
      icon: Receipt,
      description: "Manage your subscription plan and billing details",
    },
    {
      id: "payment-method",
      label: "Payment Method",
      icon: CreditCard,
      description: "Update your payment methods and Card Details",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "subscription":
        return <Subscription />;
      case "payment-method":
        return <PaymentMethod />;
      default:
        return <Subscription />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-muted/50 relative",
                      isActive
                        ? "bg-muted/50 text-primary font-medium"
                        : "text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{tab.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {tab.description}
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isActive && "text-primary rotate-90"
                      )}
                    />
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-card rounded-lg border shadow-sm p-6">
          <div className="mt-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
