import { DocumentUpload } from "@/components/documents/document-upload"

export default function DocumentUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground">Upload new documents to your cases</p>
      </div>
      <DocumentUpload />
    </div>
  )
}
