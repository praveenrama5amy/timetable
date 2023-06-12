import { useEffect, useState } from "react"
import axios from "../api/Axios"
import { useNavigate, useParams } from "react-router-dom"
import { Organisation } from "../Interface"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil } from "@fortawesome/free-solid-svg-icons"
import { faTrashCan } from "@fortawesome/free-regular-svg-icons"

const Tutors = () => {
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
    async function deleteTutor(name: string) {
        (await axios.delete(`/api/organisation/${organName}/deleteTutor/${name}`)).data
        if (organName != null)
            fetchOrgan(organName)
    }
    async function saveChangesTutor() {
        const minimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMinHour")
        const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMaxHour")
        const nameField: HTMLInputElement | null = document.querySelector("#tutorName")
        if (nameField?.value == null || nameField?.value.trim() == "") return
        if (maxmimumHoursField?.value == null || maxmimumHoursField?.value.trim() == "") return
        if (minimumHoursField?.value == null || minimumHoursField?.value.trim() == "") return
        if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
        const res = (await axios.post(`/api/organisation/${organName}/addtutor`, {
            name: nameField.value,
            minimumHours: minimumHoursField.value,
            maximumHours: maxmimumHoursField.value
        })).data
        alert(res.success || res.error)
        if (organName != null)
            fetchOrgan(organName)
    }
    return (
        <div style={{ height: "100%" }}>
            <h1 className="text-center">Tutors</h1>
            <div className="tutors" style={{ width: "70%", margin: "auto", marginTop: "50px" }}>
                <button type="button" className="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#tutorModal" onClick={() => {
                    const minimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMinHour")
                    const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMaxHour")
                    const nameField: HTMLInputElement | null = document.querySelector("#tutorName")
                    if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
                    minimumHoursField.value = ""
                    maxmimumHoursField.value = ""
                    nameField.value = ""
                    nameField.disabled = false
                }}>Add</button>
                {organ?.tutors.map((tutor, index) =>
                    <div className="tutor" key={index} style={{ borderBottom: "solid 2px black", display: "flex" }}>
                        <div style={{ flex: 1, padding: "30px 10px" }}>
                            <p className="no-margin bold">{tutor.name}</p>
                            <p className="no-margin">Subjects : {(tutor.subjects.join(", ").length != 0) ? tutor.subjects.join(", ") : "No Subject Assinged"}</p>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>
                                <p className="no-margin bold">{tutor.minimumHours}</p>
                                <div className="progress" style={{ width: "100%", height: "20px", backgroundColor: "rgb(233, 233, 233)", position: "relative" }}>
                                    <div className="under" style={{ height: "100%", width: 100 / 3 + "%", borderRight: "solid 2px black" }}>
                                        <div style={(tutor.allotedHours < tutor.minimumHours) ?
                                            {
                                                backgroundColor: "blue",
                                                height: "100%",
                                                width: tutor.allotedHours / tutor.minimumHours * 100 + "%",
                                            }
                                            :
                                            {
                                                backgroundColor: "blue",
                                                height: "100%",
                                            }
                                        }>
                                            <div style={{
                                                height: "100%",
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "white"
                                            }}>
                                                {(tutor.allotedHours < tutor.minimumHours) && tutor.allotedHours}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="normal" style={{ height: "100%", width: 100 / 3 + "%", borderRight: "solid 2px black" }}>
                                        <div style={(tutor.minimumHours <= tutor.allotedHours) ?
                                            {
                                                backgroundColor: "green",
                                                height: "100%",
                                                width: tutor.allotedHours / tutor.maximumHours * 100 + "%"
                                            }
                                            :
                                            {}
                                        }>
                                            <div style={{
                                                height: "100%",
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "white"
                                            }}>
                                                {(tutor.minimumHours <= tutor.allotedHours && tutor.maximumHours >= tutor.allotedHours) && tutor.allotedHours}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="over" style={{ height: "100%", width: 100 / 3 + "%", borderRight: "solid 2px black" }}>
                                        <div style={(tutor.maximumHours < tutor.allotedHours) ?
                                            {
                                                backgroundColor: "red",
                                                height: "100%",
                                                width: tutor.allotedHours / (tutor.maximumHours + tutor.allotedHours) * 100 + "%"
                                            }
                                            :
                                            {}
                                        }>
                                            <div style={{
                                                height: "100%",
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "white"
                                            }}>
                                                {(tutor.maximumHours < tutor.allotedHours) && tutor.allotedHours}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <p className="no-margin bold">{tutor.maximumHours}</p>
                            </div>
                        </div>
                        <div className="btn-group-vertical" role="group" aria-label="Vertical button group">
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#tutorModal" onClick={() => {
                                const minimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMinHour")
                                const maxmimumHoursField: HTMLInputElement | null = document.querySelector("#tutorMaxHour")
                                const nameField: HTMLInputElement | null = document.querySelector("#tutorName")
                                if (minimumHoursField == null || maxmimumHoursField == null || nameField == null) return
                                minimumHoursField.value = tutor.minimumHours + ""
                                maxmimumHoursField.value = tutor.maximumHours + ""
                                nameField.value = tutor.name
                                nameField.disabled = true
                            }}><FontAwesomeIcon icon={faPencil} /></button>
                            <button type="button" className="btn btn-danger"><FontAwesomeIcon icon={faTrashCan} onClick={() => { deleteTutor(tutor.name) }} /></button>
                        </div>
                    </div>)}
            </div>
            <div className="modal fade" id="tutorModal" tabIndex={-1} aria-labelledby="tutorModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="tutorModalLabel">Tutor</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ gap: "10px", display: 'flex', flexDirection: "column" }}>
                            <input type="email" className="form-control" id="tutorName" placeholder="Name" />
                            <input type="email" className="form-control" id="tutorMinHour" placeholder="Minimum Hour" />
                            <input type="email" className="form-control" id="tutorMaxHour" placeholder="Maximum Hour" />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" id="tutorModelBtn" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { saveChangesTutor() }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Tutors