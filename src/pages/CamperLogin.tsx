
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CamperSelector from '@/components/CamperSelector';
import { CAMP_DATA } from '@/data/campData';

const CamperLogin = () => {
  const navigate = useNavigate();
  const [selectedBunkId, setSelectedBunkId] = useState<string>('');

  useEffect(() => {
    const bunkId = localStorage.getItem('selectedBunkId');
    if (!bunkId) {
      navigate('/');
      return;
    }
    setSelectedBunkId(bunkId);
  }, [navigate]);

  const handleCamperSelect = (camperId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === selectedBunkId);
    const camper = bunk?.campers.find(c => c.id === camperId);
    
    if (camper) {
      localStorage.setItem('currentCamperId', camperId);
      localStorage.setItem('currentCamperName', camper.name);
      localStorage.setItem('currentBunkId', selectedBunkId);
      navigate('/camper');
    }
  };

  const handleBack = () => {
    localStorage.removeItem('selectedBunkId');
    navigate('/');
  };

  if (!selectedBunkId) {
    return <div>Loading...</div>;
  }

  return (
    <CamperSelector
      bunkId={selectedBunkId}
      onSelectCamper={handleCamperSelect}
      onBack={handleBack}
    />
  );
};

export default CamperLogin;
