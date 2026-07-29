import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  InstanceEnvironmentVariable,
  InstancePortMappingRange,
  InstancePortMappingSingle,
  InstancePorts,
  TransportProtocol,
  UsbDevice as SystemUsbDevice,
  InstanceConfigUsbDevice,
} from '@generated/core/schemas';
import { TransportProtocol as Protocol } from '@generated/core/schemas';
import {
  getGetInstancesInstanceIdConfigDevicesUsbQueryKey,
  getGetInstancesInstanceIdConfigEnvironmentQueryKey,
  getGetInstancesInstanceIdConfigPortsQueryKey,
  useDeleteInstancesInstanceIdConfigDevicesUsbPort,
  useGetInstancesInstanceIdConfigDevicesUsb,
  useGetInstancesInstanceIdConfigEnvironment,
  useGetInstancesInstanceIdConfigPorts,
  usePutInstancesInstanceIdConfigDevicesUsbPort,
  usePutInstancesInstanceIdConfigEnvironment,
  usePutInstancesInstanceIdConfigPortsTransportProtocol,
} from '@generated/core/instances/instances';
import {
  getGetSystemDevicesUsbQueryKey,
  useGetSystemDevicesUsb,
} from '@generated/core/system/system';
import { unwrapSuccess } from '@app/api/unwrap';

export type DraftSection = 'usb' | 'ports' | 'env';

export type EnvironmentDraft = InstanceEnvironmentVariable & { _rowId: string };

export type PortDraft = {
  protocol: TransportProtocol;
  port: InstancePortMappingSingle | InstancePortMappingRange;
  _rowId: string;
};

export type UsbDraft = {
  port: string;
  name: string;
  vendor: string;
  device_connected: boolean;
  enabled: boolean;
};

type InstanceConfigDraft = {
  environment: EnvironmentDraft[];
  ports: PortDraft[];
  usb: UsbDraft[];
};

const clone = <T>(value: T): T => structuredClone(value);
const comparable = (value: unknown) => JSON.stringify(value);

const environmentPayload = (rows: EnvironmentDraft[]): InstanceEnvironmentVariable[] =>
  rows.map(({ name, value }) => ({ name: name.trim(), value }));

const portsPayload = (rows: PortDraft[], protocol: TransportProtocol) =>
  rows.filter((row) => row.protocol === protocol).map((row) => row.port);

const createDraft = (
  environment: InstanceEnvironmentVariable[],
  ports: InstancePorts,
  systemUsb: SystemUsbDevice[],
  instanceUsb: InstanceConfigUsbDevice[],
): InstanceConfigDraft => {
  const usb: UsbDraft[] = systemUsb.map((device) => {
    const configured = instanceUsb.find((item) => item.port === device.port);
    return {
      port: device.port,
      name: device.name ?? 'Unknown',
      vendor: device.vendor ?? 'Unknown',
      device_connected: configured?.device_connected ?? true,
      enabled: Boolean(configured),
    };
  });

  instanceUsb.forEach((device) => {
    if (usb.some((item) => item.port === device.port)) return;
    usb.push({
      port: device.port,
      name: device.name ?? 'Unknown',
      vendor: device.vendor ?? 'Unknown',
      device_connected: false,
      enabled: true,
    });
  });

  return {
    environment: environment.map((item) => ({ ...item, _rowId: crypto.randomUUID() })),
    ports: ([Protocol.tcp, Protocol.udp, Protocol.sctp] as const).flatMap((protocol) =>
      ports[protocol].map((port) => ({ protocol, port, _rowId: crypto.randomUUID() })),
    ),
    usb: usb.sort((a, b) => a.port.localeCompare(b.port)),
  };
};

const validate = (draft: InstanceConfigDraft | null) => {
  if (!draft) return undefined;

  const names = draft.environment.map(({ name }) => name.trim());
  if (names.some((name) => !name)) return 'Environment variable names cannot be empty.';
  if (new Set(names).size !== names.length) return 'Environment variable names must be unique.';

  const validPort = (value: number) => Number.isInteger(value) && value >= 1 && value <= 65535;
  for (const { port } of draft.ports) {
    if ('host_port' in port) {
      if (!validPort(port.host_port) || !validPort(port.container_port)) {
        return 'Ports must be between 1 and 65535.';
      }
      continue;
    }
    const hostSize = port.host_ports.end - port.host_ports.start;
    const containerSize = port.container_ports.end - port.container_ports.start;
    if (
      !validPort(port.host_ports.start) ||
      !validPort(port.host_ports.end) ||
      !validPort(port.container_ports.start) ||
      !validPort(port.container_ports.end) ||
      hostSize < 0 ||
      containerSize < 0
    ) {
      return 'Port ranges must use valid start and end values.';
    }
    if (hostSize !== containerSize) return 'Host and container port ranges must be the same size.';
  }
};

export function useInstanceConfigDraft(instanceId: string) {
  const queryClient = useQueryClient();
  const environmentQuery = useGetInstancesInstanceIdConfigEnvironment(instanceId);
  const portsQuery = useGetInstancesInstanceIdConfigPorts(instanceId);
  const systemUsbQuery = useGetSystemDevicesUsb();
  const instanceUsbQuery = useGetInstancesInstanceIdConfigDevicesUsb(instanceId);
  const { mutateAsync: putEnvironment } = usePutInstancesInstanceIdConfigEnvironment();
  const { mutateAsync: putPorts } = usePutInstancesInstanceIdConfigPortsTransportProtocol();
  const { mutateAsync: enableUsb } = usePutInstancesInstanceIdConfigDevicesUsbPort();
  const { mutateAsync: disableUsb } = useDeleteInstancesInstanceIdConfigDevicesUsbPort();
  const [editedDraft, setEditedDraft] = useState<InstanceConfigDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<InstanceConfigDraft | null>(null);

  const serverDraft = useMemo(() => {
    const environment = unwrapSuccess(environmentQuery.data);
    const ports = unwrapSuccess(portsQuery.data);
    const systemUsb = unwrapSuccess(systemUsbQuery.data);
    const instanceUsb = unwrapSuccess(instanceUsbQuery.data);
    if (!environment || !ports || !systemUsb || !instanceUsb) return null;
    return createDraft(environment, ports, systemUsb, instanceUsb);
  }, [environmentQuery.data, portsQuery.data, systemUsbQuery.data, instanceUsbQuery.data]);

  const baseline = savedDraft ?? serverDraft;
  const draft = editedDraft ?? baseline;

  const dirtySections = useMemo(() => {
    if (!baseline || !draft) return [] as DraftSection[];
    const sections: DraftSection[] = [];
    if (
      comparable(environmentPayload(draft.environment)) !==
      comparable(environmentPayload(baseline.environment))
    )
      sections.push('env');
    if (
      comparable(draft.ports.map(({ protocol, port }) => ({ protocol, port }))) !==
      comparable(baseline.ports.map(({ protocol, port }) => ({ protocol, port })))
    )
      sections.push('ports');
    if (
      comparable(draft.usb.map(({ port, enabled }) => ({ port, enabled }))) !==
      comparable(baseline.usb.map(({ port, enabled }) => ({ port, enabled })))
    )
      sections.push('usb');
    return sections;
  }, [baseline, draft]);

  const freezeBaseline = useCallback(() => {
    if (draft) setSavedDraft((current) => current ?? clone(draft));
  }, [draft]);

  const updateEnvironment = useCallback(
    (update: (rows: EnvironmentDraft[]) => EnvironmentDraft[]) => {
      freezeBaseline();
      setEditedDraft((current) =>
        current || draft
          ? {
              ...(current ?? clone(draft!)),
              environment: update((current ?? draft!).environment),
            }
          : current,
      );
    },
    [draft, freezeBaseline],
  );
  const updatePorts = useCallback(
    (update: (rows: PortDraft[]) => PortDraft[]) => {
      freezeBaseline();
      setEditedDraft((current) =>
        current || draft
          ? { ...(current ?? clone(draft!)), ports: update((current ?? draft!).ports) }
          : current,
      );
    },
    [draft, freezeBaseline],
  );
  const toggleUsb = useCallback(
    (port: string) => {
      freezeBaseline();
      setEditedDraft((current) =>
        current || draft
          ? {
              ...(current ?? clone(draft!)),
              usb: (current ?? draft!).usb.map((device) =>
                device.port === port ? { ...device, enabled: !device.enabled } : device,
              ),
            }
          : current,
      );
    },
    [draft, freezeBaseline],
  );

  const reset = useCallback(() => {
    setEditedDraft(null);
  }, []);

  const apply = useCallback(async () => {
    if (!baseline || !draft) return;
    const sections = new Set(dirtySections);

    if (sections.has('env')) {
      await putEnvironment({ instanceId, data: environmentPayload(draft.environment) });
    }
    if (sections.has('ports')) {
      for (const protocol of [Protocol.tcp, Protocol.udp, Protocol.sctp]) {
        if (
          comparable(portsPayload(draft.ports, protocol)) ===
          comparable(portsPayload(baseline.ports, protocol))
        )
          continue;
        await putPorts({
          instanceId,
          transportProtocol: protocol,
          data: portsPayload(draft.ports, protocol),
        });
      }
    }
    if (sections.has('usb')) {
      for (const device of draft.usb) {
        const previous = baseline.usb.find(({ port }) => port === device.port);
        if (!previous || previous.enabled === device.enabled) continue;
        if (device.enabled) await enableUsb({ instanceId, port: device.port });
        else await disableUsb({ instanceId, port: device.port });
      }
    }

    const saved = clone(draft);
    setSavedDraft(saved);
    setEditedDraft(null);
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetInstancesInstanceIdConfigEnvironmentQueryKey(instanceId),
        refetchType: 'none',
      }),
      queryClient.invalidateQueries({
        queryKey: getGetInstancesInstanceIdConfigPortsQueryKey(instanceId),
        refetchType: 'none',
      }),
      queryClient.invalidateQueries({
        queryKey: getGetInstancesInstanceIdConfigDevicesUsbQueryKey(instanceId),
        refetchType: 'none',
      }),
      queryClient.invalidateQueries({
        queryKey: getGetSystemDevicesUsbQueryKey(),
        refetchType: 'none',
      }),
    ]);
  }, [
    baseline,
    dirtySections,
    disableUsb,
    draft,
    enableUsb,
    instanceId,
    putEnvironment,
    putPorts,
    queryClient,
  ]);

  const loading =
    environmentQuery.isLoading ||
    portsQuery.isLoading ||
    systemUsbQuery.isLoading ||
    instanceUsbQuery.isLoading;
  const loadError =
    environmentQuery.error || portsQuery.error || systemUsbQuery.error || instanceUsbQuery.error;
  const reload = useCallback(
    () =>
      Promise.all([
        environmentQuery.refetch(),
        portsQuery.refetch(),
        systemUsbQuery.refetch(),
        instanceUsbQuery.refetch(),
      ]),
    [environmentQuery, instanceUsbQuery, portsQuery, systemUsbQuery],
  );

  return {
    draft,
    dirtySections,
    validationError: validate(draft),
    loading,
    loadError,
    updateEnvironment,
    updatePorts,
    toggleUsb,
    reset,
    apply,
    reload,
  };
}
