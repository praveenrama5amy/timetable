import { NavLink, useParams } from "react-router-dom"

const NavBar = () => {
    const { organName } = useParams()
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ padding: 0 }}>
            <div className="container-fluid">
                <a className="navbar-brand" href="#" style={{ fontSize: "30px", textTransform: "uppercase" }}>{organName}</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to={organName + "/classes"} style={{ textDecoration: "none", color: "inherit" }}>Classes</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/tutors"} style={{ textDecoration: "none", color: "inherit" }}>Tutors</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/subjects"} style={{ textDecoration: "none", color: "inherit" }}>Subjects</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/summary"} style={{ textDecoration: "none", color: "inherit" }}>Summary</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar