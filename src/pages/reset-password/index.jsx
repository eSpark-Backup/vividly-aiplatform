import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { setPasswordBgDark, setPasswordBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "@/hooks/useAuth";


function ResetPassword() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const { mutate: resetPassword, isPending } = useResetPassword();

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = (data) => {
        resetPassword(data, {
            onSuccess: (data) => {
                showToast("Success", "Password has been reseted successfully", "success");
                navigate("/log-in");
            },
            onError: (error) => {
                showToast("Error", "Failed to reset password", "error")
                console.log(error)
            }
        })

        console.log("Form Data:", data);
    };


    return (
        <Authlayout
            onLightPoster={setPasswordBgLight}
            onDarkPoster={setPasswordBgDark}
        >
            <div className="w-full space-y-6">
                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Reset Password</h1>
                        <p className="text-md dark:text-gray-300">Your previous password has been reseted. Please set a new password for your account.</p>
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
        </Authlayout>
    );
}


export default ResetPassword;