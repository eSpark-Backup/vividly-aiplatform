import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Landing = () => {

    const navigate = useNavigate()

    useEffect(() => {
        navigate('/log-in')
    }, [])

    return (
        <div className="flex items-center justify-center ">
            <span className="ml-3 text-2xl font-semibold">LANDING PAGE UNDER DEVELOPMENT</span>
        </div>
    )
}

export default Landing