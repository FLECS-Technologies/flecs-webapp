export const mapJobStatus = (status) => {
  if (status === 'pending') return 0
  else if (status === 'running') return 1
  else if (status === 'successful') return 3
  else if (status === 'failed') return -1
  else return 0
}
