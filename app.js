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
const summary = require("./app/summary")


const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))
const organisations = require("./app/organisation")
const { log } = require('console')

// open(`http://localhost:${config.http}`)

const app = express()
app.set("view engine", "ejs")

app.use(json())
app.use(urlencoded({extended:false}))
app.use(text())
app.use(cors());

app.use(cookieParser())
const xhttp = http.createServer(app).listen(config.http,()=>{console.log(`Http Server Running on Port : ${config.http}`)})
const xhttps = https.createServer(app).listen(config.https,()=>{console.log(`Https Server Running on Port : ${config.https}`)})
app.get("/",(req,res)=>{
    let organisations = getOrganisations()
    res.render("home",{
        organisations
    })
})
app.post("/addOrganisation",(req,res)=>{
    req.body.name = (req.body.name).toLowerCase();
    res.send(createOrganisation(req.body.name));
})
app.post("/deleteOrganisation", (req,res)=>{
    req.body.name = (req.body.name).toLowerCase();
    res.send(deleteOrganisation(req.body.name));
})
app.get("/organisation/:name",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("organisation",{
        title : organisation.name
    })
})
app.get("/organisation/:name/classes",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("classes",{
        organisation,
        classes : organisation.classes,
        tutors : getTutorFullDetails(organisation.name)
    })
})
app.get("/organisation/:name/getTutorsFullDetails",(req,res) => {
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.send(getTutorFullDetails(organisation.name))
})
app.get("/organisation/:name/tutors",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("tutors",{
        organisation,
        tutors : organisation.tutors,
        subjects : organisation.subjects
    })
}).post("/organisation/:name/addtutor",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    req.body = JSON.parse(req.body)
    let tutorName = req.body.name;
    let minimumHours = parseInt(req.body.minimumHours)
    let maximumHours = parseInt(req.body.maximumHours)
    let subjects = req.body.subjects;
    res.send(addTutor(organisation.name,tutorName,minimumHours,maximumHours,subjects));
}).post("/organisation/:name/editTutorSubject",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    req.body = JSON.parse(req.body)
    let tutorName = req.body.tutorName;
    let subjectName = req.body.subjectName;
    let value = req.body.value;
    res.send(editTutorSubject(organisation.name,tutorName,subjectName,value))
    
}).post("/organisation/:name/editClassSubject",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    req.body = JSON.parse(req.body)
    let className = req.body.className;
    let subjectName = req.body.subjectName;
    let value = req.body.value;
    res.send(editClassSubject(organisation.name,className,subjectName,value))
    
}).post("/organisation/:name/editSubjectTutorOfClass",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    req.body = JSON.parse(req.body)
    let className = req.body.className;
    let subjectName = req.body.subjectName;
    let tutorName = req.body.tutorName;
    let value = req.body.value;
    res.send(editSubjectTutorOfClass(organisation.name,className,subjectName,tutorName,value));
})
app.get("/organisation/:name/subjects",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    let subjects = [];
    organisation.classes.forEach(room => {
        room.subjects.forEach(subject => {
            if(subjects.find(sub => {return sub.name == subject.name})){
                let already = subjects.find((sub,i,a) => {return sub.name == subject.name});
                already.classes.push(room.name)
            }else{
                subjects.push({
                    name : subject.name,
                    classes : [room.name],
                })
            }
        })
    });
    organisation.tutors.forEach(tutor => {
        tutor.subjects.forEach(subject => {
            organisation.subjects.find(sub => sub == subject)
        })
    })
    res.render("subjects",{
        organisation,
        classes : organisation.classes,
        subjects : organisation.subjects,
        tutors : organisation.tutors
    })
}).post("/organisation/:name/addsubject",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    req.body = JSON.parse(req.body)
    let subjectName = req.body.name;
    let minimumHours = parseInt(req.body.minimumHours)
    let maximumHours = parseInt(req.body.maximumHours)
    let classes = req.body.classes
    
    res.send(addSubject(organisation.name,subjectName,minimumHours,maximumHours,[],classes))
})
app.get("/organisation/:name/summary",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("summary",{
        organisation,
        tutors : organisation.tutors,
        subjects : organisation.subjects,
        classes : organisation.classes,
        general : organisation.general,
        summary : {
            hours : summary.checkHourAvailability(organisation.name),
            tutors : summary.checkTutors(organisation.name)
        }
    })
})
app.post("/organisation/:name/addClass",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    if(addClass(req.params.name,req.body.name)){
        res.send(addClass(req.params.name,req.body.name)).status(403)
    }
    else{
        res.sendStatus(200)
    }
})
app.get("/timetable/:name/",async(req,res)=>{
    let organisation = getOrganisations(req.params.name)
    if(organisation.code == 2){
        res.render("organNotFound.ejs");
        return;
    }
    res.render("timetable",{
        organisation
    })
}).post("/timetable/setHour",async(req,res)=>{
    res.send(setHour(req.body.organ,req.body.class,req.body.day,req.body.hour,req.body.hourName))
}).post("/timetable/deleteHour",async(req,res)=>{
    res.send(deleteHour(req.body.organ,req.body.class,req.body.day,req.body.hour))
})
app.get("/organNotFound",(req,res)=>{
    res.render("organNotFound");
})


app.get("/organisation/:name/timetable", async(req,res)=>{
    let organisation = getOrganisations(req.params.name);
    if (organisation.error) {
        console.log(organisation);
        return res.json(organisation);
    }
    res.json({
        organisation
    })
})
app.get("/api/getTimetable", async(req,res)=>{
    let organisation = getOrganisations(req.query.organName);
    if (organisation.error) {
        return res.json(organisation);
    }
    organisation.tutors = getTutorFullDetails(organisation.name)
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

function checkConflict(organName, day, hour, object, subjectName){
    let conflict = false;
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation;
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;
    let timetable = organisation.timetable;
    let classes = organisation.classes
    if (tutors.find(tutor => tutor.name == object)) {
    }
    else if (organisation.classes.find(room => room.name == object)) {
        let room = classes.find(room => room.name == object)
        if(room == null) return {conflict : "Class Name Invalid"}
        //check subject is valid 
        let subject = subjects.find(e => e.name == subjectName)
        if (subject == null) return { conflict: "Subject Name Invalid" }
        //check tutor available and allotment
        let tutorAvailability = getTutorAvailability(organName)
        for (let tutor of room.subjects.find(sub => sub.name == subject.name).tutors) {
            tutor = tutorAvailability.find(e => e.name == tutor)
            if (tutor.allotedHour >= tutor.maximumHours) {
                conflict = true
                return { conflict: `Tutor: ${tutor.name} Exceeding Limit` }
            }
        }
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
        if(subjectAlloted >= subject.maximumHours)return { conflict : "Subject Limit Exceeding"}
    }
    else {
        return {conflict: "Tutor or Class you provided is Invalid"}
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
        if(tutors.find(tutor => tutor.name == e))continue
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