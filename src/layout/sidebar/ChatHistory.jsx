import { categorizeHistory } from "@/lib/utils";
import ChatHistoryItem from "./ChatHistoryItem";
import { useChatStore } from "@/store/useChatStore";
import { useWebSocketContext } from "@/services/WebSocketProvider";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useMemo, useState } from "react";
import { Loader } from "lucide-react";

const ChatHistory = ({ conversationSearch }) => {
    const { conversations } = useChatStore();
    const { today, yesterday, last7Days } = useMemo(() => categorizeHistory(conversations), [conversations])
    const { renameConversation, deleteConversation, isConversationLoading } = useWebSocketContext();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    const renameItem = (conversationId, title) => {
        renameConversation({ conversationId, title });
    };

    const handleDeleteClick = (conversationId) => {
        setConversationToDelete(conversationId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (conversationToDelete) {
            deleteConversation({ conversationId: conversationToDelete });
            setShowDeleteDialog(false);
            setConversationToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
        setConversationToDelete(null);
    };

    // Filter conversations based on the search input
    const filteredConversations = useMemo(() => {
        const search = conversationSearch.toLowerCase();

        const filterData = (data) =>
            data.filter((item) =>
                item.title.toLowerCase().includes(search)
            );

        return {
            today: filterData(today),
            yesterday: filterData(yesterday),
            last7Days: filterData(last7Days),
        };
    }, [today, yesterday, last7Days, conversationSearch]);

    return (
        <>
            <div className="h-full flex flex-col overflow-y-auto space-y-3 mx-3 pr-4">
                {
                    isConversationLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="h-6 w-6 animate-spin" />
                        </div>
                    ) :

                        [{ label: "Today", data: filteredConversations.today }, { label: "Yesterday", data: filteredConversations.yesterday }, { label: "Last 7 Days", data: filteredConversations.last7Days }].map(
                            ({ label, data }) =>
                                data.length > 0 && (
                                    <div key={label} className="space-y-3">
                                        <h3 className="text-sm font-semibold text-center dark:text-[#686B6E]">{label}</h3>
                                        <div className="space-y-3">
                                            {data.map((item) => (
                                                <ChatHistoryItem
                                                    key={item.id}
                                                    item={item}
                                                    onRename={renameItem}
                                                    onDelete={handleDeleteClick}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                        )

                }

            </div>

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                variant="confirmation"
                desc="Are you sure you want to delete this chat?"
                buttonText="Confirm"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

export default ChatHistory;