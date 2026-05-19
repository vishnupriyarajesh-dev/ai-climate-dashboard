import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import CurrentWeather from './components/weather/CurrentWeather'
import HourlyForecast from './components/weather/HourlyForecast'
import WeeklyTrends from './components/weather/WeeklyTrends'
import AQIPanel from './components/air/AQIPanel'
import UVIndex from './components/air/UVIndex'
import WindPanel from './components/wind/WindPanel'
import WeatherMap from './components/maps/WeatherMap'
import TemperatureChart from './components/charts/TemperatureChart'
import RainfallChart from './components/charts/RainfallChart'
import ClimateChart from './components/charts/ClimateChart'
import TravelConditions from './components/travel/TravelConditions'
import AISummary from './components/ai/AISummary'
import StormTracker from './components/storm/StormTracker'
import WeatherAlerts from './components/alerts/WeatherAlerts'
import WeatherRiskScore from './components/weather/WeatherRiskScore'

export default function App() {
  const [location, setLocation] = useState({ name: 'Mumbai', lat: 19.076, lon: 72.877 })
  const [activeTab, setActiveTab] = useState('overview')
  const [unit, setUnit] = useState('C')

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-aurora-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-aurora-violet/5 rounded-full blur-3xl" />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar
          location={location}
          setLocation={setLocation}
          unit={unit}
          setUnit={setUnit}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6 relative z-10">
          <WeatherAlerts location={location} />

          {activeTab === 'overview' && (
            <section className="animate-soft-in space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-5">
                  <CurrentWeather location={location} unit={unit} />
                </div>

                <div className="xl:col-span-7 space-y-6">
                  <AISummary location={location} />
                  <WeatherRiskScore location={location} />
                </div>
              </div>

              <HourlyForecast location={location} unit={unit} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <AQIPanel location={location} />
                <UVIndex location={location} />
                <WindPanel location={location} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <TemperatureChart location={location} unit={unit} />
                <RainfallChart location={location} />
              </div>
            </section>
          )}

          {activeTab === 'forecast' && (
            <section className="animate-soft-in">
              <WeeklyTrends location={location} unit={unit} />
            </section>
          )}

          {activeTab === 'map' && (
            <section className="animate-soft-in">
              <WeatherMap location={location} />
            </section>
          )}

          {activeTab === 'climate' && (
            <section className="animate-soft-in">
              <ClimateChart location={location} unit={unit} />
            </section>
          )}

          {activeTab === 'storm' && (
            <section className="animate-soft-in">
              <StormTracker location={location} />
            </section>
          )}

          {activeTab === 'travel' && (
            <section className="animate-soft-in">
              <TravelConditions location={location} />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}