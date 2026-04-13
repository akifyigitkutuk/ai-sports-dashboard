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
  backgroundImage?: string
}

export const OPTIMIZED_USER_PATH = [
  { x: 35, y: 72 },   // Start/Finish Straight
  { x: 60, y: 72 },   
  { x: 95, y: 72 },   // End of Pit Straight
  { x: 108, y: 68 },  // Turn 1 Entry
  { x: 115, y: 55 },  // Turn 2 Apex (The Flick)
  { x: 112, y: 48 },  // Transition to S
  { x: 105, y: 42 },  // S-Section Entry
  { x: 112, y: 35 },  // S-Section Apex 1
  { x: 105, y: 30 },  // S-Section Middle
  { x: 92, y: 22 },   // S-Section Apex 2 (Leftward Exit)
  { x: 80, y: 15 },   // Top Straight Entry
  { x: 55, y: 12 },   // Top Straight Middle
  { x: 30, y: 10 },   // Top Straight End
  { x: 18, y: 12 },   // Sharp Turn 4 (Top Left)
  { x: 12, y: 20 },   // Descent Entry
  { x: 18, y: 32 },   // Infield Section Start
  { x: 45, y: 38 },   // Infield Apex 1
  { x: 70, y: 45 },   // Mid-field Right Turn Apex
  { x: 78, y: 52 },   // Transition Down
  { x: 65, y: 58 },   // Mid-field Exit
  { x: 45, y: 62 },   // Hairpin Approach
  { x: 25, y: 65 },   // Hairpin Entry
  { x: 8, y: 70 },    // Hairpin Apex (Far Left)
  { x: 12, y: 75 },   // Hairpin Exit
  { x: 25, y: 74 },   // Return to Pitch Straight
]

export const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  SOCCER: {
    id: 'SOCCER', name: 'Soccer', dimX: 120, dimY: 80, playerCount: 22, objectName: 'Ball',
    actionButtons: ['PASS', 'SHOT', 'FOUL', 'SAVE'],
    surfaceColor: '#0a1f0a', surfaceStyle: 'GRASS', markingColor: 'rgba(255,255,255,0.4)',
    perspectiveTop: 0.6, team1Label: 'HOME', team2Label: 'AWAY',
    backgroundImage: '/assets/soccer_pitch.png',
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
      { message: 'Shot detected in own half.', correction: 'PASS' },
      { message: 'Suspected handball near box.', correction: 'FOUL' },
      { message: 'Offside trigger at FE_102.', correction: 'PASS' }
    ]
  },
  HOCKEY: {
    id: 'HOCKEY', name: 'Ice Hockey', dimX: 200, dimY: 85, playerCount: 12, objectName: 'Puck',
    actionButtons: ['SLAPSHOT', 'BODYCHECK', 'SAVE', 'FOUL'],
    surfaceColor: '#e0f7fa', surfaceStyle: 'ICE', markingColor: 'rgba(255,100,100,0.5)',
    perspectiveTop: 0.7, secondaryColor: '#bbdefb',
    team1Label: 'HOME', team2Label: 'AWAY',
    backgroundImage: '/assets/hockey_pitch.png',
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
      { message: 'Bodycheck force anomaly.', correction: 'BODYCHECK' },
      { message: 'Puck exit detected.', correction: 'FOUL' },
      { message: 'Crease violation suspect.', correction: 'SAVE' }
    ]
  },
  BASKETBALL: {
    id: 'BASKETBALL', name: 'Basketball', dimX: 94, dimY: 50, playerCount: 10, objectName: 'Ball',
    actionButtons: ['3-POINTER', 'SLAM DUNK', 'BLOCK', 'PASS'],
    surfaceColor: '#3e2723', surfaceStyle: 'WOOD', markingColor: '#ffd54f',
    perspectiveTop: 0.5, secondaryColor: '#5d4037',
    team1Label: 'HOME', team2Label: 'AWAY',
    backgroundImage: '/assets/basketball_pitch.png',
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
      { message: 'Traveling suspect detected.', correction: 'PASS' },
      { message: '3-second key violation.', correction: 'PASS' },
      { message: 'Shot arc anomaly.', correction: 'BLOCK' }
    ]
  },
  AM_FOOTBALL: {
    id: 'AM_FOOTBALL', name: 'American Football', dimX: 120, dimY: 53.3, playerCount: 22, objectName: 'Pigskin',
    actionButtons: ['TOUCHDOWN', 'SACK', 'PASS', 'FIELD GOAL'],
    surfaceColor: '#1b5e20', surfaceStyle: 'GRASS', markingColor: '#fff',
    perspectiveTop: 0.65, team1Label: 'OFFENSE', team2Label: 'DEFENSE',
    backgroundImage: '/assets/am_football_pitch.png',
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
      { message: 'Incomplete pass suspect.', correction: 'PASS' },
      { message: 'False start AI-detected.', correction: 'SACK' },
      { message: 'Forward pass discrepancy.', correction: 'PASS' }
    ]
  },
  F1: {
    id: 'F1', name: 'F1 Racing', dimX: 120, dimY: 80, playerCount: 20, objectName: 'Car',
    actionButtons: ['PIT STOP', 'OVERTAKE', 'LAP', 'CRASH'],
    surfaceColor: '#121214', surfaceStyle: 'ASPHALT', markingColor: '#fff',
    perspectiveTop: 0.55, secondaryColor: '#f44336',
    backgroundImage: '/assets/f1_pitch.png',
    f1Path: OPTIMIZED_USER_PATH,
    f1DrsZones: [
      { start: 0.85, end: 0.1 },  // Pit straight
      { start: 0.38, end: 0.48 }, // Top straight
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
      { message: 'Car #7 telemetry dip.', correction: 'PIT STOP' },
      { message: 'Off-track excursion suspect.', correction: 'LAP' },
      { message: 'Illegal overtake detected.', correction: 'OVERTAKE' }
    ]
  }
}
