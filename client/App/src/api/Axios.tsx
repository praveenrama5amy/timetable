import axios from "axios";

export const corsPort = 8181
const hostUrl = `${window.location.protocol}//${window.location.hostname}:${corsPort || window.location.port}`

const instance = axios.create({
    baseURL: hostUrl
})


export default instance;