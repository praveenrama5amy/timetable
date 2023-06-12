import axios from "../api/Axios"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Organisation } from "../Interface"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-regular-svg-icons"

const Subjects = () => {
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
        const organ = (await axios.get(`/api/getOrgan/${name}`)).data
        setOrgan(organ)
    }
    async function saveChangesSubject() {
        const minimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMinimumHours")
        const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMaximumHours")
        const nameField: HTMLInputElement | null = document.querySelector("#subjectName")
        const checkBoxesField: NodeListOf<HTMLInputElement> = document.querySelectorAll(`.classCheckBoxes`)
        const classes: Array<string> = []
        checkBoxesField.forEach(room => {
            if (room.checked) classes.push(room.id)
        })
        if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
        if (maxmimumHoursField?.value == null || maxmimumHoursField?.value.trim() == "") return
        if (minimumHoursField?.value == null || minimumHoursField?.value.trim() == "") return
        if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
        const res = (await axios.post(`/api/organisation/${organName}/addsubject`, {
            name: nameField.value,
            minimumHours: minimumHoursField.value,
            maximumHours: maxmimumHoursField.value,
            classes
        })).data
        alert(res.message || res.success || res.error)
        if (organName != null)
            fetchOrgan(organName)
    }
    return (
        <div style={{ height: "100%", overflow: "scroll" }}>
            <div>
                <h1 className="text-center">Subjects</h1>
                <div className="subjects" style={{ width: "70%", margin: "auto", marginTop: "50px" }}>
                    <button type="button" className="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#subjectModal" onClick={() => {
                        const minimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMinimumHours")
                        const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMaximumHours")
                        const nameField: HTMLInputElement | null = document.querySelector("#subjectName")
                        const checkBoxesField: NodeListOf<HTMLInputElement> = document.querySelectorAll(`.classCheckBoxes`)
                        checkBoxesField.forEach(room => {
                            room.checked = false
                            room.disabled = false
                        })
                        if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
                        minimumHoursField.value = ""
                        maxmimumHoursField.value = ""
                        nameField.value = ""
                        nameField.disabled = false
                        minimumHoursField.disabled = false
                        maxmimumHoursField.disabled = false
                    }}>Add</button>
                    <ul className="list-group list-group-flush">
                        {organ?.subjects.map((sub, index) =>
                            <li key={index} className="list-group-item" style={{ display: "flex", alignItems: "center" }}>
                                <p className="no-margin" style={{ flex: 1 }}>{sub.name}</p>
                                <button type="button" data-bs-toggle="modal" data-bs-target="#subjectModal" className="btn btn-primary" onClick={() => {
                                    const minimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMinimumHours")
                                    const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#subjectMaximumHours")
                                    const nameField: HTMLInputElement | null = document.querySelector("#subjectName")
                                    const checkBoxesField: NodeListOf<HTMLInputElement> = document.querySelectorAll(`.classCheckBoxes`)
                                    checkBoxesField.forEach(room => {
                                        if (sub.classes.includes(room.id)) {
                                            room.checked = true
                                        } else {
                                            room.checked = false
                                        }
                                        room.disabled = true
                                    })
                                    if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
                                    minimumHoursField.value = sub.minimumHours + ""
                                    maxmimumHoursField.value = sub.maximumHours + ""
                                    nameField.value = sub.name
                                    nameField.disabled = true
                                    minimumHoursField.disabled = true
                                    maxmimumHoursField.disabled = true
                                }}><FontAwesomeIcon icon={faEye} /></button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="modal fade" id="subjectModal" tabIndex={-1} aria-labelledby="subjectModalLabel" aria-hidden="true" style={{ color: "black" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="subjectModalLabel">Subject</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ gap: "10px", display: 'flex', flexDirection: "column" }}>
                            <input type="email" className="form-control" id="subjectName" placeholder="Name" />
                            <input type="email" className="form-control" id="subjectMinimumHours" placeholder="Minimum Hour" />
                            <input type="email" className="form-control" id="subjectMaximumHours" placeholder="Maximum Hour" />
                            {organ?.classes.map((room, index) =>
                                <div key={index}>
                                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>
                                        <input type="checkbox" style={{ height: "23px", width: "23px", cursor: "pointer" }} className="classCheckBoxes" id={room.name} />
                                        {room.name}
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" id="tutorModelBtn" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { saveChangesSubject() }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Subjects