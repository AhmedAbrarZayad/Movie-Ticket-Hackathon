const TIME_ZONE = 'Asia/Dhaka'

export function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

export function nextSevenDates(now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() + index * 86_400_000)
    return {
      value: dateKey(date),
      weekday: new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(date),
      label: new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' }).format(date),
    }
  })
}

export function formatShowtime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(value))
}

export function formatReleaseDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(value))
}

