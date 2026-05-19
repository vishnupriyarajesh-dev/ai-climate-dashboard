// src/utils/riskScores.js
export function calculateWeatherRisk({
  weatherCode = 0,
  temperature = 0,
  humidity = 0,
  windSpeed = 0,
  rainChance = 0,
  aqi = 0,
  uv = 0,
}) {
  let score = 0
  const factors = []

  if (weatherCode >= 95) {
    score += 28
    factors.push('Thunderstorm conditions')
  } else if (weatherCode >= 80) {
    score += 18
    factors.push('Showery weather')
  } else if (weatherCode >= 61) {
    score += 14
    factors.push('Rain conditions')
  } else if (weatherCode >= 51) {
    score += 8
    factors.push('Drizzle')
  }

  if (temperature >= 40) {
    score += 22
    factors.push('Extreme heat')
  } else if (temperature >= 35) {
    score += 14
    factors.push('High heat')
  } else if (temperature <= 3) {
    score += 10
    factors.push('Cold stress')
  }

  if (humidity >= 90 && temperature >= 30) {
    score += 10
    factors.push('Heat stress humidity')
  }

  if (windSpeed >= 60) {
    score += 18
    factors.push('Strong winds')
  } else if (windSpeed >= 40) {
    score += 10
    factors.push('Wind advisory')
  }

  if (rainChance >= 80) {
    score += 18
    factors.push('High rain probability')
  } else if (rainChance >= 55) {
    score += 10
    factors.push('Moderate rain probability')
  }

  if (aqi >= 200) {
    score += 20
    factors.push('Hazardous air quality')
  } else if (aqi >= 150) {
    score += 14
    factors.push('Unhealthy air quality')
  } else if (aqi >= 100) {
    score += 8
    factors.push('Sensitive-group AQI risk')
  }

  if (uv >= 10) {
    score += 8
    factors.push('Very high UV')
  } else if (uv >= 7) {
    score += 5
    factors.push('High UV')
  }

  const finalScore = Math.min(score, 100)

  if (finalScore >= 70) {
    return {
      score: finalScore,
      label: 'High',
      color: 'data-red',
      bg: 'bg-aurora-red',
      factors,
    }
  }

  if (finalScore >= 40) {
    return {
      score: finalScore,
      label: 'Moderate',
      color: 'data-amber',
      bg: 'bg-aurora-amber',
      factors,
    }
  }

  return {
    score: finalScore,
    label: 'Low',
    color: 'data-emerald',
    bg: 'bg-aurora-emerald',
    factors,
  }
}