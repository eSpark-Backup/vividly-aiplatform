import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePaymentStore } from "@/store/usePaymentStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const paymentFormSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
})

export function CustomerCardIntoStep({ defaultValues, onCancel, onContinue }) {
    const { setCustomerInfo } = usePaymentStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(paymentFormSchema),
        defaultValues,
    })

    const onSubmit = (data) => {
        setCustomerInfo(data)
        onContinue()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" className="w-full px-4 py-3" placeholder="First Name" {...register("firstName")} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" className="w-full px-4 py-3" placeholder="Last Name" {...register("lastName")} />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-2 justify-center mt-6">
                <Button type="button" onClick={onCancel} variant="secondary" size="lg" className="w-full">
                    Cancel
                </Button>
                <Button type="submit" variant="gradient" size="lg" className="w-full">
                    Continue to Add Card
                </Button>
            </div>
        </form>
    )
}
