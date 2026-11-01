import type { Achievement } from './types'

function extractYear(value: string): number {
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : Number.NEGATIVE_INFINITY
}

/** Sort achievements by displayed year, newest first, keeping original order for ties. */
export function sortAchievementsNewestFirst(achievements: Achievement[]): Achievement[] {
  return achievements
    .map((item, index) => ({ item, index, year: extractYear(item.year) }))
    .sort((a, b) => b.year - a.year || a.index - b.index)
    .map(({ item }) => item)
}

/** Keep the source index available so admin edits update the correct original item. */
export function sortAchievementsWithSourceIndex(achievements: Achievement[]) {
  return achievements
    .map((item, index) => ({ item, index, year: extractYear(item.year) }))
    .sort((a, b) => b.year - a.year || a.index - b.index)
}
