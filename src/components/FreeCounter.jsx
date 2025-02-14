import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
// import { useProModal } from "@/hooks/use-pro-modal";
import { MAX_FREE_COUNTS } from "@/constant";


const FreeCounter = ({
  apiLimitCount = 0,
  isPro = false,
}) => {
  // const proModal = useProModal();
  const proModal = true

  // if (isPro) {
  //   return null;
  // }
  return (
    <div >
      <Card className="dark:gradient-glass-effect bg-black">
        <CardContent className="py-2">
          <div className="text-center text-sm text-white  mb-4 space-y-2">
            <p>
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Generations
            </p>
            <Progress
              className="h-1 dark:bg-white/10 bg-white"
              value={(apiLimitCount / MAX_FREE_COUNTS) * 100}
            />
          </div>
          <Button
            // onClick={proModal.onOpen}
            variant="premium"
            className="w-full"
          >
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeCounter;
