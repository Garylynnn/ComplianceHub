import { ComplianceCategory, ComplianceRequirement } from './types';

export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  { id: 'uar', name: 'User Access Review', description: 'Review of user access, authorizations, and revocations.' },
  { id: 'pm', name: 'Patch Management', description: 'Tracking of software updates, impact analysis, and testing.' },
  { id: 'ps', name: 'Physical Security', description: 'CCTV, Biometrics, and Fire Safety checklists.' },
  { id: 'am', name: 'Asset Management', description: 'License counts and reconciliation reports.' },
  { id: 'hr-exit', name: 'Employee Exit Compliance', description: 'Weekly review of exit checklists and asset scrapping.' },
  { id: 'vc-check', name: 'Meeting Room VC Check', description: 'Daily 7 AM verification of Video Conference systems.' },
  { id: 'fac-infra', name: 'Facility Infrastructure', description: 'Daily checks for Cameras and DG Fuel status.' },
];

export const COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  // User Access Review
  { id: 'uar-1', categoryId: 'uar', description: 'Sophos: Admin role lists and MFA settings.', maker: 'Surya.K', checker: 'Shruthi.sb' },
  { id: 'uar-2', categoryId: 'uar', description: 'ZKBio: Biometric personnel admin rights and device privileges.', maker: 'Ajith.kumar.thala', checker: 'Surya.k' },
  { id: 'uar-3', categoryId: 'uar', description: 'Salt-Stack: external_auth configs and master access logs.', maker: 'Gani', checker: 'Linekar' },
  { id: 'uar-4', categoryId: 'uar', description: 'FreeIPA: HBAC (Host Based Access Control) policies and active user lists.' },
  { id: 'uar-5', categoryId: 'uar', description: 'Ruijie: Cloud sub-account management and SSID auth settings.', maker: 'fatah.khan', checker: 'Vinod.S' },
  { id: 'uar-6', categoryId: 'uar', description: 'GLPI: User profiles (Technician/Admin) and account status.', maker: 'Rakshith', checker: 'Fatah.khan' },
  { id: 'uar-7', categoryId: 'uar', description: 'NetBird: Peer group access control policies and IdP integration.', maker: 'Fatah', checker: 'Gani' },
  { id: 'uar-8', categoryId: 'uar', description: 'Pritunl: VPN user lists and "Two-Step Authentication" enforcement.', maker: 'Gani', checker: 'Linekar' },
  
  // Patch Management
  { id: 'pm-1', categoryId: 'pm', description: 'Gitlab links for latest patch deployments.' },
  { id: 'pm-2', categoryId: 'pm', description: 'SOP upload for patch testing procedures.' },
  { id: 'pm-3', categoryId: 'pm', description: 'Impact analysis report for critical patches.' },
  
  // Physical Security
  { id: 'ps-1', categoryId: 'ps', description: 'CCTV Backup Policy and verification logs.' },
  { id: 'ps-2', categoryId: 'ps', description: 'Biometric access logs review.' },
  { id: 'ps-3', categoryId: 'ps', description: 'Fire Safety equipment maintenance records.' },
  
  // Asset Management
  { id: 'am-1', categoryId: 'am', description: 'Software license count reconciliation.' },
  { id: 'am-2', categoryId: 'am', description: 'Hardware asset inventory audit.' },

  // Employee Exit Compliance (Weekly)
  { id: 'hr-1', categoryId: 'hr-exit', description: 'Review of weekly exit employee checklists.' },
  { id: 'hr-2', categoryId: 'hr-exit', description: 'Address gaps for assets not scrapped/returned.' },

  // Meeting Room VC Check (Daily)
  { id: 'vc-1', categoryId: 'vc-check', description: '7 AM check: Video Conference functionality in all meeting rooms.' },

  // Facility Infrastructure (Daily)
  { id: 'fac-1', categoryId: 'fac-infra', description: 'Verification of all CCTV cameras (Live & Recording status).' },
  { id: 'fac-2', categoryId: 'fac-infra', description: 'DG Fuel status check and log maintenance.' },
];
