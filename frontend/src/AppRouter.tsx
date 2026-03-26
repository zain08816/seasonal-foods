import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StatePage from './pages/StatePage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/state/:stateCode" element={<StatePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

