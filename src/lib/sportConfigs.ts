export type SportType = 'SOCCER' | 'HOCKEY' | 'BASKETBALL' | 'AM_FOOTBALL' | 'F1'

export interface SportConfig {
  name: string
  id: SportType
  dimX: number
  dimY: number
  surfaceColor: string
  markingColor: string
  actionButtons: string[]
  playerCount: number
  objectName: string // 'BALL' | 'PUCK' | 'CAR'
  perspectiveTop: number // Projection scale at the top (narrowness)
  surfaceStyle: 'GRASS' | 'ICE' | 'WOOD' | 'ASPHALT'
  secondaryColor?: string
}

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  SOCCER: {
    name: 'Soccer',
    id: 'SOCCER',
    dimX: 120,
    dimY: 80,
    surfaceColor: '#0c3d0c', // Dark Lush Green
    markingColor: 'rgba(255, 255, 255, 0.5)',
    actionButtons: ['CARD', 'PASS', 'FOUL', 'SHOT'],
    playerCount: 22,
    objectName: 'BALL',
    perspectiveTop: 0.62,
    surfaceStyle: 'GRASS'
  },
  HOCKEY: {
    name: 'Ice Hockey',
    id: 'HOCKEY',
    dimX: 200,
    dimY: 85,
    surfaceColor: '#e0f4ff', // Crisp Ice Blue
    markingColor: 'rgba(50, 100, 255, 0.4)',
    actionButtons: ['SHOT', 'SAVE', 'FOUL', 'PENALTY'],
    playerCount: 12,
    objectName: 'PUCK',
    perspectiveTop: 0.70,
    surfaceStyle: 'ICE',
    secondaryColor: '#ff2244' // Red lines
  },
  BASKETBALL: {
    name: 'Basketball',
    id: 'BASKETBALL',
    dimX: 94,
    dimY: 50,
    surfaceColor: '#8b4513', // Saddle Brown Parquet
    markingColor: 'rgba(255, 255, 255, 0.35)',
    actionButtons: ['SHOT', '3-POINTER', 'FOUL', 'REBOUND'],
    playerCount: 10,
    objectName: 'BALL',
    perspectiveTop: 0.78,
    surfaceStyle: 'WOOD',
    secondaryColor: '#5c3a21'
  },
  AM_FOOTBALL: {
    name: 'American Football',
    id: 'AM_FOOTBALL',
    dimX: 120,
    dimY: 53.3,
    surfaceColor: '#1b4d3e', 
    markingColor: 'rgba(255, 255, 255, 0.6)',
    actionButtons: ['TACKLE', 'PASS', 'TOUCHDOWN', 'KICK'],
    playerCount: 22,
    objectName: 'BALL',
    perspectiveTop: 0.62,
    surfaceStyle: 'GRASS'
  },
  F1: {
    name: 'F1 Racing',
    id: 'F1',
    dimX: 500,
    dimY: 200,
    surfaceColor: '#1a1a1c', // Dark Asphalt
    markingColor: 'rgba(255, 255, 255, 0.2)',
    actionButtons: ['PIT STOP', 'OVERTAKE', 'LAP', 'FLAG'],
    playerCount: 20,
    objectName: 'CAR',
    perspectiveTop: 0.55,
    surfaceStyle: 'ASPHALT',
    secondaryColor: '#ff4b4b' // Red curbs
  }
}
