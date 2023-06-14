export interface Organisation {
    name: string;
    classes: Array<Room>;
    tutors: Array<Tutor>;
    subjects: Array<Subject>;
    general: GeneralSettings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timetable: any
}
export interface GeneralSettings {
    hoursPerDay: number
    daysPerWeek: number
}
export interface Subject {
    minimumHours: number
    maximumHours: number
    name: string
    classes: Array<string>
    tutors: Array<string>
}
export interface Room {
    name: string
    subjects: Array<{
        name: string,
        tutors: [string]
    }>
}
export interface Tutor {
    name: string,
    minimumHours: number,
    maximumHours: number
    availableHour: number;
    allotedHours: number;
    subjects: [string];
}
export interface Summary {
    hour: HourSummary;
    tutors: TutorSummary
}
export interface HourSummary {
    [key: string]: {
        stat: boolean;
        reason?: string;
        count?: number
    }
}
export interface TutorSummary {
    [key: string]: {
        stat: boolean;
        reason?: string;
        count?: number
    }
}
