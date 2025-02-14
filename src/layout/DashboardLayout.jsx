import { Outlet } from 'react-router-dom'
import { Header, Sidebar } from './index'


const DashboardLayout = () => {
    return (
        <div className="max-h-screen relative dark:bg-[#131619] bg-[#E8E9E9]">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 ">
                <Sidebar isPro={false} apiLimitCount={2} />
            </div>
            <main className="md:pl-72 pb-10">
                <Header />
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout