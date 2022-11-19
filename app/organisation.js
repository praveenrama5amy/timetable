var fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))

var createOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    let oldOrganisations = fs.readdirSync(`./data/${config.directories.recycleBin}`)
    if(organisations.includes(name) || oldOrganisations.includes(name)){
        return {
            error : "Organisation Already Exists",
            errCode : 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    createTutor(name)
    createClasses(name)
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
            organisations.push({
                name : e,
                tutors : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.tutors}`,{encoding:"utf8"})),
                classes : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${e}/${config.directories.classes}`,{encoding:"utf8"})) 
            })
        })
        return organisations;
    }
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if(!organisations.includes(name)){
        return {
            error : "Organisation Not Found",
            errCode : 2
        }
    }
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}`)
    if(!files.includes(`${config.directories.tutors}`)){
        createTutor(name)
    }
    if(!files.includes(`${config.directories.classes}`)){
        createClasses(name)
    }
    let organisation = {
        name : name,
        tutors : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.tutors}`,{encoding:"utf8"})),
        classes : JSON.parse(fs.readFileSync(`./data/${config.directories.organisations}/${name}/${config.directories.classes}`,{encoding:"utf8"}))
    }
    return organisation;
}
var deleteOrganisation = (name) => {
    let organisations = fs.readdirSync(`./data/${config.directories.organisations}`)
    if(!organisations.includes(name)){
        return {
            error : "Organisation Not Found",
            errCode : 2
        }
    }

    if(fs.readdirSync(`./data/${config.directories.recycleBin}/`).includes(name)){
        fs.rmSync(`./data/${config.directories.recycleBin}/${name}`,{force:true ,recursive:true})
    }
    fs.mkdirSync(`./data/${config.directories.recycleBin}/${name}`);
    let files = fs.readdirSync(`./data/${config.directories.organisations}/${name}` ,{withFileTypes : true})
    console.log(files);
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
            errCode : 2
        }
    }
    if(organisations.includes(name)){
        return{
            error : "Organisations Already Found",
            errCode : 1
        }
    }
    fs.mkdirSync(`./data/${config.directories.organisations}/${name}`)
    let backupDir = fs.readdirSync(`./data/${config.directories.recycleBin}/${name}`)
    backupDir.forEach(e=>{
        fs.copyFileSync(`./data/${config.directories.recycleBin}/${name}/${e}`,`./data/${config.directories.organisations}/${name}/${e}`);
    })
    fs.rmSync(`./data/${config.directories.recycleBin}/${name}`,{force:true ,recursive:true})
}
var createTutor = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.tutors}`,"[]")
}
var createClasses = (organisationName) => {
    fs.writeFileSync(`./data/${config.directories.organisations}/${organisationName}/${config.directories.classes}`,"[]")
}

module.exports.createOrganisation = createOrganisation;
module.exports.getOrganisations = getOrganisations;
module.exports.deleteOrganisation = deleteOrganisation;
module.exports.restoreOrganisation = restoreOrganisation;
module.exports.createClasses = createClasses;
module.exports.createTutor = createTutor;