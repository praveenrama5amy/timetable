import axios from "../api/Axios"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

const Summary = () => {
    const { organName } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (organName == null) {
            navigate(`${axios.defaults.baseURL}/organNotFound`)
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div style={{ height: "100%" }}>
            <embed src={`${axios.defaults.baseURL}/organisation/${organName}/summary`} style={{ height: "100%", width: "100%" }}></embed>
        </div>
    )
}

export default Summary