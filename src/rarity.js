// Rarity of a character, from its level (used for the card glow and the badge)
export function getRarity(level) {
  if (level >= 80) return { key: 'legendary', label: 'Légendaire' }
  if (level >= 60) return { key: 'epic', label: 'Épique' }
  if (level >= 40) return { key: 'rare', label: 'Rare' }
  return { key: 'common', label: 'Commun' }
}
