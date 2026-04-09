export const ENVIRONMENTS = {
  neon: {
    id: 'neon',
    name: 'Cyber City',
    fogColor: '#020617',
    preset: 'night', 
    groundColor: '#0f172a',
    laneColor: '#475569',
    glowColor: '#3b82f6',
    sunColor: '#ffffff',
    ambientIntensity: 0.6
  },
  desert: {
    id: 'desert',
    name: 'Dune Desert',
    fogColor: '#fcd34d',
    preset: 'sunset',
    groundColor: '#f59e0b',
    laneColor: '#b45309',
    glowColor: '#d97706',
    sunColor: '#f97316',
    ambientIntensity: 1.0
  },
  snow: {
    id: 'snow',
    name: 'Arctic Tundra',
    fogColor: '#f8fafc',
    preset: 'dawn',
    groundColor: '#e2e8f0',
    laneColor: '#94a3b8',
    glowColor: '#38bdf8',
    sunColor: '#bae6fd',
    ambientIntensity: 1.2
  }
}

export const SKINS = {
  default: {
    id: 'default',
    name: 'Classic Blue',
    color: '#3b82f6',
    metalness: 0,
    wireframe: false
  },
  gold: {
    id: 'gold',
    name: 'Solid Gold',
    color: '#fbbf24',
    metalness: 1,
    wireframe: false
  },
  hacker: {
    id: 'hacker',
    name: 'Hacker Wire',
    color: '#34d399',
    metalness: 0.2,
    wireframe: true
  }
}

export const THEME_KEYS = Object.keys(ENVIRONMENTS)
export const SKIN_KEYS = Object.keys(SKINS)
