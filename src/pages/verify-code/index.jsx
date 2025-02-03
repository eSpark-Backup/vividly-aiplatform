import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, BadgeCheck } from "lucide-react";
import { verifyCodeBgDark, verifyCodeBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyCodeSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

function VerifyCode() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reset = searchParams.get("reset");
    const create = searchParams.get("create");


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(verifyCodeSchema),
    });

    const onSubmit = (data) => {

        toast({
            title: "Success",
            description: "You have successfully verified your code",
            type: "success",
        })

        console.log("Form Data:", data);

        if (reset) {
            navigate("/reset-password");
        }

        if (create) {
            navigate("/create-password");
        }
    };


    useEffect(() => {
        if (!reset && !create) {
            navigate("/log-in");
        }
    }, []);

    return (
        <Authlayout
            onLightPoster={verifyCodeBgLight}
            onDarkPoster={verifyCodeBgDark}
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

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Verify Code</h1>
                        <p className="text-md dark:text-gray-300">An authentication code has been sent to your email.</p>
                    </div>

                    <div className="grid gap-4">
                        {/* Code Input */}
                        <div className="space-y-2">
                            <Input
                                icon={BadgeCheck}
                                type="number" placeholder="Enter Code" {...register("code")} />
                            {errors.code && <p className="text-sm text-[#FF8682]">{errors.code.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button size="lg" variant="gradient" type="submit">
                            Verify
                        </Button>

                    </div>
                </form>

            </div>
        </Authlayout>
    );
}


export default VerifyCode;