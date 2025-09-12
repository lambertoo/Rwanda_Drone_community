import { useState, useEffect } from 'react'

interface EmploymentType {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  isActive: boolean
  order: number
}

export function useEmploymentTypes(category?: string) {
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmploymentTypes()
  }, [category])

  const fetchEmploymentTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = category 
        ? `/api/employment-types?category=${category}`
        : '/api/employment-types'
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch employment types')
      }
      
      const data = await response.json()
      setEmploymentTypes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employment types')
      console.error('Error fetching employment types:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    employmentTypes,
    loading,
    error,
    refetch: fetchEmploymentTypes
  }
}
