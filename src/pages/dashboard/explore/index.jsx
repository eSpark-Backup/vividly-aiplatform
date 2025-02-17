import React from 'react'
import { Pen, Code, Lightbulb, ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components'
import { themes } from '@/constant'

const FeatureCard = ({ icon: Icon, title, items, color, shadow }) => {
    const { theme } = useTheme()
    const isDarkTheme = theme === themes[0];

    return (
        <div className="space-y-4 w-full max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center">

                <div className={cn(`dark:gradient-glass-effect bg-black p-4 rounded-full text-white  transition-all duration-300 cursor-pointer`, isDarkTheme && shadow)}>
                    <Icon className={cn("w-6 h-6 text-white/90", color)} />
                </div>

                <h3 className="text-lg font-medium dark:text-white text-black mt-3">{title}</h3>
            </div>
            <div className="space-y-2 flex flex-col items-center">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="dark:gradient-glass-effect bg-black  w-[220px] flex items-center justify-between rounded-lg text-wrap  p-3 text-sm   transition-all"
                    >
                        <span className='px-2 text-left text-gray-300 hover:text-white'>{item}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                ))}
            </div>
        </div>
    )
}

const Explore = () => {
    const features = [
        {
            icon: MessageCircle,
            color: "text-[#B6F09C]",
            shadow: "shadow-[0_0_50px_-5px_rgba(182,240,156,0.4)]",
            title: "Help me write?",
            items: [
                "Write a cover letter",
                "Write a blog post",
                "Social media",
                "Write a screen play"
            ]
        },
        {
            icon: Code,
            color: "text-[#82DBF7]",
            shadow: "shadow-[0_0_50px_-5px_rgba(130,219,247,0.4)]",
            title: "Summarize text",
            items: [
                "Summarize your text",
                "Summarize notes",
                "Summarize a research paper",
                "Summarize chapter 1"
            ]
        },
        {
            icon: Pen,
            color: "text-[#BD9AF8]",
            shadow: "shadow-[0_0_50px_-5px_rgba(189,154,248,0.4)]",
            title: "Content Creation",
            items: [
                "Product description",
                "E-mail copy",
                "Whitepaper",
                "Press release"
            ]
        },
        {
            icon: Lightbulb,
            color: "text-[#FFD147]",
            shadow: "shadow-[0_0_50px_-5px_rgba(255,209,71,0.4)]",
            title: "Idea Generation",
            items: [
                "Hashtag ideas",
                "Brainstorming",
                "Trend analysis",
                "Social media posts"
            ]
        }
    ]

    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center">
            <div className="w-full px-4 sm:px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-2 mb-12">
                        <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white text-black">What Vividly Can Do?</h2>
                        <p className="dark:text-zinc-400 text-black max-w-2xl mx-auto">
                            Kickstart your innovation process with our comprehensive selection of predefined prompts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Explore