import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { usePaymentStore } from "@/store/usePaymentStore"
import { useNavigate } from "react-router-dom"
import { PaymentDialogHeader } from "./PaymentDialogHeader"
import {  addMonths, addYears, formatDate } from "date-fns"
import { ConfirmationStep } from "./ConfirmationStep"
import { SuccessStep } from "./SuccessStep"
import { PAYMENT_RECURRING_PERIOD } from "@/constant"

export function UpgradePlanDialog({ open, onOpenChange, onCancel }) {
    
    const navigate = useNavigate()
    const { selectedPlan, clearPayment } = usePaymentStore()

    const [currentStep, setCurrentStep] = useState(1)
    const { MONTHLY } = PAYMENT_RECURRING_PERIOD


  // Calculate next billing date (21st of each month)
  const calculateNextBillingDate = () => {
    const today = new Date()
    const isMonthly = selectedPlan?.billingPeriod === MONTHLY

    const nextDate = isMonthly ? addMonths(today, 1) : addYears(today, 1)

    return {
      date: formatDate(nextDate, "do 'of' MMMM, yyyy"),
      isMonthly,
    }
  }

  const { date: nextBillingDate, isMonthly } = calculateNextBillingDate()

  const handleOpenChange = (open) => {
    if (!open) {
      setCurrentStep(1)
      clearPayment()
    }
    onOpenChange(open)
  }

  const handlePaymentSuccess = () => {
    setCurrentStep(2)
  }

  const handleGoToBilling = () => {
    onOpenChange(false)
    clearPayment()
    navigate("/billing")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[350px] sm:max-w-[500px] border-0 dark:bg-[#131619] py-8 shadow-[0px_0px_60px_20px_rgba(124,53,241,0.4)]">
        <div className="flex flex-col items-center gap-5 sm:p-6 p-0">
          {/* Dialog Header */}
          <PaymentDialogHeader
            title={currentStep === 1 ? "Upgrade Plan" : "Payment Successful!"}
            description={
              currentStep === 1
                ? "Review your subscription details before confirming"
                : `You're now subscribed to the ${selectedPlan?.name} plan`
            }
          />

          {/* Step Content */}
          {currentStep === 1 ? (
            <ConfirmationStep
              planName={selectedPlan?.name}
              price={selectedPlan?.price}
              nextBillingDate={nextBillingDate}
              isMonthly={isMonthly}
              onCancel={onCancel}
              onConfirm={handlePaymentSuccess}
            />
          ) : (
            <SuccessStep planName={selectedPlan?.name} onGoToBilling={handleGoToBilling} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
