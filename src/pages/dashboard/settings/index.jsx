import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, ShieldCheck, ChevronRight } from "lucide-react"
import { cn } from '@/lib/utils'
import { Profile, StudentVerification } from '@/pages'

const Settings = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const searchParams = new URLSearchParams(location.search)
    const cat = searchParams.get("cat") || "profile"

    const [activeTab, setActiveTab] = useState(cat)

    const handleTabChange = (value) => {
        setActiveTab(value)
        navigate(`/settings?cat=${value}`, { replace: true })
    }

    useEffect(() => {
        setActiveTab(cat)
    }, [cat])

    const tabs = [
        {
            id: "profile",
            label: "Profile",
            icon: User,
            description: "Manage your personal information and account settings",
        },
        {
            id: "studentverification",
            label: "Student Verification",
            icon: ShieldCheck,
            description: "Verify your student status to access special features",
        },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <Profile />
            case "studentverification":
                return <StudentVerification />
            default:
                return <Profile />
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                        <nav className="flex flex-col">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                            "hover:bg-muted/50 relative",
                                            isActive ? "bg-muted/50 text-primary font-medium" : "text-foreground",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-md",
                                                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{tab.label}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tab.description}</div>
                                        </div>
                                        <ChevronRight
                                            className={cn(
                                                "h-4 w-4 text-muted-foreground transition-transform",
                                                isActive && "text-primary rotate-90",
                                            )}
                                        />
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 bg-card rounded-lg border shadow-sm p-6">
                    <div className="mt-6">{renderContent()}</div>
                </div>
            </div>
        </div>
    )
}

export default Settings
