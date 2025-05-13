import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  ImageIcon,
  Infinity,
  Sparkles,
  Mic,
  Zap,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UpgradeModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#7C35F1]" />
              <DialogTitle className="text-xl sm:text-2xl">
                Unlock Premium Features
              </DialogTitle>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Upgrade to access these powerful creative tools
            </p>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Infinity className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  Unlimited Images
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Generate as many AI images as you need
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  Image Analysis
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Analyze unlimited images with AI
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  Human-Like Content
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Natural, context-aware content
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  Voice Capabilities
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Voice replies and interactions
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">AI Tutor</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Personalized learning assistance
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base">
                  Undetectable AI
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Human-quality content creation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 bg-muted/30 rounded-lg p-3 sm:p-4 flex items-center gap-3">
            <div className="shrink-0 p-1.5 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C35F1]" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium">
                Ready to unlock your creative potential?
              </p>
              <p className="text-xs text-muted-foreground">
                Plans start at just $5.99/month
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2 bg-muted/30 border-t">
          <Button
            variant="premium"
            className=" h-10 sm:h-11 text-sm sm:text-base"
            onClick={() => {
              navigate("/pricing-plan");
              onOpenChange(false);
            }}
          >
            <Crown className="mr-2 h-4 w-4" /> Upgrade Now
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-9 sm:h-10 text-sm"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
