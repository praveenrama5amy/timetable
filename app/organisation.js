var fs = require("fs");
const { totalmem } = require("os");
const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))

var createOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    let oldOrganisations = fs.readdirSync(`./data/${config.directories.recycleBin}`)
    if(organisations.includes(name) || oldOrganisations.includes(name)){
        return {
            error : "Organisation Already Exists",
            code : 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    createTutor(name)
    createClasses(name)
    createGeneralConfig(name)
    createTimeTable(name)
    return {
        res : "Organisation Created",
        resCode : 200
    }
}
var getOrganisations = (name) => {
    if(name == null){
        let organisationsFiles =  fs.readdirSync(`./data/${config.directories.organisations}`)
        let organisations = [];
        organisationsFiles.forEach(e=>{
            createMissingFiles(e)
            organisations.push({
                name : e,
                general : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.general}`,{encoding:"utf8"})),
                subjects : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.subjects}`,{encoding:"utf8"})),
                tutors : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.tutors}`,{encoding:"utf8"})),
                classes : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.classes}`,{encoding:"utf8"})),
                timetable : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.timetable}`,{encoding:"utf8"})),
            })
        })
        return organisations;
    }
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if(!organisations.includes(name)){
        return {
            error : "Organisation Not Found",
            code : 2
        }
    }
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}`)
    createMissingFiles(name)
    let organisation = {
        name : name,
        general : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.general}`,{encoding:"utf8"})),
        subjects : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.subjects}`,{encoding:"utf8"})),
        tutors : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.tutors}`,{encoding:"utf8"})),
        classes : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.classes}`,{encoding:"utf8"})),
        timetable : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.timetable}`,{encoding:"utf8"}))
    }
    return organisation;
}
var deleteOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if(!organisations.includes(name)){
        return {
            error : "Organisation Not Found",
            code : 2
        }
    }

    if(fs.readdirSync(`./data/${config.directories.recycleBin}/`).includes(name)){
        fs.rmSync(`./data/${config.directories.recycleBin}/${name}`,{force:true ,recursive:true})
    }
    fs.mkdirSync(`./data/${config.directories.recycleBin}/${name}`);
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}` ,{withFileTypes : true})
    files.forEach(e=>{
        if(e.isFile()){
            fs.copyFileSync(`./data/${config.directories.organisations}/${name}/${e.name}`,`./data/${config.directories.recycleBin}/${name}/${e.name}`)
        }
    })
    fs.rmSync(`./data/${config.directories.organisations}/${name}`,{force:true ,recursive:true})
    return {
        res : "Organisation Deleted",
        resCode : 200
    }
}
var restoreOrganisation = (name) => {
    let backedUpOrganisations = fs.readdirSync(`./data/${config.directories.recycleBin}`)
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if(!backedUpOrganisations.includes(name)){
        return{
            error : "No Organisations Found",
            code : 2
        }
    }
    if(organisations.includes(name)){
        return{
            error : "Organisations Already Found",
            code : 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    let backupDir = fs.readdirSync(`./data/${config.directories.recycleBin}/${name}`)
    backupDir.forEach(e=>{
        fs.copyFileSync(`./data/${config.directories.recycleBin}/${name}/${e}`,`./data/${config.directories.organisations}/${name}/${e}`);
    })
    fs.rmSync(`./data/${config.directories.recycleBin}/${name}`,{force:true ,recursive:true})
}
var createSubjects = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.subjects}`,"[]")
}
var createTutor = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.tutors}`,"[]")
}
var createClasses = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.classes}`, "[]")
}
var createGeneralConfig = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.general}`,`{
        "hoursPerDay" : 6,
        "daysPerWeek" : 5
    }`)
}
var createTimeTable = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`,`{}`)
}
var createMissingFiles = (organisationName) => {
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${organisationName}`)
    if(!files.includes(`${config.directories.subjects}`)){
        createSubjects(organisationName)
    }
    if(!files.includes(`${config.directories.tutors}`)){
        createTutor(organisationName)
    }
    if(!files.includes(`${config.directories.classes}`)){
        createClasses(organisationName)
    }
    if(!files.includes(`${config.directories.general}`)){
        createGeneralConfig(organisationName)
    }
    if(!files.includes(`${config.directories.timetable}`)){
        createTimeTable(organisationName)
    }
}
var addClass = (organisationName,className) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    let classes = organisation.classes;
    if(classes.find(e=>{return e.name == className})){
        return{
            code : 3,
            error : "Class Already Exist In The Organisation"
        };
    }
    classes.push({name : className,subjects : []})
    setClass(organisationName, classes)
}
var setClass = (organisationName , classes) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.classes}`,JSON.stringify(classes))
}
var setHour = (organisationName, className, day, hour, hourName) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let clas = classes.find(e=>{return e.name == className})
    if(clas == null){
        return{code:404,error:"Class Not Found"};
    }
    let subjects = clas.subjects;
    if(subjects.find(e=>{return e.name == hourName})){
        if(timetable[className] == null){
            timetable[className] = {};
        }
        if(timetable[className][`day${day}`] == null){
            timetable[className][`day${day}`] = {};
        }
        timetable[className][`day${day}`][`hour${hour}`] = hourName
        fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`,JSON.stringify(timetable))
        return{
            code : 200, message : "Hour Set"
        }
    }
    else{
        return{code:404,error:"Subject Not Found"}
    }
}
var deleteHour = (organisationName, className, day, hour) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let clas = classes.find(e=>{return e.name == className})
    if(clas == null){
        return{code:404,error:"Class Not Found"};
    }
    let subjects = clas.subjects;
    timetable[className][`day${day}`][`hour${hour}`] = null
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`,JSON.stringify(timetable))
    return{
        code : 200, message : "Hour Deleted"
    }
}
var setSubject = (organisationName , subjects) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.subjects}`,JSON.stringify(subjects))
}
var addSubject = (organisationName, subjectName, minimumHours, maximumHours, tutors) => {
    let organisation = getOrganisations(organisationName)
    if(organisation.error){
        return organisation
    }
    let subjects = organisation.subjects;
    let tutorsOld = organisation.tutors;
    if(subjects.find(subject => {return subject.name == subjectName})){
        return {error:"Subject Already Exists", code:4};
    }
    minimumHours = parseInt(minimumHours);
    maximumHours = parseInt(maximumHours);
    let data = {
        name : subjectName,
        minimumHours,
        maximumHours,
        tutors : [],
        classes : []
    }
    tutors.forEach(tutor => {
        if(tutorsOld.find(e => e.name == tutor))data.tutors.push(tutor)
    })
    subjects.push(data)
    subjects = subjects.sort(function(a,b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setSubject(organisationName, subjects);
    if(tutors == null){
        return{
            code : 200, message : "Subject Added"
        }
    }
    //adding Tutors
    tutors.forEach(tutor => {
        tutor = tutorsOld.find(e => {return e.name == tutor})
        if(tutor.subjects.includes(subjectName)){
            return;
        }
        tutor.subjects.push(subjectName)
    })
    tutorsOld = tutorsOld.sort(function(a,b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setTutor(organisationName, tutorsOld)
    return{
        code : 200, message : "Subject Added"
    }
}
var setTutor = (organisationName , tutors) => {
    let organisation = getOrganisations(organisationName);
    if(organisation.code && organisation.code == 2){
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.tutors}`,JSON.stringify(tutors))
}
var addTutor = (organisationName,tutorName,minimumHours,maximumHours,subjects) => {
    let organisation = getOrganisations(organisationName)
    if(organisation.error){
        return organisation
    }
    let tutors = organisation.tutors;
    if(tutors.find(tutor => {return tutor.name == tutorName})){
        return {error:"Tutor Already Exists", code:5};
    }
    minimumHours = parseInt(minimumHours);
    maximumHours = parseInt(maximumHours);
    let data = {
        name : tutorName,
        minimumHours,
        maximumHours,
        subjects : [],
        classes : []
    }
    subjects.forEach(subject => {
        if(organisation.subjects.find(e => {return e.name == subject})){
            data.subjects.push(subject)
        }
    })
    tutors.push(data);
    tutors = tutors.sort(function(a,b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setTutor(organisationName, tutors);
    return {
        code : 200, message : "Tutor Added"
    };
}
var editTutorSubject = (organisationName,tutorName,subjectName,value) => {
    let organisation = getOrganisations(organisationName)
    if(organisation.error){
        return organisation
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;

    let tutor = tutors.find(tutor => {return tutor.name == tutorName});
    if(tutor == null)return{error:"Tutor Not Exists", code:404}
    let subject = subjects.find(subject => {return subject.name == subjectName})
    if(subject == null)return{error:"Subject Not Exists", code:404}
    if(value == true && !tutor.subjects.includes(subjectName)){
        tutor.subjects.push(subjectName);
    }
    if(value == true && !subject.tutors.includes(tutorName)){
        subject.tutors.push(tutorName);
    }
    if(value == false && tutor.subjects.includes(subjectName)){
        tutor.subjects = tutor.subjects.filter(subject => {return subject != subjectName})
    }
    if(value == false && subject.tutors.includes(tutorName)){
        subject.tutors = subject.tutors.filter(tutor => {return tutor != tutorName})
    }
    setSubject(organisationName,subjects)
    setTutor(organisationName,tutors)
    return{code : 200, message : "Tutor Subject Edited"}
}
var editClassSubject = (organisationName,className,subjectName,value) => {
    let organisation = getOrganisations(organisationName)
    if(organisation.error){
        return organisation
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;
    let classes = organisation.classes;
    let room = classes.find(room => {return room.name == className});
    if(room == null)return{error:"Class Not Exists", code:404}
    let subject = subjects.find(subject => {return subject.name == subjectName})
    if(subject == null)return{error:"Subject Not Exists", code:404}
    if(value == true && !room.subjects.find(subject => subject.name == subjectName)){
        room.subjects.push({ name: subjectName, tutors: [] });
        setClass(organisationName,classes)
    }
    if(value == true && !subject.classes.includes(className)){
        subject.classes.push(className);
        setSubject(organisationName,subjects)
    }
    if(value == false && room.subjects.find(subject => subject.name == subjectName)){
        room.subjects = room.subjects.filter(subject => {return subject.name != subjectName})
        setClass(organisationName,classes)
    }
    if(value == false && subject.classes.includes(className)){
        subject.classes = subject.classes.filter(room => {return room != className})
        setSubject(organisationName,subjects)
    }
    return{code : 200, message : "Subject Classes Edited"}
}
module.exports.createOrganisation = createOrganisation;
module.exports.getOrganisations = getOrganisations;
module.exports.deleteOrganisation = deleteOrganisation;
module.exports.restoreOrganisation = restoreOrganisation;
module.exports.createClasses = createClasses;
module.exports.createTutor = createTutor;
module.exports.addClass = addClass;
module.exports.setClass = setClass;
module.exports.setHour = setHour;
module.exports.deleteHour = deleteHour;
module.exports.addSubject = addSubject;
module.exports.addTutor = addTutor;
module.exports.editTutorSubject = editTutorSubject;
module.exports.editClassSubject = editClassSubject;




























function script(){
    let organ = getOrganisations("ksr");
    let subjects = organ.subjects;
    let tutors = organ.tutors;
    subjects.forEach(subject => {
        subject.tutors = [];
    })
    setSubject("ksr",subjects)
}
function script2(){
    let organ = getOrganisations("ksr");
    let subjects = organ.subjects;
    let tutors = organ.tutors;
    subjects.forEach(subject => {
        let tutor = tutors.filter(tutor => tutor.subjects.includes(subject.name));
        tutor.forEach(e => {
            subject.tutors.push(e.name)
        })
    })
    console.log(setSubject("ksr",subjects))
}