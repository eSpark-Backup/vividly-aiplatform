import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { confirmationDialog, successDialog } from "@/assets"


export function ConfirmationDialog({ open, onOpenChange, variant, desc, onConfirm, onCancel }) {
    const isConfirmation = variant === "confirmation"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[300px] sm:max-w-[500px] border-0 dark:bg-[#131619] py-12 shadow-glow">
                <p
                    onClick={onCancel}
                    className="absolute z-50 cursor-pointer right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4 text-zinc-400" />
                </p>


                <div className="flex flex-col items-center gap-5 sm:p-6 p-0">
                    {/* Dialog Header */}
                    <DialogHeader className="space-y-1 text-center">
                        <div className="rounded-full flex justify-center p-3">
                            {isConfirmation ? <img src={confirmationDialog} className="h-[70px]" alt="Confirmation" /> : <img src={successDialog} className="h-[70px]" alt="Success" />}
                        </div>


                        <DialogTitle className="sm:text-3xl text-xl text-center font-bold dark:text-white">
                            {isConfirmation ? "CONFIRM?" : "SUCCESSFULLY CREATED!"}
                        </DialogTitle>
                        <DialogDescription className="text-center dark:text-white text-black sm:text-xl text-sm">
                            {desc}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Buttons */}
                    <div className="flex w-full gap-2 justify-center">
                        {isConfirmation ? (
                            <>
                                <Button
                                    onClick={onCancel}
                                    variant="secondary"
                                    size="lg"
                                >
                                    Cancel
                                </Button>
                                <Button onClick={onConfirm} variant="gradient" size="lg">
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <Button onClick={onConfirm} variant="gradient" size="lg">
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

