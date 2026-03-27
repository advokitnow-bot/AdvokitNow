"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Eye, Edit, Phone, Mail, MapPin, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  phoneNumber: string | null
  email: string | null
  address: string | null
  createdAt: string
  _count: {
    cases: number
  }
}

interface ClientListProps {
  initialClients?: Client[]
}

export function ClientList({ initialClients = [] }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/clients?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients()
    }, 300)

    return () => clearTimeout(debounce)
  }, [search])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client cases</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Cases</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-600 text-white">{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/clients/${client.id}`} className="font-medium text-blue-600 hover:underline">
                            {client.name}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.phoneNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{client.phoneNumber}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {!client.phoneNumber && !client.email && (
                          <span className="text-muted-foreground text-sm">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.address ? (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                          <span className="line-clamp-2">{client.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No address</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{client._count.cases}</span>
                        <span className="text-muted-foreground text-sm">cases</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
