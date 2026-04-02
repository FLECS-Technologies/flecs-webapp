import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getInstancesInstanceIdLogs } from '@generated/core/instances/instances';
import type { GetInstancesInstanceIdLogs200 } from '@generated/core/schemas';

export default function InstanceLog(props: any) {
  const { instance } = props;
  const executedRef = React.useRef(false);
  const [loadingLog, setLoadingLog] = React.useState(false);
  const [logText, setLogText] = React.useState('No log available...');

  React.useEffect(() => { if (executedRef.current) return; fetchLog(); executedRef.current = true; }, []);

  const fetchLog = async () => {
    setLoadingLog(true);
    getInstancesInstanceIdLogs(instance.instanceId)
      .then((response) => { const logs = response.data as GetInstancesInstanceIdLogs200; setLogText(logs?.stdout || logs?.stderr || 'No log available...'); })
      .catch((error) => console.log(error))
      .finally(() => setLoadingLog(false));
  };

  return (
    <div data-testid="log-editor">
      <button className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 mb-2 mr-2" data-testid="refresh-button" disabled={loadingLog} onClick={() => { executedRef.current = false; fetchLog(); }}>
        <RefreshCw size={16} /> Refresh
      </button>
      <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4 bg-dark-end rounded-lg border border-white/10 max-h-[400px] overflow-auto">{logText}</pre>
    </div>
  );
}
