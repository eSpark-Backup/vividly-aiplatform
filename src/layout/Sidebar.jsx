import { CreditCard, House, LogOut, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { FreeCounter, UserProfile, useTheme } from "../components";
import { vividlyLogoDark, vividlyLogoLight } from "@/assets";
import { themes } from "@/constant";
import ThemeToggle from "../components/ThemeToggle";

const routes = [
  { label: "Home", icon: House, href: "/home" },
  { label: "Billing", icon: WalletCards, href: "/billing" },
  { label: "Pricing Plan", icon: CreditCard, href: "/pricing-plan" },
];

const SidebarLink = ({ route }) => {
  const { pathname } = useLocation();
  const isRouteMatched = pathname === route.href
  return (
    <Link
      to={route.href}
      className={cn(
        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
        "dark:hover:text-white dark:hover:bg-white/5 hover:bg-gray-200",
        isRouteMatched
          ? "dark:text-white dark:bg-white/5 bg-black hover:bg-black"
          : "text-zinc-400"
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

  );
};

const Sidebar = ({ apiLimitCount = 0, isPro = false }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === themes[0];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full dark:bg-[#0D0F10] bg-white ">
      <div className="px-3 py-1 flex-1">
        <Link to="/home" className="flex items-center mb-1">
          <div className="relative h-24 w-24">
            <img alt="Logo" src={isDarkTheme ? vividlyLogoDark : vividlyLogoLight} />
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <SidebarLink key={route.href} route={route} />
          ))}
          <div
            className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer dark:hover:text-white dark:hover:bg-white/5 hover:bg-gray-200 rounded-lg transition"
            onClick={() => { }}
          >
            <div className="flex items-center flex-1">
              <LogOut className="h-5 w-5 mr-3 dark:text-[#686B6E] text-black" />
              Sign out
            </div>

          </div>
        </div>
      </div>


      <div className="px-3 space-y-2 flex flex-col">
        <FreeCounter isPro={isPro} apiLimitCount={apiLimitCount} />
        <div className="flex flex-col justify-center space-y-2">
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
