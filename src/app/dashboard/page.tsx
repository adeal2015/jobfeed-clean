'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'

interface Opportunity {
  id: string
  title: string
  description: string
  company: string | null
  location: string | null
  remote: boolean | null
  rate_min: number | null
  rate_max: number | null
  type: string | null
  author_name: string | null
  linkedin_post_url: string
  captured_at: string
  created_at: string
  analysis: {
    analyzed?: boolean
    is_opportunity?: boolean
    position?: string
    duration?: string
    start_date?: string
    confidence?: string
  } | null
}

const formatTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'il y a quelques secondes'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `il y a ${days} jour${days > 1 ? 's' : ''}`
  }
  const weeks = Math.floor(diffInSeconds / 604800)
  return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
}

const KPICard = ({ icon, value, label, change, highlight }: {
  icon: string
  value: number
  label: string
  change?: number
  highlight?: boolean
}) => (
  <div className={`rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 ${
    highlight 
      ? 'bg-gradient-to-br from-emerald-600 to-emerald-500' 
      : 'bg-slate-800 border border-slate-700 hover:border-emerald-500'
  }`}>
    <div className="text-3xl mb-4">{icon}</div>
    <div className="text-4xl font-bold font-mono mb-2">{value}</div>
    <div className={`text-xs uppercase tracking-wider font-semibold ${
      highlight ? 'text-white/90' : 'text-slate-400'
    }`}>
      {label}
    </div>
    {change !== undefined && (
      <div className="mt-3 text-sm flex items-center gap-1 text-emerald-400">
        ↗ {Math.abs(change)} cette semaine
      </div>
    )}
  </div>
)

const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
  const timeAgo = formatTimeAgo(opportunity.captured_at || opportunity.created_at)
  const isNew = new Date().getTime() - new Date(opportunity.captured_at || opportunity.created_at).getTime() < 24 * 60 * 60 * 1000
  
  const description = (opportunity.description || '').toLowerCase()
  const title = (opportunity.title || '').toLowerCase()
  const combinedText = description + ' ' + title
  
  let detectedType = opportunity.type
  if (!detectedType) {
    if (combinedText.includes('freelance') || combinedText.includes('mission') || combinedText.includes('tjm')) {
      detectedType = 'freelance'
    } else if (combinedText.includes('cdi') || combinedText.includes('cdd')) {
      detectedType = combinedText.includes('cdd') ? 'cdd' : 'cdi'
    }
  }
  
  const isFreelance = detectedType === 'freelance' || detectedType === 'mission'
  const isCDI = detectedType === 'cdi' || detectedType === 'cdd'
  
  const extractTitle = (text: string) => {
    if (!text) return 'Opportunité IT'
    const firstLine = text.split('\n')[0]
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
  }

  const displayTitle = opportunity.title ? extractTitle(opportunity.title) : extractTitle(opportunity.description)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 transition-all duration-300 hover:translate-x-2 hover:border-emerald-500 hover:shadow-xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-emerald-500 before:scale-y-0 hover:before:scale-y-100 before:transition-transform">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {opportunity.company && (
            <div className="text-emerald-400 font-bold mb-1">{opportunity.company}</div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {isNew && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500 uppercase">Nouveau</span>}
          {isFreelance && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500 uppercase">Mission Freelance</span>}
          {isCDI && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500 uppercase">{detectedType?.toUpperCase()}</span>}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 leading-tight">{displayTitle}</h3>

      {isFreelance && (
        <div className="space-y-4 mb-4">
          <div className="border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">🎯</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Mission</span>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed pl-11">
              {opportunity.description || 'NC'}
            </div>
          </div>

          <div className="border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">👤</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Profil recherché</span>
            </div>
            <div className="text-slate-300 text-sm pl-11">
              {opportunity.analysis?.position || 'NC'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">📋</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Modalités clés</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-11">
              <div className="flex gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Durée</div>
                  <div className="text-sm font-semibold">{opportunity.analysis?.duration || 'NC'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Localisation</div>
                  <div className="text-sm font-semibold">
                    {opportunity.location || 'NC'}
                    {opportunity.remote && ' / hybride'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">🚀</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Démarrage</div>
                  <div className="text-sm font-semibold">{opportunity.analysis?.start_date || 'NC'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">💰</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">TJM</div>
                  <div className="text-sm font-semibold">
                    {opportunity.rate_min && opportunity.rate_max 
                      ? `${opportunity.rate_min} - ${opportunity.rate_max} €`
                      : opportunity.rate_min 
                      ? `${opportunity.rate_min}€`
                      : opportunity.rate_max 
                      ? `${opportunity.rate_max}€`
                      : 'NC'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCDI && (
        <div className="space-y-4 mb-4">
          <div className="border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">🚀</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Annonce</span>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed pl-11">
              {opportunity.description || 'NC'}
            </div>
          </div>

          <div className="border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">🎯</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Profil recherché</span>
            </div>
            <div className="text-slate-300 text-sm pl-11">
              {opportunity.analysis?.position || 'NC'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">💼</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Conditions</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-11">
              <div className="flex gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Localisation</div>
                  <div className="text-sm font-semibold">
                    {opportunity.location || 'NC'}
                    {opportunity.remote && ' / hybride'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">📝</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Contrat</div>
                  <div className="text-sm font-semibold">{detectedType?.toUpperCase() || 'NC'}</div>
                </div>
              </div>
              <div className="flex gap-2 col-span-2">
                <span className="text-lg">💰</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Salaire</div>
                  <div className="text-sm font-semibold">
                    {opportunity.rate_min && opportunity.rate_max 
                      ? `${opportunity.rate_min} - ${opportunity.rate_max} K€ brut annuel`
                      : 'NC (selon profil)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFreelance && !isCDI && (
        <div className="space-y-4 mb-4">
          <div className="border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl bg-emerald-500/10 p-2 rounded-lg">📝</span>
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Description</span>
            </div>
            <div className="text-slate-300 text-sm pl-11">{opportunity.description}</div>
          </div>
          {opportunity.location && (
            <div className="grid grid-cols-2 gap-3 pl-11">
              <div className="flex gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase">Localisation</div>
                  <div className="text-sm font-semibold">{opportunity.location}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-slate-700 pt-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-amber-400 font-semibold">
          <span>🕐</span>
          <span>{timeAgo}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <a 
          href={opportunity.linkedin_post_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
        >
          ↗ Voir sur LinkedIn
        </a>
        <button className="px-6 py-3 rounded-lg border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 font-semibold transition-all duration-200">
          ⭐ Intéressant
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching opportunities:', error)
      } else {
        setOpportunities(data || [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const kpis = useMemo(() => {
    const total = opportunities.length
    
    const freelance = opportunities.filter(opp => {
      if (opp.type === 'freelance' || opp.type === 'mission') return true
      const text = ((opp.description || '') + ' ' + (opp.title || '')).toLowerCase()
      return text.includes('freelance') || text.includes('mission') || text.includes('tjm')
    }).length
    
    const emploi = opportunities.filter(opp => {
      if (opp.type === 'cdi' || opp.type === 'cdd') return true
      const text = ((opp.description || '') + ' ' + (opp.title || '')).toLowerCase()
      return text.includes('cdi') || text.includes('cdd') || text.includes('recrutement')
    }).length

    return { total, freelance, emploi }
  }, [opportunities])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = !searchTerm || 
        opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === 'all' || opp.type === filterType
      const matchesLocation = filterLocation === 'all' || 
        opp.location?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        (filterLocation === 'remote' && opp.remote)

      return matchesSearch && matchesType && matchesLocation
    })
  }, [opportunities, searchTerm, filterType, filterLocation])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, rgb(16, 185, 129) 0px, transparent 2px, transparent 20px), repeating-linear-gradient(-45deg, rgb(16, 185, 129) 0px, transparent 2px, transparent 20px)'
      }}></div>

      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">Job</span>
            <span className="text-amber-400">Feed</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm font-bold">
              AD
            </div>
            <span className="font-medium">Anthony DEAL</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Opportunités de votre réseau
          </h1>
          <div className="flex items-center gap-8 text-slate-400 text-lg">
            <span>{filteredOpportunities.length} nouvelles opportunités détectées</span>
            <span className="flex items-center gap-2 text-emerald-400">
              <span>⚡</span>
              <span>Dernier scan : il y a 2 heures</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <KPICard 
            icon="📊"
            value={kpis.total}
            label="Posts capturés"
            change={5}
          />
          <KPICard 
            icon="💼"
            value={kpis.freelance}
            label="Missions Freelance"
            change={3}
            highlight
          />
          <KPICard 
            icon="🎯"
            value={kpis.emploi}
            label="Offres d'emploi"
            change={2}
          />
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="Rechercher par titre, entreprise ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous types</option>
            <option value="freelance">Freelance</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
          </select>
          <select 
            className="px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">Toutes localisations</option>
            <option value="remote">Remote</option>
            <option value="paris">Paris</option>
            <option value="bordeaux">Bordeaux</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">🔍</div>
            <h3 className="text-2xl font-bold mb-3">Aucune opportunité trouvée</h3>
            <p className="text-slate-400">
              Essayez de modifier vos filtres ou lancez un nouveau scan
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
