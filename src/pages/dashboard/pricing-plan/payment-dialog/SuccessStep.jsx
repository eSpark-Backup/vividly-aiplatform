import { Button } from "@/components/ui/button"
import { CheckCircle } from 'lucide-react'
import { motion } from "framer-motion"

export function SuccessStep({ planName, onGoToBilling }) {
  return (
    <motion.div 
      className="w-full flex flex-col items-center gap-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
      >
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
        </div>
      </motion.div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Thank You for Your Subscription!</h3>
        <p className="text-muted-foreground">
          Your {planName} plan is now active. You can manage your subscription from the billing page.
        </p>
      </div>

      {/* Action Button */}
      <Button 
        onClick={onGoToBilling} 
        className="w-full bg-[linear-gradient(99.78deg,#9181F4_-5.85%,#5038ED_109.55%)] shadow-[0px_8px_21px_0px_rgba(0,0,0,0.16)] hover:opacity-90"
        size="lg"
      >
        Go to Billing Page
      </Button>
    </motion.div>
  )
}
