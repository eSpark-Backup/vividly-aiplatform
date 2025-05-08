import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetUserCards } from "@/hooks/useSubsciption";
import { ComponentLoader } from "@/components";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import AddCardDialog from "./add-card-dialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import CardView from "./CardView";

const PaymentMethod = () => {
  const { data: UserData, isLoading: isCardsLoading } = useGetUserCards();
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [defaultCardId, setDefaultCardId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddCard = () => {
    setShowAddCardDialog(true);
  };

  const handleDeleteCard = (cardId) => {
    setCardToDelete(cardId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCard = async () => {
    setIsDeleting(true);
    try {
      // API call to delete card would go here
      // await deleteUserCard(cardToDelete);

      // For now, we'll just close the dialog
      setShowDeleteDialog(false);
      // You would typically refetch the cards here
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    try {
      // API call to set default card would go here
      // await setDefaultCard(cardId);

      setDefaultCardId(cardId);
      // You would typically refetch the cards here
    } catch (error) {
      console.error("Error setting default card:", error);
    }
  };

  useEffect(() => {
    if (UserData?.userCards?.length > 0) {
      const defaultCard = UserData.userCards.find((card) => card.isDefault);
      setDefaultCardId(defaultCard?.id || UserData.userCards[0].id);
    }
  }, [UserData?.userCards]);

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
              You have not added any cards to your account.
            </p>
          </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold">Cards</h2>
              <p className="text-sm text-muted-foreground">
                Select a default payment method
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={defaultCardId}
                onValueChange={handleSetDefaultCard}
              >
                {UserData?.userCards?.map((userCard) => (
                  <CardView
                    key={userCard.id}
                    cardDetails={userCard}
                    isDefault={userCard.id === defaultCardId}
                    onSetDefault={handleSetDefaultCard}
                    onDeleteCard={handleDeleteCard}
                  />
                ))}
              </RadioGroup>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="default" onClick={handleAddCard}>
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

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        variant="confirmation"
        desc="Are you sure you want to delete this card? This action cannot be undone."
        buttonText="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDeleteCard}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
};

export default PaymentMethod;
