import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#7C35F1] text-white shadow hover:bg-[#7C35F1]/90 border-t-[1.58px] border-t-[#9C67F4]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-[1px] border-gray-300 dark:bg-[#131619] bg-white shadow-sm dark:hover:bg-[#1C1C1C] hover:bg-gray-100",
        secondary:
          "dark:bg-gradient-to-br dark:from-[rgba(215,237,237,0.25)] dark:to-transparent dark:border-t dark:border-t-[#FFFFFF14] text-white dark:shadow-sm dark:hover:bg-opacity-90 bg-black",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-[linear-gradient(99.78deg,#9181F4_-5.85%,#5038ED_109.55%)]  text-white shadow-[0px_8px_21px_0px_rgba(0,0,0,0.16)] rounded-xl hover:opacity-90 ",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        md: "h-10 px-3 rounded-lg",
        lg: "h-[53px] w-[140px] rounded-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false,  isLoading = false, icon, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={props.disabled || isLoading} {...props}>
        {isLoading ? <Loader2 className="h-12 w-12 animate-spin" /> : <>{icon}  {props.children}</>}
        
      </Comp>

    )
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
