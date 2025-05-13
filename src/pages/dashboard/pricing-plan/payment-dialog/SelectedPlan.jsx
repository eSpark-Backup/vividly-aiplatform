export function SelectedPlan({ name, price, billingPeriod }) {
    return (
        <div className="w-full bg-muted/30 p-4 rounded-lg">
            <p className="font-medium">Selected Plan: {name}</p>
            <p className="text-sm text-muted-foreground">
                ${price}/{billingPeriod}
            </p>
        </div>
    )
}
