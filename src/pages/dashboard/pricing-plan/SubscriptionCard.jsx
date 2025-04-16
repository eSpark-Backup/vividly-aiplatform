"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SubscriptionCard({
  plan,
  status,
  startDate,
  nextBillingDate,
  onCancelSubscription,
}) {
  return (
    <Card className="w-full border border-gray-200 rounded-lg">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
        <p className="text-sm text-gray-600">Your subscription details</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="text-base font-medium">{plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="text-base">{startDate}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-base font-medium text-[#5038ED]">{status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
              <p className="text-base">{nextBillingDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="destructive"
            className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
            onClick={onCancelSubscription}
          >
            Cancel Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
