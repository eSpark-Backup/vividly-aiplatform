import { useState } from "react"
import { Card } from "@/components/ui/card"
import SubscriptionCard from "../pricing-plan/SubscriptionCard"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { useUserSubscriptionStore } from "@/store/useUserSubscriptionStore"
import { useCancelSubscription, useGetUserSubscriptionInfo } from "@/hooks/useSubsciption"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ComponentLoader } from "@/components"
import { useToast } from "@/hooks/use-toast"

function Billing() {
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false)
  const { id: subscriptionId, planName, status, startDate, nextBillingDate, cancelationDate, recurring } = useUserSubscriptionStore()
  const { isLoading: isSubscriptionInfoLoading } = useGetUserSubscriptionInfo({
    enabled: false,
  })
  const { mutate: cancelSubscription, isPending } = useCancelSubscription()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleCancelSubscription = () => {
    setShowCancelSubscriptionModal(true)
  }

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };


  const handleOnConfirm = () => {
    cancelSubscription({ subscriptionId }, {
      onSuccess: () => {
        showToast("Success", "Subscription cancelled successfully", "success");
        setShowCancelSubscriptionModal(false)
      }
      , onError: (error) => {
        handleApiError(showToast, error);
      }
    })

  }

  const handleGoToPricing = () => {
    navigate("/pricing-plan")
  }

  if (isSubscriptionInfoLoading) {
    return <ComponentLoader description={"Loading subscription information..."} />
  }

  if (!planName) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card className="p-8 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">No Active Subscription</h2>
            <p className="text-muted-foreground">
              You don't have an active subscription plan. Subscribe to unlock premium features.
            </p>
          </div>
          <Button onClick={handleGoToPricing} className="min-w-[200px]">
            View Pricing Plans
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

        <div className="space-y-8">
          <SubscriptionCard
            plan={planName}
            status={status}
            startDate={startDate}
            nextBillingDate={nextBillingDate}
            cancelationDate={cancelationDate}
            recurring={recurring}
            onCancelSubscription={handleCancelSubscription}
          />

          {/* <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-8 bg-gray-200 rounded mr-4 flex items-center justify-center">
                  <span className="text-xs font-medium text-black">VISA</span>
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/2025</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      <ConfirmationDialog
        open={showCancelSubscriptionModal}
        onOpenChange={setShowCancelSubscriptionModal}
        variant="confirmation"
        desc="Are you sure you want to cancel your subscription?"
        buttonText="Confirm"
        isLoading={isPending}
        onConfirm={handleOnConfirm}
        onCancel={() => setShowCancelSubscriptionModal(false)}
      />
    </>
  )
}

export default Billing
