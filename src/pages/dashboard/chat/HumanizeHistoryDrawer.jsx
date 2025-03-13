import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { History, Loader } from 'lucide-react'
import { useWebSocketContext } from "@/services/WebSocketProvider"
import MarkdownDisplay from "./MarkdownDisplay"

const HumanizeHistoryDrawer = ({ message }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { sendHumanizeCommand, sendReHumanizeCommand, isHumanizeLoading, humanizedContent, getSpecificMessageHumanizeHistory, isSpecificMessageHistoryLoading, specficMessageHumanizeHistory } = useWebSocketContext()

    useEffect(() => {
        if (isOpen && message) {
            getSpecificMessageHumanizeHistory({ message_id: message.id })
        }
    }, [isOpen, message, getSpecificMessageHumanizeHistory, humanizedContent])

    const handleOpenChange = (open) => {
        setIsOpen(open)
    }

    const handleReHumanize = () => {
        sendReHumanizeCommand({ message_id: message.id })
    }

    const handleHumanize = () => {
        sendHumanizeCommand({ message_id: message.id })
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 flex items-center"
                >
                    <div className="flex items-start mr-1">
                        <History className="h-4 w-4" />
                    </div>
                    History
                    <span className="ml-1 text-xs text-muted-foreground">({message.humanized_count})</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[500px] w-[90vw] p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                    <SheetHeader className="px-4 py-2 border-b">
                        <SheetTitle>Humanize History</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 border-b shrink-0">
                        <div className="relative">
                            <MarkdownDisplay content={message.content} />
                        </div>

                        {
                            specficMessageHumanizeHistory &&
                            (specficMessageHumanizeHistory.length === 0 ? (
                                <Button onClick={handleHumanize} disabled={isHumanizeLoading}>
                                    {isHumanizeLoading ? "Humanizing..." : "Humanize"}
                                </Button>
                            ) : (
                                <Button onClick={handleReHumanize} disabled={isHumanizeLoading}>
                                    {isHumanizeLoading ? "Humanizing..." : "Re-humanize"}
                                </Button>
                            ))
                        }

                    </div>

                    <div className="flex flex-col flex-grow overflow-hidden">
                        <div className="px-4 py-2 border-b shrink-0">
                            <p className="font-medium">Humanized Variants</p>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-grow overflow-y-auto p-4">
                            {isSpecificMessageHistoryLoading || isHumanizeLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {specficMessageHumanizeHistory && specficMessageHumanizeHistory.length > 0 ? (
                                        <div className="space-y-4">
                                            {specficMessageHumanizeHistory.map((item, index) => (
                                                <div key={index} className="relative">
                                                    <MarkdownDisplay key={index} content={item.humanized_text} index={index} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-4 py-8 h-full">
                                            <History className="h-16 w-16 text-gray-400" />
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center">
                                                No message history available
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-xs">
                                                This message hasn't been humanized yet. Try humanizing it to see the history.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default HumanizeHistoryDrawer