import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { forgotPasswordBgDark, forgotPasswordBgLight, setPasswordBgDark, setPasswordBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";


function ResetPassword() {

    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = (data) => {
        toast({
            title: "Success",
            description: "You have successfully reset your password",
            type: "success",
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

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">set a password</h1>
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
                        <Button size="lg" variant="gradient" type="submit">
                            Set Password
                        </Button>

                    </div>
                </form>

            </div>
        </Authlayout>
    );
}


export default ResetPassword;