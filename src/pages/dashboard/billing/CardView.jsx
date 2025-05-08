import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const CardView = ({ cardDetails, isDefault, onSetDefault, onDeleteCard }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={cardDetails.id} id={`card-${cardDetails.id}`} />
          <Label htmlFor={`card-${cardDetails.id}`} className="sr-only">
            Default payment method
          </Label>
        </div>

        <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs font-medium text-black">{cardDetails.cardBrand}</span>
        </div>

        <div>
          <p className="font-medium flex items-center">
            {cardDetails.cardBrand} ending in {cardDetails.last4}
            {isDefault && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Default</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Expires {cardDetails.expMonth}/{cardDetails.expYear}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-red-500 hover:bg-red-50"
        onClick={() => onDeleteCard(cardDetails.id)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete card</span>
      </Button>
    </div>
  )
}

export default CardView
