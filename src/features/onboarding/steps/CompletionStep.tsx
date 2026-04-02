import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

let hasBeenRendered = false;
export const resetCompletionStepState = () => { hasBeenRendered = false; };

const CompletionStepComponent: React.FC<{ onNext?: () => void; onPrevious?: () => void; onComplete?: () => void; isLoading?: boolean; error?: string }> = ({ onComplete }) => {
  const navigate = useNavigate();
  useEffect(() => { if (!hasBeenRendered) { hasBeenRendered = true; navigate('/device-login'); onComplete(); } }, [onComplete]);
  return (
    <div className="max-w-3xl mx-auto py-8 text-center">
      <h4 className="text-2xl font-semibold mb-4">Onboarding Complete!</h4>
      <p className="text-muted mb-2">Your device has been successfully configured and is ready to use.</p>
      <p className="text-muted">You can now start using your device with full administrative access.</p>
    </div>
  );
};


export default CompletionStepComponent;
