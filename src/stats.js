export const STATS = [
  { key: 'strength', label: 'Force', icon: '💪' },
  { key: 'speed', label: 'Vitesse', icon: '⚡' },
  { key: 'magic', label: 'Magie', icon: '✨' },
  { key: 'defense', label: 'Défense', icon: '🛡️' },
]

export const totalStats = (c) => STATS.reduce((sum, s) => sum + (c[s.key] ?? 0), 0)
