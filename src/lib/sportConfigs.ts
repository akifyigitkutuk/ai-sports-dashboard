import { SportType } from './gameEngine'

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
  { x: 60, y: 18 },  // Start/Finish
  { x: 85, y: 22 },  // T1 approach
  { x: 92, y: 32 },  // T1
  { x: 88, y: 40 },  // T2
  { x: 84, y: 46 },  // T3
  { x: 70, y: 48 },  // Straight to T4
  { x: 55, y: 44 },  // T4
  { x: 42, y: 52 },  // T5
  { x: 28, y: 50 },  // T6
  { x: 12, y: 58 },  // T7
  { x: 18, y: 72 },  // T8
  { x: 35, y: 74 },  // T9
  { x: 55, y: 72 },  // T10
  { x: 75, y: 65 },  // Straight to T11
  { x: 95, y: 58 },  // T11
  { x: 88, y: 48 },  // T12
  { x: 102, y: 42 }, // T13
  { x: 105, y: 32 }, // T14-15 chicane
  { x: 112, y: 24 }, // T16
  { x: 112, y: 12 }, // Long Back Straight entry
  { x: 60, y: 12 },  // Back Straight middle
  { x: 15, y: 12 },  // T17 Hairpin entry
  { x: 8, y: 20 },   // T17
  { x: 25, y: 32 },  // T18
  { x: 45, y: 25 },  // T19
]

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  SOCCER: {
    id: 'SOCCER', name: 'Soccer', dimX: 120, dimY: 80, playerCount: 22, objectName: 'Ball',
    actionButtons: ['PASS', 'SHOT', 'FOUL', 'SAVE'],
    surfaceColor: '#0a1f0a', surfaceStyle: 'GRASS', markingColor: 'rgba(255,255,255,0.4)',
    perspectiveTop: 0.6
  },
  HOCKEY: {
    id: 'HOCKEY', name: 'Ice Hockey', dimX: 200, dimY: 85, playerCount: 12, objectName: 'Puck',
    actionButtons: ['SLAPSHOT', 'BODYCHECK', 'SAVE', 'FOUL'],
    surfaceColor: '#e0f7fa', surfaceStyle: 'ICE', markingColor: 'rgba(255,100,100,0.5)',
    perspectiveTop: 0.7, secondaryColor: '#bbdefb'
  },
  BASKETBALL: {
    id: 'BASKETBALL', name: 'Basketball', dimX: 94, dimY: 50, playerCount: 10, objectName: 'Ball',
    actionButtons: ['3-POINTER', 'SLAM DUNK', 'BLOCK', 'PASS'],
    surfaceColor: '#3e2723', surfaceStyle: 'WOOD', markingColor: '#ffd54f',
    perspectiveTop: 0.5, secondaryColor: '#5d4037'
  },
  AM_FOOTBALL: {
    id: 'AM_FOOTBALL', name: 'American Football', dimX: 120, dimY: 53.3, playerCount: 22, objectName: 'Pigskin',
    actionButtons: ['TOUCHDOWN', 'SACK', 'PASS', 'FIELD GOAL'],
    surfaceColor: '#1b5e20', surfaceStyle: 'GRASS', markingColor: '#fff',
    perspectiveTop: 0.65
  },
  F1: {
    id: 'F1', name: 'F1 Racing', dimX: 120, dimY: 80, playerCount: 20, objectName: 'Car',
    actionButtons: ['PIT STOP', 'OVERTAKE', 'LAP', 'CRASH'],
    surfaceColor: '#121214', surfaceStyle: 'ASPHALT', markingColor: '#fff',
    perspectiveTop: 0.55, secondaryColor: '#f44336',
    f1Path: MIAMI_PATH,
    f1DrsZones: [
      { start: 0.75, end: 0.85 }, // Back straight
      { start: 0.2, end: 0.28 },  // Between T3 and T4 (approx)
      { start: 0.0, end: 0.05 },  // Pit straight
    ]
  }
}
