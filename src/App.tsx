import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import BunkSelection from '@/pages/BunkSelection';
import CamperDashboard from '@/pages/CamperDashboard';
import CamperLogin from '@/pages/CamperLogin';
import StaffDashboard from '@/pages/StaffDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import IndividualCamperProgress from '@/pages/IndividualCamperProgress';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bunk-selection" element={<BunkSelection />} />
          <Route path="/camper-login" element={<CamperLogin />} />
          <Route path="/camper" element={<CamperDashboard />} />
          <Route path="/camper-progress" element={<IndividualCamperProgress />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;