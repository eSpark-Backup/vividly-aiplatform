import { Link } from "react-router-dom";
import { ChatHistory, FreeCounter, useTheme } from "../components";
import { vividlyLogoDark, vividlyLogoLight } from "@/assets";
import { themes } from "@/constant";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = ({ apiLimitCount = 0, isPro = false }) => {

  const { theme } = useTheme();
  const isDarkTheme = theme === themes[0];

  const { user } = useAuthStore();
  
  const { first_name, last_name, email } = user;

  return (
    <>
      <div className="space-y-4 py-2 flex flex-col h-full dark:bg-[#0D0F10] bg-white md:rounded-2xl md:m-3">
        <div className="px-3 py-1 flex-1">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center mb-1">
              <div className="relative h-24 w-24">
                <img alt="Logo" src={isDarkTheme ? vividlyLogoDark : vividlyLogoLight} />
              </div>
            </Link>

            <div className="text-right">
              <p className="uppercase text-md">{first_name} {last_name}</p>
              <p className="text-xs text-[#B6F09C]">{email}</p>
              <p className="text-xs text-[#B6F09C]">Premium</p>
            </div>
          </div>

          <ChatHistory />
        </div>

        <div className="px-3 space-y-2 flex flex-col">
          <FreeCounter isPro={isPro} apiLimitCount={apiLimitCount} />
        </div>
      </div>



    </>
  );
};

export default Sidebar;
