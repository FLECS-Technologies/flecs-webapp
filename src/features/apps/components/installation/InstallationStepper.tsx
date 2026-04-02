import React from 'react';
import InstallApp from './InstallApp';
import SideloadApp from './SideloadApp';
import UpdateApp from './UpdateApp';
import DeviceActivationStep from './DeviceActivationStep';
type App = any;

interface InstallationStepperProps {
  app?: any;
  version?: string;
  sideload?: boolean;
  update?: boolean;
  onStateChange?: (state: any) => void;
}

const steps = ['Check Device Activation', 'Installing', 'Done'];

function InstallationStepper({ app, version, sideload, update, onStateChange }: InstallationStepperProps) {
  const myApp = app as App;
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = (status?: number) => {
    if (!status) { setActiveStep(activeStep + 1); } else { setActiveStep(status); }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return <DeviceActivationStep handleNext={handleNext} />;
      case -1: case 1: case 2: case 3: case 4:
        if (!(sideload || update)) return <InstallApp app={app} version={version || myApp?.appKey.version} handleActiveStep={handleNext} onStateChange={onStateChange} />;
        else if (sideload) return <SideloadApp manifest={app} handleActiveStep={handleNext} />;
        else if (update) return <UpdateApp app={app} from={myApp?.installedVersions[0]} to={version} handleActiveStep={handleNext} onStateChange={onStateChange} />;
        else return <div>Not Found</div>;
      default: return <div>Not Found</div>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index <= activeStep ? 'bg-brand text-white' : 'bg-white/10 text-muted'}`}>{index + 1}</div>
            <span className={`text-sm ${index <= activeStep ? 'font-semibold' : 'text-muted'}`}>{label}</span>
            {index < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>
      {renderStepContent(activeStep)}
    </div>
  );
}

export default InstallationStepper;
