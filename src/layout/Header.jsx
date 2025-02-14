import { Sparkles, MessageCircle, HelpCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const tabs = [
  { value: "explore", label: "Explore Vividly", icon: Sparkles },
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "help", label: "How to use", icon: HelpCircle },
];

export default function Header() {
  const tabClass =
  "py-9 data-[state=active]:bg-transparent data-[state=active]:shadow-none relative h-9 px-4 flex gap-2 text-sm font-medium transition-all dark:hover:text-white text-zinc-400 data-[state=active]:text-white data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[3px] data-[state=active]:after:rounded-2xl data-[state=active]:after:w-full data-[state=active]:after:bg-[#9181F4] data-[state=active]:rounded-t-lg";

  return (
    <div className="dark:bg-[#0D0F10] bg-white space-y-6">
      <div className="space-y-1 pt-6 px-6">
        <h1 className="text-xl font-semibold">Your Personalised AI Assistant</h1>
        <p className="text-sm dark:text-zinc-400 text-black">Vividly will boost your efficiency</p>
      </div>


      <div className="px-6">
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="h-auto p-0 bg-transparent">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className={tabClass}>
                <Icon className="h-4 w-4" />
                <p>{label}</p>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="explore">
            <p>Make changes to your account here.</p>
          </TabsContent>
          <TabsContent value="chat">
            <p>Change your password here.</p>
          </TabsContent>
          <TabsContent value="help">
            <p>Get help and guidance here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
