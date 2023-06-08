import { useEffect, useState } from "react"
import { Organisation } from "../Interface"
import { useNavigate, useParams } from "react-router-dom"
import axios from "../api/Axios"
const Classes = () => {
    const [organ, setOrgan] = useState<Organisation | null>()
    const { organName } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (organName == null) {
            navigate(`${axios.defaults.baseURL}/organNotFound`)
            return
        }
        fetchOrgan(organName)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    async function fetchOrgan(name: string) {
        const organ = (await axios.get(`/api/getOrgan/${organName}`)).data
        setOrgan(organ)
    }
    return (
        <div style={{ height: "100%" }}>


        </div>
    )
}

export default Classes