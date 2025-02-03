import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ChevronLeft } from "lucide-react";
import { forgotPasswordBgDark, forgotPasswordBgLight, loginBgDark, loginBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

function ForgotPassword() {

    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data) => {
        toast({
            title: "Success",
            description: "You have successfully submitted your email",
            type: "success",
        })

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
                        <Button size="lg" variant="gradient" type="submit">
                            Submit
                        </Button>

                    </div>
                </form>

            </div>
        </Authlayout>
    );
}


export default ForgotPassword;