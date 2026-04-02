import React from 'react';
import WhiteLabelLogo, {
  useWhiteLabelLogo,
  showPoweredBy,
} from '@app/theme/WhiteLabelLogo';
import FLECSLogo from './FLECSLogo';

const Logo: React.FC = () => {
  return (
    <React.Fragment>
      {!useWhiteLabelLogo && (
        <React.Fragment>
          <button className="p-1.5" aria-label="logo" disabled>
            <FLECSLogo logoColor="white" />
          </button>
          <h6 className="text-base font-semibold flex-1">FLECS</h6>
        </React.Fragment>
      )}
      {useWhiteLabelLogo && showPoweredBy && (
        <React.Fragment>
          <button className="p-1.5" aria-label="logo" disabled>
            <WhiteLabelLogo />
          </button>
          <span className="text-xs flex-1">
            powered by
            <button className="p-1.5" aria-label="FLECS-Logo" disabled>
              <FLECSLogo logoColor="white" />
            </button>
            <span className="text-xs">FLECS</span>
          </span>
        </React.Fragment>
      )}
      {useWhiteLabelLogo && !showPoweredBy && (
        <React.Fragment>
          <button className="p-1.5" aria-label="logo" disabled>
            <WhiteLabelLogo />
          </button>
          <span className="text-xs flex-1" />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Logo;
