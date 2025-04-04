import { useStudentStore } from '@/store/useStudentStore'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()
    const { isStudent, setIsStudent } = useStudentStore()

    useLayoutEffect(() => {
        if (isStudent) {
            setIsStudent(false)
            if (location.pathname !== "/settings?cat=studentverification") {
                navigate("/settings?cat=studentverification")
            }
        }
        else {
            navigate("/home?cat=explore")
        }
    }, [])

}

export default Home