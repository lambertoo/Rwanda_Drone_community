import { useState, useEffect } from 'react'

interface OpportunityCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
}

export function useOpportunityCategories() {
  const [categories, setCategories] = useState<OpportunityCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/opportunity-categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      console.error('Error fetching opportunity categories:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}
