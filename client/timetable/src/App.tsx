import "./assets/App.css"
import Select from "./assets/components/Select"
import { v4 } from 'uuid';

import classes from "./data/classes.json"
import tutors from "./data/tutors.json"
import subjects from "./data/subjects.json"
import general from "./data/general.json"
import timetable from "./data/timetable.json"
import { useEffect, useState } from "react"
import Button from "./assets/components/Button"
import OutlineButton from './assets/components/OutlineButton'
import Dropdown from "./assets/components/Dropdown"


var corsPort = 81;
var location = `${window.location.protocol}//${window.location.hostname}:${corsPort || window.location.port}`
declare module globalThis {
    var errorTimeout: any;
}
interface Room {
    name: string,
    subjects: Array<{ name: string, tutors: Array<string> }>
}
interface Tutor {
    name: string;
    minimumHours: string;
    maximumHours: string;
    subjects: Array<string>
}
interface Subject {
    name: string;
    minimumHours: string;
    maximumHours: string;
    classes: Array<string>
    tutors: Array<string>
}
interface Organisation {
    name: string;
    general: any;
    classes: Array<Room>;
    tutors: Array<Tutor>;
    subjects: Array<Subject>;
    timetable: any
}

function App() {
    var subjectsOfViewer = []
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState({
        organisation: {
            name: "",
            classes: [{ name: "", subjects: [{ name: "abc", tutors: [] }] }],
            tutors: [{ name: "", subjects: ["abc"] }],
            subjects: [{ name: "", minimumHours: 0, maximumHours: 0 }],
            general: {},
            timetable: {}
        }
    });
    const [viewAsSelector, setViewAsSelector] = useState("Classes")
    const [viewAsSelectorSub, setViewAsSelectorSub] = useState("")
    const [timetable, setTimeTable] = useState(response.organisation.timetable)
    const [error, setError] = useState(null);
    useEffect(() => {
        let organName = window.location.pathname.split("/")[2];
        if (!organName) return window.location.replace(`${window.location.protocol}//${window.location.hostname}:${corsPort || window.location.port}/organNotFound`)
        fetch(`${location}/api/getTimetable?organName=${organName}`, { method: "GET" }).then(async res => {
            let response = await res.json()
            if (response.code == 2) {
                window.location.replace(`${window.location.protocol}//${window.location.hostname}:${corsPort || window.location.port}/organNotFound`)
            }
            setResponse(response);
            setViewAsSelectorSub(response.organisation.classes[0].name)
            setTimeTable(response.organisation.timetable[response.organisation.classes[0].name])
        }).finally(() => {
            setLoading(false);
        })
    }, [])
    useEffect(() => {
        setTimeTable(response.organisation.timetable[viewAsSelectorSub])

    }, [viewAsSelectorSub])


    function getHoursHeads() {
        if (timetable == null) return;
        let heads: String[] = []
        for (const e in timetable) {
            for (const f in timetable[e]) {
                if (!heads.includes(f)) {
                    heads.push(f)
                }
            }
        }
        return heads
    }
    function getDayOfTimetable() {
        if (timetable == null) return;
        let days: String[] = []
        for (const e in timetable) {
            days.push(e);
        }
        return days
    }
    function getHoursOfTheday(day: String) {
        if (timetable == null) return;
        let hours: String[] = []
        for (const e in timetable[day]) {
            hours.push(timetable[day][e])
        }
        return hours
    }
    function getListOfViewer() {
        if (viewAsSelector == null || viewAsSelectorSub == null) return
        let list: any = []
        if (viewAsSelector == "Classes") {
            list = response.organisation.classes.find(room => room.name == viewAsSelectorSub)?.subjects.map((subject: { name: string; }) => subject.name)
        }
        else {
            let classes: string[] = []
            response.organisation.classes.forEach(room => {
                room.subjects.forEach(subject => {
                    if (subject.tutors.includes(viewAsSelectorSub)) {
                        classes.push(room.name)
                    }
                })
            })
            list = classes;
        }

        return list
    }
    async function deleteHour({ day, hour }: { day: any, hour: any }) {
        if (timetable == null) return;
        if (day == null || hour == null) return
        day = day + 1
        hour = hour + 1
        let res = await fetch(`${location}/api/deleteHour/${response.organisation.name}/${viewAsSelectorSub}/${day}/${hour}`, { method: "DELETE" })
        let resp = res.status
        if (resp == 204) {
            let res: any = { ...response }
            let organisation: Organisation = res.organisation
            let classes = organisation.classes;
            let tutors = organisation.tutors;
            let subjects = organisation.subjects;
            let timetable: any = organisation.timetable
            if (viewAsSelector == "Classes") {
                let room = classes.find(room => room.name == viewAsSelectorSub)
                let subjectName = timetable[viewAsSelectorSub][`day${day}`][`hour${hour}`];
                if (subjectName != null) {
                    room?.subjects.find(subject => subject.name == subjectName)?.tutors.forEach(tutor => {
                        console.log(tutor);
                        timetable[tutor][`day${day}`][`hour${hour}`] = null
                    })
                }
                timetable[viewAsSelectorSub][`day${day}`][`hour${hour}`] = null
            }
            else if (viewAsSelector == "Tutors") {
                let tutor = tutors.find(e => e.name == viewAsSelectorSub)
                let className = timetable[viewAsSelectorSub][`day${day}`][`hour${hour}`]
                if (className != null) {
                    let room = classes.find(e => { return e.name == className })
                    if (room == null) return
                    let subjectName = timetable[room?.name][`day${day}`][`hour${hour}`];
                    room.subjects.find(e => e.name == subjectName)?.tutors.forEach(tutor => {
                        timetable[tutor][`day${day}`][`hour${hour}`] = null
                    })
                    timetable[className][`day${day}`][`hour${hour}`] = null
                }
            }
            setResponse(res)
            setTimeTable(res.organisation.timetable[viewAsSelectorSub])
        }

    }
    async function addHour({ day, hour, value }: { day: any, hour: any, value: String }) {
        if (timetable == null) return;
        if (day == null || hour == null) return
        day = day + 1
        hour = hour + 1
        let res = await fetch(`${location}/api/addHour/${response.organisation.name}/${viewAsSelectorSub}/${day}/${hour}/${value}`, { method: "POST" })
        let resStatus = res.status
        let conflict;
        try {
            conflict = (await res.json())
        } catch (error) {

        }
        if (conflict) {
            setError(conflict.conflict)
            clearTimeout(globalThis.errorTimeout)
            globalThis.errorTimeout = setTimeout(() => {
                setError(null)
            }, 3000)
        }

        if (resStatus == 202) {
            let res: any = { ...response }
            let organisation: Organisation = res.organisation;
            let timetable: any = organisation.timetable;
            let classes = organisation.classes;
            let tutors = organisation.tutors;
            if (classes.find(room => room.name == viewAsSelectorSub)) {
                let room = classes.find(room => room.name == viewAsSelectorSub);
                let subject = room?.subjects.find(subject => subject.name == value)
                subject?.tutors.forEach(tutor => {
                    timetable[tutor][`day${day}`][`hour${hour}`] = room?.name
                })
                timetable[viewAsSelectorSub][`day${day}`][`hour${hour}`] = value
            }

            setResponse(res)
            setTimeTable(res.organisation.timetable[viewAsSelectorSub])
        }

    }
    async function sendAddHourRequest({day, hour, value}: {day:number, hour : number, value :String}) {
        let res = await fetch(`${location}/api/addHour/${response.organisation.name}/${viewAsSelectorSub}/${day}/${hour}/${value}`, { method: "POST" })
        let resStatus = res.status
        let conflict;
        try {
            conflict = (await res.json())
        } catch (error) {

        }
        if (conflict) {
            return true
        }

        if (resStatus == 202) {
            let res: any = { ...response }
            let organisation: Organisation = res.organisation;
            let timetable: any = organisation.timetable;
            let classes = organisation.classes;
            let tutors = organisation.tutors;
            if (classes.find(room => room.name == viewAsSelectorSub)) {
                let room = classes.find(room => room.name == viewAsSelectorSub);
                let subject = room?.subjects.find(subject => subject.name == value)
                subject?.tutors.forEach(tutor => {
                    timetable[tutor][`day${day}`][`hour${hour}`] = room?.name
                })
                timetable[viewAsSelectorSub][`day${day}`][`hour${hour}`] = value
            }

            setResponse(res)
            setTimeTable(res.organisation.timetable[viewAsSelectorSub])
        }
    }
    async function autoGenerate(){
        // fetch(`${location}/api/autoGenerate/${response.organisation.name}/${viewAsSelectorSub}`)
        let conflict;
        do{
            
        }
    }
    if (loading) return (
        <div className="text-center" style={{ marginTop: "50vh" }}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden" style={{}}>Loading...</span>
            </div>
            <p>Loading</p>
        </div>
    )
    return (
        <div className="App">
            <h1 className="header">{response.organisation.name && response.organisation.name}</h1>
            {error &&
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>{error}</strong>
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => { setError(null) }}></button>
                </div>
            }
            <div className="wrapper">
                <div className="viewSelector">
                    <h5>View As : </h5>
                    <Select options={["Classes", "Tutors"]} selected={viewAsSelector} onChange={(e) => {
                        setViewAsSelector(e.target.value);
                        setViewAsSelectorSub(response.organisation[e.target.value.toLowerCase()][0].name)
                    }}></Select>
                    {viewAsSelector === "Classes" ?
                        <Select options={response.organisation.classes.map(room => room.name)} selected={viewAsSelectorSub} onChange={(e) => { setViewAsSelectorSub(e.target.value) }}></Select>
                        : <Select options={response.organisation.tutors.map(tutor => tutor.name)} selected={viewAsSelectorSub} onChange={(e) => { setViewAsSelectorSub(e.target.value) }}></Select>
                    }
                    <Button color="dark" onClick={()=>{autoGenerate()}}>Auto Generate</Button>
                </div>
                <div className="timetable">
                    {timetable != null &&
                        <table className="table table-bordered caption-top align-middle">
                            <caption style={{ fontSize: "18px", fontWeight: "bolder" }}>{viewAsSelectorSub}</caption>
                            <thead>
                                <tr className="align-middle">
                                    <th scope="col" className="table-dark">Day/ Hour</th>
                                    {getHoursHeads()?.map(hour => <th scope="col" key={"hour" + hour} className="table-dark">{hour}</th>)}

                                </tr>
                            </thead>
                            <tbody>
                                {getDayOfTimetable()?.map((day, dayIndex) => <tr key={v4()}>
                                    <th scope="row" className="table-dark">{day}</th>
                                    {getHoursOfTheday(day)?.map((hour, hourIndex) => <td key={day + String(hourIndex)} scope="col">{(hour == null) ?
                                        <>
                                            <Dropdown text="Add" color="secondary" list={getListOfViewer().map((subject: { name: string; }) => {
                                                let disabled = (viewAsSelector == "Tutors") ? true : false
                                                return {
                                                    name: subject, value: subject, disabled
                                                }
                                            })} onChange={(value) => {
                                                addHour({ day: dayIndex, hour: hourIndex, value: value })
                                            }}></Dropdown>
                                        </> :
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <p style={{ flex: "1", marginBottom: "0px" }}>{hour}</p>
                                            <div className="btn-group-vertical" role="group" aria-label="Vertical button group">
                                                <Button color="secondary" onClick={() => { }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg></Button>
                                                <Button color="danger" onClick={() => deleteHour({ day: dayIndex, hour: hourIndex })}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" /></svg></Button>
                                            </div>
                                        </div>
                                    }</td>)}
                                </tr>)}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </div>
    )
}

export default App
