import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthProviderStep from '@features/onboarding/steps/AuthProviderStep';
import SuperAdminStep from '@features/onboarding/steps/SuperAdminStep';
import CompletionStep from '@features/onboarding/steps/CompletionStep';

const STEPS = ['Auth Provider', 'Super Admin', 'Complete'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setCompleted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold mb-2">Welcome to FLECS</h4>
        <p className="text-base text-muted">
          Let's get your device ready in under 30 seconds.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex-1 h-1 rounded ${i <= step ? 'bg-brand' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Current step */}
      {step === 0 && <AuthProviderStep onComplete={next} />}
      {step === 1 && <SuperAdminStep onComplete={next} />}
      {step === 2 && <CompletionStep onComplete={() => setCompleted(true)} />}

      <div className="flex justify-between mt-6">
        <button onClick={() => navigate('/')} className="px-4 py-2 text-muted hover:text-white transition">
          Skip for now
        </button>
        {completed && (
          <button
            onClick={() => navigate('/device-login')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition"
          >
            Get started <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
