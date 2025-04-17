import { mockApi, mockGetBaseURL, mockTransportProtocol } from './__mocks__/api'

const localStorageMock = (function () {
  let store = {}

  return {
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      store[key] = value.toString()
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key) {
      delete store[key]
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock the Configuration class
jest.mock('core-client/configuration', () => ({
  Configuration: jest.fn(() => ({
    basePath: ''
  }))
}))

jest.mock('./api/flecs-core/api-client', () => ({
  api: {
    instances: {
      instancesInstanceIdConfigPortsGet: jest.fn(),
      instancesInstanceIdConfigPortsTransportProtocolPut: jest.fn()
    }
  }
}))
