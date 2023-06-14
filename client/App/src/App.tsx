import './App.css'

import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from './Layout'
import Organisations from './pages/Organisations'
// import Organisation from './pages/organisation'
import Tutors from './pages/Tutors'
import Subjects from './pages/Subjects'
import Classes from './pages/Classes'
import Summary from './pages/Summary'
import Print from './pages/Print'
import Settings from './pages/Settings'


function App() {
    return (
        <div className='App'>
            <BrowserRouter >
                <Routes>
                    <Route element={<Organisations />} path=''></Route>
                    <Route path='/' element={<Layout />}>
                        <Route element={<Classes />} path='/:organName/classes'></Route>
                        <Route element={<Tutors />} path='/:organName/tutors'></Route>
                        <Route element={<Subjects />} path='/:organName/subjects'></Route>
                        <Route element={<Summary />} path='/:organName/summary'></Route>
                        <Route element={<Settings />} path='/:organName/settings'></Route>
                    </Route>
                    <Route element={<Print />} path='/:organName/print'></Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
