import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, UserProfile } from "..";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}) => {

  return (
    <Sheet>
     
    <div className="flex items-end justify-between">
    <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu
          className="h-6 w-6" 
          />
        </Button>
      </SheetTrigger>

      <UserProfile />
    </div>
      

      <SheetContent side="left" className="p-0">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
