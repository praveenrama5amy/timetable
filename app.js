const express = require('express')
const http = require("http")
const https = require("https")
const fs = require("fs")
const open = require("open")
const ejs = require("ejs")
const { json, urlencoded, text } = require('body-parser')
const cookieParser = require('cookie-parser')


require("./app/setup").setup();
const {createOrganisation, getOrganisations, createClasses, createTutor, deleteOrganisation} = require("./app/organisation")


const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))
const organisations = require("./app/organisation")

open(`http://localhost:${config.http}`)

const app = express()
app.set("view engine", "ejs")

app.use(json())
app.use(urlencoded({extended:false}))
app.use(text())

app.use(cookieParser())
const xhttp = http.createServer(app).listen(config.http)
const xhttps = https.createServer(app).listen(config.https)
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
