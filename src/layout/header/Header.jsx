import { MessageCircle, HelpCircle, Pyramid, PersonStanding, Speech } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useMemo, useCallback, useState } from "react"
import { useLogout } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/useAuthStore"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { useDialogStore } from "@/store/useDialogStore"
import { tabsCSS } from "@/constant"
import { MobileSidebar } from ".."
import { useChatStore } from "@/store/useChatStore"
import { useWebSocketContext } from "@/services/WebSocketProvider"
import { useUserStore } from "@/store/useUserStore"

const tabs = [
  { value: "explore", label: "Explore Vividly", icon: Pyramid },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "ai-to-humanize", label: "AI to Humanize", icon: Speech },
  { value: "how-to-use", label: "How to use", icon: HelpCircle },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const conversationId = searchParams.get("cid")
  const { mutate: logout, isPending } = useLogout()
  const { setConversations } = useChatStore();
  const { clearMessages } = useWebSocketContext()
  const { clearAuth } = useAuthStore();
  const { showSignOutDialog, setShowSignOutDialog } = useDialogStore();
  const { clearUser } = useUserStore()
  const { toast } = useToast();

  const showToast = (title, description, type) => {
    toast({ title, description, type });
  };

  const handleSignOut = () => {
    logout("", {
      onSuccess: () => {
        showToast("Success", "You have been signed out successfully.", "success");
        clearAuth();
        clearUser();
        setShowSignOutDialog(false);
        setConversations([]);
        clearMessages();
        navigate("/log-in");
      },
      onError: (error) => {
        handleApiError(showToast, error);
      },
    });
  }


  const activeTab = useMemo(() => {
    if (!location.pathname.startsWith("/home")) return null
    const cat = new URLSearchParams(location.search).get("cat")
    return tabs.some((tab) => tab.value === cat) ? cat : "explore"
  }, [location.pathname, location.search])

  const handleTabChange = useCallback(
    (value) => {
      if (conversationId && value === "chat") navigate(`/home?cat=${value}&cid=${conversationId}`)
      else {
        navigate(`/home?cat=${value}`)
        clearMessages()
      }

    },
    [navigate, conversationId]
  )

  return (
    <>
      <div className="dark:bg-[#0D0F10] bg-white space-y-6 w-full h-[212px] rounded-2xl my-3 mr-6">
        <div className="flex items-center justify-between pt-6 px-6">
          <div className="space-y-1 mr-2">
            <h1 className="sm:text-xl text-sm font-semibold">Your Personalised AI Assistant</h1>
            <p className="sm:text-sm text-xs dark:text-zinc-400 text-black">Vividly will boost your efficiency</p>
          </div>

          <div>
            {/* Mobile Sidebar */}
            <MobileSidebar handleSignOut={handleSignOut} isPro={false} apiLimitCount={2} />
          </div>
        </div>

        <Separator />

        <div className="sm:px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent overflow-x-auto no-scrollbar max-w-full">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={tabsCSS}
                >
                  <Icon
                    className={`h-4 w-4 mr-2 
                    ${activeTab === value && 'text-[#9181F4]'}`}
                  />
                  <p>{label}</p>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ConfirmationDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        variant="confirmation"
        desc="are you sure you want to sign out?"
        buttonText="Sign out"
        isLoading={isPending}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </>
  )
}
