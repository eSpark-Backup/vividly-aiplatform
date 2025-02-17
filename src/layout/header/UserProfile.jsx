import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { CreditCard, Home, LogOut, Palette, Settings, WalletCards } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/store/useDialogStore";
import { Switch } from "../../components/ui/switch";
import { useTheme } from "../../components";
import { themes } from "@/constant";
import { memo } from "react";

const SidebarLink = memo(({ route, isRouteMatched }) => (
  <Link
    to={route.href}
    className={cn(
      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
      "dark:hover:text-white dark:hover:bg-white/5 hover:bg-gray-200",
      isRouteMatched
        ? "dark:text-white text-white dark:bg-white/5 bg-black hover:bg-black"
        : "dark:text-zinc-400 text-white"
    )}
  >
    <div className="flex items-center flex-1">
      <route.icon
        className={cn(
          "h-5 w-5 mr-3",
          isRouteMatched ? "text-white" : "dark:text-[#686B6E] text-black"
        )}
      />
      <span className={cn(isRouteMatched ? "text-white" : "dark:text-white text-black")}>
        {route.label}
      </span>
    </div>
  </Link>
));

const ThemeSwitch = ({ isDarkTheme, setTheme }) => (
  <div className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer dark:hover:text-white dark:text-white text-black dark:hover:bg-white/5 hover:bg-gray-200 rounded-lg transition">
    <div className="flex items-center flex-1">
      <Palette className="h-5 w-5 mr-3 dark:text-[#686B6E] text-black" />
      Dark Mode
    </div>
    <Switch
      checked={isDarkTheme}
      onCheckedChange={() => setTheme(isDarkTheme ? "light" : "dark")}
    />
  </div>
);

const SignOutButton = ({ onSignOut }) => (
  <div
    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer dark:hover:text-white dark:text-white text-black dark:hover:bg-white/5 hover:bg-gray-200 rounded-lg transition"
    onClick={onSignOut}
  >
    <div className="flex items-center flex-1">
      <LogOut className="h-5 w-5 mr-3 dark:text-[#686B6E] text-black" />
      Sign out
    </div>
  </div>
);

export default function UserProfile() {
  const { setShowSignOutDialog } = useDialogStore();
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === themes[0];

  const routes = [
    { label: "Home", icon: Home, href: "/home?cat=explore" },
    { label: "Billing", icon: WalletCards, href: "/billing" },
    { label: "Pricing Plan", icon: CreditCard, href: "/pricing-plan" },
  ];

  return (
    <Card className="dark:gradient-glass-effect bg-black rounded-lg w-full py-2 px-3 relative">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src="https://cdn2.futurepedia.io/2024-11-26T18-51-51.356Z-MtXWJEI4O08DkXhcFo8z7VXOEe00XPWLb.webp?w=1920"
              alt="Adam Green"
            />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </div>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute bottom-1 right-1 p-1 rounded-full shadow-md transition">
              <Settings fill="black" className="w-5 h-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mr-2 mt-2 dark:bg-zinc-900/95 border-zinc-800 text-white p-2">
            {routes.map((route) => {
              const { pathname } = useLocation();
              const isRouteMatched = pathname.split('?')[0] === route.href.split('?')[0];
              console.log("pathname", pathname);
              
              return <SidebarLink key={route.href} route={route} isRouteMatched={isRouteMatched} />;
            })}

            <ThemeSwitch isDarkTheme={isDarkTheme} setTheme={setTheme} />
            <SignOutButton onSignOut={() => setShowSignOutDialog(true)} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
