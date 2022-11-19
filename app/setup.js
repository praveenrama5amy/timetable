const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json",{encoding:"utf-8"}))

var setup = ()=>{
    let file = fs.readdirSync("./",{withFileTypes:true})
    let files = [];
    let folders = [];
    file.forEach(e=>{
        if(e.isFile()){
            files.push(e.name);
        }
        else if(e.isDirectory()){
            folders.push(e.name);
        }
    })
    if(!folders.includes("data")){
        fs.mkdirSync("./data/")
    }
    file = fs.readdirSync("./data",{withFileTypes:true});
    files = [];
    folders = [];
    file.forEach(e=>{
        if(e.isFile()){
            files.push(e.name);
        }
        else if(e.isDirectory()){
            folders.push(e.name);
        }
    })
    if(!folders.includes(config.directories.organisations)){
        fs.mkdirSync(`./data/${config.directories.organisations}`)
    }
    if(!folders.includes("recycle-bin")){
        fs.mkdirSync(`./data/${config.directories.recycleBin}/`)
    }
}
module.exports.setup = setup;