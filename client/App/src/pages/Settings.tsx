import { useEffect, useRef, useState } from "react"
import { Organisation } from "../Interface"
import { useNavigate, useParams } from "react-router-dom"
import axios from "../api/Axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faWarning } from "@fortawesome/free-solid-svg-icons"

const Settings = () => {
    const setOrgan = useState<Organisation | null>()[1]
    const { organName } = useParams()
    const navigate = useNavigate()

    const daysPerWeekField = useRef<HTMLInputElement>(null)
    const hoursPerDayField = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (organName == null) {
            navigate(`${axios.defaults.baseURL}/organNotFound`)
            return
        }
        fetchOrgan(organName)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    async function fetchOrgan(name: string) {
        const organ = (await axios.get(`/api/getOrgan/${name}`)).data
        setOrgan(organ)
        if (daysPerWeekField.current != null)
            daysPerWeekField.current.value = organ.general.daysPerWeek + ``
        if (hoursPerDayField.current != null)
            hoursPerDayField.current.value = organ.general.hoursPerDay + ``
    }
    const saveGeneralSettings = async () => {
        if (confirm("Are you sure want to change settings. This erase timetable schedules")) {
            if (hoursPerDayField.current == null || daysPerWeekField.current == null) return
            const daysPerWeek = daysPerWeekField.current.value
            const hoursPerDay = hoursPerDayField.current.value
            if (daysPerWeek == null || hoursPerDay == "" || hoursPerDay == "0" || daysPerWeek == "" || daysPerWeek == null || daysPerWeek == "0") return alert({ error: "parameter missing" })
            const res = (await axios.put(`/api/${organName}/changeGeneralSettings`, {
                daysPerWeek,
                hoursPerDay
            })).data
            console.log(res);
            if (res.error || res.message) alert(res.error || res.message)
            if (organName != null)
                fetchOrgan(organName)
        }
    }
    return (
        <div style={{ display: "block", width: "70%", margin: "auto", marginTop: "50px", padding: "10px" }}>
            <h5><FontAwesomeIcon icon={faWarning} color="orange" /> Changing any of these settings clear all timetable </h5>
            <label style={{ width: "100%" }}>
                <h6>Days per Week :</h6>
            </label>
            <input type="number" id="daysPerWeekField" className="input-group-text" style={{ width: "100%" }} ref={daysPerWeekField} />
            <label style={{ width: "100%" }}>
                <h6>Hours per Day :</h6>
            </label>
            <input type="number" id="hoursPerDay" className="input-group-text" style={{ width: "100%" }} ref={hoursPerDayField} />
            <button className="btn btn-success mt-4" onClick={() => { saveGeneralSettings() }}>Save</button>
        </div>
    )
}

export default Settings