import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { usecreateAccountResendVerification } from "@/hooks/useAuth";
import { verifyCodeBgDark, verifyCodeBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiErrorHandler";
import { useEffect } from "react";


function VerifyEmailSent() {

    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reset = searchParams.get("reset");
    const create = searchParams.get("create");
    const { mutate: resendEmail, isPending } = usecreateAccountResendVerification();

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    const handleResntEmail = () => {
        const data = { email: create };
        
        resendEmail(data, {
            onSuccess: () => {
                showToast("Success", "Verification email resent successfully", "success");
            },
            onError: (error) => {
                handleApiError(showToast, error);
                
            }
        });
    }

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
                <div className="space-y-6">
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

                        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Verification Email Sent</h1>
                        <p className="text-md dark:text-gray-300">We have sent a verification code to your email address.</p>
                    </div>

                    <div className="grid gap-4">

                        {/* Submit Button */}
                        <Button
                            onClick={handleResntEmail}
                            isLoading={isPending}
                            size="lg"
                            variant="gradient"
                            type="submit">
                            Resend Email
                        </Button>

                    </div>
                </div>

            </div>
        </Authlayout>
    );
}


export default VerifyEmailSent;