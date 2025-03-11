import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { History, Loader } from 'lucide-react'
import { useWebSocketContext } from "@/services/WebSocketProvider"
import CopyButton from "./CopyButton"
import SpeechController from "./SpeechController"

const HumanizeHistoryDrawer = ({ message }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { getSpecificMessageHumanizeHistory, isSpecificMessageHistoryLoading, specficMessageHumanizeHistory } = useWebSocketContext()

    useEffect(() => {
        if (isOpen && message) {
            getSpecificMessageHumanizeHistory({ message_id: message.id })
        }
    }, [isOpen, message, getSpecificMessageHumanizeHistory])

    const handleOpenChange = (open) => {
        setIsOpen(open)
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 flex items-center"
                >
                    <History className="h-4 w-4 mr-1" />
                    History
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[500px] w-[90vw] p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                    <SheetHeader className="px-4 py-2 border-b">
                        <SheetTitle>Humanize History</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        {isSpecificMessageHistoryLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Textarea
                                        value={message.content}
                                        readOnly
                                        className="w-full h-40 mb-4 bg-black text-white pr-10"
                                        placeholder="Original message"
                                    />

                                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                                        <CopyButton text={message.content} />
                                        <SpeechController text={message.content} />
                                    </div>
                                </div>

                                <p>Humanized Variants</p>


                                {specficMessageHumanizeHistory && specficMessageHumanizeHistory.length > 0 ? (
                                    specficMessageHumanizeHistory.map((item, index) => (
                                        <div key={index} className="relative">
                                            <Textarea
                                                key={index}
                                                value={item.humanized_text}
                                                readOnly
                                                className="w-full h-80 mb-4 dark:bg-white/10 bg-black/45 text-white  pr-10"
                                                placeholder={`Humanized version ${index + 1}`}
                                            />
                                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                                <CopyButton text={item.humanized_text} />
                                                <SpeechController text={item.humanized_text} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                        <History className="h-16 w-16 text-gray-400" />
                                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center">
                                            No message history available
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-xs">
                                            This message hasn't been humanized yet. Try humanizing it to see the history.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default HumanizeHistoryDrawer