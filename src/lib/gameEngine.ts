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

export type EventType = 'GOAL' | 'CARD' | 'SUB' | 'FOUL' | 'PASS' | 'SHOT'

export interface GameEvent {
  minute: number
  type: EventType | string
  team: 0 | 1
  id: string
  status?: 'HIT' | 'MISSED' | 'PENDING'
  latency?: number
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
  
  // Quality & Efficiency Stats
  efficiencyScore: number
  hitCount: number
  missedCount: number
  avgLatency: number
  systemMessage: { text: string; type: 'error' | 'success' | 'warn'; id: number } | null
}

const HOME_POS = [
  { x: 5,  y: 40, role: 'gk'  }, { x: 22, y: 12, role: 'def' }, { x: 22, y: 30, role: 'def' },
  { x: 22, y: 50, role: 'def' }, { x: 22, y: 68, role: 'def' }, { x: 48, y: 22, role: 'mid' },
  { x: 52, y: 40, role: 'mid' }, { x: 48, y: 58, role: 'mid' }, { x: 78, y: 18, role: 'fwd' },
  { x: 82, y: 40, role: 'fwd' }, { x: 78, y: 62, role: 'fwd' },
] as const

const AWAY_POS = [
  { x: 115, y: 40, role: 'gk'  }, { x: 98,  y: 12, role: 'def' }, { x: 98,  y: 30, role: 'def' },
  { x: 98,  y: 50, role: 'def' }, { x: 98,  y: 68, role: 'def' }, { x: 72,  y: 22, role: 'mid' },
  { x: 68,  y: 40, role: 'mid' }, { x: 72,  y: 58, role: 'mid' }, { x: 40,  y: 18, role: 'fwd' },
  { x: 35,  y: 40, role: 'fwd' }, { x: 40,  y: 62, role: 'fwd' },
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
  
  private pendingTruthEvents: { type: EventType; timestamp: number; id: string; team: 0 | 1 }[] = []
  private latencies: number[] = []

  constructor() {
    this.stats = {
      minute: 0, homeScore: 0, awayScore: 0, homePossession: 55,
      homeShots: 4, homeShotsOnTarget: 2, passAccuracy: 91,
      distanceCovered: 18, fatigueRisk: 0.18, shiftHour: 1.5,
      lastAiEvent: null, showAnomalyPopup: false, anomalySuppressed: false,
      efficiencyScore: 100, hitCount: 0, missedCount: 0, avgLatency: 0, systemMessage: null
    }
    this.initPlayers()
  }

  private initPlayers() {
    HOME_POS.forEach((pos, i) => {
      this.players.push({
        id: i, team: 0, x: pos.x, y: pos.y, baseX: pos.x, baseY: pos.y,
        role: pos.role as Player['role'], hasBall: i === 9, showBox: BOX_PLAYERS.has(i),
        label: makeLabel(pos.x, pos.y),
      })
    })
    AWAY_POS.forEach((pos, i) => {
      this.players.push({
        id: i + 11, team: 1, x: pos.x, y: pos.y, baseX: pos.x, baseY: pos.y,
        role: pos.role as Player['role'], hasBall: false, showBox: BOX_PLAYERS.has(i + 11),
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

    this.stats.minute = Math.min(90, this.elapsed / 1000)
    this.stats.shiftHour = Math.min(8, 1.5 + this.elapsed / 60000)
    this.stats.fatigueRisk = Math.min(0.97, this.stats.shiftHour * 0.115)
    this.stats.distanceCovered = 18 + this.elapsed * 0.0012

    // Move players & ball...
    const now = this.elapsed
    this.players.forEach((p, i) => {
      if (p.role === 'gk') {
        p.x += (p.baseX - p.x) * 0.05; p.y += (p.baseY - p.y) * 0.05
        p.label = makeLabel(p.x, p.y); return
      }
      const drift = this.getBallDrift(p)
      const tX = p.baseX + (this.ball.x - p.baseX) * drift + Math.sin(now / 3200 + i * 1.3) * 5
      const tY = p.baseY + (this.ball.y - p.baseY) * drift + Math.cos(now / 2700 + i * 0.9) * 4
      p.x += (Math.max(2, Math.min(118, tX)) - p.x) * 0.025
      p.y += (Math.max(2, Math.min(78,  tY)) - p.y) * 0.025
      p.label = makeLabel(p.x, p.y)
    })
    const carrier = this.players[this.ballCarrierIdx]
    if (carrier) {
      this.ball.x += (carrier.x - this.ball.x) * 0.18
      this.ball.y += (carrier.y - this.ball.y) * 0.18
    }

    if (dt > 0 && Math.random() < dt / 100) {
      this.positionHistory.push({ x: this.ball.x, y: this.ball.y })
      if (this.positionHistory.length > 300) this.positionHistory.shift()
    }

    // Pendings Check (TTL: 4s)
    this.pendingTruthEvents = this.pendingTruthEvents.filter(pt => {
      if (now - pt.timestamp > 4000) {
        // Missed!
        this.stats.missedCount++
        this.updateEfficiency()
        this.stats.systemMessage = { 
          text: `🚨 MISSED: You were late to press [${pt.type}]!`, 
          type: 'error', 
          id: now 
        }
        this.events.push({ minute: Math.round(this.stats.minute), type: pt.type, team: pt.team, id: pt.id, status: 'MISSED' })
        return false
      }
      return true
    })

    if (this.timeSinceEvent > this.nextEventIn) {
      this.timeSinceEvent = 0
      this.nextEventIn = 2000 + Math.random() * 4000
      this.triggerGameEvent()
    }
  }

  private triggerGameEvent() {
    const carrier = this.players[this.ballCarrierIdx]
    const roll = Math.random()
    const id = Math.random().toString(36).substring(7)

    if (roll < 0.5) {
      this.pendingTruthEvents.push({ type: 'PASS', timestamp: this.elapsed, id, team: carrier.team })
      // Auto-sim effect
      const teammates = this.players.filter(p => p.team === carrier.team && p.id !== carrier.id && p.role !== 'gk')
      const target = teammates[Math.floor(Math.random() * teammates.length)]
      if (target) {
        this.players[this.ballCarrierIdx].hasBall = false
        this.ballCarrierIdx = this.players.indexOf(target)
        this.players[this.ballCarrierIdx].hasBall = true
      }
    } else if (roll < 0.8) {
      this.pendingTruthEvents.push({ type: 'SHOT', timestamp: this.elapsed, id, team: carrier.team })
      this.stats.homeShots += carrier.team === 0 ? 1 : 0
    } else {
      this.pendingTruthEvents.push({ type: 'FOUL', timestamp: this.elapsed, id, team: carrier.team })
    }
  }

  private updateEfficiency() {
    const total = this.stats.hitCount + this.stats.missedCount
    if (total === 0) return
    const acc = (this.stats.hitCount / total) * 0.7
    const lat = this.latencies.length > 0 ? Math.max(0, 1 - (this.avgLatency() / 4000)) * 0.3 : 0.3
    this.stats.efficiencyScore = Math.round((acc + lat) * 100)
  }

  private avgLatency() {
    if (this.latencies.length === 0) return 0
    return this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
  }

  acceptAnomaly(changeToPass: boolean) {
    this.stats.showAnomalyPopup = false
    this.stats.anomalySuppressed = false
    // Manual anomaly check counts as a hit but we treat it separately to reward corrections
  }

  manualEvent(type: EventType) {
    const now = this.elapsed
    this.stats.showAnomalyPopup = false
    
    // Check if it matches a pending truth
    const matchIdx = this.pendingTruthEvents.findIndex(pt => pt.type === type)
    if (matchIdx > -1) {
      const pt = this.pendingTruthEvents[matchIdx]
      const latency = now - pt.timestamp
      this.latencies.push(latency)
      this.stats.hitCount++
      this.pendingTruthEvents.splice(matchIdx, 1)
      this.updateEfficiency()
      this.events.push({ minute: Math.round(this.stats.minute), type, team: pt.team, id: pt.id, status: 'HIT', latency })
      return 'SUCCESS'
    } else {
      // Over-reporting or incorrect
      this.stats.systemMessage = { text: `❓ UNEXPECTED: [${type}] input with no physical evidence.`, type: 'warn', id: now }
      return 'WARN'
    }
  }
}
