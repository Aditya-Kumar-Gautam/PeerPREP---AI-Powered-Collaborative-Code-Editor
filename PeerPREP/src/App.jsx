import { useState } from 'react'

import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Editor from './pages/Editor Page'
import Home from './pages/Home'
import {Toaster} from 'react-hot-toast';

function App() {
 
  return (
    <>
      <div>
        <Toaster position='top-right' ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<Home/>}></Route>
          <Route path='/editor/:roomID' element={<Editor/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
