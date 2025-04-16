import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import SubscriptionCard from "../pricing-plan/SubscriptionCard"

function Billing() {
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
    console.log("Cancel subscription clicked")
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

      <div className="space-y-8">
        <SubscriptionCard
          plan="Vividly Premium"
          status="ACTIVE"
          startDate="4/11/2025"
          nextBillingDate="4/16/2025"
          onCancelSubscription={handleCancelSubscription}
        />

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Payment Method</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-12 h-8 bg-gray-200 rounded mr-4 flex items-center justify-center">
                <span className="text-xs font-medium  text-black">VISA</span>
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Billing
