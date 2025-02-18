import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, UserProfile } from "..";
import { Menu } from "lucide-react";


const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}) => {

  return (
    <Sheet>
     
    <div className="flex items-end justify-between">
    <SheetTrigger>
          <Menu className="h-4 w-4 md:hidden m-2"  />
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
