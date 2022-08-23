import React from 'react'
import Chat from './pages/Chat'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/chat" element={<Chat />} />
        </Routes>
    </BrowserRouter>
  )
}