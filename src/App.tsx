import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/DashboardLayout'
import OverviewPage from './pages/OverviewPage'
import LiveFloorPage from './pages/LiveFloorPage'
import InventoryPage from './pages/InventoryPage'
import RevenuePage from './pages/RevenuePage'
import SettingsPage from './pages/SettingsPage'
import AiAssistantPage from './pages/AiAssistantPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="floor" element={<LiveFloorPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ai" element={<AiAssistantPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
