"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { capitalize } from "@/lib/utils"
import CardView from "../billing/CardView"

export default function SubscriptionCard({
  plan,
  status,
  startDate,
  nextBillingDate,
  cancelationDate,
  recurring,
  cardDetails,
  onCancelSubscription,
}) {
  return (
    <Card className="w-full border rounded-lg bg-white dark:bg-black">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Subscription</h2>
        <p className="text-sm text-gray-500">Your subscription details</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="text-base font-medium text-black dark:text-white">{plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="text-base text-black dark:text-white">{startDate}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-base font-medium text-[#7C35F1]">{status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
              <p className="text-base text-black dark:text-white">{nextBillingDate}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Card Details</p>
              <CardView
                cardDetails={cardDetails}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recurring</p>
              <p className="text-base text-black dark:text-white">{capitalize(recurring)}</p>
            </div>
          </div>
        </div>



        <div className="mt-6">
          <Button
            variant="default"
            disabled={cancelationDate}
            onClick={onCancelSubscription}
          >
            {cancelationDate ? `Cancellation Processing (Ends on ${nextBillingDate})` : "Cancel Subscription"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
