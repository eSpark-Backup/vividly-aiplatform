import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Home = () => {

    const navigate = useNavigate()

    useEffect(() => {
        navigate('/log-in')
    }, [])

    return (
        <div className="h-screen flex items-center justify-center ">
            <span className="ml-3 text-2xl font-semibold">HOME UNDER DEVELOPMENT</span>
        </div>
    )
}

export default Home