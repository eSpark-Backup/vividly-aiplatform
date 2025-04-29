import { Loader, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useWebSocketContext } from "@/services/WebSocketProvider";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { ProgressBar } from "@/components";
import { useGetUserSubscriptionInfo } from "@/hooks/useSubsciption";
import { UpgradeModal } from "./Upgrade-Modal";
import { useState } from "react";

const FreeCounter = ({}) => {
  const [open, setOpen] = useState(false);
  const {
    userImageGenerationCount,
    userImageAnalysisCount,
    isUserUsageLoading,
  } = useWebSocketContext();
  const { currentPlan } = useFeatureAccess();
  const { isLoading: isSubscriptionInfoLoading } = useGetUserSubscriptionInfo();

  if (currentPlan?.maxPictureGeneration === Infinity) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Card className="dark:gradient-glass-effect min-h-[120px] flex flex-col justify-center bg-black">
        {isUserUsageLoading || isSubscriptionInfoLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <CardContent className="py-2">
            <ProgressBar
              title="Image Generations"
              userCount={userImageGenerationCount}
              maxCount={currentPlan?.maxPictureGeneration}
            />
            <ProgressBar
              title="Image Analysis"
              userCount={userImageAnalysisCount}
              maxCount={currentPlan?.maxPictureAnalysis}
            />

            <Button
              variant="premium"
              className="w-full"
              onClick={() => setOpen(true)}
            >
              Upgrade
              <Zap className="w-4 h-4 ml-2 fill-white" />
            </Button>
          </CardContent>
        )}
      </Card>

      <UpgradeModal open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default FreeCounter;
