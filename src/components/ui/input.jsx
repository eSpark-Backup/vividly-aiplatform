import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const Input = React.forwardRef(({ className, type, icon: Icon, iconClassName, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative">
      <div className={cn(`flex items-center justify-between w-full dark:bg-[#F0EDFFCC] bg-[#B2B0BDCC]  py-4 rounded-xl gap-3`)}>
        {Icon && <Icon className={cn("absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#1C1C1C]", iconClassName)} />}
        <input
          type={showPassword ? "text" : type}
          className={cn(
            "w-full bg-transparent focus:outline-none text-[#1C1C1C] placeholder:text-[#1C1C1C] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            Icon && "pl-11 pr-6",
            type === "password" && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-6 w-6 text-[#1C1C1C]" /> : <Eye className="h-5 w-5 text-[#1C1C1C]" />}
          </button>
        )}
      </div>
    </div>
  )
})

Input.displayName = "Input"

export { Input }

