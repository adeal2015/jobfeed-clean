'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
  published_at: string | null
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Date inconnue'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Date invalide'
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    // Si c'est récent (moins de 7 jours), afficher "il y a..."
    if (diffInSeconds < 604800) {
      if (diffInSeconds < 60) return 'il y a quelques secondes'
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
      }
      const days = Math.floor(diffInSeconds / 86400)
      return `il y a ${days} jour${days > 1 ? 's' : ''}`
    }
    
    // Sinon afficher la date formatée
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    return 'Date invalide'
  }
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
      ? 'bg-gradient-to-br from-blue-600 to-blue-500' 
      : 'bg-white border border-slate-200 hover:border-blue-500 shadow-sm'
  }`}>
    <div className="text-3xl mb-4">{icon}</div>
    <div className={`text-4xl font-bold font-mono mb-2 ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
    <div className={`text-xs uppercase tracking-wider font-semibold ${
      highlight ? 'text-white/90' : 'text-slate-500'
    }`}>
      {label}
    </div>
    {change !== undefined && (
      <div className={`mt-3 text-sm flex items-center gap-1 ${highlight ? 'text-white/80' : 'text-blue-600'}`}>
        ↗ {Math.abs(change)} cette semaine
      </div>
    )}
  </div>
)

const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
  const displayDate = formatDate(opportunity.published_at || opportunity.captured_at || opportunity.created_at)
  const isNew = new Date().getTime() - new Date(opportunity.captured_at || opportunity.created_at).getTime() < 24 * 60 * 60 * 1000
  
  const isFreelance = opportunity.type === 'freelance'
  const isCDI = opportunity.type === 'cdi'
  const isCDD = opportunity.type === 'cdd'
  
  const extractTitle = (text: string) => {
    if (!text) return 'Opportunité IT'
    const firstLine = text.split('\n')[0]
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
  }

  const displayTitle = opportunity.title ? extractTitle(opportunity.title) : extractTitle(opportunity.description)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-500 relative">
      {/* Header avec badges */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex-1">
          {opportunity.company && (
            <div className="text-blue-600 font-bold text-lg mb-1">{opportunity.company}</div>
          )}
          <div className="text-slate-500 text-sm">{displayDate}</div>
        </div>
        <div className="flex flex-col gap-2">
          {isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              NOUVEAU
            </span>
          )}
          {isFreelance && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              FREELANCE
            </span>
          )}
          {isCDI && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
              CDI
            </span>
          )}
          {isCDD && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
              CDD
            </span>
          )}
        </div>
      </div>

      {/* Titre */}
      <h3 className="text-xl font-bold mb-6 text-slate-900">{displayTitle}</h3>

      {/* Informations clés - Layout vertical */}
      <div className="space-y-3 mb-6">
        {/* Localisation */}
        {opportunity.location && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">📍</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Lieu</div>
              <div className="text-sm font-medium text-slate-900">
                {opportunity.location}
                {opportunity.remote && <span className="text-blue-600 ml-2">• Hybride</span>}
              </div>
            </div>
          </div>
        )}

        {/* TJM */}
        {(opportunity.rate_min || opportunity.rate_max) && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">💰</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">TJM</div>
              <div className="text-sm font-medium text-slate-900">
                {opportunity.rate_min && opportunity.rate_max 
                  ? `${opportunity.rate_min} - ${opportunity.rate_max}€`
                  : opportunity.rate_min 
                  ? `${opportunity.rate_min}€`
                  : `${opportunity.rate_max}€`}
              </div>
            </div>
          </div>
        )}

        {/* Durée */}
        {opportunity.analysis?.duration && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Durée</div>
              <div className="text-sm font-medium text-slate-900">{opportunity.analysis.duration}</div>
            </div>
          </div>
        )}

        {/* Démarrage */}
        {opportunity.analysis?.start_date && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">🚀</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Démarrage</div>
              <div className="text-sm font-medium text-slate-900">{opportunity.analysis.start_date}</div>
            </div>
          </div>
        )}

        {/* Profil recherché */}
        {opportunity.analysis?.position && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">👤</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Profil</div>
              <div className="text-sm font-medium text-slate-900">{opportunity.analysis.position}</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <a 
          href={opportunity.linkedin_post_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-center"
        >
          Voir sur LinkedIn →
        </a>
        <button className="px-4 py-2.5 rounded-lg border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-sm font-semibold transition-all duration-200">
          ⭐
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
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      // FILTRAGE : Récupérer UNIQUEMENT les vraies opportunités
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', USER_ID)
        .not('company', 'is', null)
        .not('location', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching opportunities:', error)
      } else {
        // Double filtrage : seulement celles avec is_opportunity = true dans analysis
        const filtered = (data || []).filter(opp => {
          if (!opp.analysis) return false
          return opp.analysis.is_opportunity === true
        })
        setOpportunities(filtered)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/')
    }
  }

  const kpis = useMemo(() => {
    const total = opportunities.length
    const freelance = opportunities.filter(opp => opp.type === 'freelance').length
    const emploi = opportunities.filter(opp => opp.type === 'cdi' || opp.type === 'cdd').length
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-slate-900">Job</span>
            <span className="text-slate-900">Feed</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
              AD
            </div>
            <span className="font-medium text-slate-900">Anthony DEAL</span>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Titre */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-slate-900">
            Vos opportunités IT
          </h1>
          <div className="flex items-center gap-8 text-slate-600 text-lg">
            <span>{filteredOpportunities.length} {filteredOpportunities.length > 1 ? 'opportunités détectées' : 'opportunité détectée'}</span>
            <span className="flex items-center gap-2 text-blue-600">
              <span>⚡</span>
              <span>Analyse automatique active</span>
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <KPICard 
            icon="📊"
            value={kpis.total}
            label="Opportunités trouvées"
            change={kpis.total}
          />
          <KPICard 
            icon="💼"
            value={kpis.freelance}
            label="Missions Freelance"
            change={kpis.freelance}
            highlight
          />
          <KPICard 
            icon="🎯"
            value={kpis.emploi}
            label="Offres d'emploi"
            change={kpis.emploi}
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Rechercher par titre, entreprise ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous types</option>
            <option value="freelance">Freelance</option>
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
          </select>
          <select 
            className="px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">Toutes localisations</option>
            <option value="remote">Remote</option>
            <option value="paris">Paris</option>
            <option value="bordeaux">Bordeaux</option>
          </select>
        </div>

        {/* Grille d'opportunités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        {/* Message si aucune opportunité */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">🔍</div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">Aucune opportunité trouvée</h3>
            <p className="text-slate-600">
              Essayez de modifier vos filtres ou lancez un nouveau scan sur LinkedIn
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

