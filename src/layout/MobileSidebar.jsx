import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}) => {

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu
          className="h-6 w-6" 
          />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
