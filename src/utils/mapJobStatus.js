export const mapJobStatus = (status) => {
  if (status === 'pending') return 1;
  else if (status === 'running') return 2;
  else if (status === 'successful') return 4;
  else if (status === 'failed') return -1;
  else return 0;
};
