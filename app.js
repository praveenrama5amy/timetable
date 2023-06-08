const express = require('express')
const http = require("http")
const https = require("https")
const fs = require("fs")
const open = require("open")
const ejs = require("ejs")
const { json, urlencoded, text } = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require("cors")

require("./app/setup").setup();
const { createOrganisation, getOrganisations, createClasses, createTutor, deleteOrganisation, addClass, setHour, deleteHour, addSubject, addTutor, setTutor, editTutorSubject, editClassSubject, editSubjectTutorOfClass, getTutorFullDetails } = require("./app/organisation")
const organisationModule = require("./app/organisation")
const summary = require("./app/summary")
const tools = require("./app/tools")


const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf-8" }))
const organisations = require("./app/organisation")
const { log, time } = require('console')

// open(`http://localhost:${config.http}`)


const app = express()
app.set("view engine", "ejs")

app.use(json())
app.use(urlencoded({ extended: false }))
app.use(text())
app.use(cors());

app.use(cookieParser())
const xhttp = http.createServer(app).listen(config.http, () => { console.log(`Http Server Running on Port : ${config.http}`) })
const xhttps = https.createServer(app).listen(config.https, () => { console.log(`Https Server Running on Port : ${config.https}`) })

app.use("/assets", express.static("assets"))

app.get("/", (req, res) => {
    let organisations = getOrganisations()
    res.render("home", {
        organisations
    })
}).get("/api/getOrgans", (req, res) => {
    let organisations = getOrganisations()
    res.json(organisations)
}).get("/api/getOrgan/:name", (req, res) => {
    if (req.params.name == null) return null
    let organisation = getOrganisations(req.params.name)
    console.log(organisation);
    res.json(organisation)
})
app.post("/addOrganisation", (req, res) => {
    req.body.name = (req.body.name).toLowerCase();
    res.send(createOrganisation(req.body.name));
})
app.post("/deleteOrganisation", (req, res) => {
    req.body.name = (req.body.name).toLowerCase();
    res.send(deleteOrganisation(req.body.name));
})
app.get("/organisation/:name", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    res.render("organisation", {
        title: organisation.name
    })
})
app.get("/organisation/:name/classes", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    res.render("classes", {
        organisation,
        classes: organisation.classes,
        tutors: getTutorFullDetails(organisation.name)
    })
})
app.get("/organisation/:name/getTutorsFullDetails", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    res.send(getTutorFullDetails(organisation.name))
})
app.get("/organisation/:name/tutors", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    res.render("tutors", {
        organisation,
        tutors: organisation.tutors,
        subjects: organisation.subjects
    })
}).post("/organisation/:name/addtutor", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    req.body = JSON.parse(req.body)
    let tutorName = req.body.name;
    let minimumHours = parseInt(req.body.minimumHours)
    let maximumHours = parseInt(req.body.maximumHours)
    res.send(addTutor(organisation.name, tutorName, minimumHours, maximumHours, []));
}).post("/organisation/:name/editTutorSubject", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    req.body = JSON.parse(req.body)
    let tutorName = req.body.tutorName;
    let subjectName = req.body.subjectName;
    let value = req.body.value;
    res.send(editTutorSubject(organisation.name, tutorName, subjectName, value))

}).post("/organisation/:name/editClassSubject", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    req.body = JSON.parse(req.body)
    let className = req.body.className;
    let subjectName = req.body.subjectName;
    let value = req.body.value;
    res.send(editClassSubject(organisation.name, className, subjectName, value))

}).post("/organisation/:name/editSubjectTutorOfClass", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    req.body = JSON.parse(req.body)
    let className = req.body.className;
    let subjectName = req.body.subjectName;
    let tutorName = req.body.tutorName;
    let value = req.body.value;
    res.send(editSubjectTutorOfClass(organisation.name, className, subjectName, tutorName, value));
})
app.get("/organisation/:name/subjects", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    let subjects = [];
    organisation.classes.forEach(room => {
        room.subjects.forEach(subject => {
            if (subjects.find(sub => { return sub.name == subject.name })) {
                let already = subjects.find((sub, i, a) => { return sub.name == subject.name });
                already.classes.push(room.name)
            } else {
                subjects.push({
                    name: subject.name,
                    classes: [room.name],
                })
            }
        })
    });
    organisation.tutors.forEach(tutor => {
        tutor.subjects.forEach(subject => {
            organisation.subjects.find(sub => sub == subject)
        })
    })
    res.render("subjects", {
        organisation,
        classes: organisation.classes,
        subjects: organisation.subjects,
        tutors: organisation.tutors
    })
}).post("/organisation/:name/addsubject", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    req.body = JSON.parse(req.body)
    let subjectName = req.body.name;
    let minimumHours = parseInt(req.body.minimumHours)
    let maximumHours = parseInt(req.body.maximumHours)
    let classes = req.body.classes

    res.send(addSubject(organisation.name, subjectName, minimumHours, maximumHours, [], classes))
})
app.get("/organisation/:name/summary", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    res.render("summary", {
        organisation,
        tutors: organisation.tutors,
        subjects: organisation.subjects,
        classes: organisation.classes,
        general: organisation.general,
        summary: {
            hours: summary.checkHourAvailability(organisation.name),
            tutors: summary.checkTutors(organisation.name)
        }
    })
})
app.post("/organisation/:name/addClass", (req, res) => {
    let organisations = getOrganisations()
    if (!organisations.find(e => { return e.name == req.params.name })) {
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e => { return e.name == req.params.name })
    if (addClass(req.params.name, req.body.name)) {
        res.send(addClass(req.params.name, req.body.name)).status(403)
    }
    else {
        res.sendStatus(200)
    }
})
app.get("/timetable/:name/", async (req, res) => {
    let organisation = getOrganisations(req.params.name)
    if (organisation.code == 2) {
        res.render("organNotFound.ejs");
        return;
    }
    res.render("timetable", {
        organisation
    })
}).post("/timetable/setHour", async (req, res) => {
    res.send(setHour(req.body.organ, req.body.class, req.body.day, req.body.hour, req.body.hourName))
}).post("/timetable/deleteHour", async (req, res) => {
    res.send(deleteHour(req.body.organ, req.body.class, req.body.day, req.body.hour))
})
app.get("/organNotFound", (req, res) => {
    res.render("organNotFound");
})


app.get("/organisation/:name/timetable", async (req, res) => {
    let organisation = getOrganisations(req.params.name);
    if (organisation.error) {
        return res.json(organisation);
    }
    res.render("timetable")

})
app.get("/api/getTimetable", async (req, res) => {
    let organisation = getOrganisations(req.query.organName);
    if (organisation.error) {
        return res.json(organisation);
    }
    organisation.tutors = getTutorFullDetails(organisation.name)
    if (organisationModule.isHasTemp(organisation.name)) {
        organisation.onTemp = true
    }
    res.json({
        organisation
    })
})
app.delete("/api/deleteHour/:organName/:obj/:day/:hour", async (req, res) => {
    let organisation = getOrganisations(req.params.organName);
    if (organisation.error) {
        return res.sendStatus(404);
    }
    if (!deleteHour(organisation.name, req.params.obj, req.params.day, req.params.hour).error) {
        return res.sendStatus(204)
    }
    res.sendStatus(202)
})
app.post("/api/addHour/:organName/:obj/:day/:hour/:value", async (req, res) => {
    let organisation = getOrganisations(req.params.organName);
    if (organisation.error) {
        return res.sendStatus(406);
    }
    let conflict = checkConflict(req.params.organName, req.params.day, req.params.hour, req.params.obj, req.params.value)
    if (conflict) {
        return res.json(conflict)
    }
    if (setHour(req.params.organName, req.params.obj, req.params.day, req.params.hour, req.params.value).error) {
        return res.sendStatus(406)
    }
    res.sendStatus(202)
})
app.put("/api/autoGenerate/:organName/", (req, res) => {
    console.log(req.params.organName);
    let organName = req.params.organName;
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return res.send(organisation)
    }
    organisationModule.deleteTempTimetable(organName)
    organisationModule.createTempTimetable(organName)
    let generate = getAutoGenerateTimetable(req.params.organName)
    organisationModule.setTimetable(organName, generate.timetable)
    res.json(generate)
})
app.put("/api/saveAutoGenerate/:organName/", (req, res) => {
    let organName = req.params.organName;
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return res.send(organisation)
    }
    organisations.deleteTempTimetable(organName)
    organisation = getOrganisations(organName)
    res.json({ organisation })
})
app.delete("/api/autoGenerate/:organName/", (req, res) => {
    let organName = req.params.organName;
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return res.send(organisation)
    }
    organisations.swapTempTimetable(organName)
    organisations.deleteTempTimetable(organName)
    organisation = getOrganisations(organName)
    res.json({ organisation })
})

function checkConflict(organisation, day, hour, object, subjectName) {
    let conflict = false;
    if (organisation == null || object == null || day == null || subjectName == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;
    let timetable = organisation.timetable;
    let classes = organisation.classes
    if (tutors.find(tutor => tutor.name == object)) {
    }
    else if (organisation.classes.find(room => room.name == object)) {
        let room = classes.find(room => room.name == object)
        if (room == null) return { conflict: "Class Name Invalid" }
        //check subject is valid 
        let subject = subjects.find(e => e.name == subjectName)
        if (subject == null) return { conflict: "Subject Name Invalid" }
        //check Subject Availablity
        let subjectAlloted = 0
        for (const e in timetable[room.name]) {
            const day = timetable[room.name][e];
            for (const f in day) {
                let hour = day[f]
                if (subject.name == hour) {
                    subjectAlloted = subjectAlloted + 1
                }
            }
        }
        //check tutor available and allotment
        let tutorAvailability = getTutorAvailability(organisation.name)
        for (let tutor of room.subjects.find(sub => sub.name == subject.name).tutors) {
            tutor = tutorAvailability.find(e => e.name == tutor)
            if (tutor.allotedHour >= tutor.maximumHours) {
                conflict = true
                return { conflict: `Tutor Exceeding Limit` }
            }
        }
        if (subjectAlloted >= subject.maximumHours) return { conflict: "Subject Limit Exceeding" }
        //check tutor availablity
        let tutorOfHour = classes.find(room => room.name == object).subjects.find(e => e.name == subject.name).tutors
        for (const e in timetable) {
            const element = timetable[e];
            let subjectName = timetable[e][`day${day}`][`hour${hour}`]
            if (subjectName == null) continue;
            let roomOfLoop = classes.find(room => room.name == e)
            if (roomOfLoop == null) continue;
            let subjectOfLoopRoom = roomOfLoop.subjects.find(subject => subject.name == subjectName);
            if (subjectOfLoopRoom == null) continue
            let tutorsOfSubjectOfLoopRoom = subjectOfLoopRoom.tutors
            for (const e of tutorsOfSubjectOfLoopRoom) {
                if (tutorOfHour.includes(e)) {
                    return { conflict: "Tutor Busy" }
                }
            }
        }
    }
    else {
        return { conflict: "Tutor or Class you provided is Invalid" }
    }
    return conflict
}
function getTutorAvailability(organName) {
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation;
    }
    let tutors = organisation.tutors;
    let timetable = organisation.timetable;
    let classes = organisation.classes
    tutors.forEach(tutor => {
        tutor.allotedHour = 0
        tutor.availableHour = tutor.maximumHours
    })
    for (const e in timetable) {
        if (tutors.find(tutor => tutor.name == e)) continue
        let room = classes.find(room => room.name == e)
        let object = timetable[e]
        for (const f in object) {
            const day = object[f];
            for (const g in day) {
                const hour = day[g]
                if (hour != null) {
                    let subject = room.subjects.find(subject => subject.name == hour)
                    subject.tutors.forEach(tutor => {
                        tutor = tutors.find(e => e.name == tutor)
                        tutor.allotedHour = tutor.allotedHour + 1
                        tutor.availableHour = tutor.availableHour - 1
                    })
                }
            }
        }
    }
    // setTutor(organName, tutors)
    return tutors
}
function getSubjectsOfClass(organName, className) {
    let organisation = getOrganisations(organName);
    console.log(className);;
    if (organisation.error) {
        return organisation;
    }
    let classes = organisation.classes;
    let room = classes.find(room => room.name == className);
    return room.subjects
}
function getTutorsofSubject(organisation, className, subjectName) {
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return;
    let classes = organisation.classes;
    let room = classes.find(room => room.name == className)
    if (room == null) return { error: "Class Not Exists" }
    let subjectsOfRoom = room.subjects.find(subject => subject.name == subjectName)
    let tutorsOfSubject = subjectsOfRoom.tutors
    return tutorsOfSubject
}
function getHourRecurrencyOfDay(organisation, className, day, subjectName) {
    if (organisation == null || className == null || day == null || subjectName == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable[className][`day${day}`]
    let recurrency = 0
    for (const e in timetable) {
        const period = timetable[e]
        if (period == subjectName) recurrency += 1
        if (recurrency >= 2) recurrency *= 1.5
    }
    return recurrency
}
function getTutorRecurrencyOfDay(organisation, className, day, subjectName) {
    if (organisation == null || className == null || day == null || subjectName == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable[className][`day${day}`]
    let recurrency = 0
    for (const e in timetable) {
        const period = timetable[e]
        if (period == null) continue;
        let tutorsOfSubjectName = getTutorsofSubject(organisation, className, subjectName)
        let tutorsOfPeriod = getTutorsofSubject(organisation, className, period)
        tutorsOfPeriod.forEach(tutor => {
            if (tutorsOfSubjectName.includes(tutor)) {
                recurrency += 1
            }
        })
    }
    return recurrency
}
function getTutorContinuity(organisation, className, day, hour, subjectName) {
    if (organisation == null || className == null || day == null || subjectName == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let tutorsOfSubject = getTutorsofSubject(organisation, className, subjectName)
    let timetable = organisation.timetable
    let priority = 0
    for (const loopClassName in timetable) {
        let previousHour = timetable[loopClassName][`day${day}`][`hour${hour - 1}`]
        let nextHour = timetable[loopClassName][`day${day}`][`hour${hour + 1}`]
        if (organisation.tutors.find(tutor => tutor.name == loopClassName)) continue
        if (previousHour != null) {
            let tutorsOfPreviousHour = getTutorsofSubject(organisation.name, loopClassName, previousHour)
            tutorsOfPreviousHour.forEach(tutor => {
                if (tutorsOfSubject.includes(tutor)) {
                    priority += 0.5
                }
            })
        }
        if (nextHour != null) {
            let tutorOfNextHour = getTutorsofSubject(organisation.name, loopClassName, nextHour)
            tutorOfNextHour.forEach(tutor => {
                if (tutorsOfSubject.includes(tutor)) {
                    priority += 0.5
                }
            })
        }
    }
    return priority
}
function getTutorBusyAt(organisation, day, hour, tutors) {
    if (organisation == null || day == null || tutors == null || hour == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable
    for (const className in timetable) {
        if (organisation.tutors.find(room => room.name == className)) continue
        let subjectOfhour = timetable[className][`day${day}`][`hour${hour}`]
        if (subjectOfhour == null) continue;
        let tutorsOfSubjectOfHour = getTutorsofSubject(organisation, className, subjectOfhour)
        for (const tutor of tutorsOfSubjectOfHour) {
            if (tutors.includes(tutor)) {
                return {
                    className,
                    day,
                    hour
                }
            }
        }
    }
}
function getSubjectPriorities(organisation, className, day) {
    if (organisation == null || day == null || className == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable[className]
    for (const hourName in timetable) {
        const hourSubjectName = timetable[`day${day}`][hourName];
        let hourNumber = parseInt(hourName.slice(4))
        if (hourSubjectName != null) continue;
        let subjectsOfRoom = getSubjectsOfClass(organisation.name, className)
        let conflict;
        for (const subject of subjectsOfRoom) {
            subject.priority = 0;
            let tutorsOfSubject = getTutorsofSubject(organisation, className, subject.name)
            //check Subject recurrency same day
            subject.priority += getHourRecurrencyOfDay(organisation, className, day, subject.name)
            // check tutor recurrenct same day
            subject.priority += getTutorRecurrencyOfDay(organisation, className, day, subject.name)
            //check tutor continuity
            console.log(getTutorContinuity(organisation, className, day, hourNumber, subject.name));
            subject.priority += getTutorContinuity(organisation, className, day, hourNumber, subject.name)
            //check Conflict
            conflict = checkConflict(organisation, day, hourNumber, className, subject.name)
            if (conflict && conflict.conflict == "Subject Limit Exceeding") subject.priority += 15
            if (conflict && conflict.conflict == "Tutor Busy") subject.priority += 5
            if (conflict && conflict.conflict == "Tutor Exceeding Limit") subject.priority += 15
            if (conflict && conflict.conflict) subject.conflict = conflict.conflict
        }
        subjectsOfRoom = tools.shuffleArray(subjectsOfRoom)
        subjectsOfRoom = subjectsOfRoom.sort((a, b) => { return a.priority - b.priority })
        return subjectsOfRoom
    }
}
function getBestPeriodForSpecificHour(organisation, className, day, hour) {
    if (organisation == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable[className][`day${day}`]
    let subjectsOfRoom = getSubjectsOfClass(organisation.name, className)
    for (const subject of subjectsOfRoom) {
        subject.priority = 0;
        subject.priority += getHourRecurrencyOfDay(organisation, className, day, subject.name)
        subject.priority += getTutorRecurrencyOfDay(organisation, className, day, subject.name)
        subject.priority += getTutorContinuity(organisation, className, day, hour, subject.name)
        let conflict = checkConflict(organisation, day, hour, className, subject.name)
        if (conflict && conflict.conflict == "Subject Limit Exceeding") subject.priority += 10
        if (conflict && conflict.conflict == "Tutor Busy") subject.priority += 5
        if (conflict && conflict.conflict == "Tutor Exceeding Limit") subject.priority += 10
        if (conflict && conflict.conflict) subject.conflict = conflict.conflict
    }
    subjectsOfRoom = tools.shuffleArray(subjectsOfRoom)
    subjectsOfRoom = subjectsOfRoom.sort((a, b) => { return a.priority - b.priority })
    // let subjectsPriority = getSubjectPriorities(organisation, className, day)
    return subjectsOfRoom[0]
}
// function autoGenerate(organName) {
//     let organisation = getOrganisations(organName);
//     if (organisation.error) {
//         return organisation;
//     }
//     organisationModule.createTempTimetable(organName)
//     let timetable = organisation.timetable;
//     let classes = organisation.classes;
//     let tutors = organisation.tutors;
//     let i = 1;
//     for (const className in timetable) {
//         if (tutors.find(tutor => tutor.name == className)) continue;
//         let classTimetable = timetable[className]
//         for (const dayName in classTimetable) {
//             let dayNumber = parseInt(dayName.slice(3))
//             for (const hourName in classTimetable[dayName]) {
//                 const hourSubjectName = classTimetable[dayName][hourName];
//                 let hourNumber = parseInt(hourName.slice(4))
//                 if (hourSubjectName != null) continue;
//                 let subjectsOfRoom = getSubjectsOfClass(organName, className)


//                 for (const subject of subjectsOfRoom) {
//                     subject.priority = 0;
//                     let tutorsOfSubject = getTutorsofSubject(organisation, className, subject.name)
//                     //check Subject recurrency same day
//                     subject.priority += getHourRecurrencyOfDay(organisation, className, dayNumber, subject.name)
//                     // check tutor recurrenct same day
//                     subject.priority += getTutorRecurrencyOfDay(organisation, className, dayNumber, subject.name)
//                     //check tutor continuity
//                     subject.priority += getTutorContinuity(organisation, className, dayNumber, hourNumber, subject.name)
//                     //check Conflict
//                     conflict = checkConflict(organisation, dayNumber, hourNumber, className, subject.name)
//                     if (conflict && conflict.conflict == "Subject Limit Exceeding") subject.priority += 10
//                     if (conflict && conflict.conflict == "Tutor Busy") subject.priority += 5
//                     if (conflict && conflict.conflict == "Tutor Exceeding Limit") subject.priority += 10
//                     if (conflict && conflict.conflict) subject.conflict = conflict.conflict
//                 }

//                 subjectsOfRoom = tools.shuffleArray(subjectsOfRoom)
//                 subjectsOfRoom = subjectsOfRoom.sort((a, b) => {
//                     return a.priority-b.priority
//                 })
//                 // console.log(className, dayName, hourName, subjectsOfRoom[0])
//                 if (subjectsOfRoom[0].conflict == "Tutor Busy") {
//                     let tutorBusyAt = getTutorBusyAt(organisation, dayNumber, hourNumber, subjectsOfRoom[0].tutors)
//                     console.log(tutorBusyAt);
//                 }
//                 // return subjectsOfRoom
//                 // log(subjectsOfRoom)
//                 organisation.timetable[className][dayName][hourName] = subjectsOfRoom[0].name
//             }
//         }
//     }
//     // return organisation.timetable
//     // organisationModule.setTimetable(organisation.name,organisation.timetable)
// }
function getAllConflict(organisation) {
    if (organisation == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let conflicts = [];
    for (const className in organisation.timetable) {
        if (organisation.tutors.find(tutor => tutor.name == className)) continue;
        for (const dayName in organisation.timetable[className]) {
            let dayNumber = parseInt(dayName.slice(3))
            for (const hourName in organisation.timetable[className][dayName]) {
                let hourNumber = parseInt(hourName.slice(4))
                let subjectName = organisation.timetable[className][dayName][hourName]
                if (subjectName == null) continue
                organisation.timetable[className][dayName][hourName] = null
                let conflict = checkConflict(organisation, dayNumber, hourNumber, className, subjectName)
                conflict.className = className
                conflict.hour = hourNumber
                conflict.day = dayNumber
                organisation.timetable[className][dayName][hourName] = subjectName
                if (conflict) {
                    organisation.timetable[className][dayName][hourName] = null
                    conflicts.push(conflict)
                }
            }
        }
    }
    organisation.conflicts = conflicts
    return organisation;
}
function getGeneratedTimetable(organName) {
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation;
    }
    organisationModule.createTempTimetable(organName)
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let tutors = organisation.tutors;
    let i = 1;
    organisation.conflicts = []
    for (const className in timetable) {
        if (tutors.find(tutor => tutor.name == className)) continue;
        let classTimetable = timetable[className]
        for (const dayName in classTimetable) {
            let dayNumber = parseInt(dayName.slice(3))
            for (const hourName in classTimetable[dayName]) {

                let conflict = null;

                const hourSubjectName = classTimetable[dayName][hourName];
                let hourNumber = parseInt(hourName.slice(4))
                if (hourSubjectName != null) continue;
                let bestSubjectForHour = getBestPeriodForSpecificHour(organisation, className, dayNumber, hourNumber)
                if (bestSubjectForHour.conflict) {
                    console.log(className, dayName, hourName, bestSubjectForHour.name);
                    console.log(bestSubjectForHour.conflict);
                    conflict = { className, day: dayNumber, hour: hourNumber, subject: bestSubjectForHour.name, conflict: bestSubjectForHour.conflict }
                }

                if (bestSubjectForHour.conflict == "Tutor Busy") {
                    let tutorBusyAt = getTutorBusyAt(organisation, dayNumber, hourNumber, bestSubjectForHour.tutors)
                    conflict.tutorBusyAt = tutorBusyAt
                }
                if (conflict != null) organisation.conflicts.push(conflict)
                // return bestSubjectForHour
                if (conflict == null) {

                    organisation.timetable[className][dayName][hourName] = bestSubjectForHour.name
                }
            }
        }
    }
    console.log("Conflict Count : ", organisation.conflicts.length);
    return organisation
}
function getAppropriateTutorTimetable(organisation) {
    if (organisation == null) throw "Missing Parameter"
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    let timetable = organisation.timetable
    for (const className in timetable) {
        if (!organisation.classes.find(room => room.name == className)) continue
        for (const dayName in timetable[className]) {
            for (const hourName in timetable[className][dayName]) {
                let subjectName = timetable[className][dayName][hourName]
                if (subjectName == null) continue
                let tutorsOfSubject = getTutorsofSubject(organisation, className, subjectName)
                tutorsOfSubject.forEach(tutor => {
                    organisation.timetable[tutor][dayName][hourName] = className
                })
            }
        }
    }
    return organisation
}
function getAutoGenerateTimetable(organName) {
    let generate = getGeneratedTimetable(organName)
    generate = getAppropriateTutorTimetable(generate)
    return generate

}
// let generate = autoGenerate("ksr")
// let conflicts = getAllConflict(generate)
// console.log(conflicts.conflicts.length);
// let generate = autoGenerate("ksr")
// organisationModule.setTimetable(generate.name,generate.timetable)
// while (generate.conflicts.length != 0) {
//     for (const conflict of generate.conflicts) {
//         if (conflict.conflict == "Tutor Busy") {
//             console.log(conflict.tutorBusyAt);
//             // generate = clearPeriodsOfDayOfClass(generate, conflict.tutorBusyAt.className, conflict.tutorBusyAt.day)
//             generate.timetable[conflict.tutorBusyAt.className][`day${conflict.tutorBusyAt.day}`][`hour${conflict.tutorBusyAt.hour}`] = null
//         }
//     }
//     generate = autoGenerate("ksr")
// }
// organisationModule.setTimetable("ksr",getAppropriateTutorTimetable("ksr").timetable)
function clearPeriodsOfDayOfClass(organisation, className, day) {
    if (organisation == null) throw "Missing Parameter"
    if (className == null) return { error: "className not found" };
    if (day == null) return { error: "day not found" };
    organisation = (typeof organisation == "object") ? organisation : getOrganisations(organisation)
    if (organisation.error) return organisation;
    if (organisation == null) return { error: "organisation not found" };
    for (const hour in organisation.timetable[className][`day${day}`]) {
        organisation.timetable[className][`day${day}`][hour] = null
    }
    return organisation
}