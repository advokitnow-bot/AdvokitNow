"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react"

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "destructive"
    case "MEDIUM":
      return "default"
    case "LOW":
      return "secondary"
    default:
      return "default"
  }
}

export function UpcomingHearings() {
  const [hearings, setHearings] = useState<any[]>([])

  useEffect(() => {
    async function fetchHearings() {
      const res = await fetch("/api/hearings/upcoming");
      const data = await res.json();
      setHearings(data);
    }
    fetchHearings();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Hearings</CardTitle>
        <CardDescription>Your scheduled court appearances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hearings.length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming hearings.</p>
          )}

          {hearings.map((hearing) => (
            <div
              key={hearing.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{hearing.caseNumber}</Badge>
                  <Badge variant={getPriorityColor(hearing.priority)}>
                    {hearing.priority.toLowerCase()}
                  </Badge>
                </div>

                <h4 className="font-medium">{hearing.title}</h4>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(hearing.nextHearing).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{hearing.time || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{hearing.court}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {hearing.judge} • {hearing.caseType}
                </p>
              </div>

              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
