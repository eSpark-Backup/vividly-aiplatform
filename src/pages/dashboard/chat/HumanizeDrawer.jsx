import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Sparkle, Square } from "lucide-react"
import { useWebSocketContext } from "@/services/WebSocketProvider"

const HumanizeDrawer = ({ message }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { sendHumanizeCommand, sendReHumanizeCommand, isHumanizeLoading, humanizedContent } = useWebSocketContext()

    useEffect(() => {
        if (isOpen && message) {
            sendHumanizeCommand({ message_id: message.id })
        }
    }, [isOpen, message, sendHumanizeCommand])

    const handleOpenChange = (open) => {
        setIsOpen(open)
    }

    const handleReHumanize = () => {
        sendReHumanizeCommand({ message_id: message.id })
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost flex"
                    size="sm"
                    className="mt-2"
                >
                    <Sparkle className="h-4 w-4 mr-1" />
                    Humanize
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[500px] w-[90vw] px-3 sm:py-4 py-4">
                <SheetHeader>
                    <SheetTitle>Message</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                    <Textarea
                        value={message.content}
                        readOnly
                        className="w-full h-60 mb-4 bg-black text-white"
                    />
                    <div className="font-bold mb-2">Humanized Message:</div>
                    {isHumanizeLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Square className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Textarea
                            value={humanizedContent}
                            readOnly
                            className="w-full h-60 mb-4 dark:bg-white/10 bg-black/45 text-white"
                        />
                    )}
                    <Button onClick={handleReHumanize} disabled={isHumanizeLoading}>
                        {isHumanizeLoading ? "Humanizing..." : "Re-humanize"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default HumanizeDrawer