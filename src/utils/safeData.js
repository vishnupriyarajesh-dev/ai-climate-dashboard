// src/utils/safeData.js
export function safeArray(value) {
  return Array.isArray(value) ? value : []
}

export function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

export function safeMax(values, fallback = 0) {
  const nums = safeArray(values).filter(Number.isFinite)
  return nums.length ? Math.max(...nums) : fallback
}

export function safeMin(values, fallback = 0) {
  const nums = safeArray(values).filter(Number.isFinite)
  return nums.length ? Math.min(...nums) : fallback
}

export function safeAverage(values, fallback = 0) {
  const nums = safeArray(values).filter(Number.isFinite)
  if (!nums.length) return fallback
  return nums.reduce((sum, value) => sum + value, 0) / nums.length
}

export function safePercent(value, max = 100) {
  const num = safeNumber(value, 0)
  if (max <= 0) return 0
  return Math.min((num / max) * 100, 100)
}