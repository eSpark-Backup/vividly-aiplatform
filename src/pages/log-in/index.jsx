import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock } from "lucide-react";
import { loginBgDark, loginBgLight } from "@/assets";
import { Authlayout } from "@/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "@/components";
import { useLogin } from "@/hooks/useAuth";

function LogIn() {

  const { toast } = useToast();
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();


  console.log(isPending)

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    login(data, {
      onSuccess: () => {
        showToast("Success", "You have successfully logged in", "success");
      },
      onError: (error) => {
        handleApiError(showToast, error);
      }
    });
  };

  return (
    <Authlayout
      onLightPoster={loginBgLight}
      onDarkPoster={loginBgDark}
    >
      <div className="w-full space-y-6">
        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="lg:text-2xl text-xl font-semibold tracking-tight dark:text-white uppercase">Login</h1>
            <p className="text-md dark:text-gray-300">How do I get started? Lorem ipsum dolor sit amet.</p>
          </div>

          <div className="grid gap-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Input icon={User} type="email" placeholder="Email" {...register("email")} />
              {errors.email && <p className="text-sm text-[#FF8682]">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Input icon={Lock} type="password" placeholder="Password" {...register("password")} />
              {errors.password && <p className="text-sm text-[#FF8682]">{errors.password.message}</p>}
              <div className="flex justify-end">
                <Link to="/forgot-password">
                  <p className="text-[10px] text-[#FF8682] cursor-pointer">Forgot password?</p>
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              isLoading={isPending}
              size="lg"
              variant="gradient"
              type="submit"
            >
              Login Now
            </Button>

            {/* Signup Link */}
            <div className="text-xs">
              <span className="mr-1 dark:text-gray-300">Don't have an account?</span>
              <Link to="/sign-up" className="text-[#9181F4] p-0 cursor-pointer">Sign up</Link>
            </div>
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
        <GoogleLoginButton />

      </div>
    </Authlayout>
  );
}


export default LogIn;