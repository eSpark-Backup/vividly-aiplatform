import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { usePaymentStore } from "@/store/usePaymentStore"
import { useUserStore } from "@/store/useUserStore"
import { PaymentDialogHeader } from "../../pricing-plan/payment-dialog/PaymentDialogHeader"
import { useNavigate } from "react-router-dom"
import { CustomerCardIntoStep } from "./CustomerCardIntoStep"
import { AddCardStep } from "./AddCardStep"
import { CardAddedSuccessStep } from "./AddCardSuccessStep"

export function AddCardDialog({ open, onOpenChange, onCancel }) {
    const navigate = useNavigate();
    const { selectedPlan, customerInfo } = usePaymentStore()
    const { firstName, lastName } = useUserStore()
    
    const [currentStep, setCurrentStep] = useState(1)
  const getDefaultValues = () => {
    const hasValidCustomerInfo = !!customerInfo?.firstName && !!customerInfo?.lastName

    if (hasValidCustomerInfo) {
      return {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
      }
    }

    return {
      firstName,
      lastName,
    }
  }

  const handleContinueToPayment = () => {
    setCurrentStep(2)
  }

  const handleBackToCustomerInfo = () => {
    setCurrentStep(1)
  }

  const handleAddCardSuccess = () => {
    setCurrentStep(3)
  }

  const handleGoToBilling = () => {
    onOpenChange(false)
    navigate("/billing")
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[350px] sm:max-w-[500px] border-0 dark:bg-[#131619] py-8 shadow-[0px_0px_60px_20px_rgba(124,53,241,0.4)]">
        <div className="flex flex-col items-center gap-5 sm:p-6 p-0">
          {/* Dialog Header */}
          <PaymentDialogHeader
            title={
              currentStep === 1 || currentStep === 2 ? "Add Card Information" : "Payment Successful!"
            }
            description={
              currentStep === 1
                ? "Please provide your information to continue"
                : currentStep === 2
                  ? "Please provide your card information"
                  : `You're now subscribed to the ${selectedPlan.name} plan`
            }
          />

          {/* Step Content */}
          {currentStep === 1 ? (
            <CustomerCardIntoStep
              defaultValues={getDefaultValues()}
              onCancel={onCancel}
              onContinue={handleContinueToPayment}
            />
          ) : currentStep === 2 ? (
            <AddCardStep
              onBack={handleBackToCustomerInfo}
              onAddCardSuccess={handleAddCardSuccess}
            />
          ) : (
            <CardAddedSuccessStep onGoToPaymentMethods={handleGoToBilling} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddCardDialog;
