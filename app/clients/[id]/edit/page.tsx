"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { useToast } from "@/hooks/use-toast"

export default function EditClientPage() {
  const params = useParams()
  const { toast } = useToast()
  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClientData(params.id as string)
    }
  }, [params.id])

  const fetchClientData = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`)
      if (response.ok) {
        const data = await response.json()
        setClientData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch client data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch client data",
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

  if (!clientData) {
    return (
      <div className="text-center py-8">
        <p>Client not found</p>
      </div>
    )
  }

  return <ClientForm clientId={params.id as string} initialData={clientData} />
}
