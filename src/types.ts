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
  maker?: string;
  checker?: string;
}

export interface EvidenceRow {
  id: string;
  requirementDescription: string;
  textResponse: string;
  fileAttachment?: string;
  remarks: string;
  status?: 'Pass' | 'Fail' | 'N/A';
  maker?: string;
  checker?: string;
  checkerRemarks?: string;
}

export interface AuditSubmission {
  id: string;
  date: string;
  categoryId: string;
  frequency: Frequency;
  makerId: string;
  makerName: string;
  checkerId?: string;
  checkerName?: string;
  status: AuditStatus;
  evidence: EvidenceRow[];
  checkerComments?: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = 'Maker' | 'Checker' | 'Admin';

export interface User {
  uid: string;
  name: string;
  role: Role;
  email: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resourceId: string;
  resourceType: string;
  details: string;
}
