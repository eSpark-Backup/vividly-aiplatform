import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, CreditCard } from "lucide-react"

export function PaymentCardSelector({ cards, onCardSelect, isLoading = false }) {
  const [selectedCardId, setSelectedCardId] = useState(null)

  useEffect(() => {
    if (cards && cards.length > 0 && !selectedCardId) {
      // Find default card or use the first one
      const defaultCard = cards.find((card) => card.isDefault) || cards[0]
      setSelectedCardId(defaultCard.id)
      onCardSelect(defaultCard)
    }
  }, [cards, selectedCardId, onCardSelect])

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId)
    const selectedCard = cards.find((card) => card.id === cardId)
    if (selectedCard) {
      onCardSelect(selectedCard)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Payment Methods</p>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center text-muted-foreground py-4">
          <p>No payment methods available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Payment Methods</p>
      <RadioGroup value={selectedCardId || ""} onValueChange={handleCardSelect} className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {cards.map((card) => (
          <div key={card.id} className="relative">
            <RadioGroupItem value={card.id} id={`card-${card.id}`} className="peer sr-only" />
            <Label
              htmlFor={`card-${card.id}`}
              className="flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all hover:bg-accent peer-data-[state=checked]:border-primary"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{card.cardBrand}</p>           {card.isDefault && <span className="text-xs text-muted-foreground bg-primary px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">•••• {card.last4}</p>
                  {card.expMonth && card.expYear && (
                    <p className="text-xs text-muted-foreground">
                      Expires {card.expMonth}/{card.expYear}
                    </p>
                  )}

                </div>
              </div>
              <div className="flex items-center justify-center h-5 w-5 rounded-full border border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                {selectedCardId === card.id && <Check className="h-3.5 w-3.5" />}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
