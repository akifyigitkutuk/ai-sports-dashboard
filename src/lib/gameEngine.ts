// ─── Game Simulation Engine ───────────────────────────────────────────────────
// All coordinates scaled based on sport configuration.

import { type SportType, SPORT_CONFIGS } from './sportConfigs'

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
  type: string
  team: 0 | 1
  id: string
  status?: 'HIT' | 'MISSED' | 'PENDING'
  latency?: number
  sport?: SportType
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
  sport: SportType
}

function makeLabel(x: number, y: number) {
  return `X:${Math.round(x)}, Y:${Math.round(y)}, Z:2`
}

export class GameEngine {
  players: Player[] = []
  ball: Ball = { x: 60, y: 40, vx: 0, vy: 0 }
  stats: GameStats
  events: GameEvent[] = []
  positionHistory: { x: number; y: number }[] = []

  private ballCarrierIdx = 0
  private timeSinceEvent = 0
  private nextEventIn = 2500
  private elapsed = 0

  private pendingTruthEvents: { type: string; timestamp: number; id: string; team: 0 | 1 }[] = []
  private latencies: number[] = []
  private sportId: SportType = 'SOCCER'

  constructor(sportId: SportType = 'SOCCER') {
    this.sportId = sportId
    const conf = SPORT_CONFIGS[sportId]
    this.stats = {
      minute: 0, homeScore: 0, awayScore: 0, homePossession: 55,
      homeShots: 4, homeShotsOnTarget: 2, passAccuracy: 91,
      distanceCovered: 18, fatigueRisk: 0.18, shiftHour: 1.5,
      lastAiEvent: null, showAnomalyPopup: false, anomalySuppressed: false,
      efficiencyScore: 100, hitCount: 0, missedCount: 0, avgLatency: 0, systemMessage: null,
      sport: sportId
    }
    this.ball = { x: conf.dimX / 2, y: conf.dimY / 2, vx: 0, vy: 0 }
    this.initPlayers()
  }

  private initPlayers() {
    const conf = SPORT_CONFIGS[this.sportId]
    const count = Math.ceil(conf.playerCount / 2)

    this.players = []
    if (this.sportId === 'F1') {
      // Initialize cars along the circuit
      for (let i = 0; i < conf.playerCount; i++) {
        const team: 0 | 1 = i < 10 ? 0 : 1
        const angle = (i / conf.playerCount) * Math.PI * 2
        const x = conf.dimX / 2 + (conf.dimX * 0.4) * Math.cos(angle)
        const y = conf.dimY / 2 + (conf.dimY * 0.35) * Math.sin(angle)
        this.players.push({
          id: i, team, x, y, baseX: x, baseY: y,
          role: 'mid', hasBall: false, showBox: Math.random() > 0.7,
          label: `CAR #${i + 1}`
        })
      }
    } else {
      // Team 0
      for (let i = 0; i < count; i++) {
        const x = (i / count) * (conf.dimX * 0.4) + 5
        const y = (conf.dimY * 0.2) + Math.random() * (conf.dimY * 0.6)
        this.players.push({
          id: i, team: 0, x, y, baseX: x, baseY: y,
          role: 'mid', hasBall: i === 0, showBox: Math.random() > 0.6,
          label: makeLabel(x, y)
        })
      }
      // Team 1
      for (let i = 1; i <= count; i++) {
        const x = conf.dimX - (i / count) * (conf.dimX * 0.4) - 5
        const y = (conf.dimY * 0.2) + Math.random() * (conf.dimY * 0.6)
        this.players.push({
          id: i + 100, team: 1, x, y, baseX: x, baseY: y,
          role: 'mid', hasBall: false, showBox: Math.random() > 0.6,
          label: makeLabel(x, y)
        })
      }
    }
    this.ballCarrierIdx = 0
  }

  private getBallDrift(p: Player): number {
    if (this.sportId === 'F1') return 0.88 // Cars stick to line
    if (this.sportId === 'BASKETBALL') return 0.4
    return 0.22
  }

  tick(dt: number) {
    const conf = SPORT_CONFIGS[this.sportId]
    this.elapsed += dt
    this.timeSinceEvent += dt

    this.stats.minute = Math.min(90, this.elapsed / 1000)
    // Fatigue etc...
    this.stats.shiftHour = Math.min(8, 1.5 + this.elapsed / 60000)
    this.stats.fatigueRisk = Math.min(0.97, this.stats.shiftHour * 0.115)
    this.stats.distanceCovered = 18 + this.elapsed * 0.0012

    const now = this.elapsed
    this.players.forEach((p, i) => {
      if (this.sportId === 'F1') {
        const lapTime = 20000 + i * 500 // Different speeds for different cars
        const angle = (now / lapTime) * Math.PI * 2 + (i / conf.playerCount) * Math.PI * 2
        const tX = conf.dimX / 2 + (conf.dimX * 0.42) * Math.cos(angle)
        const tY = conf.dimY / 2 + (conf.dimY * 0.38) * Math.sin(angle)
        p.x += (tX - p.x) * 0.1
        p.y += (tY - p.y) * 0.1
        p.label = `CAR #${p.id + 1} | ${(now/lapTime).toFixed(1)} Laps`
      } else {
        const drift = this.getBallDrift(p)
        const tX = p.baseX + (this.ball.x - p.baseX) * drift + Math.sin(now / 3200 + i * 1.3) * (conf.dimX * 0.05)
        const tY = p.baseY + (this.ball.y - p.baseY) * drift + Math.cos(now / 2700 + i * 0.9) * (conf.dimY * 0.05)

        const speed = 0.025
        p.x += (Math.max(1, Math.min(conf.dimX - 1, tX)) - p.x) * speed
        p.y += (Math.max(1, Math.min(conf.dimY - 1, tY)) - p.y) * speed
        p.label = makeLabel(p.x, p.y)
      }
    })

    const carrier = this.players[this.ballCarrierIdx]
    if (carrier) {
      this.ball.x += (carrier.x - this.ball.x) * 0.2
      this.ball.y += (carrier.y - this.ball.y) * 0.2
    }

    if (dt > 0 && Math.random() < dt / 100) {
      this.positionHistory.push({ x: this.ball.x, y: this.ball.y })
      if (this.positionHistory.length > 300) this.positionHistory.shift()
    }

    this.pendingTruthEvents = this.pendingTruthEvents.filter(pt => {
      if (now - pt.timestamp > 4000) {
        this.stats.missedCount++
        this.updateEfficiency()
        this.stats.systemMessage = {
          text: `🚨 MISSED: You were late to press [${pt.type}]!`,
          type: 'error', id: now
        }
        this.events.push({ minute: Math.round(this.stats.minute), type: pt.type, team: pt.team, id: pt.id, status: 'MISSED', sport: this.sportId })
        return false
      }
      return true
    })

    const threshold = this.sportId === 'BASKETBALL' ? 1200 : this.sportId === 'F1' ? 3200 : 2500
    if (this.timeSinceEvent > this.nextEventIn) {
      this.timeSinceEvent = 0
      this.nextEventIn = threshold + Math.random() * 3000
      this.triggerGameEvent()
    }
  }

  private triggerGameEvent() {
    const conf = SPORT_CONFIGS[this.sportId]
    const carrier = this.players[this.ballCarrierIdx] || this.players[0]
    const roll = Math.random()
    const id = Math.random().toString(36).substring(7)

    const actionType = conf.actionButtons[Math.floor(Math.random() * conf.actionButtons.length)]
    this.pendingTruthEvents.push({ type: actionType, timestamp: this.elapsed, id, team: carrier.team })

    if (roll < 0.65) {
      const teamPlayers = this.players.filter(p => p.team === carrier.team)
      this.ballCarrierIdx = this.players.indexOf(teamPlayers[Math.floor(Math.random() * teamPlayers.length)])
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
  }

  manualEvent(type: string) {
    const now = this.elapsed
    this.stats.showAnomalyPopup = false
    const matchIdx = this.pendingTruthEvents.findIndex(pt => pt.type === type)
    if (matchIdx > -1) {
      const pt = this.pendingTruthEvents[matchIdx]
      const latency = now - pt.timestamp
      this.latencies.push(latency)
      this.stats.hitCount++
      this.pendingTruthEvents.splice(matchIdx, 1)
      this.updateEfficiency()
      this.events.push({ minute: Math.round(this.stats.minute), type, team: pt.team, id: pt.id, status: 'HIT', latency, sport: this.sportId })
      return 'SUCCESS'
    } else {
      this.stats.systemMessage = { text: `❓ UNEXPECTED: [${type}] input recorded.`, type: 'warn', id: now }
      return 'WARN'
    }
  }
}
