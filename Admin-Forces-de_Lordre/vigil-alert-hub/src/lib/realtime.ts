// Lazy init of Laravel Echo with Pusher (or Laravel WebSockets)
import Pusher from 'pusher-js'
import Echo from 'laravel-echo'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo?: Echo
  }
}

window.Pusher = Pusher

const WS_KEY = (import.meta as any).env?.VITE_PUSHER_APP_KEY || 'local'
const WS_HOST = (import.meta as any).env?.VITE_WS_HOST || window.location.hostname
const WS_PORT = Number((import.meta as any).env?.VITE_WS_PORT || 6001)
const FORCE_TLS = ((import.meta as any).env?.VITE_PUSHER_FORCE_TLS || 'false') === 'true'

let echoInstance: Echo | null = null

export function getEcho(): Echo {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: WS_KEY,
    wsHost: WS_HOST,
    wsPort: WS_PORT,
    wssPort: WS_PORT,
    forceTLS: FORCE_TLS,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
  }) as unknown as Echo

  return echoInstance
}

export function disconnectEcho() {
  try {
    (window as any).Echo?.disconnect?.()
  } catch {
    // no-op
  }
  echoInstance = null
}


