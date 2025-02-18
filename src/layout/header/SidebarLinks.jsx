import { Link} from "react-router-dom";
import { cn } from "@/lib/utils";
import { memo} from "react";

export const SidebarLink = memo(({ route, isRouteMatched }) => (
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
  