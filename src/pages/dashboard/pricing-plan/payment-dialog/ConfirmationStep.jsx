import { useState, useEffect } from "react"
import { ComponentLoader } from "@/components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Info } from "lucide-react";
import { PaymentCardSelector } from "./PaymentCardSelector";


export function ConfirmationStep({
  planName,
  price,
  nextBillingDate,
  isMonthly,
  onCancel,
  onConfirm,
  isLoading,
  UserData,
  isCardsLoading,
  setSelectedCard
}) {


  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="w-full space-y-6">
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              By clicking on Confirm, you'll start your{" "}
              <span className="font-medium text-foreground">{planName}</span>{" "}
              plan subscription of{" "}
              <span className="font-medium text-foreground">
                ${price}/{isMonthly ? "month" : "year"}
              </span>
              {isMonthly ? (
                <>, with a renewal date of the {nextBillingDate}.</>
              ) : (
                <>, with an annual renewal on {nextBillingDate}.</>
              )}
            </p>
            <p className="mt-2">
              You can cancel your subscription at any time from your billing
              settings.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {isCardsLoading ? (
          <ComponentLoader description={"Loading User Cards information..."} />
        ) : (
          <PaymentCardSelector
            cards={UserData?.userCards || []}
            onCardSelect={handleCardSelect}
            isLoading={isCardsLoading}
          />
        )}
      </div>

      <div className="flex w-full gap-3 justify-center mt-6">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Cancel
        </Button>
        <Button
          isLoading={isLoading}
          disabled={isCardsLoading}
          type="button"
          onClick={onConfirm}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          Confirm to pay
        </Button>
      </div>
    </div>
  );
}
