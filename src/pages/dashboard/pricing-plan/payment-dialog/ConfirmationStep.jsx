import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Info } from "lucide-react"

export function ConfirmationStep({ planName, price, nextBillingDate, isMonthly, onCancel, onConfirm }) {

    return (
        <div className="w-full space-y-6">
            <Card className="p-4 bg-muted/30">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <p>
                            By clicking on Confirm, you'll start your <span className="font-medium text-foreground">{planName}</span>{" "}
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
                        <p className="mt-2">You can cancel your subscription at any time from your billing settings.</p>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Billing cycle</span>
                    <span>{isMonthly ? "Monthly" : "Annual"}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next payment</span>
                    <span>{nextBillingDate}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total amount</span>
                    <span className="font-medium">
                        ${price}/{isMonthly ? "month" : "year"}
                    </span>
                </div>
            </div>

            <div className="flex w-full gap-3 justify-center mt-6">
                <Button type="button" onClick={onCancel} variant="secondary" size="lg" className="w-full">
                    Cancel
                </Button>
                <Button type="button" onClick={onConfirm} variant="gradient" size="lg" className="w-full">
                    Confirm to pay
                </Button>
            </div>
        </div>
    )
}
