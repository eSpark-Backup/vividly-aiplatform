import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/store/usePaymentStore"
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/components"
import { paymentButtonCSS, themes } from "@/constant"
import { useBodyClassToggle } from "@/hooks/useBodyClassToggle"
import { useCreateSubscription } from "@/hooks/useSubsciption"
import { handleSubscriptionApiError } from "@/lib/apiErrorHandler"
import { useToast } from "@/hooks/use-toast"

export function PaymentStep({ onBack, onPaymentComplete, isLoading }) {
    const { selectedPlan, customerInfo } = usePaymentStore()
    const { toast } = useToast();
    const { theme } = useTheme();
    const { mutate: CreateSubscription, isPending } = useCreateSubscription()
    const isDarkTheme = theme === themes[0];
    useBodyClassToggle("square-dark-mode", isDarkTheme);

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    return (
        <div className="w-full space-y-6">
            {/* Square Payment Form */}
            <div className="w-full">
                <div className={`w-full dark:dark-payment-form light-payment-form`}>
                    <div className="payment-form-container">
                        <PaymentForm
                            applicationId={import.meta.env.VITE_SQUARE_APPLICATION_ID}
                            locationId={import.meta.env.VITE_SQUARE_LOCATION_ID}
                            cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
                                console.log(token);

                                const SubscriptionData = {
                                    sourceId: token.token,
                                    planId: selectedPlan.id,
                                    customer: customerInfo,
                                }

                                CreateSubscription(SubscriptionData, {
                                    onSuccess: (data) => {
                                        if (data.success) {
                                            onPaymentComplete(data)
                                        }
                                    },
                                    onError: (error) => {
                                        handleSubscriptionApiError(showToast, error);
                                    }
                                });
                            }}
                            createPaymentRequest={() => ({
                                countryCode: "US",
                                currencyCode: "USD",
                                total: {
                                    amount: selectedPlan.price.toString(),
                                    label: `${selectedPlan.name} Plan`,
                                },
                            })}

                        >
                            <div className="grid gap-4">
                                <CreditCard
                                    className="w-full dark:bg-muted/50 p-4 rounded-lg"
                                    buttonProps={{
                                        ...paymentButtonCSS(isDarkTheme),
                                        isLoading: isPending
                                    }}
                                />
                            </div>
                        </PaymentForm>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <Button
                type="button"
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading}
            >
                <ArrowLeft size={16} />
                Back to Customer Info
            </Button>
        </div>
    )
}

