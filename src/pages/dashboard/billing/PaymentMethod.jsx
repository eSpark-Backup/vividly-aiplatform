import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CardView from "./CardView";
import { useGetUserCards } from "@/hooks/useSubsciption";
import { ComponentLoader } from "@/components";

const PaymentMethod = () => {
  const { data: UserData, isLoading: isCardsLoading } = useGetUserCards();

  if (isCardsLoading) {
    return (
      <ComponentLoader description={"Loading User Cards information..."} />
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* Payment Method Tab */}
      <h1 className="text-2xl font-bold mb-6">Payment Method</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Cards</h2>
          </CardHeader>
          <CardContent>
            {UserData?.userCards?.map((userCard) => (
              <CardView cardDetails={userCard} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentMethod;
