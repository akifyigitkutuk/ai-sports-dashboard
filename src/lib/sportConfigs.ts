export type SportType = 'SOCCER' | 'HOCKEY' | 'BASKETBALL' | 'AM_FOOTBALL' | 'F1'

export interface SportConfig {
  id: SportType
  name: string
  dimX: number
  dimY: number
  playerCount: number
  objectName: string
  actionButtons: string[]
  surfaceColor: string
  surfaceStyle: 'GRASS' | 'ICE' | 'WOOD' | 'ASPHALT'
  markingColor: string
  perspectiveTop: number
  secondaryColor?: string
  f1Path?: { x: number; y: number }[]
  f1DrsZones?: { start: number; end: number }[] // progress 0-1
}

export const MIAMI_PATH = [
  { x: 60, y: 18 },  { x: 85, y: 22 },  { x: 92, y: 32 },  { x: 88, y: 40 },  
  { x: 84, y: 46 },  { x: 70, y: 48 },  { x: 55, y: 44 },  { x: 42, y: 52 },  
  { x: 28, y: 50 },  { x: 12, y: 58 },  { x: 18, y: 72 },  { x: 35, y: 74 },  
  { x: 55, y: 72 },  { x: 75, y: 65 },  { x: 95, y: 58 },  { x: 88, y: 48 },  
  { x: 102, y: 42 }, { x: 105, y: 32 }, { x: 112, y: 24 }, { x: 112, y: 12 }, 
  { x: 60, y: 12 },  { x: 15, y: 12 },  { x: 8, y: 20 },   { x: 25, y: 32 },  
  { x: 45, y: 25 },
]

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  SOCCER: {
    id: 'SOCCER', name: 'Soccer', dimX: 120, dimY: 80, playerCount: 22, objectName: 'Ball',
    actionButtons: ['PASS', 'SHOT', 'FOUL', 'SAVE'],
    surfaceColor: '#000', surfaceStyle: 'GRASS', markingColor: '#00e676',
    perspectiveTop: 0.6
  },
  HOCKEY: {
    id: 'HOCKEY', name: 'Ice Hockey', dimX: 200, dimY: 85, playerCount: 12, objectName: 'Puck',
    actionButtons: ['SLAPSHOT', 'BODYCHECK', 'SAVE', 'FOUL'],
    surfaceColor: '#000', surfaceStyle: 'ICE', markingColor: '#00e6ff',
    perspectiveTop: 0.7, secondaryColor: '#ff1744'
  },
  BASKETBALL: {
    id: 'BASKETBALL', name: 'Basketball', dimX: 94, dimY: 50, playerCount: 10, objectName: 'Ball',
    actionButtons: ['3-POINTER', 'SLAM DUNK', 'BLOCK', 'PASS'],
    surfaceColor: '#000', surfaceStyle: 'WOOD', markingColor: '#ff9100',
    perspectiveTop: 0.5, secondaryColor: '#fff'
  },
  AM_FOOTBALL: {
    id: 'AM_FOOTBALL', name: 'American Football', dimX: 120, dimY: 53.3, playerCount: 22, objectName: 'Pigskin',
    actionButtons: ['TOUCHDOWN', 'SACK', 'PASS', 'FIELD GOAL'],
    surfaceColor: '#000', surfaceStyle: 'GRASS', markingColor: '#fff',
    perspectiveTop: 0.65
  },
  F1: {
    id: 'F1', name: 'F1 Racing', dimX: 120, dimY: 80, playerCount: 20, objectName: 'Car',
    actionButtons: ['PIT STOP', 'OVERTAKE', 'LAP', 'CRASH'],
    surfaceColor: '#000', surfaceStyle: 'ASPHALT', markingColor: '#00e6ff',
    perspectiveTop: 0.55, secondaryColor: '#ff1744',
    f1Path: MIAMI_PATH,
    f1DrsZones: [
      { start: 0.75, end: 0.85 }, { start: 0.2, end: 0.28 }, { start: 0.0, end: 0.05 },
    ]
  }
}
