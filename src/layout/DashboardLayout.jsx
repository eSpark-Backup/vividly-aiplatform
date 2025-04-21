import { Outlet, useLocation } from 'react-router-dom'
import { Header, Sidebar } from './index'
import { AItoHumanize, Chat, Explore, HowToUse } from '@/pages'
import { useGetUserProfile } from '@/hooks/useUser'
import { useUserStore } from '@/store/useUserStore'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useGetUserSubscriptionInfo } from '@/hooks/useSubsciption'
import { useUserSubscriptionStore } from '@/store/useUserSubscriptionStore'


const DashboardLayout = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const cat = searchParams.get("cat")

    const { data: User, isSuccess, isError } = useGetUserProfile()
    const { data: UserSubscription, isSuccess: isSubscriptionSuccess, isError: isSubscriptionError, isLoading } = useGetUserSubscriptionInfo()
    const { setUser } = useUserStore()
    const { setUserSubscription, clearUserSubscription } = useUserSubscriptionStore()
    const { toast } = useToast();

    const showToast = (title, description, type) => {
        toast({ title, description, type });
    };

    useEffect(() => {
        if (isSuccess) {
            setUser(User?.profile)
        }
        if (isError) {
            showToast("Error", "Error While Fetching User", "error")
        }
    }, [isSuccess, isError, User])

    useEffect(() => {
        if (isSubscriptionSuccess) {
            if (UserSubscription?.subscriptionDetails)
                setUserSubscription(UserSubscription?.subscriptionDetails)
            else {
                clearUserSubscription()
            }
        }
        if (isSubscriptionError) {
            showToast("Error", "Error While Fetching User Subscription", "error")
        }
    }, [isSubscriptionSuccess, isSubscriptionError, UserSubscription])

    const renderContent = () => {
        if (location.pathname === "/home") {
            switch (cat) {
                case "explore":
                    return <Explore />
                case "chat":
                    return <Chat />
                case "ai-to-humanize":
                    return <AItoHumanize />
                case "how-to-use":
                    return <HowToUse />
                default:
                    return <Outlet />
            }
        }
        return <Outlet />
    }




    return (
        <div className="max-h-screen relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Header />
                {renderContent()}
            </main>
        </div>
    )
}

export default DashboardLayout