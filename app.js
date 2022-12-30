const express = require('express')
const http = require("http")
const https = require("https")
const fs = require("fs")
const open = require("open")
const ejs = require("ejs")
const { json, urlencoded, text } = require('body-parser')
const cookieParser = require('cookie-parser')


require("./app/setup").setup();
const {createOrganisation, getOrganisations, createClasses, createTutor, deleteOrganisation, addClass, setHour, deleteHour} = require("./app/organisation")


const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))
const organisations = require("./app/organisation")

// open(`http://localhost:${config.http}`)

const app = express()
app.set("view engine", "ejs")

app.use(json())
app.use(urlencoded({extended:false}))
app.use(text())

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
        classes : organisation.classes
    })
})
app.get("/organisation/:name/tutors",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("tutors")
})
app.get("/organisation/:name/subjects",(req,res)=>{
    let organisations = getOrganisations()
    if(!organisations.find(e=>{return e.name == req.params.name})){
        res.render("organNotFound")
        return;
    }
    let organisation = organisations.find(e=>{return e.name == req.params.name})
    res.render("subjects")
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
    console.log(organisation);
    res.render("timetable",{
        organisation
    })
}).post("/timetable/setHour",async(req,res)=>{
    res.send(setHour(req.body.organ,req.body.class,req.body.day,req.body.hour,req.body.hourName))
}).post("/timetable/deleteHour",async(req,res)=>{
    res.send(deleteHour(req.body.organ,req.body.class,req.body.day,req.body.hour))
})