import { MessageCircle, HelpCircle, Pyramid } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useLocation, useNavigate } from "react-router-dom"
import { useMemo, useCallback } from "react"
import { MobileSidebar } from "."

const tabs = [
  { value: "explore", label: "Explore Vividly", icon: Pyramid },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "how-to-use", label: "How to use", icon: HelpCircle },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = useMemo(() => {
    if (!location.pathname.startsWith("/home")) return null
    const cat = new URLSearchParams(location.search).get("cat")
    return tabs.some((tab) => tab.value === cat) ? cat : "explore"
  }, [location.pathname, location.search])

  const handleTabChange = useCallback(
    (value) => navigate(`/home?cat=${value}`),
    [navigate]
  )

  return (
    <div className="dark:bg-[#0D0F10] bg-white space-y-6 w-full h-[190px]">
      <div className="flex items-center justify-between">
        <div className="space-y-1 pt-6 px-6">
          <h1 className="text-xl font-semibold">Your Personalised AI Assistant</h1>
          <p className="text-sm dark:text-zinc-400 text-black">Vividly will boost your efficiency</p>
        </div>

        <div>
          {/* Mobile Sidebar */}
          <MobileSidebar isPro={false} apiLimitCount={2} />
        </div>
      </div>

      <Separator />

      <div className="px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="h-auto p-0 bg-transparent">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={`
                  py-8 relative h-7 px-4 flex gap-2 text-sm font-medium transition-all
                  dark:hover:text-white hover:text-[#9181F4] dark:text-zinc-400 text-black 
                  data-[state=active]:text-[#9181F4] dark:data-[state=active]:text-white
                  data-[state=active]:after:absolute 
                  data-[state=active]:after:left-0 
                  data-[state=active]:after:bottom-0 
                  data-[state=active]:after:h-[4.31px] 
                  data-[state=active]:after:w-full 
                  data-[state=active]:after:bg-[#9181F4]
                  data-[state=active]:after:rounded-t-[6.31px]
                  data-[state=active]:after:shadow-[0px_6.31px_9.47px_-6.31px_#B6F09C29,0px_15.78px_23.67px_-4.73px_#B6F09C29]
                `}
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
  )
}
