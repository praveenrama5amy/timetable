const {createOrganisation, getOrganisations, createClasses, createTutor, deleteOrganisation, addClass, setHour, deleteHour, getTutorFullDetails} = require("./organisation")
var checkHourAvailability = (organName) => {
    let organisation = getOrganisations(organName)
    if(organisation.error){
        return organisation
    }
    let totalHours = organisation.general.daysPerWeek * organisation.general.hoursPerDay;
    let allClasses = {}
    organisation.classes.forEach(room => {
        let minimumHours = 0
        let maximumHours = 0
        room.subjects.forEach(subject => {
            subject = organisation.subjects.find(e => {return e.name == subject.name})
            minimumHours += subject.minimumHours
            maximumHours += subject.maximumHours
        })
        if(totalHours <= maximumHours && totalHours >= minimumHours){
            allClasses[room.name] = { stat: true, };
        }
        else if(totalHours > maximumHours){
            allClasses[room.name] = { stat: false, reason: `underflow`, count: totalHours - maximumHours }
        }
        else if(totalHours < minimumHours){
            allClasses[room.name] = { stat: false, reason: `overflow`, count: minimumHours - totalHours }
        }
    });
    return allClasses;
}
var checkTutors = (organName) => {
    let organisation = getOrganisations(organName)
    if(organisation.error){
        return organisation
    }
    let allTutors = {}
    let tutors = getTutorFullDetails(organName);
    tutors.forEach(tutor => {
        allTutors[tutor.name] = {}
        if(tutor.minimumHours <= tutor.allotedHours && tutor.allotedHours <= tutor.maximumHours){
            allTutors[tutor.name] = {
                stat : true
            }
        }else{
            if(tutor.minimumHours > tutor.allotedHours){
                allTutors[tutor.name] = { stat : false, reason : "underflow", count : tutor.minimumHours - tutor.allotedHours };
            }
            if(tutor.maximumHours < tutor.allotedHours){
                allTutors[tutor.name] = { stat : false, reason : "overflow", count : tutor.allotedHours - tutor.maximumHours };
            }
        }
    })
    return allTutors;
}
var checkSubjects = (organName) => {
    let organisation = getOrganisations(organName);
    if(organisation.error){
        return organisation;
    }
    let allSubjects = {};
    organisation.subjects.forEach(subject => {
        allSubjects[subject.name] = {};
        let allotedHours = 0;
        organisation.classes.forEach(room => {
            if(room.subjects.find(e => e.name == subject.name)){

            }
        })
    })
    return "Under Development"
}

module.exports.checkHourAvailability = checkHourAvailability;
module.exports.checkTutors = checkTutors; 