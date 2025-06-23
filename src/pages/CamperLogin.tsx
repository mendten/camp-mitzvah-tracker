
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CamperSelector from '@/components/CamperSelector';
import { CAMP_DATA } from '@/data/campData';

const CamperLogin = () => {
  const navigate = useNavigate();
  const [selectedBunkId, setSelectedBunkId] = useState<string>('');

  useEffect(() => {
    console.log('CamperLogin - checking localStorage...');
    const bunkId = localStorage.getItem('selectedBunk');
    console.log('Found bunkId in localStorage:', bunkId);
    
    if (!bunkId) {
      console.log('No bunk selected, redirecting to home');
      navigate('/');
      return;
    }
    setSelectedBunkId(bunkId);
  }, [navigate]);

  const handleCamperSelect = (camperId: string) => {
    console.log('Camper selected:', camperId, 'from bunk:', selectedBunkId);
    
    const bunk = CAMP_DATA.find(b => b.id === selectedBunkId);
    const camper = bunk?.campers.find(c => c.id === camperId);
    
    if (camper) {
      console.log('Found camper:', camper);
      // Use consistent localStorage keys
      localStorage.setItem('selectedCamper', camperId);
      localStorage.setItem('selectedBunk', selectedBunkId);
      console.log('Navigating to camper dashboard...');
      navigate('/camper');
    } else {
      console.error('Camper not found!', { camperId, selectedBunkId, bunk, camper });
    }
  };

  const handleBack = () => {
    localStorage.removeItem('selectedBunk');
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
