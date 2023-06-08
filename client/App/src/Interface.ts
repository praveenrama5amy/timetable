export interface Organisation{
    name : string
}
export interface GeneralSettings{
    hoursPerDay: number
    daysPerWeek : number
}
export interface Subject{
    minimumHours: number
    maximumHours: number
    name: string
    classes: Array<string>
    tutors:Array<string>
}
export interface Room{
    name: string
    subjects: Array<{
        name: string,
        tuttors : [string]
    }>
}
export interface Tutor{
    name: string,
    minimumHours: number,
    maximumHours: number
    availableHour: number
    subjects: [string]
}
