let accessToken: string | null = null
const subscribers = new Set<(token: string | null) => void>()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
  subscribers.forEach((subscriber) => subscriber(token))
}

export function subscribeToAccessToken(subscriber: (token: string | null) => void) {
  subscribers.add(subscriber)
  return () => {
    subscribers.delete(subscriber)
  }
}

