import { UserProfile } from "@/components";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}) => {

  return (
    <Sheet>
      {/* <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu
          className="h-6 w-6" 
          />
        </Button>
      </SheetTrigger> */}
   
      <UserProfile />

      <SheetContent side="left" className="p-0">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
