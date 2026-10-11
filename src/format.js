// Prices are in Tunisian dinars, e.g. "189,000 DT"
const money = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' })

export const formatPrice = (value) => (Number(value) === 0 ? 'Gratuit' : money.format(value))

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// A stable color per game (used for covers without a picture)
export function gameHue(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return hash
}
