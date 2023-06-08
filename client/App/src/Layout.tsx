import { Outlet } from "react-router-dom"
import NavBar from "./components/NavBar"
const Layout = () => {
    return (
        <div style={{ height: "100%" }}>
            <div>
                <NavBar></NavBar>
            </div>
            <div style={{ height: "100%" }}>
                <Outlet></Outlet>
            </div>
        </div>
    )
}

export default Layout