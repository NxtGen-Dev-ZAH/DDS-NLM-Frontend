'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchService } from '@/lib/search'

export function SearchTest() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const searchResults = await searchService.search(query)
      setResults(searchResults)
      console.log('Test search results:', searchResults)
    } catch (error) {
      console.error('Test search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Search Test</h3>
      <div className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search term..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {results.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Results ({results.length}):</h4>
          <div className="space-y-2">
            {results.map((result) => (
              <div key={result.id} className="p-2 border rounded text-sm">
                <div className="font-medium">{result.title}</div>
                <div className="text-muted-foreground">{result.description}</div>
                <div className="text-xs text-muted-foreground">
                  Type: {result.type} | Score: {result.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 