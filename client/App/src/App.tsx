import './App.css'

import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from './Layout'
import Organisations from './pages/Organisations'
// import Organisation from './pages/organisation'
import Tutors from './pages/Tutors'
import Subjects from './pages/Subjects'
import Classes from './pages/Classes'


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
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
