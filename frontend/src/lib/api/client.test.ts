import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, test } from 'vitest'
import { setAccessToken } from '../../stores/auth-store'
import { apiClient, refreshClient } from './client'

let apiMock: MockAdapter | undefined
let refreshMock: MockAdapter | undefined

afterEach(() => {
  apiMock?.restore()
  refreshMock?.restore()
  setAccessToken(null)
})

describe('authenticated API client', () => {
  test('adds the current Bearer token to requests', async () => {
    apiMock = new MockAdapter(apiClient)
    setAccessToken('access-one')
    apiMock.onGet('/protected').reply((config) => [200, { authorization: config.headers?.Authorization }])

    const response = await apiClient.get('/protected')
    expect(response.data.authorization).toBe('Bearer access-one')
  })

  test('uses one refresh request for concurrent 401 responses and retries both', async () => {
    apiMock = new MockAdapter(apiClient)
    refreshMock = new MockAdapter(refreshClient)
    let protectedCalls = 0
    apiMock.onGet('/protected').reply((config) => {
      protectedCalls += 1
      return config.headers?.Authorization === 'Bearer access-two' ? [200, { ok: true }] : [401]
    })
    refreshMock.onPost('/auth/refresh').reply(200, {
      accessToken: 'access-two',
      user: { id: '1', name: 'Ada', email: 'ada@example.com' },
    })

    const responses = await Promise.all([apiClient.get('/protected'), apiClient.get('/protected')])
    expect(responses.every(({ data }) => data.ok)).toBe(true)
    expect(refreshMock.history.post).toHaveLength(1)
    expect(protectedCalls).toBe(4)
  })

  test('does not loop when refresh fails', async () => {
    apiMock = new MockAdapter(apiClient)
    refreshMock = new MockAdapter(refreshClient)
    apiMock.onGet('/protected').reply(401)
    refreshMock.onPost('/auth/refresh').reply(401)

    await expect(apiClient.get('/protected')).rejects.toMatchObject({ response: { status: 401 } })
    expect(refreshMock.history.post).toHaveLength(1)
    expect(apiMock.history.get).toHaveLength(1)
  })
})
