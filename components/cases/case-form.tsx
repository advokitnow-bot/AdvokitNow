"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  phoneNumber: string | null
}

interface CaseFormProps {
  caseId?: string
  initialData?: any
}

export function CaseForm({ caseId, initialData }: CaseFormProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    caseNumber: initialData?.caseNumber || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    court: initialData?.court || "",
    judge: initialData?.judge || "",
    caseType: initialData?.caseType || "",
    status: initialData?.status || "ACTIVE",
    priority: initialData?.priority || "MEDIUM",
    filingDate: initialData?.filingDate ? initialData.filingDate.split("T")[0] : "",
    nextHearing: initialData?.nextHearing ? initialData.nextHearing.split("T")[0] : "",
    clientId: initialData?.clientId || "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = caseId ? `/api/cases/${caseId}` : "/api/cases"
      const method = caseId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Case ${caseId ? "updated" : "created"} successfully`,
        })
        router.push(`/cases/${data.id}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || `Failed to ${caseId ? "update" : "create"} case`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${caseId ? "update" : "create"} case`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{caseId ? "Edit Case" : "Add New Case"}</h1>
          <p className="text-muted-foreground">{caseId ? "Update case information" : "Create a new legal case"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of the case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Case Number *</Label>
                <Input
                  id="caseNumber"
                  value={formData.caseNumber}
                  onChange={(e) => handleInputChange("caseNumber", e.target.value)}
                  placeholder="e.g., CRL/2024/001"
                  required
                  disabled={!!caseId} // Don't allow editing case number
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => handleInputChange("clientId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.phoneNumber && `(${client.phoneNumber})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., State vs. Accused"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the case"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Court Information</CardTitle>
            <CardDescription>Details about the court and proceedings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court">Court *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => handleInputChange("court", e.target.value)}
                  placeholder="e.g., Delhi High Court"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judge">Judge</Label>
                <Input
                  id="judge"
                  value={formData.judge}
                  onChange={(e) => handleInputChange("judge", e.target.value)}
                  placeholder="e.g., Justice A.K. Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseType">Case Type *</Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(value) => handleInputChange("caseType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="CRIMINAL">Criminal</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                    <SelectItem value="CORPORATE">Corporate</SelectItem>
                    <SelectItem value="TAX">Tax</SelectItem>
                    <SelectItem value="LABOR">Labor</SelectItem>
                    <SelectItem value="PROPERTY">Property</SelectItem>
                    <SelectItem value="CONSTITUTIONAL">Constitutional</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DISPOSED">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
            <CardDescription>Key dates for the case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filingDate">Filing Date</Label>
                <Input
                  id="filingDate"
                  type="date"
                  value={formData.filingDate}
                  onChange={(e) => handleInputChange("filingDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextHearing">Next Hearing</Label>
                <Input
                  id="nextHearing"
                  type="date"
                  value={formData.nextHearing}
                  onChange={(e) => handleInputChange("nextHearing", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {caseId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {caseId ? "Update Case" : "Create Case"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
