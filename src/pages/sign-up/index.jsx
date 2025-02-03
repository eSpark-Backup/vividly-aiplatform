import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail } from "lucide-react";
import { googleIcon, signupBgDark, signupBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {

    const { toast } = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = (data) => {
        toast({
            title: "Success",
            description: "You have successfully created an account",
            type: "success",
        })

        console.log("Form Data:", data);
        navigate("/verify-code");
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
                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Create an account</h1>
                        <p className="text-md dark:text-gray-300">How to i get started lorem ipsum dolor at?</p>
                    </div>

                    <div className="grid gap-4">

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Input icon={User} type="text" placeholder="First Name" {...register("firstName")} />
                                {errors.firstName && <p className="text-sm text-[#FF8682]">{errors.firstName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Input icon={Lock} type="text" placeholder="Last Name" {...register("lastName")} />
                                {errors.lastName && <p className="text-sm text-[#FF8682]">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Input icon={Mail} type="email" placeholder="Email" {...register("email")} />
                            {errors.email && <p className="text-sm text-[#FF8682]">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Input icon={Lock} type="password" placeholder="Password" {...register("password")} />
                            {errors.password && <p className="text-sm text-[#FF8682]">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Input icon={Lock} type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-sm text-[#FF8682]">{errors.confirmPassword.message}</p>}
                        </div>


                        {/* Signup Link */}
                        <div className="text-xs">
                            <span className="mr-1 dark:text-gray-300">Allready have an account?</span>
                            <Link to="/log-in" className="text-[#9181F4] p-0 cursor-pointer">Login</Link>
                        </div>



                        {/* Submit Button */}
                        <Button size="lg" variant="gradient" type="submit">
                            Continue
                        </Button>


                    </div>
                </form>

                {/* Divider */}
                <div className="flex items-center justify-center">
                    <div className="flex-1 h-px bg-gray-500" />
                    <div className="px-5 whitespace-nowrap">
                        <span className="mr-1 dark:text-white font-bold">Login</span>
                        <span className="dark:text-gray-300">with Others</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-500" />
                </div>

                {/* Google Login Button */}
                <Button
                    variant="outline" size="lg" className="w-full">
                    <img src={googleIcon} alt="Google" width={32} height={32} className="mr-2" />
                    <div>
                        <span className="mr-1 dark:text-gray-300">Login with</span>
                        <span className="dark:text-white font-bold">Google</span>
                    </div>
                </Button>
            </div>
        </Authlayout>
    );
}


export default SignUp;