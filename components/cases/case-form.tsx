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
                    <SelectItem value="63">AA - ARBITRATION APPEAL</SelectItem><SelectItem value="100">AB - ADVISORY BOARD</SelectItem><SelectItem value="64">AC - ARBITRATION CASE</SelectItem><SelectItem value="65">AR - ARBITRATION REVISION</SelectItem><SelectItem value="61">ARBA - ARBITRATION APPEAL</SelectItem><SelectItem value="60">ARBC - ARBITRATION CASES</SelectItem><SelectItem value="101">CA(R) - CIVIL APPLICATION</SelectItem><SelectItem value="102">CDR - CIRIMINAL DEATH REFRENCE</SelectItem><SelectItem value="74">CEA - CENTRAL EXCISE APPEAL</SelectItem><SelectItem value="27">CER - CENTRAL EXCISE REF.</SelectItem><SelectItem value="30">CESR - CENTRAL EXCISE SALES</SelectItem><SelectItem value="83">CFA - CFA</SelectItem><SelectItem value="103">CFA(MBI) - CIVIL FIRST APPEAL(MBI)</SelectItem><SelectItem value="104">CMA - CIVIL MISCELLANEOUS APPLICATION</SelectItem><SelectItem value="105">CMA(R) - CIVIL MISCELLANEOUS APPEAL</SelectItem><SelectItem value="106">CMAP(R) - CIVIL MISCELLANEOUS APPLICATION</SelectItem><SelectItem value="107">CMAPL - CIVIL MISCELLANEOUS APPEAL</SelectItem><SelectItem value="108">CMC - CIVIL MISCELLANEOUS CASE</SelectItem><SelectItem value="109">CMEC - CIVIL MISCELLANEOUS EXECUTION CASE</SelectItem><SelectItem value="110">CMJ - CIVIL MISCELLANEOUS JURISDICTION</SelectItem><SelectItem value="111">CMP - CIVIL MISCELLANEOUS PETITION</SelectItem><SelectItem value="112">CMSA - CIVIL MISCELLANEOUS SECOND APPEAL</SelectItem><SelectItem value="113">CMWP - CIVIL MISCELLANEOUS WRIT PETITION</SelectItem><SelectItem value="69">COMA - COMPANY APPEAL</SelectItem><SelectItem value="21">COMP - COMPANY PETITION</SelectItem><SelectItem value="31">COMPA - COMPANY APPEALS</SelectItem><SelectItem value="66">CONA - CONTEMPT APPEAL</SelectItem><SelectItem value="67">CONC - CONTEMPT PETITION CIVIL</SelectItem><SelectItem value="73">CONCR - CONTEMPT PETITION CRIMINAL</SelectItem><SelectItem value="15">CONT - CONTEMPT. PETITION</SelectItem><SelectItem value="54">CONTR - CRIMINAL CONTEMPT</SelectItem><SelectItem value="114">COS - CIVIL ORIGINAL SUIT</SelectItem><SelectItem value="140">CP(CRI) - CONTEMPT PETITION (CRIMINAL)</SelectItem><SelectItem value="19">CR - CIVIL REVISION</SelectItem><SelectItem value="51">CRA - CRIMINAL APPEAL</SelectItem><SelectItem value="115">CRCC - CRIMINAL CONFORMATION CASE</SelectItem><SelectItem value="116">CREF - CIVIL REFERENCE</SelectItem><SelectItem value="141">CREGA - CIVIL REGULAR APPEAL</SelectItem><SelectItem value="117">CREV - CIVIL REVIEW</SelectItem><SelectItem value="118">CRMA - CRIMINAL MISCELLANEOUS APPLICATION</SelectItem><SelectItem value="142">CRMC - CRIMINAL MISCELLANEOUS CASE</SelectItem><SelectItem value="119">CRP - CIVIL REVISION PETITION</SelectItem><SelectItem value="53">CRR - CRIMINAL REVISION</SelectItem><SelectItem value="55">CRRE - CRIMINAL REFERENCE</SelectItem><SelectItem value="71">CRRF - CRIMINAL REFERENCE</SelectItem><SelectItem value="72">CRRFC - CRIMINAL REFERENCE CAPITAL</SelectItem><SelectItem value="120">CRSA - CRIMINAL SPECIAL APPEAL</SelectItem><SelectItem value="34">CS - CIVIL SUIT</SelectItem><SelectItem value="82">CSA - CSA</SelectItem><SelectItem value="121">CSA(MBI) - CIVIL SECOND APPEAL(MBI)</SelectItem><SelectItem value="122">CSAP - CIVIL SPECIAL APPEAL</SelectItem><SelectItem value="123">DR - DEATH REFERENCE</SelectItem><SelectItem value="125">EC - EXECUTION CASE</SelectItem><SelectItem value="126">EMC - EXECUTION MISCELLANEOUS CASE</SelectItem><SelectItem value="127">EOC - EXECUTION OBJECTION CASE</SelectItem><SelectItem value="20">EP - ELECTION PETITION</SelectItem><SelectItem value="13">FA - FIRST APPEAL</SelectItem><SelectItem value="75">FEMA - FORIEGN EXCHANGE MANAGEMENT APPEAL</SelectItem><SelectItem value="26">ITA - INCOME TAX APPEAL</SelectItem><SelectItem value="22">ITR - INCOME-TAX REFERENCE</SelectItem><SelectItem value="17">LPA - LETTER PATENT APPEAL</SelectItem><SelectItem value="128">LPAA - LETTER PATENT APPEAL</SelectItem><SelectItem value="12">MA - MISC. APPEAL</SelectItem><SelectItem value="129">MA(cri) - MA(CRI)</SelectItem><SelectItem value="35">MACE - MISC. APPEAL (C. EXCISE)</SelectItem><SelectItem value="59">MACOM - MISC.APPEAL(COMPANY)</SelectItem><SelectItem value="62">MACTR - COMMERCIAL TAX REF.</SelectItem><SelectItem value="28">MAIT - MISC. APPEAL (I.T.)</SelectItem><SelectItem value="130">MAPL - MISCELLANEOUS APPLICATION</SelectItem><SelectItem value="58">MAVAT - MISC. APPEAL(VAT)</SelectItem><SelectItem value="18">MCC - MISC. CIVIL CASE</SelectItem><SelectItem value="70">MCOMA - MISC. COMPANY APPEAL</SelectItem><SelectItem value="24">MCP - MISC. CIVIL PETITION</SelectItem><SelectItem value="52">MCRC - MISC. CRIMINAL CASE</SelectItem><SelectItem value="56">MCRP - MISC. CRI. PETITION</SelectItem><SelectItem value="131">MEC - MISCELLANEOUS EXECUTION CASE</SelectItem><SelectItem value="132">MFA - MISCALLENEOUS FIRST APPREAL</SelectItem><SelectItem value="16">MP - MISC. PETITION</SelectItem><SelectItem value="90">MSA - MISCELLANEOUS SECOND APPEAL</SelectItem><SelectItem value="133">MSAL - MISCALLENEOUS SECOND APPREAL</SelectItem><SelectItem value="25">MWP - MISC. WRIT PETITION</SelectItem><SelectItem value="80">OA - ORIGINAL APPLICATION</SelectItem><SelectItem value="135">OC - OBJECTION CASE</SelectItem><SelectItem value="79">OTA - OTHER TAX APPEALS</SelectItem><SelectItem value="136">RC - REVIEW CASE</SelectItem><SelectItem value="68">RP - REVIEW PETITION</SelectItem><SelectItem value="14">SA - SECOND APPEAL</SelectItem><SelectItem value="85">SATMA - SATMA</SelectItem><SelectItem value="86">SATMCC - SATMCC</SelectItem><SelectItem value="88">SATOA - SATOA</SelectItem><SelectItem value="84">SATOT - SATOT</SelectItem><SelectItem value="89">SATTA - SATTA</SelectItem><SelectItem value="137">SCA - SPECIAL CRIMINAL APPEAL</SelectItem><SelectItem value="138">SCR - SMALL CAUSE REVISION</SelectItem><SelectItem value="139">SCR(MBI) - SMALL CAUSE REVISION(MBI)</SelectItem><SelectItem value="29">STR - SALES TAX REFERENCE</SelectItem><SelectItem value="81">TA - TRANSFER APPLICATION</SelectItem><SelectItem value="76">TR - TAX REFERENCE</SelectItem><SelectItem value="77">VATA - VALUE ADDED TAX APPEAL</SelectItem><SelectItem value="57">WA - WRIT APPEAL</SelectItem><SelectItem value="11">WP - WRIT PETITION</SelectItem><SelectItem value="32">WPS - WRIT PET. (SERVICE)</SelectItem><SelectItem value="78">WTA - WEALTH TAX APPEAL</SelectItem><SelectItem value="23">WTR - WEALTH-TAX REFERENCE</SelectItem>
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
