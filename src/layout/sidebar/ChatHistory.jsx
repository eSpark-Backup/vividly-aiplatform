import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatHistoryDummyData } from "@/constant";
import { categorizeHistory } from "@/lib/utils";
import ChatHistoryItem from "./ChatHistoryItem";
import { useChatStore } from "@/store/useChatStore";


const ChatHistory = () => {
    const { conversations } = useChatStore();
    const { today, yesterday, last7Days } = categorizeHistory(conversations);
    const [chatHistory, setChatHistory] = useState(conversations);

    const renameItem = (id, newTitle) => {
        setChatHistory(chatHistory.map(item => (item.id === id ? { ...item, lastMessage: newTitle } : item)));
    };

    const deleteItem = (id) => {
        setChatHistory(chatHistory.filter(item => item.id !== id));
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto space-y-3 mx-3 pr-4">
            {[{ label: "Today", data: today }, { label: "Yesterday", data: yesterday }, { label: "Last 7 Days", data: last7Days }].map(
                ({ label, data }) =>
                    data.length > 0 && (
                        <div key={label} className="space-y-3">
                            <h3 className="text-sm font-semibold text-center dark:text-[#686B6E]">{label}</h3>
                            <div className="space-y-3">
                                {data.map((item) => (
                                    <ChatHistoryItem key={item.id} item={item} onRename={renameItem} onDelete={deleteItem} />
                                ))}
                            </div>
                        </div>
                    )
            )}
        </div>
    );
};


export default ChatHistory;