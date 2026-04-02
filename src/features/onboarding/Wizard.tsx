import React, { createContext, useContext, useState, useCallback } from 'react';

// Minimal wizard — replaces the 724-line stepper abstraction

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
};

export interface WizardStepProps {
  isCompleted: () => Promise<boolean> | boolean;
}

export type WizardStep = React.ComponentType<WizardStepProps & Record<string, any>>;

export function WizardProvider({ children, totalSteps }: { children: React.ReactNode; totalSteps: number }) {
  const [currentStep, setCurrentStep] = useState(0);
  const next = useCallback(() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback((step: number) => setCurrentStep(step), []);
  return (
    <WizardContext.Provider value={{ currentStep, totalSteps, next, prev, goTo }}>
      {children}
    </WizardContext.Provider>
  );
}

export function MultiStepWizard({ steps, className }: { steps: React.ReactNode[]; className?: string }) {
  const { currentStep } = useWizard();
  return <div className={className}>{steps[currentStep]}</div>;
}

// Compatibility shim
export class WizardStepRegistry {
  private steps: { component: WizardStep; label: string }[] = [];
  register(component: WizardStep, label: string) { this.steps.push({ component, label }); return this; }
  getSteps() { return this.steps; }
  getLabels() { return this.steps.map((s) => s.label); }
}
