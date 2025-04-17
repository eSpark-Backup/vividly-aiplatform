import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/store/usePaymentStore"
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/components"
import { paymentButtonCSS, themes } from "@/constant"
import { useBodyClassToggle } from "@/hooks/useBodyClassToggle"

export function PaymentStep({ onBack, onPaymentComplete, isLoading }) {
    const { selectedPlan, customerInfo } = usePaymentStore()
    const { theme } = useTheme();
    const isDarkTheme = theme === themes[0];
    useBodyClassToggle("square-dark-mode", isDarkTheme);

    return (
        <div className="w-full space-y-6">
            {/* Square Payment Form */}
            <div className="w-full">
                <div className={`w-full dark:dark-payment-form light-payment-form`}>
                    <div className="payment-form-container">
                        <PaymentForm
                            applicationId="sandbox-sq0idb-GcWTKjZ57p4iva8s2BikBA"
                            cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
                                try {
                                    const response = await fetch("/api/create-subscription", {
                                        method: "POST",
                                        headers: {
                                            "Content-type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            sourceId: token.token,
                                            planId: selectedPlan.id,
                                            customer: customerInfo,
                                        }),
                                    })

                                    const result = await response.json()

                                    if (result.success) {
                                        onPaymentComplete()
                                        // Redirect to success page with plan name
                                        const planName = selectedPlan.name
                                        window.location.href = `/subscription-success?plan=${encodeURIComponent(planName)}`
                                    } else {
                                        alert("Error creating subscription: " + result.error)
                                    }
                                } catch (error) {
                                    console.error("Payment error:", error)
                                    alert("An error occurred during payment processing")
                                }
                            }}
                            createPaymentRequest={() => ({
                                countryCode: "US",
                                currencyCode: "USD",
                                total: {
                                    amount: selectedPlan.price.toString(),
                                    label: `${selectedPlan.name} Plan`,
                                },
                            })}
                            locationId="REPLACE-WITH-YOUR-LOCATION-ID"
                        >
                            <div className="grid gap-4">
                                <CreditCard 
                                    className="w-full dark:bg-muted/50 p-4 rounded-lg"
                                    buttonProps={paymentButtonCSS(isDarkTheme)}
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

