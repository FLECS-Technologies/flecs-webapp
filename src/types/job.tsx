export interface Job {
  id: number
  status:
    | 'running'
    | 'queued'
    | 'successful'
    | 'failed'
    | 'pending'
    | 'cancelled'
  description: string
  numSteps: number
  currentStep: {
    description: string
    num: number
    unit: string
    unitsTotal: number
    unitsDone: number
    rate: number
  }
  result: {
    code: number
    message: string
  }
}
