import { Button } from "@/components/ui/button";
import { usePaymentStore } from "@/store/usePaymentStore";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/components";
import { paymentButtonCSS, themes } from "@/constant";
import { useBodyClassToggle } from "@/hooks/useBodyClassToggle";
import { useAddUserCard } from "@/hooks/useSubsciption";
import { handleSubscriptionApiError } from "@/lib/apiErrorHandler";
import { useToast } from "@/hooks/use-toast";

export function AddCardStep({ onBack, onAddCardSuccess }) {
  const { customerInfo } = usePaymentStore();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { mutate: addUserCard, isPending: isAddingCard } = useAddUserCard();
  const isDarkTheme = theme === themes[0];
  useBodyClassToggle("square-dark-mode", isDarkTheme);

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };

  return (
    <div className="w-full space-y-6">
      {/* Square Payment Form */}
      <div className="w-full">
        <div className={`w-full dark:dark-payment-form light-payment-form`}>
          <div className="payment-form-container">
            <PaymentForm
              applicationId={import.meta.env.VITE_SQUARE_APPLICATION_ID}
              locationId={import.meta.env.VITE_SQUARE_LOCATION_ID}
              cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
                const addCardData = {
                  sourceId: token.token,
                  customer: customerInfo,
                };

                addUserCard(addCardData, {
                      onSuccess: (data) => {
                        if (data.success) {
                          onAddCardSuccess(data);
                        }
                      },
                      onError: (error) => {
                        handleSubscriptionApiError(showToast, error);
                      },
                    });
              }}
            >
              <div className="grid gap-4">
                <CreditCard
                  className="w-full dark:bg-muted/50 p-4 rounded-lg"
                  buttonProps={{
                    ...paymentButtonCSS(isDarkTheme),
                    isLoading: isAddingCard,
                  }}
                >
                  <p className="text-sm font-medium">Add Card</p>
                </CreditCard>
              </div>
            </PaymentForm>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Button
        type="button"
        onClick={onBack}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Customer Info
      </Button>
    </div>
  );
}
