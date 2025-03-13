import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkle, Loader2, ClipboardCopy, Check } from 'lucide-react'
import { useWebSocketContext } from "@/services/WebSocketProvider"

const AItoHumanize = () => {
    const [isCopied, setIsCopied] = useState(false)
    const { sendCustomHumanizeCommand, isHumanizeLoading, customHumanizeContent, AItoHumanizeInput, setAItoHumanizeInput } = useWebSocketContext()
    const maxWords = 125

    const wordCount = AItoHumanizeInput.trim() ? AItoHumanizeInput.trim().split(/\s+/).length : 0

    const handleHumanize = () => {
        if (!AItoHumanizeInput.trim()) return
        sendCustomHumanizeCommand({ text: AItoHumanizeInput })
    }

    const handleCopy = async () => {
        if (customHumanizeContent) {
            await navigator.clipboard.writeText(customHumanizeContent)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        }
    }

    return (
        <div className="min-h-[calc(100vh-280px)] flex flex-col md:flex-row">
            {/* Input Section */}
            <div className="flex-1 relative p-4 md:p-6 mb-4 md:mb-0">
                <Textarea
                    value={AItoHumanizeInput}
                    onChange={(e) => setAItoHumanizeInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full h-[calc(50vh-140px)] md:h-full resize-none bg-black text-white p-4 pb-16"
                />
                <div className="absolute bottom-8 left-8 text-sm text-gray-400">
                    {wordCount}/{maxWords} Words
                </div>
                <Button
                    onClick={handleHumanize}
                    disabled={!AItoHumanizeInput.trim() || isHumanizeLoading || wordCount > maxWords}
                    className="absolute md:bottom-16 lg:bottom-8  bottom-8 right-8"
                    size="sm"
                >
                    {isHumanizeLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Humanizing
                        </>
                    ) : (
                        <>
                            <Sparkle className="mr-2 h-4 w-4" />
                            Humanize
                        </>
                    )}
                </Button>
            </div>

            {/* Output Section */}
            <div className="flex-1 p-4 md:p-6 relative">
                <Textarea
                    value={customHumanizeContent || ""}
                    readOnly
                    disabled={!customHumanizeContent}
                    placeholder="Humanized text will appear here..."
                    className="w-full h-[calc(50vh-140px)] md:h-full resize-none bg-black/45 text-white p-4 pb-16 disabled:placeholder-white"
                />

                {customHumanizeContent && (
                    <Button
                        onClick={handleCopy}
                        className="absolute bottom-8 right-8"
                        size="sm"
                        variant="outline"
                    >
                        {isCopied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <ClipboardCopy className="mr-2 h-4 w-4" />
                                Copy
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AItoHumanize