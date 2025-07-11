"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, CloudSnow, Zap, Menu, RotateCcw, Droplets, Wind, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  pressure: number
  hourlyForecast: HourlyForecast[]
}

interface HourlyForecast {
  time: string
  temperature: number
  icon: string
}

export function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchCity, setSearchCity] = useState("")
  const [currentCity, setCurrentCity] = useState("Mumbai")

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo_key"

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case "01d":
      case "01n":
        return <Sun className="w-16 h-16 text-yellow-500" />
      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        return <Cloud className="w-16 h-16 text-purple-500" />
      case "09d":
      case "09n":
      case "10d":
      case "10n":
        return <CloudRain className="w-16 h-16 text-purple-500" />
      case "11d":
      case "11n":
        return <Zap className="w-16 h-16 text-purple-500" />
      case "13d":
      case "13n":
        return <CloudSnow className="w-16 h-16 text-purple-500" />
      default:
        return <Cloud className="w-16 h-16 text-purple-500" />
    }
  }

  const getSmallWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case "01d":
      case "01n":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        return <Cloud className="w-8 h-8 text-purple-500" />
      case "09d":
      case "09n":
      case "10d":
      case "10n":
        return <CloudRain className="w-8 h-8 text-purple-500" />
      case "11d":
      case "11n":
        return <Zap className="w-8 h-8 text-purple-500" />
      case "13d":
      case "13n":
        return <CloudSnow className="w-8 h-8 text-purple-500" />
      default:
        return <Cloud className="w-8 h-8 text-purple-500" />
    }
  }

  const fetchWeatherData = async (city: string) => {
    setLoading(true)
    setError(null)

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
      )

      if (!currentResponse.ok) {
        throw new Error("City not found")
      }

      const currentData = await currentResponse.json()

      // Fetch hourly forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`,
      )

      const forecastData = await forecastResponse.json()

      // Process hourly forecast (next 4 hours)
      const hourlyForecast: HourlyForecast[] = forecastData.list.slice(0, 4).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        temperature: Math.round(item.main.temp),
        icon: item.weather[0].icon,
      }))

      const weatherData: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        pressure: currentData.main.pressure,
        hourlyForecast,
      }

      setWeatherData(weatherData)
      setCurrentCity(city)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCity.trim()) {
      fetchWeatherData(searchCity.trim())
      setSearchCity("")
    }
  }

  const handleRefresh = () => {
    fetchWeatherData(currentCity)
  }

  useEffect(() => {
    fetchWeatherData(currentCity)
  }, [])

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading weather data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl mb-4">Error: {error}</div>
          <Button onClick={() => fetchWeatherData(currentCity)} className="bg-white text-purple-600 hover:bg-gray-100">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="text-lg font-medium">{getCurrentTime()}</div>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{weatherData.location}</h1>
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="text-white hover:bg-white/20">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
          <Button type="submit" className="bg-white text-purple-600 hover:bg-gray-100">
            Search
          </Button>
        </form>
      </div>

      <div className="px-4 pb-8">
        {/* Current Weather Card */}
        <div className="bg-white rounded-3xl p-8 mb-8 text-center shadow-lg">
          <div className="text-5xl font-light text-gray-800 mb-4">{weatherData.temperature}°C</div>
          <div className="flex justify-center mb-4">{getWeatherIcon(weatherData.icon)}</div>
          <div className="text-2xl font-medium text-gray-700">{weatherData.condition}</div>
        </div>

        {/* Hourly Forecast */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Hourly Forecast</h2>
          <div className="grid grid-cols-4 gap-4">
            {weatherData.hourlyForecast.map((hour, index) => (
              <div key={index} className="bg-white/20 rounded-2xl p-4 text-center text-white">
                <div className="text-sm mb-2">{hour.time}</div>
                <div className="flex justify-center mb-2">{getSmallWeatherIcon(hour.icon)}</div>
                <div className="text-sm font-medium">{hour.temperature}°C</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-300" />
              <div className="text-sm mb-1">Humidity</div>
              <div className="text-lg font-semibold">{weatherData.humidity}%</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
              <Wind className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm mb-1">Wind speed</div>
              <div className="text-lg font-semibold">{weatherData.windSpeed} m/s</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
              <Gauge className="w-8 h-8 mx-auto mb-2 text-green-300" />
              <div className="text-sm mb-1">Pressure</div>
              <div className="text-lg font-semibold">{weatherData.pressure} hPa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
