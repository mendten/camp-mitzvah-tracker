
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BunkSelector from '@/components/BunkSelector';
import CamperSelector from '@/components/CamperSelector';

const CamperLogin = () => {
  const [selectedBunk, setSelectedBunk] = useState<string>('');
  const navigate = useNavigate();

  const handleSelectBunk = (bunkId: string) => {
    setSelectedBunk(bunkId);
  };

  const handleSelectCamper = (camperId: string) => {
    // Store the selected camper in localStorage for the dashboard
    localStorage.setItem('selectedCamper', camperId);
    localStorage.setItem('selectedBunk', selectedBunk);
    navigate('/camper');
  };

  const handleBack = () => {
    if (selectedBunk) {
      setSelectedBunk('');
    } else {
      navigate('/');
    }
  };

  if (!selectedBunk) {
    return <BunkSelector onSelectBunk={handleSelectBunk} />;
  }

  return (
    <CamperSelector 
      bunkId={selectedBunk} 
      onSelectCamper={handleSelectCamper}
      onBack={handleBack}
    />
  );
};

export default CamperLogin;
