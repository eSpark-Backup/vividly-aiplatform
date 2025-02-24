import React, { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    useLayoutEffect(() => {
        navigate("/home?cat=explore")
    }, [])

    return (
        <div className="flex items-center justify-center ">
            <span className="ml-3 text-2xl font-semibold">HOME PAGE UNDER DEVELOPMENT</span>
        </div>
    )
}

export default Home