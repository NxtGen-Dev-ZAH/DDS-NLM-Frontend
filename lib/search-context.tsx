'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { SearchResult, SearchFilters, searchService } from './search'

interface SearchContextType {
  query: string
  results: SearchResult[]
  isLoading: boolean
  isOpen: boolean
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setIsLoading: (loading: boolean) => void
  setIsOpen: (open: boolean) => void
  search: (query: string, filters?: SearchFilters) => Promise<void>
  clearSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const search = useCallback(async (searchQuery: string, filters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    console.log('🔍 Searching for:', searchQuery)
    setIsLoading(true)
    try {
      const searchResults = await searchService.search(searchQuery, filters)
      console.log('✅ Search results:', searchResults)
      setResults(searchResults)
    } catch (error) {
      console.error('❌ Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        search(query)
      } else {
        setResults([])
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, search])

  const value: SearchContextType = {
    query,
    results,
    isLoading,
    isOpen,
    setQuery,
    setResults,
    setIsLoading,
    setIsOpen,
    search,
    clearSearch,
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
} 