import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components'
import { themes } from '@/constant'

export const FeatureCard = ({ icon: Icon, title, items, color, shadow, onClick }) => {
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
                        onClick={() => onClick(item)}
                        key={index}
                        className="group dark:gradient-glass-effect bg-black w-[220px] flex items-center justify-between rounded-lg text-wrap p-3 text-sm transition-all"
                    >
                        <span className="px-2 text-left text-gray-300 group-hover:text-white">
                            {item}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-white" />
                    </div>
                ))}

            </div>
        </div>
    )
}