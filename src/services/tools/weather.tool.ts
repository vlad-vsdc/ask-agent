const weatherCodeMap: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  80: 'rain showers',
  81: 'heavy rain showers',
  82: 'violent rain showers',
  95: 'thunderstorm',
}

interface GeocodingResponse {
  results?: Array<{
    name: string
    country?: string
    latitude: number
    longitude: number
  }>
}

interface WeatherResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
    wind_speed_10m?: number
  }
}

export const getWeather = async (city: string): Promise<string> => {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1&language=en&format=json`
    const geoResponse = await fetch(geoUrl)

    if (!geoResponse.ok) {
      throw new Error('geocoding_failed')
    }

    const geoData = (await geoResponse.json()) as GeocodingResponse
    const place = geoData.results?.[0]

    if (!place) {
      return `Could not find the city "${city}". Try a more specific name.`
    }

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast')
    weatherUrl.searchParams.set('latitude', String(place.latitude))
    weatherUrl.searchParams.set('longitude', String(place.longitude))
    weatherUrl.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m')
    weatherUrl.searchParams.set('timezone', 'auto')

    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      throw new Error('weather_failed')
    }

    const weatherData = (await weatherResponse.json()) as WeatherResponse
    const current = weatherData.current

    if (!current) {
      return `Current weather for "${city}" is unavailable right now.`
    }

    const condition = weatherCodeMap[current.weather_code ?? -1] ?? 'unknown conditions'
    const cityLabel = [place.name, place.country].filter(Boolean).join(', ')

    return `Current weather in ${cityLabel}: ${Math.round(current.temperature_2m ?? 0)} °C, ${condition}, wind ${Math.round(
      current.wind_speed_10m ?? 0,
    )} km/h.`
  } catch {
    throw new Error('Could not get weather because of a network error. Try again later.')
  }
}
