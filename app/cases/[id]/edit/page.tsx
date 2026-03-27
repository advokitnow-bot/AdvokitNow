"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CaseForm } from "@/components/cases/case-form"
import { useToast } from "@/hooks/use-toast"

export default function EditCasePage() {
  const params = useParams()
  const { toast } = useToast()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCaseData(params.id as string)
    }
  }, [params.id])

  const fetchCaseData = async (id: string) => {
    try {
      const response = await fetch(`/api/cases/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch case data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch case data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-8">
        <p>Case not found</p>
      </div>
    )
  }

  return <CaseForm caseId={params.id as string} initialData={caseData} />
}
