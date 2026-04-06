export type Frequency = 'Daily' | 'Weekly' | 'Monthly';
export type AuditStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
}

export interface ComplianceRequirement {
  id: string;
  categoryId: string;
  description: string;
}

export interface EvidenceRow {
  id: string;
  requirementDescription: string;
  textResponse: string;
  fileAttachment?: string;
  remarks: string;
  status?: 'Pass' | 'Fail' | 'N/A';
}

export interface AuditSubmission {
  id: string;
  date: string;
  categoryId: string;
  frequency: Frequency;
  maker: string;
  checker: string;
  status: AuditStatus;
  evidence: EvidenceRow[];
  checkerComments?: string;
}

export type Role = 'Maker' | 'Checker';
