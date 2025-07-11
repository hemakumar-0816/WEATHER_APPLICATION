"use client"

import { Droplets, Wind, Gauge, Eye, Thermometer, Sunrise } from "lucide-react"

interface WeatherDetailsProps {
  humidity: number
  windSpeed: number
  pressure: number
  visibility?: number
  feelsLike?: number
  uvIndex?: number
}

export function WeatherDetails({ humidity, windSpeed, pressure, visibility, feelsLike, uvIndex }: WeatherDetailsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
        <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-300" />
        <div className="text-sm mb-1">Humidity</div>
        <div className="text-lg font-semibold">{humidity}%</div>
      </div>

      <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
        <Wind className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <div className="text-sm mb-1">Wind Speed</div>
        <div className="text-lg font-semibold">{windSpeed} m/s</div>
      </div>

      <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
        <Gauge className="w-8 h-8 mx-auto mb-2 text-green-300" />
        <div className="text-sm mb-1">Pressure</div>
        <div className="text-lg font-semibold">{pressure} hPa</div>
      </div>

      {visibility && (
        <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
          <Eye className="w-8 h-8 mx-auto mb-2 text-cyan-300" />
          <div className="text-sm mb-1">Visibility</div>
          <div className="text-lg font-semibold">{visibility} km</div>
        </div>
      )}

      {feelsLike && (
        <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
          <Thermometer className="w-8 h-8 mx-auto mb-2 text-red-300" />
          <div className="text-sm mb-1">Feels Like</div>
          <div className="text-lg font-semibold">{feelsLike}°C</div>
        </div>
      )}

      {uvIndex && (
        <div className="bg-white/20 rounded-2xl p-4 text-center text-white">
          <Sunrise className="w-8 h-8 mx-auto mb-2 text-orange-300" />
          <div className="text-sm mb-1">UV Index</div>
          <div className="text-lg font-semibold">{uvIndex}</div>
        </div>
      )}
    </div>
  )
}
