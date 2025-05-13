import { DialogDescription, DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard } from "lucide-react"

export function PaymentDialogHeader({ title, description }) {
  return (
    <UIDialogHeader className="space-y-1 text-center">
      <div className="rounded-full flex justify-center p-3">
        <div className="bg-muted/50 rounded-full p-3">
          <CreditCard />
        </div>
      </div>

      <DialogTitle className="sm:text-3xl text-xl text-center font-bold dark:text-white">{title}</DialogTitle>
      <DialogDescription className="text-center dark:text-white text-black sm:text-xl text-sm">
        {description}
      </DialogDescription>
    </UIDialogHeader>
  )
}
