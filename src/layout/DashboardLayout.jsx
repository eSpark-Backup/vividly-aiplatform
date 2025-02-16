import { Outlet, useLocation } from 'react-router-dom'
import { Header, Sidebar } from './index'
import { Chat, Explore, HowToUse } from '@/pages'


const DashboardLayout = () => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const cat = searchParams.get("cat")

    const renderContent = () => {
        if (location.pathname === "/home") {
            switch (cat) {
                case "explore":
                    return <Explore />
                case "chat":
                    return <Chat />
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
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 ">
                <Sidebar isPro={false} apiLimitCount={2} />
            </div>
            <main className="md:pl-72 pb-10">
                <Header />
                {renderContent()}
            </main>
        </div>
    )
}

export default DashboardLayout