// Mock API Client
export const mockApi = {
  instances: {
    instancesInstanceIdConfigPortsGet: jest.fn(),
    instancesInstanceIdConfigPortsTransportProtocolPut: jest.fn(),
    instancesInstanceIdConfigDevicesUsbGet: jest.fn(() =>
      Promise.resolve({ data: {} })
    )
  }
}

export const mockGetBaseURL = jest.fn()

// Mock API Responses
export const mockPortsResponse = {
  empty: {
    data: {
      tcp: [],
      udp: []
    }
  },
  withTcpPorts: {
    data: {
      tcp: [{ host_port: 8080, container_port: 80 }],
      udp: []
    }
  },
  withUdpPorts: {
    data: {
      tcp: [],
      udp: [
        {
          host_ports: { start: 3000, end: 3005 },
          container_ports: { start: 4000, end: 4005 }
        }
      ]
    }
  }
}

// Mock TransportProtocol Enum
export const mockTransportProtocol = {
  Tcp: 'Tcp',
  Udp: 'Udp'
}
