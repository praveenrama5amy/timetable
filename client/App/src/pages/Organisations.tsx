import { useState, useEffect } from 'react'

import { faTrashCan } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { Organisation as OrganInterface } from '../Interface'
import axios from '../api/Axios'

const Organisation = () => {
    const navigate = useNavigate()
    const [organs, setOrgans] = useState<Array<OrganInterface>>([])
    const open = (organName: string) => {
        navigate(`/${organName}/classes`)
    }
    // const preventDefault = async (event: any) => {
    //     event.stopPropagation();
    // }
    const edit = async (organName: string) => {
        const input: HTMLInputElement | null = document.querySelector("#organisationNewName")
        if (input == null) return
        const name = input.value
        console.log(name);
        if (name == null || name == "") return
        const res = await (await axios.put(`/api/editOrganisation`, { oldName: organName, newName: name })).data
        if (res.resCode == 200) {
            setOrgans(organs.map(organ => {
                if (organ.name != organName) return organ
                return { ...organ, name: name }
            }))
        }

    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteOrgan = async (event: any, organName: string) => {
        event.stopPropagation();
        const res = await (await axios.delete(`/api/deleteOrganisation/${organName}`)).data
        if (res.resCode == 200) {
            setOrgans(organs.filter(organ => organ.name != organName))
        }
    }
    // const setEditField = (name: string) => {
    //     const field: HTMLInputElement | null = document.querySelector("#organisationNewName")
    //     if (field != null)
    //         field.value = name;
    // }
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
                            <div className="card-body" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "70px 100px", cursor: "pointer" }} onClick={() => { open(organ.name) }}>
                                <h5 className="card-title">{organ.name}</h5>
                                <p className="card-text"></p>
                                <div className="btn-group" role="group" aria-label="Basic mixed styles example">
                                    {/* <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#editModal" onClick={(e) => { preventDefault(e); setEditField(organ.name) }}><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></button> */}
                                    <button type="button" className="btn btn-danger" onClick={(e) => { deleteOrgan(e, organ.name) }}><FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon></button>
                                </div>
                            </div>
                            <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <input type="text" className="form-control" placeholder="Organiation Name" id='organisationNewName' />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button type="button" className="btn btn-primary" onClick={() => { edit(organ.name) }}>Edit</button>
                                        </div>
                                    </div>
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