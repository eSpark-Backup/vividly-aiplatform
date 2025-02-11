import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { signupBgDark, signupBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPasswordSchema } from "@/schema";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useCreatePassword } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiErrorHandler";


function CreatePassword() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const { token } = useParams();
    const { mutate: createPassword, isPending } = useCreatePassword();

    const [showSuccessDialog, setShowSuccessDialog] = useState(false)

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createPasswordSchema),
    });

    const onSubmit = (data) => {

        createPassword({token, password: data.password}, {
            onSuccess: () => {
                showToast("Success", "Your account has been created successfully.", "success");
                setShowSuccessDialog(true)
            },
            onError: (error) => {
                handleApiError(showToast, error);
            }
        })
        console.log("Form Data:", data);
    };


    return (
        <Authlayout
            onLightPoster={signupBgLight}
            onDarkPoster={signupBgDark}
        >
            <div className="w-full space-y-6">
                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Set Password</h1>
                        <p className="text-md dark:text-gray-300">Please set a password for your account.</p>
                    </div>

                    <div className="grid gap-4">
                        {/* Passwords Input */}
                        <div className="space-y-2">
                            <Input
                                icon={Lock}
                                type="password" placeholder="Create Password" {...register("password")} />
                            {errors.password && <p className="text-sm text-[#FF8682]">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Input
                                icon={Lock}
                                type="password" placeholder="Re-Enter Password" {...register("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-sm text-[#FF8682]">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button
                            isLoading={isPending}
                            size="lg"
                            variant="gradient"
                            type="submit">
                            Set Password
                        </Button>

                    </div>
                </form>

            </div>


            <ConfirmationDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                variant="success"
                desc="Your account has been created successfully."
                onConfirm={() => {
                    setShowSuccessDialog(false)
                    navigate("/log-in");
                }}
            />
        </Authlayout>
    );
}


export default CreatePassword;