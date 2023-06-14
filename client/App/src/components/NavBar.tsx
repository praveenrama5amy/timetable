import { faBook, faChalkboardTeacher, faGear, faPersonShelter, faPoll } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
                            <NavLink to={organName + "/classes"} style={{ textDecoration: "none", color: "inherit" }}><FontAwesomeIcon icon={faPersonShelter} />Classes</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/tutors"} style={{ textDecoration: "none", color: "inherit" }}><FontAwesomeIcon icon={faChalkboardTeacher} />Tutors</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/subjects"} style={{ textDecoration: "none", color: "inherit" }}><FontAwesomeIcon icon={faBook} />Subjects</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/summary"} style={{ textDecoration: "none", color: "inherit" }}><FontAwesomeIcon icon={faPoll} />Summary</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={organName + "/settings"} style={{ textDecoration: "none", color: "inherit" }}><FontAwesomeIcon icon={faGear} /> Settings</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar