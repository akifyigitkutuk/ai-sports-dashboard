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
  team1Label: string
  team2Label: string
  teamPool: { name: string; sub: string }[]
  digitalTwinMetrics: { key: string; label: string; unit: string }[]
  anomalyScenarios: { message: string; correction: string }[]
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
    perspectiveTop: 0.6, team1Label: 'HOME', team2Label: 'AWAY',
    teamPool: [
      { name: 'THI TIGERS', sub: 'Munich Academy' },
      { name: 'DATA EAGLES', sub: 'Silicon Valley FC' },
      { name: 'AI UNITED', sub: 'Neural City' },
      { name: 'LOGIC LIONS', sub: 'Mainframe SC' }
    ],
    digitalTwinMetrics: [
      { key: 'velocity', label: 'Kick Velocity', unit: 'm/s' },
      { key: 'spin', label: 'Ball Rotation', unit: 'RPM' },
      { key: 'power', label: 'Impact Force', unit: 'N' },
      { key: 'xg', label: 'Expected Goals', unit: 'xG' }
    ],
    anomalyScenarios: [
      { message: 'Shot detected in own half.', correction: 'Long Pass' },
      { message: 'Suspected handball near box.', correction: 'Default to Play' },
      { message: 'Offside trigger at FE_102.', correction: 'Ignore' }
    ]
  },
  HOCKEY: {
    id: 'HOCKEY', name: 'Ice Hockey', dimX: 200, dimY: 85, playerCount: 12, objectName: 'Puck',
    actionButtons: ['SLAPSHOT', 'BODYCHECK', 'SAVE', 'FOUL'],
    surfaceColor: '#e0f7fa', surfaceStyle: 'ICE', markingColor: 'rgba(255,100,100,0.5)',
    perspectiveTop: 0.7, secondaryColor: '#bbdefb',
    team1Label: 'HOME', team2Label: 'AWAY',
    teamPool: [
      { name: 'THI BLIZZARD', sub: 'Munich North' },
      { name: 'ICE BREAKERS', sub: 'Cyber Rink' },
      { name: 'POLAR BEARS', sub: 'Arctic HC' },
      { name: 'GLACIER GIANTS', sub: 'Berg City' }
    ],
    digitalTwinMetrics: [
      { key: 'velocity', label: 'Puck Velocity', unit: 'm/s' },
      { key: 'impact', label: 'Impact Force', unit: 'kg-m/s' },
      { key: 'flex', label: 'Stick Flex', unit: '%' },
      { key: 'saveProb', label: 'Save Probability', unit: '%' }
    ],
    anomalyScenarios: [
      { message: 'Bodycheck force anomaly.', correction: 'Check Intensity' },
      { message: 'Puck exit detected.', correction: 'Icing suspect' },
      { message: 'Crease violation suspect.', correction: 'Goalie Interference' }
    ]
  },
  BASKETBALL: {
    id: 'BASKETBALL', name: 'Basketball', dimX: 94, dimY: 50, playerCount: 10, objectName: 'Ball',
    actionButtons: ['3-POINTER', 'SLAM DUNK', 'BLOCK', 'PASS'],
    surfaceColor: '#3e2723', surfaceStyle: 'WOOD', markingColor: '#ffd54f',
    perspectiveTop: 0.5, secondaryColor: '#5d4037',
    team1Label: 'HOME', team2Label: 'AWAY',
    teamPool: [
      { name: 'THI HOOPS', sub: 'Courtside District' },
      { name: 'NET RIPPERS', sub: 'Skyline City' },
      { name: 'DATA DUNKERS', sub: 'Digital Arena' },
      { name: 'PIXEL PISTONS', sub: 'Retro Court' }
    ],
    digitalTwinMetrics: [
      { key: 'shotArc', label: 'Release Angle', unit: 'deg' },
      { key: 'jointAngle', label: 'Knee Angle', unit: 'deg' },
      { key: 'shotProb', label: 'Shot Probability', unit: '%' },
      { key: 'rotation', label: 'Ball Rotation', unit: 'rad/s' }
    ],
    anomalyScenarios: [
      { message: 'Traveling suspect detected.', correction: 'Dribble' },
      { message: '3-second key violation.', correction: 'Pivot' },
      { message: 'Shot arc anomaly.', correction: 'Blocked Shot' }
    ]
  },
  AM_FOOTBALL: {
    id: 'AM_FOOTBALL', name: 'American Football', dimX: 120, dimY: 53.3, playerCount: 22, objectName: 'Pigskin',
    actionButtons: ['TOUCHDOWN', 'SACK', 'PASS', 'FIELD GOAL'],
    surfaceColor: '#1b5e20', surfaceStyle: 'GRASS', markingColor: '#fff',
    perspectiveTop: 0.65, team1Label: 'OFFENSE', team2Label: 'DEFENSE',
    teamPool: [
      { name: 'THI RAVENS', sub: 'Field General' },
      { name: 'CYBER TITANS', sub: 'League Alpha' },
      { name: 'GRIDIRON GHOSTS', sub: 'Night Stadium' },
      { name: 'DATA DESTROYERS', sub: 'Iron Bowl' }
    ],
    digitalTwinMetrics: [
      { key: 'velocity', label: 'Launch Velocity', unit: 'mph' },
      { key: 'pressure', label: 'Pocket Pressure', unit: '%' },
      { key: 'catchProb', label: 'Catch Probability', unit: '%' },
      { key: 'tackleForce', label: 'Tackle Force', unit: 'G' }
    ],
    anomalyScenarios: [
      { message: 'Incomplete pass suspect.', correction: 'Fumble' },
      { message: 'False start AI-detected.', correction: 'Offside' },
      { message: 'Forward pass discrepancy.', correction: 'Lateral' }
    ]
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
    ],
    team1Label: 'LEADER', team2Label: 'CHASER',
    teamPool: [
      { name: 'VER', sub: 'RED BULL' },
      { name: 'HAM', sub: 'MERCEDES' },
      { name: 'LEC', sub: 'FERRARI' },
      { name: 'NOR', sub: 'MCLAREN' },
      { name: 'ALO', sub: 'ASTON MARTIN' },
      { name: 'RUS', sub: 'MERCEDES' },
      { name: 'PIA', sub: 'MCLAREN' },
      { name: 'SAI', sub: 'FERRARI' }
    ],
    digitalTwinMetrics: [
      { key: 'velocity', label: 'Car Velocity', unit: 'km/h' },
      { key: 'gforce', label: 'Lateral G-Force', unit: 'G' },
      { key: 'tireTemp', label: 'Tyre Temperature', unit: 'C' },
      { key: 'downforce', label: 'Total Downforce', unit: 'kg' }
    ],
    anomalyScenarios: [
      { message: 'Car #7 telemetry dip.', correction: 'Pit Entry' },
      { message: 'Off-track excursion suspect.', correction: 'Track Limits' },
      { message: 'Illegal overtake detected.', correction: 'Pos Swap' }
    ]
  }
}
