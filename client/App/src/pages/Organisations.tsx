import { useState, useEffect } from 'react'

import { faEdit, faTrashCan } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { Organisation as OrganInterface } from '../Interface'
import axios from '../api/Axios'

const Organisation = () => {
    const navigate = useNavigate()
    const [organs, setOrgans] = useState<Array<OrganInterface>>([])
    const open = () => {
        navigate(`/${"ksr/classes"}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const edit = (event: any) => {
        event.stopPropagation();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteOrgan = (event: any) => {
        event.stopPropagation();
    }
    useEffect(() => {
        fetchOrgans()
    }, [])
    async function fetchOrgans() {
        const organs = (await axios.get("/api/getOrgans")).data
        setOrgans(organs)
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", backgroundImage: `url(${axios.defaults.baseURL}/assets/images/timetable.jpg)`, backgroundRepeat: "repeat", height: "100%" }}>
            <div className="organisations" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "50px", padding: "10%" }}>
                <h1 className="uppercase no-margin text-center" style={{ fontFamily: "colonna MT", fontSize: "100px", fontWeight: "400", color: "red", width: "100%", marginTop: "10px" }}>Organisation</h1>
                {organs.map((organ, index) => {
                    return (
                        <div className="card" key={index} style={{ minHeight: "150px", minWidth: "150px" }}>
                            <div className="card-body" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "70px 100px", cursor: "pointer" }} onClick={open}>
                                <h5 className="card-title">{organ.name}</h5>
                                <p className="card-text"></p>
                                <div className="btn-group" role="group" aria-label="Basic mixed styles example">
                                    <button type="button" className="btn btn-success" onClick={(e) => { edit(e) }}><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></button>
                                    <button type="button" className="btn btn-danger" onClick={(e) => { deleteOrgan(e) }}><FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon></button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div >
        </div >
    )
}

export default Organisation