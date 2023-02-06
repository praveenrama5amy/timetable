const {createOrganisation, getOrganisations, createClasses, createTutor, deleteOrganisation, addClass, setHour, deleteHour} = require("./organisation")
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
    console.log(allClasses);
    return allClasses;
}
checkHourAvailability("ks");


module.exports.checkHourAvailability = checkHourAvailability;