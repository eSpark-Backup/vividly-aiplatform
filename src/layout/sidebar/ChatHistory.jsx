import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatHistoryDummyData } from "@/constant";
import { categorizeHistory } from "@/lib/utils";
import ChatHistoryItem from "./ChatHistoryItem";


const ChatHistory = () => {

    const [chatHistory, setChatHistory] = useState(chatHistoryDummyData)
    const { today, yesterday, last7Days } = categorizeHistory(chatHistory);

    const renameItem = (id, newTitle) => {
        setChatHistory(chatHistory.map(item => (item.id === id ? { ...item, lastMessage: newTitle } : item)));
    };

    const deleteItem = (id) => {
        setChatHistory(chatHistory.filter(item => item.id !== id));
    };


    return (
        <div>

            {/* Search */}
            <Input
                variant="basic"
                icon={Search}
                iconClassName="h-[17px] w-[17px] dark:text-[#686B6E]"
                placeholder="Search"
                className="w-full placeholder-white h-10"
            />

            <br />

            {/* Chat History */}
            <div className="space-y-3">
                {[{ label: "Today", data: today }, { label: "Yesterday", data: yesterday }, { label: "Last 7 Days", data: last7Days }].map(({ label, data }) => (
                    data.length > 0 && (
                        <div key={label} className="space-y-3">
                            <h3 className="text-sm font-semibold text-center dark:text-[#686B6E]">{label}</h3>
                            <div className="space-y-3">
                                {data.map(item => (
                                    <ChatHistoryItem key={item.id} item={item} onRename={renameItem} onDelete={deleteItem} />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default ChatHistory;