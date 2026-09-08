export interface CdamRawDocument {
  originalDocumentName: string;
  mimeType: string;
  size: number;
  classification: string;
  hashToken?: string;
  _links: {
    self: { href: string };
    binary: { href: string };
  };
}

export interface CdamUploadResponse {
  documents: CdamRawDocument[];
}

export interface CdamDocument {
  document_url: string;
  document_binary_url: string;
  document_filename: string;
  document_hash?: string;
  content_type?: string;
  size?: number;
}
