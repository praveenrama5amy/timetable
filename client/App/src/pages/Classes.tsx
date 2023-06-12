import { ChangeEvent, useEffect, useState } from "react"
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
        const organ = (await axios.get(`/api/getOrgan/${name}`)).data
        console.log(organ);
        setOrgan(organ)
    }
    function openDropdown(querySelector: string) {
        const content: HTMLDivElement | null = document.querySelector(querySelector)
        if (content == null) return
        if (content.style.display == "flex") {
            content.style.display = "none"
        } else { content.style.display = "flex" }
    }
    async function changeTutorsOfSubject(e: ChangeEvent<HTMLInputElement>) {
        const [tutorName, subjectName, className] = e.currentTarget.id.split("@")
        if (className == null || subjectName == null || tutorName == null) return;
        window.location.replace(`#${tutorName}`)
        await axios.post(`/api/organisation/${organName}/editSubjectTutorOfClass`, {
            className: className,
            subjectName: subjectName,
            tutorName: tutorName,
            value: e.currentTarget.checked
        })
        if (organName == null) return
        fetchOrgan(organName)

    }
    async function newClass() {
        const className = prompt("Enter New Class")
        if (className == null) return
        await axios.post(`/api/organisation/${organName}/addClass`, { name: className })
        if (organName == null) return
        fetchOrgan(organName)
    }
    async function deleteClass(className: string) {
        await axios.delete(`/api/organisation/${organName}/deleteClass/${className}`)
        if (organName == null) return
        fetchOrgan(organName)
    }
    return (
        <>
            <h1 className="text-center">Classes</h1>

            <div style={{ height: "100%", display: "flex", overflow: "hidden", gap: "5px", padding: "10px" }}>
                <div className="classes list-group" style={{ height: "100%", display: "flex", alignItems: "center", flexDirection: "column", flex: "1", overflowY: "scroll" }}>
                    <div className="class list-group-item list-group-item-action" style={{ width: "100%", border: "solid 1px black", display: "flex", justifyContent: "center", flexDirection: "column" }} onClick={() => { newClass() }}>
                        <p className="text-center no-margin" style={{ padding: "10px" }}>Add</p>
                    </div>
                    {(organ?.classes != null && organ?.classes.length != 0) ?
                        organ.classes.map((room, i) =>
                            <div key={i} className="class list-group-item list-group-item-action" style={{ width: "100%", border: "solid 1px black", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                                <div style={{ padding: "10px", cursor: "pointer" }} className="dropdown-btn" onClick={() => { openDropdown(`#class${room.name}`) }}><p className="no-margin bold">{room.name}</p></div>
                                <div className="dropdown-content" id={`class${room.name}`} style={{ display: "none", flexDirection: "column" }}>
                                    {room.subjects.map((sub, i) => <div className="dropdown-content" style={{ marginTop: "10px", display: "flex" }} key={i}>
                                        <p className="no-margin" style={{ flex: "1" }}>{sub.name}</p>
                                        <div className="tutorsOfSubject" style={{ border: "solid 2px black", width: "70vw" }}>
                                            <div className="dropdown-btn" style={{ cursor: "pointer", padding: "10px" }} onClick={() => { openDropdown(`#${room.name}${i}`) }}>{(sub.tutors.join(",").length == 0) ? "No Tutors" : sub.tutors.join(",")}</div>
                                            <div className="dropdown-content" style={{ display: "none", flexDirection: "column", padding: "10px" }} id={`${room.name}${i}`}>
                                                {organ.tutors.map((tutor, i) =>
                                                    <div style={{ display: "flex", alignItems: "center" }} key={i}>
                                                        <label className="bold">
                                                            <input
                                                                style={{ padding: "100px", cursor: "pointer" }}
                                                                type="checkbox"
                                                                name={`${tutor.name}@${sub.name}@${room.name}`}
                                                                id={`${tutor.name}@${sub.name}@${room.name}`}
                                                                className="pointer"
                                                                checked={sub.tutors.includes(tutor.name)}
                                                                onChange={(e) => { changeTutorsOfSubject(e) }} />
                                                            {tutor.name}
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                    </div>)}
                                    <button type="button" className="btn btn-danger" style={{ marginTop: "10px", cursor: "pointer" }} onClick={() => { deleteClass(room.name) }}>Delete Class</button>
                                </div>
                            </div>)
                        :
                        <p>No Class</p>
                    }
                </div>
                <div className="tutors" style={{ height: "100%", overflowY: "scroll", border: "solid 2px black", padding: "10px", gap: "5px", display: "flex", flexDirection: "column", borderRadius: "20px", scrollBehavior: "smooth" }}>
                    {organ?.tutors.map((tutor, i) =>
                        <div className="tutor" id={tutor.name} key={i}
                            style={
                                (tutor.allotedHours <= tutor.maximumHours && tutor.allotedHours >= tutor.minimumHours) ?
                                    {
                                        border: "solid 2px black",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexDirection: "column",
                                        borderRadius: "20px",
                                        padding: "20px",
                                        backgroundImage: "linear-gradient(to right,rgba(0, 255, 159, 0.8),rgba(74, 255, 101, 0.8))"
                                    }
                                    :
                                    (tutor.allotedHours > tutor.maximumHours) ?
                                        {
                                            border: "solid 2px black",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "column",
                                            borderRadius: "20px",
                                            padding: "20px",
                                            backgroundImage: "linear-gradient(to right,rgba(255, 0, 50, 0.8),rgba(255, 77, 50, 0.8))"
                                        }
                                        :
                                        {
                                            border: "solid 2px black",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "column",
                                            borderRadius: "20px",
                                            padding: "20px",
                                            backgroundImage: "linear-gradient(to right,rgba(38, 180, 255, 0.8),rgba(0, 139, 255, 0.8))"
                                        }
                                // { ...css.tutor }
                            }>
                            <p className="no-margin bold">{tutor.name}</p>
                            <p className="no-margin">Min : {tutor.minimumHours}</p>
                            <p className="no-margin">Max : {tutor.maximumHours}</p>
                            <p className="no-margin">Available : {tutor.availableHour}</p>
                            <p className="no-margin">Alloted : {tutor.allotedHours}</p>
                        </div>)}
                </div>
            </div >
        </>
    )
}

export default Classes