import { Job } from '../job';

export const mockJob: Job = {
  id: 1,
  status: 'running',
  description: 'job description',
  numSteps: 36,
  currentStep: {
    description: 'currentStep',
    num: 3,
    unit: 'unit',
    unitsTotal: 4,
    unitsDone: 4,
    rate: 0,
  },
  result: {
    code: 0,
    message: 'Ok.',
  },
};

export const mockSuccessJob: Job = {
  id: 2,
  status: 'successful',
  description: 'job description',
  numSteps: 12,
  currentStep: {
    description: 'currentStep',
    num: 12,
    unit: 'unit',
    unitsTotal: 4,
    unitsDone: 4,
    rate: 0,
  },
  result: {
    code: 0,
    message: 'Ok.',
  },
};

export const mockQueuedJob: Job = {
  id: 3,
  status: 'queued',
  description: 'job description',
  numSteps: 0,
  currentStep: {
    description: 'currentStep',
    num: 0,
    unit: 'unit',
    unitsTotal: 4,
    unitsDone: 4,
    rate: 0,
  },
  result: {
    code: 0,
    message: 'Ok.',
  },
};
