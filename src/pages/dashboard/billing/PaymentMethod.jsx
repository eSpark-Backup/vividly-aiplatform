import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useGetUserCards,
  useMakeCardDefault,
  useRemoveUserCard,
} from "@/hooks/useSubsciption";
import { ComponentLoader } from "@/components";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import AddCardDialog from "./add-card-dialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import CardView from "./CardView";
import { useToast } from "@/hooks/use-toast";

const PaymentMethod = () => {
  const { data: UserData, isLoading: isCardsLoading } = useGetUserCards();
  const { mutate: makeCardDefault, isPending: isMakingCardDefault } =
    useMakeCardDefault();
  const { mutate: removeUserCard, isPending: isRemovingCard } =
    useRemoveUserCard();
  const { toast } = useToast();

  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [defaultCardId, setDefaultCardId] = useState("");
  const [pendingCardId, setPendingCardId] = useState(null);
  const [displayedCardId, setDisplayedCardId] = useState("");

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };

  const handleAddCard = () => {
    setShowAddCardDialog(true);
  };

  const handleDeleteCard = (cardId) => {
    setCardToDelete(cardId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCard = async () => {
    const data = {
      cardId: cardToDelete,
    };

    removeUserCard(data, {
      onSuccess: () => {
        showToast("Success", "Card deleted successfully", "success");
        setShowDeleteDialog(false);
      },
      onError: () => {
        showToast("Error", "Error deleting card", "error");
        setShowDeleteDialog(false);
      },
    });
  };

  const handleSetDefaultCard = async (cardId) => {
    if (cardId === defaultCardId) return;

    setPendingCardId(cardId);
    setDisplayedCardId(cardId);

    const data = {
      cardId,
    };

    makeCardDefault(data, {
      onSuccess: () => {
        setDefaultCardId(cardId);
        setDisplayedCardId(cardId);
        showToast("Success", "Default card set successfully", "success");
        setPendingCardId(null);
      },
      onError: () => {
        setDisplayedCardId(defaultCardId);
        showToast("Error", "Error setting default card", "error");
        setPendingCardId(null);
      },
    });
  };

  useEffect(() => {
    setDisplayedCardId(defaultCardId);
  }, [defaultCardId]);

  useEffect(() => {
    if (UserData?.userCards?.length > 0) {
      const defaultCard = UserData.userCards.find((card) => card.isDefault);
      const newDefaultId = defaultCard?.id || UserData.userCards[0].id;
      setDefaultCardId(newDefaultId);
      setDisplayedCardId(newDefaultId);
    }
  }, [UserData]);

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
            <CardContent className="space-y-4 max-h-96 overflow-y-auto mr-2">
              <RadioGroup
                value={displayedCardId}
                onValueChange={handleSetDefaultCard}
                disabled={isMakingCardDefault}
              >
                {UserData?.userCards?.map((userCard) => (
                  <CardView
                    key={userCard.id}
                    cardDetails={userCard}
                    isDefault={userCard.id === defaultCardId}
                    isPending={pendingCardId === userCard.id}
                    isLoading={isMakingCardDefault}
                    onSetDefault={handleSetDefaultCard}
                    onDeleteCard={handleDeleteCard}
                  />
                ))}
              </RadioGroup>

            </CardContent>
          </Card>
        </div>
      </div>

      <Button variant="default" onClick={handleAddCard}>
        Add Card
      </Button>

      <AddCardDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onCancel={() => {
          setShowAddCardDialog(false);
        }}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        variant="confirmation"
        desc="Are you sure you want to remove this card? This action cannot be undone."
        buttonText="Remove"
        isLoading={isRemovingCard}
        onConfirm={confirmDeleteCard}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
};

export default PaymentMethod;
