"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Phone, Mail, MapPin, FileText, Calendar, User, Plus, Eye, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientDetails {
  id: string
  name: string
  phoneNumber: string | null
  email: string | null
  address: string | null
  notes: string | null
  createdAt: string
  cases: Array<{
    id: string
    caseNumber: string
    title: string
    court: string
    caseType: string
    status: string
    priority: string
    nextHearing: string | null
    createdAt: string
    _count: {
      documents: number
    }
  }>
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [clientData, setClientData] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClientDetails(params.id as string)
    }
  }, [params.id])

  const fetchClientDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`)
      if (response.ok) {
        const data = await response.json()
        setClientData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch client details",
          variant: "destructive",
        })
        router.push("/clients")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch client details",
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "CLOSED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "DISMISSED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "SETTLED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "LOW":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white text-lg">{getInitials(clientData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{clientData.name}</h1>
              <p className="text-muted-foreground">Client Profile</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/cases/new?clientId=${clientData.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Case
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/clients/${clientData.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientData.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{clientData.phoneNumber}</span>
                </div>
              )}

              {clientData.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{clientData.email}</span>
                </div>
              )}

              {clientData.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{clientData.address}</span>
                </div>
              )}

              {!clientData.phoneNumber && !clientData.email && !clientData.address && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No contact information available</span>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Client Since</p>
                <p className="text-sm">{new Date(clientData.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Cases</p>
                <p className="text-sm font-bold">{clientData.cases.length}</p>
              </div>
            </CardContent>
          </Card>

          {clientData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{clientData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="cases" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cases">Cases ({clientData.cases.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="cases">
              <Card>
                <CardHeader>
                  <CardTitle>Client Cases</CardTitle>
                  <CardDescription>All cases associated with this client</CardDescription>
                </CardHeader>
                <CardContent>
                  {clientData.cases.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No cases found for this client</p>
                      <Button asChild>
                        <Link href={`/cases/new?clientId=${clientData.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Case
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Case Number</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Court</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Next Hearing</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientData.cases.map((case_) => (
                          <TableRow key={case_.id}>
                            <TableCell className="font-medium">
                              <Link href={`/cases/${case_.id}`} className="text-blue-600 hover:underline">
                                {case_.caseNumber}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{case_.title}</p>
                                <p className="text-sm text-muted-foreground">{case_.caseType}</p>
                              </div>
                            </TableCell>
                            <TableCell>{case_.court}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              {case_.nextHearing ? (
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{new Date(case_.nextHearing).toLocaleDateString()}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{case_._count.documents}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/cases/${case_.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
