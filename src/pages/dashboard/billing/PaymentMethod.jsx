import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CardView from "./CardView";
import { useGetUserCards } from "@/hooks/useSubsciption";
import { ComponentLoader } from "@/components";
import { Button } from "@/components/ui/button";
import AddCardDialog from "./add-card-dialog";

const PaymentMethod = () => {
  const { data: UserData, isLoading: isCardsLoading } = useGetUserCards();
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);

  if (isCardsLoading) {
    return (
      <ComponentLoader description={"Loading User Cards information..."} />
    );
  }

  if (!UserData?.userCards?.length) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Card className="p-8 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">No Cards Found</h2>
            <p className="text-muted-foreground">
              You don't have any cards added. Add a card to your account.
            </p>
          </div>
          <Button onClick={"handleAddCard"} className="min-w-[200px]">
            Add Card
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
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

              <div className="mt-6">
                <Button
                  variant="default"
                  onClick={() => setShowAddCardDialog(true)}
                >
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCardDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onCancel={() => setShowAddCardDialog(false)}
      />
    </>
  );
};

export default PaymentMethod;
