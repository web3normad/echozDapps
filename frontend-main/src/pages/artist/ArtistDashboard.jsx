import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart2, 
  Music, 
  DollarSign, 
  Users, 
  Upload 
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function ArtistDashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [artistData, setArtistData] = useState({
    totalStreams: 1250000,
    totalRevenue: 62500,
    streamCounts: [
      { name: 'Sunset Memories', streams: 450000 },
      { name: 'Urban Symphony', streams: 800000 }
    ],
    songCatalog: [
      {
        id: 1,
        title: 'Sunset Memories',
        streams: 450000,
        revenue: 22500,
        sharePercentage: 70
      },
      {
        id: 2,
        title: 'Urban Symphony',
        streams: 800000,
        revenue: 40000,
        sharePercentage: 60
      }
    ],
    investorShares: [
      {
        investorName: 'Music Ventures',
        sharePercentage: 20,
        investmentAmount: 15000
      },
      {
        investorName: 'Global Sounds',
        sharePercentage: 10,
        investmentAmount: 7500
      }
    ]
  })

  const renderSection = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-base-100 p-6 rounded-xl flex items-center space-x-4">
                <BarChart2 className="text-[#cc5a7e]" size={40} />
                <div>
                  <h4 className="text-white">Total Streams</h4>
                  <p className="text-2xl font-bold text-[#cc5a7e]">
                    {artistData.totalStreams.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-base-100 p-6 rounded-xl flex items-center space-x-4">
                <DollarSign className="text-[#cc5a7e]" size={40} />
                <div>
                  <h4 className="text-white">Total Revenue</h4>
                  <p className="text-2xl font-bold text-[#cc5a7e]">
                    ${artistData.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-base-100 p-6 rounded-xl flex items-center space-x-4">
                <Music className="text-[#cc5a7e]" size={40} />
                <div>
                  <h4 className="text-white">Song Catalog</h4>
                  <p className="text-2xl font-bold text-[#cc5a7e]">
                    {artistData.songCatalog.length}
                  </p>
                </div>
              </div>
              <div className="bg-base-100 p-6 rounded-xl flex items-center space-x-4">
                <Users className="text-[#cc5a7e]" size={40} />
                <div>
                  <h4 className="text-white">Investors</h4>
                  <p className="text-2xl font-bold text-[#cc5a7e]">
                    {artistData.investorShares.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Streaming Analytics */}
            <div className="bg-base-100 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#cc5a7e] mb-4">Streaming Analytics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={artistData.streamCounts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#cc5a7e"
                  />
                  <YAxis 
                    stroke="#cc5a7e"
                  />
                  <Tooltip 
                    wrapperStyle={{ 
                      backgroundColor: '#cc5a7e',
                      border: '1px solid #cc5a7e',
                      color: '#cc5a7e'
                    }}
                  />
                  <Bar 
                    type="monotone" 
                    dataKey="streams" 
                    fill="#cc5a7e" 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      case 'songs':
        return (
          <div className="dark:bg-dark-primary-100 rounded-xl p-6">
            <h3 className="text-white text-xl mb-4">My Songs</h3>
            <div className="space-y-4">
              {artistData.songCatalog.map(song => (
                <div 
                  key={song.id} 
                  className="flex justify-between items-center dark:bg-dark-primary-200 p-4 rounded-lg"
                >
                  <div>
                    <h4 className="text-[#cc5a7e] font-bold">{song.title}</h4>
                    <p className="text-white">{song.streams.toLocaleString()} Streams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#cc5a7e] font-bold">${song.revenue.toLocaleString()}</p>
                    <p className="text-white">{song.sharePercentage}% Share</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'investors':
        return (
          <div className="dark:bg-dark-primary-100 rounded-xl p-6">
            <h3 className="text-white text-xl mb-4">Investors</h3>
            <div className="space-y-4">
              {artistData.investorShares.map((investor, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center dark:bg-dark-primary-200 p-4 rounded-lg"
                >
                  <div>
                    <h4 className="text-[#cc5a7e] font-bold">{investor.investorName}</h4>
                  </div>
                  <div className="text-right ">
                    <p className="text-white">{investor.sharePercentage}% Share</p>
                    <p className="text-[#cc5a7e] font-bold">${investor.investmentAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen text-white py-24 px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#cc5a7e]">Artist Dashboard</h2>
        <Link 
          to="/upload-music"
          className="bg-[#cc5a7e] text-gray-300 px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#7c3f52] transition-colors"
        >
          <Upload size={20} />
          <span>Upload New Track</span>
        </Link>
      </div>

      <div className="flex space-x-4 mb-8">
        {[
          { name: 'overview', icon: BarChart2 },
          { name: 'songs', icon: Music },
          { name: 'investors', icon: Users }
        ].map(section => (
          <button
            key={section.name}
            onClick={() => setActiveSection(section.name)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg
              ${activeSection === section.name 
                ? 'bg-[#22577a] text-gray-100' 
                : 'bg-dark-primary-100 text-white hover:bg-[#353535]'}
            `}
          >
            <section.icon size={20} />
            <span className="capitalize">{section.name}</span>
          </button>
        ))}
      </div>

      {renderSection()}
    </div>
  )
}

export default ArtistDashboard