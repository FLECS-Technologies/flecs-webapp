import React from 'react';
import InstanceDetails from './InstanceDetails';
import InstanceLog from './InstanceLog';

export default function InstanceInfo(props: any) {
  const { instance } = props;
  const [tab, setTab] = React.useState<'1' | '2'>('1');

  const infoRows = [
    { name: 'Instance name', info: instance?.instanceName },
    { name: 'Version', info: instance?.appKey.version },
    { name: 'Instance ID', info: instance?.instanceId },
    { name: 'Status', info: instance?.status },
    { name: 'Desired status', info: instance?.desired },
  ];

  return (
    <div className="w-full">
      <div className="flex gap-1 border-b border-white/10 mb-4">
        <button onClick={() => setTab('1')} className={`px-4 py-2 text-sm font-medium transition rounded-t-lg ${tab === '1' ? 'bg-white/5 text-white' : 'text-muted hover:bg-white/5'}`}>General</button>
        <button onClick={() => setTab('2')} className={`px-4 py-2 text-sm font-medium transition rounded-t-lg ${tab === '2' ? 'bg-white/5 text-white' : 'text-muted hover:bg-white/5'}`}>Log</button>
      </div>
      {tab === '1' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={2}>General information</td></tr></thead>
            <tbody>{infoRows.map(row => <tr key={row.name} className="border-b border-white/10 last:border-0"><td className="px-4 py-2">{row.name}</td><td className="px-4 py-2">{row.info}</td></tr>)}</tbody>
          </table>
          <hr className="border-white/10" />
          <InstanceDetails instance={instance} />
        </div>
      )}
      {tab === '2' && <InstanceLog instance={instance} />}
    </div>
  );
}
