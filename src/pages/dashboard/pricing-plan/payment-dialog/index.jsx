import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { usePaymentStore } from "@/store/usePaymentStore"
import { useUserStore } from "@/store/useUserStore"
import { PaymentDialogHeader } from "./PaymentDialogHeader"
import { CustomerInfoStep } from "./CustomerInfoStep"
import { PaymentStep } from "./PaymentStep"
import { SuccessStep } from "./SuccessStep"
import { SelectedPlan } from "./SelectedPlan"
import { useNavigate } from "react-router-dom"

export function PaymentDialog({ open, onOpenChange, isLoading, onCancel, onPaymentComplete }) {
    const navigate = useNavigate();
    const { selectedPlan, customerInfo, clearPayment } = usePaymentStore()
    const { firstName, lastName, email, phone } = useUserStore()
    
    const [currentStep, setCurrentStep] = useState(1)
  const getDefaultValues = () => {
    const hasValidCustomerInfo = !!customerInfo?.firstName && !!customerInfo?.lastName && !!customerInfo?.email

    if (hasValidCustomerInfo) {
      return {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone || "",
      }
    }

    return {
      firstName,
      lastName,
      email,
      phone: phone || "",
    }
  }

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

  const handlePaymentSuccess = () => {
    setCurrentStep(3)
  }

  const handleGoToBilling = () => {
    onOpenChange(false)
    navigate("/billing")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[350px] sm:max-w-[500px] border-0 dark:bg-[#131619] py-8 shadow-[0px_0px_60px_20px_rgba(124,53,241,0.4)]">
        <div className="flex flex-col items-center gap-5 sm:p-6 p-0">
          {/* Dialog Header */}
          <PaymentDialogHeader
            title={
              currentStep === 1 ? "Your Information" : currentStep === 2 ? "Payment Details" : "Payment Successful!"
            }
            description={
              currentStep === 1
                ? "Please provide your details to continue"
                : currentStep === 2
                  ? "Complete your payment to subscribe"
                  : `You're now subscribed to the ${selectedPlan.name} plan`
            }
          />

          {/* Selected Plan - Only show in steps 1 and 2 */}
          {currentStep < 3 && (
            <SelectedPlan
              name={selectedPlan.name}
              price={selectedPlan.price}
              billingPeriod={selectedPlan.billingPeriod}
            />
          )}

          {/* Step Content */}
          {currentStep === 1 ? (
            <CustomerInfoStep
              defaultValues={getDefaultValues()}
              onCancel={onCancel}
              onContinue={handleContinueToPayment}
            />
          ) : currentStep === 2 ? (
            <PaymentStep
              onBack={handleBackToCustomerInfo}
              onPaymentComplete={handlePaymentSuccess}
              isLoading={isLoading}
            />
          ) : (
            <SuccessStep planName={selectedPlan.name} onGoToBilling={handleGoToBilling} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
