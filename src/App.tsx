
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import NewCamperDashboard from '@/pages/NewCamperDashboard';
import CamperLogin from '@/pages/CamperLogin';
import StaffDashboard from '@/pages/StaffDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/camper-login" element={<CamperLogin />} />
          <Route path="/camper" element={<NewCamperDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
