import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ChevronLeft } from "lucide-react";
import { forgotPasswordBgDark, forgotPasswordBgLight} from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useRequestResetPassword } from "@/hooks/useAuth";

function ForgotPassword() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const { mutate: requestResetPassword, isPending } = useRequestResetPassword();

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data) => {
        requestResetPassword(data, {
            onSuccess: (data) => {
                showToast("Success", "Code sent to your email address", "success");
                navigate("/verify-code?reset=" + data.email);
            },
            onError: (error) => {
                showToast("Error", "Failed to send code", "error");
                console.log(error);
            }
        });
        // navigate("/verify-code?reset=" + data.email);
        console.log("Form Data:", data);
    };

    return (
        <Authlayout
            onLightPoster={forgotPasswordBgLight}
            onDarkPoster={forgotPasswordBgDark}
        >
            <div className="w-full space-y-6">
                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">

                        {/* Back to login */}
                        <Link to="/log-in">
                            <div className="flex items-center gap-1 cursor-pointer text-sm dark:text-gray-300">
                                <div>
                                    <ChevronLeft
                                        className="dark:text-gray-300"
                                        size={20} />
                                </div>
                                <p>Back to login</p>
                            </div>
                        </Link>

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Forget Your Password?</h1>
                        <p className="text-md dark:text-gray-300">Don’t worry, happens to all of us. Enter your email below to recover your password</p>
                    </div>

                    <div className="grid gap-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <Input icon={User} type="email" placeholder="Email" {...register("email")} />
                            {errors.email && <p className="text-sm text-[#FF8682]">{errors.email.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button
                            isLoading={isPending}
                            size="lg"
                            variant="gradient"
                            type="submit">
                            Submit
                        </Button>

                    </div>
                </form>

            </div>
        </Authlayout>
    );
}


export default ForgotPassword;