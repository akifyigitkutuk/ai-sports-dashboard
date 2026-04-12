// ─── Game Simulation Engine ───────────────────────────────────────────────────
// All coordinates use StatsBomb system: pitch = 120 x 80

export interface Player {
  id: number
  team: 0 | 1
  x: number
  y: number
  baseX: number
  baseY: number
  role: 'gk' | 'def' | 'mid' | 'fwd'
  hasBall: boolean
  showBox: boolean
  label: string
}

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
}

export interface GameEvent {
  minute: number
  type: 'Goal' | 'Card' | 'Sub' | 'Foul'
  team: 0 | 1
}

export interface GameStats {
  minute: number
  homeScore: number
  awayScore: number
  homePossession: number
  homeShots: number
  homeShotsOnTarget: number
  passAccuracy: number
  distanceCovered: number
  fatigueRisk: number
  shiftHour: number
  lastAiEvent: string | null
  showAnomalyPopup: boolean
  anomalySuppressed: boolean
}

// Formation positions (StatsBomb 120x80)
const HOME_POS = [
  { x: 5,  y: 40, role: 'gk'  },
  { x: 22, y: 12, role: 'def' },
  { x: 22, y: 30, role: 'def' },
  { x: 22, y: 50, role: 'def' },
  { x: 22, y: 68, role: 'def' },
  { x: 48, y: 22, role: 'mid' },
  { x: 52, y: 40, role: 'mid' },
  { x: 48, y: 58, role: 'mid' },
  { x: 78, y: 18, role: 'fwd' },
  { x: 82, y: 40, role: 'fwd' },
  { x: 78, y: 62, role: 'fwd' },
] as const

const AWAY_POS = [
  { x: 115, y: 40, role: 'gk'  },
  { x: 98,  y: 12, role: 'def' },
  { x: 98,  y: 30, role: 'def' },
  { x: 98,  y: 50, role: 'def' },
  { x: 98,  y: 68, role: 'def' },
  { x: 72,  y: 22, role: 'mid' },
  { x: 68,  y: 40, role: 'mid' },
  { x: 72,  y: 58, role: 'mid' },
  { x: 40,  y: 18, role: 'fwd' },
  { x: 35,  y: 40, role: 'fwd' },
  { x: 40,  y: 62, role: 'fwd' },
] as const

const BOX_PLAYERS = new Set([1, 4, 8, 9, 10, 12, 15, 19])

function makeLabel(x: number, y: number) {
  return `X:${Math.round(x)}, Y:${Math.round(y)}, Z:2`
}

export class GameEngine {
  players: Player[] = []
  ball: Ball = { x: 60, y: 40, vx: 0, vy: 0 }
  stats: GameStats
  events: GameEvent[] = []
  positionHistory: { x: number; y: number }[] = []

  private ballCarrierIdx = 9
  private timeSinceEvent = 0
  private nextEventIn = 2500
  private elapsed = 0

  constructor() {
    this.stats = {
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      homePossession: 55,
      homeShots: 4,
      homeShotsOnTarget: 2,
      passAccuracy: 91,
      distanceCovered: 18,
      fatigueRisk: 0.18,
      shiftHour: 1.5,
      lastAiEvent: null,
      showAnomalyPopup: false,
      anomalySuppressed: false,
    }
    this.initPlayers()
  }

  private initPlayers() {
    HOME_POS.forEach((pos, i) => {
      this.players.push({
        id: i, team: 0,
        x: pos.x, y: pos.y,
        baseX: pos.x, baseY: pos.y,
        role: pos.role as Player['role'],
        hasBall: i === 9,
        showBox: BOX_PLAYERS.has(i),
        label: makeLabel(pos.x, pos.y),
      })
    })
    AWAY_POS.forEach((pos, i) => {
      this.players.push({
        id: i + 11, team: 1,
        x: pos.x, y: pos.y,
        baseX: pos.x, baseY: pos.y,
        role: pos.role as Player['role'],
        hasBall: false,
        showBox: BOX_PLAYERS.has(i + 11),
        label: makeLabel(pos.x, pos.y),
      })
    })
  }

  private getBallDrift(p: Player): number {
    const drifts = { gk: 0.04, def: 0.14, mid: 0.28, fwd: 0.38 }
    return drifts[p.role]
  }

  tick(dt: number) {
    this.elapsed += dt
    this.timeSinceEvent += dt

    // Advance match minute (1 real second ≈ 1 match minute for demo)
    this.stats.minute = Math.min(90, this.elapsed / 1000)

    // Increase fatigue over time
    this.stats.shiftHour = Math.min(8, 1.5 + this.elapsed / 60000)
    this.stats.fatigueRisk = Math.min(0.97, this.stats.shiftHour * 0.115)

    // Distance covered
    this.stats.distanceCovered = 18 + this.elapsed * 0.0012

    // Move players
    const now = this.elapsed
    this.players.forEach((p, i) => {
      if (p.role === 'gk') {
        p.x += (p.baseX - p.x) * 0.05
        p.y += (p.baseY - p.y) * 0.05
        p.label = makeLabel(p.x, p.y)
        return
      }
      const drift = this.getBallDrift(p)
      const ball = this.ball
      const tX = p.baseX + (ball.x - p.baseX) * drift + Math.sin(now / 3200 + i * 1.3) * 5
      const tY = p.baseY + (ball.y - p.baseY) * drift + Math.cos(now / 2700 + i * 0.9) * 4
      p.x += (Math.max(2, Math.min(118, tX)) - p.x) * 0.025
      p.y += (Math.max(2, Math.min(78,  tY)) - p.y) * 0.025
      p.label = makeLabel(p.x, p.y)
    })

    // Ball follows carrier
    const carrier = this.players[this.ballCarrierIdx]
    if (carrier) {
      this.ball.x += (carrier.x - this.ball.x) * 0.18
      this.ball.y += (carrier.y - this.ball.y) * 0.18
    }

    // Record ball position for heatmap (sample at ~10fps)
    if (dt > 0 && Math.random() < dt / 100) {
      this.positionHistory.push({ x: this.ball.x, y: this.ball.y })
      if (this.positionHistory.length > 300) this.positionHistory.shift()
    }

    // Game events
    if (this.timeSinceEvent > this.nextEventIn) {
      this.timeSinceEvent = 0
      this.nextEventIn = 1800 + Math.random() * 3500
      this.triggerGameEvent()
    }

    // Auto-dismiss anomaly popup after 4 seconds
    if (this.stats.showAnomalyPopup && this.timeSinceEvent > 4000 && !this.stats.anomalySuppressed) {
      // don't auto dismiss — let user interact
    }
  }

  private triggerGameEvent() {
    const carrier = this.players[this.ballCarrierIdx]
    const roll = Math.random()

    if (roll < 0.55) {
      // Pass
      const teammates = this.players.filter(p => p.team === carrier.team && p.id !== carrier.id && p.role !== 'gk')
      const target = teammates[Math.floor(Math.random() * teammates.length)]
      if (target) {
        this.players[this.ballCarrierIdx].hasBall = false
        this.ballCarrierIdx = this.players.indexOf(target)
        this.players[this.ballCarrierIdx].hasBall = true

        if (carrier.team === 0) {
          this.stats.homePossession = Math.min(68, this.stats.homePossession + (Math.random() * 0.8 - 0.3))
        } else {
          this.stats.homePossession = Math.max(38, this.stats.homePossession - (Math.random() * 0.8 - 0.3))
        }
        this.stats.passAccuracy = Math.min(98, Math.max(78, this.stats.passAccuracy + (Math.random() * 2 - 1)))
        this.stats.lastAiEvent = 'PASS ✓ — Verified (9ms)'
      }
    } else if (roll < 0.8) {
      // Shot
      const isOwnHalf = carrier.team === 0 ? carrier.x < 60 : carrier.x > 60
      this.stats.homeShots += carrier.team === 0 ? 1 : 0

      if (isOwnHalf && !this.stats.anomalySuppressed) {
        // Anomaly!
        this.stats.showAnomalyPopup = true
        this.stats.lastAiEvent = '🚨 ANOMALY — Shot from own half blocked'
      } else {
        if (Math.random() > 0.45) this.stats.homeShotsOnTarget += carrier.team === 0 ? 1 : 0
        if (Math.random() > 0.75) {
          if (carrier.team === 0) this.stats.homeScore++
          else this.stats.awayScore = (this.stats.awayScore || 0) + 1
          this.events.push({ minute: Math.round(this.stats.minute), type: 'Goal', team: carrier.team })
          // Reset to center
          this.ball = { x: 60, y: 40, vx: 0, vy: 0 }
          const reset = this.players.filter(p => p.team !== carrier.team && p.role === 'mid')
          if (reset.length) this.ballCarrierIdx = this.players.indexOf(reset[0])
        }
        this.stats.lastAiEvent = 'SHOT ✓ — Verified (11ms)'
      }
    } else if (roll < 0.92) {
      // Foul
      this.stats.lastAiEvent = 'FOUL ✓ — Recorded'
      if (Math.random() > 0.7) {
        this.events.push({ minute: Math.round(this.stats.minute), type: 'Card', team: carrier.team })
      }
    } else {
      // Sub
      this.events.push({ minute: Math.round(this.stats.minute), type: 'Sub', team: carrier.team })
      this.stats.lastAiEvent = 'SUBSTITUTION — Recorded'
    }
  }

  acceptAnomaly(changeToPass: boolean) {
    this.stats.showAnomalyPopup = false
    this.stats.anomalySuppressed = false
    if (changeToPass) {
      this.stats.lastAiEvent = 'PASS (AI Corrected) ✓ — Verified (10ms)'
    } else {
      this.stats.lastAiEvent = 'SHOT (Operator Override) — Logged'
      this.stats.anomalySuppressed = true
    }
  }

  manualEvent(type: 'CARD' | 'PASS' | 'FOUL' | 'SHOT') {
    const carrier = this.players[this.ballCarrierIdx]
    this.stats.showAnomalyPopup = false
    this.stats.anomalySuppressed = false

    if (type === 'SHOT') {
      const isOwnHalf = carrier.team === 0 ? carrier.x < 60 : carrier.x > 60
      if (isOwnHalf) {
        this.stats.showAnomalyPopup = true
        return 'ANOMALY'
      }
    }
    this.stats.lastAiEvent = `${type} ✓ — AI Verified (12ms)`
    return 'SUCCESS'
  }
}
