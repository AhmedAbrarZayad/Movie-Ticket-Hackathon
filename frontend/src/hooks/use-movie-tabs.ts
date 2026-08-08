import { useState } from 'react'
import type { MovieStatus } from '../types/movie'

export function useMovieTabs(initialTab: MovieStatus = 'now-showing') {
  const [activeTab, setActiveTab] = useState<MovieStatus>(initialTab)

  return {
    activeTab,
    setActiveTab,
  }
}
