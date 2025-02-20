import { Link } from "react-router-dom";
import { useTheme } from "../../components";
import { vividlyLogoDark, vividlyLogoLight } from "@/assets";
import { themes } from "@/constant";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatHistory, FreeCounter } from "..";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Sidebar = ({ apiLimitCount = 0, isPro = false }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const isDarkTheme = theme === themes[0];
  const [conversationSearch, setConversationSearch] = useState("");
  
  
  const { first_name, last_name, email } = user;

  return (
    <div className="flex flex-col h-full dark:bg-[#0D0F10] bg-white md:rounded-2xl md:m-3">
      {/* Header */}
      <div className="px-3 sm:py-1 py-4">
        <div className="flex items-center justify-between">
          <Link to="/home" className="flex items-center">
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

        {/* Search Input */}
        <Input
          variant="basic"
          icon={Search}
          iconClassName="h-[17px] w-[17px] dark:text-[#686B6E]"
          placeholder="Search"
          className="w-full placeholder-white h-10"
          value={conversationSearch}
          onChange={(e) => setConversationSearch(e.target.value)}
        />

        <br/>
      </div>

      {/* Chat History should take up full space */}
      <div className="flex-1 overflow-y-auto">
        <ChatHistory conversationSearch={conversationSearch} />
      </div>

      {/* Footer (API Limit Counter) */}
      <div className="px-3 py-5">
        <FreeCounter isPro={isPro} apiLimitCount={apiLimitCount} />
      </div>
    </div>
  );
};


export default Sidebar;
