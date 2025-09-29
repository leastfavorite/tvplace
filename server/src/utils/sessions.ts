import settings from '@/place.config.json'
type Token = string

interface Session {
  lastUsed: number
  connected: number
}

export class Sessions {
  sessions: Map<Token, Session>
  ips: Map<string, Token[]>

  constructor() {
    this.sessions = new Map()
    this.ips = new Map()
  }

  registerIp(token: Token, ip: string): boolean {
    const registeredSessions = this.ips.get(ip)

    if (!registeredSessions) {
      this.ips.set(ip, [token])
      return true
    }

    // note--we do this before filtering, since we don't want to accidentally
    // filter out our own token right before updating it
    if (registeredSessions.includes(token)) {
      return true
    } else if (registeredSessions.length < settings.maxSessionsPerIp) {
      this.ips.set(ip, [...registeredSessions, token])
      return true
    }

    const now = Date.now()

    // filter out stale connections
    this.ips.set(
      ip,
      Array.from(
        registeredSessions.filter((t) => {
          const session = this.sessions.get(t)
          if (!session) return false

          // if a session is disconnected, we keep the session active until
          // its cooldown expires. if it remains connected, we wait for double
          // the cooldown to call it stale
          const staleTime = (session.connected ? 2 : 1) * 1000 * settings.cooldown

          return now - session.lastUsed < staleTime
        }),
      ),
    )

    // try again
    if (registeredSessions.length < settings.maxSessionsPerIp) {
      this.ips.set(ip, [...registeredSessions, token])
      return true
    }

    return false
  }

  // returns cooldown time
  connect(token: Token): number {
    let session = this.sessions.get(token)
    if (!session) {
      session = {
        lastUsed: 0,
        connected: 0,
      }
      this.sessions.set(token, session)
    }
    session.connected += 1
    const now = Date.now()
    const unlockTime = session.lastUsed + settings.cooldown * 1000

    return now > unlockTime ? 0 : unlockTime
  }

  disconnect(token: Token) {
    const session = this.sessions.get(token)
    if (!session) {
      return
    }
    session.connected -= 1
  }

  // returns [shouldPlace, cooldown]
  place(token: Token, ip: string): [boolean, number | null] {
    const now = Date.now()
    const session = this.sessions.get(token)
    if (!session) {
      throw new Error('place called before connect')
    }

    const unlockTime = session.lastUsed + settings.cooldown * 1000
    if (unlockTime > now) {
      return [false, unlockTime]
    }

    console.log(this.ips)
    if (!this.registerIp(token, ip)) {
      return [false, null]
    }

    session.lastUsed = now
    this.sessions.set(token, session)
    return [true, now + settings.cooldown * 1000]
  }
}
