import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { usePaymentStore } from "@/store/usePaymentStore"
import { useUserStore } from "@/store/useUserStore"
import { PaymentDialogHeader } from "./PaymentDialogHeader"
import { CustomerInfoStep } from "./CustomerInfoStep"
import { PaymentStep } from "./PaymentStep"
import { SelectedPlan } from "./SelectedPlan"

export function PaymentDialog({ open, onOpenChange, isLoading, onCancel, onPaymentComplete }) {
    const [currentStep, setCurrentStep] = useState(1)
    const { selectedPlan, customerInfo, clearPayment } = usePaymentStore()
    const { firstName, lastName, email, phone } = useUserStore()

    const getDefaultValues = () => {
        const hasValidCustomerInfo = !!customerInfo?.firstName && !!customerInfo?.lastName && !!customerInfo?.email;

        if (hasValidCustomerInfo) {
            return {
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                email: customerInfo.email,
                phone: customerInfo.phone || "",
            };
        }

        return {
            firstName,
            lastName,
            email,
            phone: phone || "",
        };
    };


    const handleOpenChange = (open) => {
        if (!open) {
            setCurrentStep(1)
            clearPayment()
        }
        onOpenChange(open)
    }

    const handleContinueToPayment = () => {
        setCurrentStep(2)
    }

    const handleBackToCustomerInfo = () => {
        setCurrentStep(1)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[350px] sm:max-w-[500px] border-0 dark:bg-[#131619] py-8 shadow-[0px_0px_60px_20px_rgba(124,53,241,0.4)]">
                <div className="flex flex-col items-center gap-5 sm:p-6 p-0">
                    {/* Dialog Header */}
                    <PaymentDialogHeader
                        title={currentStep === 1 ? "Your Information" : "Payment Details"}
                        description={
                            currentStep === 1 ? "Please provide your details to continue" : "Complete your payment to subscribe"
                        }
                    />

                    {/* Selected Plan */}
                    <SelectedPlan
                        name={selectedPlan.name}
                        price={selectedPlan.price}
                        billingPeriod={selectedPlan.billingPeriod}
                    />

                    {/* Step Content */}
                    {currentStep === 1 ? (
                        <CustomerInfoStep defaultValues={getDefaultValues()} onCancel={onCancel} onContinue={handleContinueToPayment} />
                    ) : (
                        <PaymentStep
                            onBack={handleBackToCustomerInfo}
                            onPaymentComplete={onPaymentComplete}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
