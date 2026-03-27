"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  caseId?: string
  onUploadComplete?: (document: any) => void
}

export function DocumentUpload({ caseId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [category, setCategory] = useState("OTHER")
  const [description, setDescription] = useState("")
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || "")
  const [cases, setCases] = useState<Array<{ id: string; caseNumber: string; title: string }>>([])
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter files by size (10MB limit)
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      setFiles((prev) => [...prev, ...validFiles])
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "text/*": [".txt"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const fetchCases = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cases`)
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases || [])
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error)
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      })
      return
    }

    if (!selectedCaseId) {
      toast({
        title: "Case required",
        description: "Please select a case for the documents",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("caseId", selectedCaseId)
        formData.append("category", category)
        formData.append("description", description)

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Failed to upload ${file.name}`)
        }

        const result = await response.json()
        setUploadProgress(((index + 1) / files.length) * 100)
        return result
      })

      const results = await Promise.all(uploadPromises)

      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      })

      // Reset form
      setFiles([])
      setDescription("")
      setUploadProgress(0)

      // Notify parent component
      if (onUploadComplete) {
        results.forEach(onUploadComplete)
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Fetch cases if not provided
  useState(() => {
    if (!caseId) {
      fetchCases()
    }
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Upload case-related documents and files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!caseId && (
          <div className="space-y-2">
            <Label htmlFor="case">Select Case *</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.caseNumber} - {case_.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Document Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PETITION">Petition</SelectItem>
                <SelectItem value="AFFIDAVIT">Affidavit</SelectItem>
                <SelectItem value="EVIDENCE">Evidence</SelectItem>
                <SelectItem value="ORDER">Order</SelectItem>
                <SelectItem value="JUDGMENT">Judgment</SelectItem>
                <SelectItem value="NOTICE">Notice</SelectItem>
                <SelectItem value="CORRESPONDENCE">Correspondence</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
            />
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-muted-foreground/25 hover:border-blue-500"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop files here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, images, and text files (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setFiles([])
              setDescription("")
            }}
            disabled={uploading}
          >
            Clear All
          </Button>
          <Button onClick={uploadFiles} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
