"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, User, MapPin, Gavel, FileText, Clock, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Timeline from "@/components/timeline/timeline"

interface CaseDetails {
  id: string
  caseNumber: string
  title: string
  description: string | null
  court: string
  judge: string | null
  caseType: string
  status: string
  priority: string
  filingDate: string | null
  nextHearing: string | null
  createdAt: string
  client: {
    id: string
    name: string
    phoneNumber: string | null
    email: string | null
    address: string | null
  }
  documents: Array<{
    id: string
    fileName: string
    originalName: string
    category: string
    createdAt: string
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
  }>
  activityLogs: Array<{
    id: string
    action: string
    description: string
    createdAt: string
  }>
}

export default function CaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [caseData, setCaseData] = useState<CaseDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCaseDetails(params.id as string)
    }
  }, [params.id])

  const fetchCaseDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/cases/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch case details",
          variant: "destructive",
        })
        router.push("/cases")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch case details",
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

  const initialActivities = [
    { time: "2025-10-01 10:00 AM", activity: "Case Filed", description: "Case officially filed.", status: "completed" },
    { time: "2025-10-03 02:00 PM", activity: "Court Hearing", description: "Hearing scheduled.", status: "completed" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{caseData.caseNumber}</h1>
            <p className="text-muted-foreground">{caseData.title}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/cases/${caseData.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Case
          </Link>
        </Button>
      </div>
<Timeline caseId={caseData.id}/>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge className={getPriorityColor(caseData.priority)}>{caseData.priority}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Case Type</p>
                  <p>{caseData.caseType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filing Date</p>
                  <p>{caseData.filingDate ? new Date(caseData.filingDate).toLocaleDateString() : "Not set"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Court:</span>
                  <span>{caseData.court}</span>
                </div>
                {caseData.judge && (
                  <div className="flex items-center space-x-2">
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Judge:</span>
                    <span>{caseData.judge}</span>
                  </div>
                )}
                {caseData.nextHearing && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Next Hearing:</span>
                    <span>{new Date(caseData.nextHearing).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {caseData.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{caseData.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Case-related documents and files</CardDescription>
                </CardHeader>
                <CardContent>
                  {caseData.documents.length === 0 ? (
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {caseData.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.originalName}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.category} • {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {caseData.activityLogs.length === 0 ? (
                    <p className="text-muted-foreground">No activity recorded yet</p>
                  ) : (
                    <div className="space-y-4">
                      {caseData.activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Case-related alerts and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  {caseData.notifications.length === 0 ? (
                    <p className="text-muted-foreground">No notifications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {caseData.notifications.map((notification) => (
                        <div key={notification.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <Badge variant="outline">{notification.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{caseData.client.name}</p>
                  <p className="text-sm text-muted-foreground">Client</p>
                </div>
              </div>

              {caseData.client.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{caseData.client.phoneNumber}</span>
                </div>
              )}

              {caseData.client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{caseData.client.email}</span>
                </div>
              )}

              {caseData.client.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{caseData.client.address}</span>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href={`/clients/${caseData.client.id}`}>View Client Details</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
