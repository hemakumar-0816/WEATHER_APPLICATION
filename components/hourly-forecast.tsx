"use client"

import { Cloud, CloudRain, Sun, CloudSnow, Zap } from "lucide-react"

interface HourlyForecastProps {
  forecast: Array<{
    time: string
    temperature: number
    icon: string
  }>
}

export function HourlyForecast({ forecast }: HourlyForecastProps) {
  const getWeatherIcon = (iconCode: string) => {
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

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-semibold mb-4">Hourly Forecast</h2>
      <div className="grid grid-cols-4 gap-4">
        {forecast.map((hour, index) => (
          <div key={index} className="bg-white/20 rounded-2xl p-4 text-center text-white">
            <div className="text-sm mb-2">{hour.time}</div>
            <div className="flex justify-center mb-2">{getWeatherIcon(hour.icon)}</div>
            <div className="text-sm font-medium">{hour.temperature}°C</div>
          </div>
        ))}
      </div>
    </div>
  )
}
