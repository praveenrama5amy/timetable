var fs = require("fs");
const { totalmem } = require("os");
const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf-8" }))

var createOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    let oldOrganisations = fs.readdirSync(`./data/${config.directories.recycleBin}`)
    if (organisations.includes(name) || oldOrganisations.includes(name)) {
        return {
            error: "Organisation Already Exists",
            code: 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    createTutor(name)
    createClasses(name)
    createGeneralConfig(name)
    createTimeTable(name)
    return {
        res: "Organisation Created",
        resCode: 200
    }
}
var getOrganisations = (name) => {
    if (name == null) {
        let organisationsFiles = fs.readdirSync(`./data/${config.directories.organisations}`)
        let organisations = [];
        organisationsFiles.forEach(e => {
            createMissingFiles(e)
            organisations.push({
                name: e,
                general: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.general}`, { encoding: "utf8" })),
                subjects: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.subjects}`, { encoding: "utf8" })),
                tutors: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.tutors}`, { encoding: "utf8" })),
                classes: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.classes}`, { encoding: "utf8" })),
                timetable: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.timetable}`, { encoding: "utf8" })),
            })
        })
        return organisations;
    }
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if (!organisations.includes(name)) {
        return {
            error: "Organisation Not Found",
            code: 2
        }
    }
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}`)
    createMissingFiles(name)
    let organisation = {
        name: name,
        general: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.general}`, { encoding: "utf8" })),
        subjects: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.subjects}`, { encoding: "utf8" })),
        tutors: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.tutors}`, { encoding: "utf8" })),
        classes: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.classes}`, { encoding: "utf8" })),
        timetable: JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.timetable}`, { encoding: "utf8" }))
    }
    return organisation;
}
var editOrganisationName = (name, newName) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if (!organisations.includes(name)) {
        return {
            error: "Organisation Not Found",
            code: 2
        }
    }
    if (newName == null || newName == "") return {
        error: "New Name Not Found",
        code: 404
    }
    fs.renameSync(`./data/${config.directories.organisations}/${name}`, `./data/${config.directories.organisations}/${newName}`)
    return {
        res: "Organisation Edited",
        resCode: 200
    }
}
var deleteOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if (!organisations.includes(name)) {
        return {
            error: "Organisation Not Found",
            code: 2
        }
    }

    if (fs.readdirSync(`./data/${config.directories.recycleBin}/`).includes(name)) {
        fs.rmSync(`./data/${config.directories.recycleBin}/${name}`, { force: true, recursive: true })
    }
    fs.mkdirSync(`./data/${config.directories.recycleBin}/${name}`);
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}`, { withFileTypes: true })
    files.forEach(e => {
        if (e.isFile()) {
            fs.copyFileSync(`./data/${config.directories.organisations}/${name}/${e.name}`, `./data/${config.directories.recycleBin}/${name}/${e.name}`)
        }
    })
    fs.rmSync(`./data/${config.directories.organisations}/${name}`, { force: true, recursive: true })
    return {
        res: "Organisation Deleted",
        resCode: 200
    }
}
var restoreOrganisation = (name) => {
    let backedUpOrganisations = fs.readdirSync(`./data/${config.directories.recycleBin}`)
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if (!backedUpOrganisations.includes(name)) {
        return {
            error: "No Organisations Found",
            code: 2
        }
    }
    if (organisations.includes(name)) {
        return {
            error: "Organisations Already Found",
            code: 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    let backupDir = fs.readdirSync(`./data/${config.directories.recycleBin}/${name}`)
    backupDir.forEach(e => {
        fs.copyFileSync(`./data/${config.directories.recycleBin}/${name}/${e}`, `./data/${config.directories.organisations}/${name}/${e}`);
    })
    fs.rmSync(`./data/${config.directories.recycleBin}/${name}`, { force: true, recursive: true })
}
var createSubjects = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.subjects}`, "[]")
}
var createTutor = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.tutors}`, "[]")
}
var createClasses = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.classes}`, "[]")
}
var createGeneralConfig = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.general}`, `{
        "hoursPerDay" : 6,
        "daysPerWeek" : 5
    }`)
}
var createTimeTable = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`, `{}`)
}
var createMissingFiles = (organisationName) => {
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${organisationName}`)
    if (!files.includes(`${config.directories.subjects}`)) {
        createSubjects(organisationName)
    }
    if (!files.includes(`${config.directories.tutors}`)) {
        createTutor(organisationName)
    }
    if (!files.includes(`${config.directories.classes}`)) {
        createClasses(organisationName)
    }
    if (!files.includes(`${config.directories.general}`)) {
        createGeneralConfig(organisationName)
    }
    if (!files.includes(`${config.directories.timetable}`)) {
        createTimeTable(organisationName)
    }
}
var addClass = (organisationName, className) => {
    let organisation = getOrganisations(organisationName);
    className = className.trim();
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    let classes = organisation.classes;
    if (classes.find(e => { return e.name == className })) {
        return {
            code: 3,
            error: "Class Already Exist In The Organisation"
        };
    }
    classes.push({ name: className, subjects: [] })
    setClass(organisationName, classes)
    initializeTimetable(organisationName);
}
var deleteClass = (organisationName, className) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    let classes = organisation.classes;
    if (!classes.find(e => { return e.name == className })) {
        return {
            code: 404,
            error: "Class Not Found"
        };
    }
    classes = classes.filter(room => room.name != className)
    setClass(organisationName, classes)
    return {
        code: 200,
        success: "Class Deleted"
    }
    initializeTimetable(organisationName);
}
var setClass = (organisationName, classes) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.classes}`, JSON.stringify(classes))
}
var setHour = (organisationName, objectName, day, hour, hourName) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let tutors = organisation.tutors
    if (classes.find(e => { return e.name == objectName })) {
        let clas = classes.find(e => { return e.name == objectName })
        if (clas == null) {
            return { code: 404, error: "Class Not Found" };
        }
        let subjects = clas.subjects;
        if (subjects.find(e => { return e.name == hourName })) {
            if (timetable[objectName] == null) {
                timetable[objectName] = {};
            }
            if (timetable[objectName][`day${day}`] == null) {
                timetable[objectName][`day${day}`] = {};
            }
            timetable[objectName][`day${day}`][`hour${hour}`] = hourName
            clas.subjects.find(e => e.name == hourName).tutors.forEach(tutor => {
                timetable[tutor][`day${day}`][`hour${hour}`] = clas.name
            })
            fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`, JSON.stringify(timetable))
            return {
                code: 200, message: "Hour Set"
            }
        }
        else {
            return { code: 404, error: "Subject Not Found" }
        }
    }
    else if (tutors.find(tutor => tutor.name == objectName)) {
        let clas = classes.find(room => room.name == hourName)
        if (clas == null) return { error: "Class Not Found" }
        return {
            error: "Cant set Hour for Tutor specified object due to conflict"
        }
    }
    else {
        return { error: "Invalid Object Parsed" }
    }
}

var deleteHour = (organisationName, objectName, day, hour) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let tutors = organisation.tutors;
    if (classes.find(e => { return e.name == objectName })) {
        let clas = classes.find(e => { return e.name == objectName })
        let subjectName = timetable[objectName][`day${day}`][`hour${hour}`];
        if (subjectName != null) {
            clas.subjects.find(subject => subject.name == subjectName).tutors.forEach(tutor => {
                timetable[tutor][`day${day}`][`hour${hour}`] = null
            })
        }
        timetable[objectName][`day${day}`][`hour${hour}`] = null
        fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`, JSON.stringify(timetable))
        return {
            code: 200, message: "Hour Deleted"
        }
    }
    else if (tutors.find(e => { return e.name == objectName })) {
        let tutor = tutors.find(e => e.name == objectName)
        let className = timetable[objectName][`day${day}`][`hour${hour}`];
        if (className != null) {
            let clas = classes.find(e => { return e.name == className })
            let subjectName = timetable[clas.name][`day${day}`][`hour${hour}`];
            clas.subjects.find(e => e.name == subjectName).tutors.forEach(tutor => {
                timetable[tutor][`day${day}`][`hour${hour}`] = null
            })
            timetable[className][`day${day}`][`hour${hour}`] = null
        }
        fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`, JSON.stringify(timetable))
        return {
            code: 200, message: "Hour Deleted"
        }
    }
    else {
        return { code: 404, error: "Class or Tutor Parsed is Not Found" };
    }
}
var setSubject = (organisationName, subjects) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.subjects}`, JSON.stringify(subjects))
}
var addSubject = (organisationName, subjectName, minimumHours, maximumHours, tutors, classes) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    subjectName = subjectName.trim();
    let subjects = organisation.subjects;
    let tutorsOld = organisation.tutors;
    let classesOld = organisation.classes;
    if (subjects.find(subject => { return subject.name == subjectName })) {
        return { error: "Subject Already Exists", code: 4 };
    }
    minimumHours = parseInt(minimumHours);
    maximumHours = parseInt(maximumHours);
    let data = {
        name: subjectName,
        minimumHours,
        maximumHours,
        tutors: [],
        classes: []
    }
    tutors.forEach(tutor => {
        if (tutorsOld.find(e => e.name == tutor)) data.tutors.push(tutor)
    })
    classes.forEach(room => {
        if (classesOld.find(e => e.name == room)) data.classes.push(room)
    })
    subjects.push(data)
    subjects = subjects.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setSubject(organisationName, subjects);
    if (tutors == null) {
        return {
            code: 200, message: "Subject Added"
        }
    }
    //adding Tutors
    tutors.forEach(tutor => {
        tutor = tutorsOld.find(e => { return e.name == tutor })
        if (tutor.subjects.includes(subjectName)) {
            return;
        }
        tutor.subjects.push(subjectName)
    })
    tutorsOld = tutorsOld.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setTutor(organisationName, tutorsOld)
    //adding Class
    classes.forEach(room => {
        room = classesOld.find(e => { return e.name == room })
        if (room.subjects.find(subject => subject.name == subjectName)) {
            return;
        }
        room.subjects.push({ name: subjectName, tutors: [] })
        room.subjects = room.subjects.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    })
    classesOld = classesOld.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setClass(organisationName, classesOld);
    return {
        code: 200, message: "Subject Added"
    }
}
var setTutor = (organisationName, tutors) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.tutors}`, JSON.stringify(tutors))
}
var addTutor = (organisationName, tutorName, minimumHours, maximumHours, subjects) => {
    let organisation = getOrganisations(organisationName)
    tutorName = tutorName.trim();
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    if (tutors.find(tutor => { return tutor.name == tutorName })) {
        return { error: "Tutor Already Exists", code: 5 };
    }
    minimumHours = parseInt(minimumHours);
    maximumHours = parseInt(maximumHours);
    let data = {
        name: tutorName,
        minimumHours,
        maximumHours,
        subjects: [],
        classes: []
    }
    if (subjects != null) {
        subjects.forEach(subject => {
            if (organisation.subjects.find(e => { return e.name == subject })) {
                data.subjects.push(subject)
            }
        })
    }
    tutors.push(data);
    tutors = tutors.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    setTutor(organisationName, tutors);
    initializeTimetable(organisationName)
    return {
        code: 200, message: "Tutor Added"
    };
}
var editTutor = (organName, tutorName, minimumHours, maximumHours) => {
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    let tutor = tutors.find(tutor => { return tutor.name == tutorName })
    minimumHours = parseInt(minimumHours);
    maximumHours = parseInt(maximumHours);
    if (tutor == null) {
        return { error: "Tutor Not Found", code: 404 };
    }
    tutors = tutors.map(tutor => {
        if (tutor.name == tutorName) {
            return { ...tutor, minimumHours, maximumHours }
        }
        else {
            return tutor
        }
    })
    setTutor(organName, tutors)
    return { code: 200, success: "Tutor Edited" }
}
var deleteTutor = (organisationName, tutorName) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    let classes = organisation.classes;
    let timetable = organisation.timetable;
    if (!tutors.find(tutor => { return tutor.name == tutorName })) {
        return { error: "Tutor Not Exists", code: 404 };
    }
    let tutor = tutors.find(tutor => tutor.name == tutorName);
    removeAllHoursOfTutor(organisationName, tutorName)
    tutors = tutors.filter(tutor => tutor.name != tutorName)
    tutors = tutors.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    for (let i = 0; i < classes.length; i++) {
        for (let j = 0; j < classes[i].subjects.length; j++) {
            classes[i].subjects[j].tutors = classes[i].subjects[j].tutors.filter(tutor => tutor != tutorName)
        }
    }
    setTutor(organisationName, tutors);
    setClass(organisationName, classes)
    return {
        code: 200, message: "Tutor Deleted"
    };
}
var editTutorSubject = (organisationName, tutorName, subjectName, value) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;

    let tutor = tutors.find(tutor => { return tutor.name == tutorName });
    if (tutor == null) return { error: "Tutor Not Exists", code: 404 }
    let subject = subjects.find(subject => { return subject.name == subjectName })
    if (subject == null) return { error: "Subject Not Exists", code: 404 }
    if (value == true && !tutor.subjects.includes(subjectName)) {
        tutor.subjects.push(subjectName);
    }
    if (value == true && !subject.tutors.includes(tutorName)) {
        subject.tutors.push(tutorName);
    }
    if (value == false && tutor.subjects.includes(subjectName)) {
        tutor.subjects = tutor.subjects.filter(subject => { return subject != subjectName })
    }
    if (value == false && subject.tutors.includes(tutorName)) {
        subject.tutors = subject.tutors.filter(tutor => { return tutor != tutorName })
    }
    setSubject(organisationName, subjects)
    setTutor(organisationName, tutors)
    return { code: 200, message: "Tutor Subject Edited" }
}
var editClassSubject = (organisationName, className, subjectName, value) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;
    let classes = organisation.classes;
    let room = classes.find(room => { return room.name == className });
    if (room == null) return { error: "Class Not Exists", code: 404 }
    let subject = subjects.find(subject => { return subject.name == subjectName })
    if (subject == null) return { error: "Subject Not Exists", code: 404 }
    if (value == true && !room.subjects.find(subject => subject.name == subjectName)) {
        room.subjects.push({ name: subjectName, tutors: [] });
        room.subjects = room.subjects.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        setClass(organisationName, classes)
    }
    if (value == true && !subject.classes.includes(className)) {
        subject.classes.push(className);
        subject.classes = subject.classes.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        setSubject(organisationName, subjects)
    }
    if (value == false && room.subjects.find(subject => subject.name == subjectName)) {
        room.subjects = room.subjects.filter(subject => { return subject.name != subjectName })
        setClass(organisationName, classes)
    }
    if (value == false && subject.classes.includes(className)) {
        subject.classes = subject.classes.filter(room => { return room != className })
        setSubject(organisationName, subjects)
    }
    return { code: 200, message: "Subject Classes Edited" }
}
var editSubjectTutorOfClass = (organisationName, className, subjectName, tutorName, value) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let tutors = getTutorFullDetails(organisation.name);
    let subjects = organisation.subjects;
    let classes = organisation.classes;
    let room = classes.find(room => { return room.name == className });
    if (room == null) return { error: "Class Not Exists", code: 404 }
    let subject = room.subjects.find(subject => { return subject.name == subjectName })
    if (subject == null) return { error: "Subject Not Exists", code: 404 }
    let tutor = tutors.find(tutor => { return tutor.name == tutorName })
    if (tutor == null) return { error: "Tutor Not Exists", code: 404 }
    if (value == true && !subject.tutors.includes(tutorName)) {
        subject.tutors.push(tutorName);
        // subject.tutors.sort(function(a,b) {
        //     var x = a.toLowerCase();
        //     var y = b.toLowerCase();
        //     return x < y ? -1 : x > y ? 1 : 0;
        // });
    }
    if (value == false && subject.tutors.includes(tutorName)) {
        subject.tutors = subject.tutors.filter(tutor => tutor != tutorName);
    }
    setClass(organisationName, classes);
    updateSubjectsTutors(organisation.name)
    updateTutorsSubjects(organisation.name)
    tutors = getTutorFullDetails(organisation.name);
    tutor = tutors.find(tutor => { return tutor.name == tutorName })
    if (tutor.availableHours < 0) {
        return {
            code: 401, error: `${tutorName} exceeding his Maximum work load`
        }
    }
    else {
        return {
            code: 200, message: `${tutorName} Assigned to ${subjectName} for ${className}`
        }
    }
}
function updateTutorsSubjects(organName) {
    let organ = getOrganisations(organName);
    if (organ.error) return organ
    let classes = organ.classes
    let subjects = organ.subjects
    let tutors = organ.tutors
    tutors.forEach(tutor => {
        tutor.subjects = []
        classes.forEach(room => {
            room.subjects.forEach(subject => {
                subject.tutors.forEach(subTutor => {
                    if (tutor.name == subTutor) {
                        if (!tutor.subjects.includes(subject.name)) {
                            tutor.subjects.push(subject.name)
                        }
                    }
                })
            })
        })
    })
    setTutor(organName, tutors)
}
function updateSubjectsTutors(organName) {
    let organ = getOrganisations(organName);
    if (organ.error) return organ
    let classes = organ.classes
    let subjects = organ.subjects
    let tutors = organ.tutors
    subjects.forEach(subject => {
        subject.tutors = []
        classes.forEach(room => {
            room.subjects.forEach(roomSubjects => {
                if (roomSubjects.name == subject.name) {
                    roomSubjects.tutors.forEach(tutor => {
                        if (!subject.tutors.includes(tutor)) {
                            subject.tutors.push(tutor)
                        }
                    })
                }
            })
        })
    })
    setSubject(organName, subjects)
}
var getTutorFullDetails = (organisationName) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let tutors = organisation.tutors;
    let subjects = organisation.subjects;
    let classes = organisation.classes;
    tutors.forEach(tutor => {
        tutor.allotedHours = 0;
        tutor.availableHours = tutor.maximumHours;
    })
    classes.forEach(room => {
        room.subjects.forEach(subject => {
            subject.tutors.forEach(tutor => {
                subject = subjects.find(e => subject.name == e.name);
                tutors.find(e => e.name == tutor).allotedHours += subject.minimumHours;
                tutors.find(e => e.name == tutor).availableHours -= subject.minimumHours;
            })
        })
    })
    return tutors
}
var initializeTimetable = (organisationName) => {
    let organisation = getOrganisations(organisationName)
    if (organisation.error) {
        return organisation
    }
    let timetable = organisation.timetable;
    let classes = organisation.classes;
    let tutors = organisation.tutors;
    classes.forEach(room => {
        if (timetable[room.name] == null) {
            timetable[room.name] = {};
        }
        for (let i = 1; i <= organisation.general.daysPerWeek; i++) {
            if (timetable[room.name][`day${i}`] == null) {
                timetable[room.name][`day${i}`] = {}
                for (let j = 1; j <= organisation.general.hoursPerDay; j++) {
                    if (timetable[room.name][`day${i}`][`hour${j}`] == null) {
                        timetable[room.name][`day${i}`][`hour${j}`] = null
                    }
                }
            }
        }
    })
    tutors.forEach(tutor => {
        if (timetable[tutor.name] == null) {
            timetable[tutor.name] = {};
        }
        for (let i = 1; i <= organisation.general.daysPerWeek; i++) {
            if (timetable[tutor.name][`day${i}`] == null) {
                timetable[tutor.name][`day${i}`] = {}
                for (let j = 1; j <= organisation.general.hoursPerDay; j++) {
                    if (timetable[tutor.name][`day${i}`][`hour${j}`] == null) {
                        timetable[tutor.name][`day${i}`][`hour${j}`] = null
                    }
                }
            }
        }
    })
    setTimeTable(organisationName, timetable)
}
var setTimeTable = (organisationName, timetable) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.timetable}`, JSON.stringify(timetable))
}
var removeAllHoursOfTutor = (organName, tutorName) => {
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation
    }
    let timetable = organisation.timetable;
    let tutors = organisation.tutors
    let classes = organisation.classes
    if (!tutors.find(tutor => tutor.name == tutorName)) {
        return {
            code: 404,
            error: "Tutor Not Found"
        }
    }
    for (const e in timetable) {
        const object = timetable[e];
        if (!classes.find(room => room.name == e)) return
        for (const f in object) {
            const day = object[f];
            for (const hour in day) {
                const subject = day[hour];
                const tutorsOfSubject = getTutorOfSubjectOfClass(organName, e, subject)
                if (tutorsOfSubject.includes(tutorName)) {
                    let dayNumber = parseInt(f.slice(3))
                    let hourNumber = parseInt(hour.slice(4))
                    console.log(deleteHour(organName, e, dayNumber, hourNumber));
                }
            }
        }
    }
}
var getTutorOfSubjectOfClass = (organName, className, subjectName) => {
    let organisation = getOrganisations(organName);
    if (organisation.error) {
        return organisation
    }
    let room = organisation.classes.find(room => room.name == className)
    let sub = room.subjects.find(subject => subject.name == subjectName)
    let tutors = (sub != null) ? sub.tutors : []
    return tutors
}
var createTempTimetable = (organName) => {
    if (organName == null) throw "Parameter Missing"
    let organisation = getOrganisations(organName);
    if (organisation.error) return organisation;
    if (!fs.readdirSync(`./data/${config.directories.organisations}/${organName}/`).includes(`temp_${config.directories.timetable}`)) {
        fs.cpSync(`./data/${config.directories.organisations}/${organName}/${config.directories.timetable}`, `./data/${config.directories.organisations}/${organName}/temp_${config.directories.timetable}`)
        return {
            success: "File Created"
        }
    }
    else {
        return {
            error: "File Already Exists"
        }
    }
}
var deleteTempTimetable = (organName) => {
    if (organName == null) throw "Parameter Missing"
    let organisation = getOrganisations(organName);
    if (organisation.error) return organisation;
    if (fs.readdirSync(`./data/${config.directories.organisations}/${organName}/`).includes(`temp_${config.directories.timetable}`)) {
        fs.unlinkSync(`./data/${config.directories.organisations}/${organName}/temp_${config.directories.timetable}`)
        return {
            success: "File Deleted"
        }
    }
    else {
        return {
            error: "File Not Exists"
        }
    }
}
var isHasTemp = (organName) => {
    if (organName == null) throw "Parameter Missing"
    let organisation = getOrganisations(organName);
    if (organisation.error) return organisation;
    if (fs.readdirSync(`./data/${config.directories.organisations}/${organName}/`).includes(`temp_${config.directories.timetable}`)) {
        return true
    }
    else {
        return false
    }
}
var swapTempTimetable = (organName) => {
    if (organName == null) throw "Parameter Missing"
    let organisation = getOrganisations(organName);
    if (organisation.error) return organisation;
    if (!fs.readdirSync(`./data/${config.directories.organisations}/${organName}/`).includes(`temp_${config.directories.timetable}`)) {
        return {
            error: "Temp File Not Exists"
        }
    }
    if (!fs.readdirSync(`./data/${config.directories.organisations}/${organName}/`).includes(`${config.directories.timetable}`)) {
        createMissingFiles(organName)
    }
    let timeTable = fs.readFileSync(`./data/${config.directories.organisations}/${organName}/${config.directories.timetable}`, { encoding: "utf-8" })
    let timeTableTemp = fs.readFileSync(`./data/${config.directories.organisations}/${organName}/temp_${config.directories.timetable}`, { encoding: "utf-8" })
    fs.writeFileSync(`./data/${config.directories.organisations}/${organName}/temp_${config.directories.timetable}`, timeTable, { encoding: "utf-8" })
    fs.writeFileSync(`./data/${config.directories.organisations}/${organName}/${config.directories.timetable}`, timeTableTemp, { encoding: "utf-8" })
}
var setTimetable = (organName, timetable) => {
    if (organName == null) throw "Parameter Missing"
    let organisation = getOrganisations(organName);
    if (organisation.error) return organisation;
    fs.writeFileSync(`./data/${config.directories.organisations}/${organName}/${config.directories.timetable}`, JSON.stringify(timetable), { encoding: "utf-8" })
}

var setGeneralSettings = (organisationName, { daysPerWeek, hoursPerDay }) => {
    let organisation = getOrganisations(organisationName);
    if (organisation.code && organisation.code == 2) {
        return organisation
    }
    let generalSettings = { ...organisation.general, daysPerWeek, hoursPerDay }
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.general}`, JSON.stringify(generalSettings))
    setTimeTable(organisationName, {})
    initializeTimetable(organisationName)
}
module.exports = {
    setGeneralSettings
}
module.exports.createOrganisation = createOrganisation;
module.exports.getOrganisations = getOrganisations;
module.exports.editOrganisationName = editOrganisationName;
module.exports.deleteOrganisation = deleteOrganisation;
module.exports.restoreOrganisation = restoreOrganisation;
module.exports.createClasses = createClasses;
module.exports.createTutor = createTutor;
module.exports.deleteTutor = deleteTutor;
module.exports.addClass = addClass;
module.exports.deleteClass = deleteClass;
module.exports.setClass = setClass;
module.exports.setHour = setHour;
module.exports.deleteHour = deleteHour;
module.exports.addSubject = addSubject;
module.exports.addTutor = addTutor;
module.exports.setTutor = setTutor;
module.exports.editTutor = editTutor;
module.exports.editTutorSubject = editTutorSubject;
module.exports.editClassSubject = editClassSubject;
module.exports.editSubjectTutorOfClass = editSubjectTutorOfClass;
module.exports.getTutorFullDetails = getTutorFullDetails;
module.exports.createTempTimetable = createTempTimetable;
module.exports.deleteTempTimetable = deleteTempTimetable;
module.exports.isHasTemp = isHasTemp;
module.exports.swapTempTimetable = swapTempTimetable;
module.exports.setTimetable = setTimetable;














function script() {
    let organ = getOrganisations("ksr");
    let subjects = organ.subjects;
    let tutors = organ.tutors;
    subjects.forEach(subject => {
        subject.tutors = [];
    })
    setSubject("ksr", subjects)
}
function script2() {
    let organ = getOrganisations("ksr");
    let subjects = organ.subjects;
    let tutors = organ.tutors;
    subjects.forEach(subject => {
        let tutor = tutors.filter(tutor => tutor.subjects.includes(subject.name));
        tutor.forEach(e => {
            subject.tutors.push(e.name)
        })
    })
    console.log(setSubject("ksr", subjects))
}

function script3() {
    let organ = getOrganisations("ksr")
    let tutors = organ.tutors
    tutors.forEach((tutor, index) => {
        tutors[index] = {
            "name": tutor.name,
            "minimumHours": tutor.minimumHours,
            "maximumHours": tutor.maximumHours,
            "subjects": tutor.subjects
        }
    })
    setTutor("ksr", tutors)
}