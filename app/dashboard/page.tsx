// app/dashboard/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import DashboardCard from '@/components/DashboardCard'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { createClient } from '@/app/utils/supabase/client'

type ChartData = { date: string; score: number };
const containerVariants = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [musicMood, setMusicMood] = useState('Loading...');

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch data from our own database
      const { data: dbData } = await supabase.from('behavioral_data').select('created_at, overall_risk_score').order('created_at', { ascending: true })
      if (dbData) {
        const formattedData = dbData.map(item => ({
          date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: item.overall_risk_score,
        }));
        setChartData(formattedData);
      }

      // Fetch data from our new API route
      try {
        const response = await fetch('/api/spotify');
        const data = await response.json();
        if (data.mood) setMusicMood(data.mood);
        else throw new Error(data.error);
      } catch (error) {
        setMusicMood('N/A'); // Set to N/A if Spotify isn't connected or fails
      }

      setLoading(false)
    };
    fetchData();
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score.toString() : '...';

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading Dashboard...</div>
  }

  return (
    <div className="p-8 text-white min-h-screen bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
          {user && <p className="text-gray-400 mt-2">Signed in as: {user.email}</p>}
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">Logout</button>
      </div>
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
        <DashboardCard title="Overall Wellness Score" value={latestScore} change="+2%" />
        <DashboardCard title="Sleep Quality" value="Good" change="+5%" />
        <DashboardCard title="Recent Music Mood" value={musicMood} change="Based on last 20 songs" />
      </motion.div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">Wellness Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="date" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
            <Line type="monotone" dataKey="score" stroke="#4299E1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}