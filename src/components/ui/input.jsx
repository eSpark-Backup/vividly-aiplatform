"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Input = React.forwardRef(
  ({ className, type, icon: Icon, iconClassName, InputClassName, variant = "default", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const variantStyles = {
      default: "dark:bg-[#F0EDFFCC] bg-[#B2B0BDCC]",
      basic: "dark:bg-[#0D0F10] bg-white border border-black dark:border-[#FFFFFF14] rounded-lg",
    }

    const isPasswordField = type === "password";
    const isPhoneField = type === "tel";

    return (
      <div className="relative">
        <div
          className={cn(
            `flex items-center justify-between w-full py-4 rounded-xl gap-3`,
            variantStyles[variant],
            className,
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                "absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#1C1C1C]",
                iconClassName,
              )}
            />
          )}


          {isPhoneField ? (
            <PhoneInput
              country={"tr"}
              ref={ref}
              {...props}
              inputStyle={
                {
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "#1C1C1C",
                  fontSize: "16px",
                }
              }
              buttonStyle={{
                background: "transparent",
                border: "none",
                padding: "0",
                color: "#1C1C1C",
              }}
              
            />
          ) : (

            <input
              type={showPassword ? "text" : type}
              className={cn(
                "w-full bg-transparent focus:outline-none",
                variant === "default"
                  ? "text-[#1C1C1C] placeholder:text-[#1C1C1C]"
                  : "text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                Icon && "pl-11 pr-6",
                isPasswordField && "pr-10",
                InputClassName,
              )}
              ref={ref}
              {...props}
            />
          )}



          {isPasswordField && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff
                  className={cn(
                    "h-6 w-6",
                    variant === "default" ? "text-[#1C1C1C]" : "text-gray-500 dark:text-gray-400",
                  )}
                />
              ) : (
                <Eye
                  className={cn(
                    "h-5 w-5",
                    variant === "default" ? "text-[#1C1C1C]" : "text-gray-500 dark:text-gray-400",
                  )}
                />
              )}
            </button>
          )}
        </div>
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input }

