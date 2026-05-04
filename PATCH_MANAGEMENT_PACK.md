# Enterprise Patch Management Compliance Pack
**Ref:** Cyber Security Audit 3(x), 3(y) | System Audit 12(k)
**Confidentiality:** Internal Use Only
**Version:** 2024.1

---

## 1. Patch Management Policy

### 1.1 Purpose
To establish a structured framework for the identification, evaluation, testing, and deployment of security patches and firmware updates to mitigate vulnerabilities across the enterprise infrastructure.

### 1.2 Scope
This policy applies to all IT assets including:
* Network Devices (Cisco Core/Access, Sophos Firewalls, Ruijie Access Points)
* Servers (AlmaLinux, FreeIPA, FreeRADIUS)
* Endpoints and Peripheral Systems

### 1.3 Patch Classification & SLAs
| Severity | Definition | SLA for Deployment |
| :--- | :--- | :--- |
| **Critical** | Vulnerabilities with active exploits or high impact (CVSS 9.0-10.0) | 7 Calendar Days |
| **High** | Significant risk to confidentiality/integrity (CVSS 7.0-8.9) | 15 Calendar Days |
| **Medium** | Minor security improvements or feature updates | 45 Calendar Days |
| **Low** | Non-security updates or cosmetic fixes | Next scheduled maintenance |

### 1.4 Emergency Patch Process
In the event of a "Zero-Day" vulnerability, the CISO/IT Head can trigger the Emergency Patching Procedure, bypassing standard UAT timelines while maintaining a mandatory "Success/Fail" smoke test.

---

## 2. Patch Management Procedure (SOP)

### 2.1 Implementation Lifecycle
1. **Identification:** Automated alerts from Cisco Talos, Sophos Central, and AlmaLinux Security Advisories.
2. **Analysis:** Reviewing CVE details and mapping them to internal asset inventory.
3. **Staging/UAT:** Deploy patches to "Rack-01-Test" (dedicated VLAN 99) mimicking production configs.
4. **Impact Assessment:** Testing application dependencies (FreeRADIUS auth, IPSEC tunnels).
5. **Approval:** Submit Change Request to CAB with rollback plan.
6. **Deployment:** Phased rollout starting at 11 PM (Saturday window).
7. **Verification:** Integrity checks and service availability monitoring.

### 2.2 Workflow Diagram Concept
`Identification` -> `Prioritization` -> `Testing` -> `Approval` -> `Rollout` -> `Audit`

---

## 3. Patch Register (Sample Audit Record)

**Period:** March 2024

| Asset Name | Asset Type | Patch ID / CVE | Severity | Status | Release Date | Deployment Date | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CR-9300-L3** | Cisco Switch | CSCwd01234 | Critical | Applied | 01-Mar-24 | 07-Mar-24 | Ajith Kumar |
| **SF-CORE-01** | Sophos FW | SFOS 20.0 MR1 | High | Applied | 28-Feb-24 | 10-Mar-24 | Surya.K |
| **SRV-IPA-01** | AlmaLinux | CVE-2024-0001 | Critical | Applied | 05-Mar-24 | 11-Mar-24 | Gani |
| **AP-04-FLR2** | Ruijie AP | AP_OS_6.8 | Medium | Pending | 15-Mar-24 | Scheduled | Fatah Khan |
| **SRV-RAD-01** | RADIUS | v3.2.4 Security | High | Applied | 10-Mar-24 | 18-Mar-24 | Gani |

---

## 4. Patch Monitoring Evidence

### 4.1 Dashboard Description
The organization utilizes **Sophos Central** and **Ansible Tower** for centralized patch monitoring.
* **Metric 1:** Asset Compliance Rate (Current: 98.4%)
* **Metric 2:** Mean Time to Patch (MTTP): 6.2 Days
* **Alerting:** Real-time email alerts sent to `it-security@org.com` for failed patch attempts.

### 4.2 Sample KPI Report
* **Total Assets discovered:** 450
* **Compliant:** 443
* **Non-Compliant:** 7 (Decommissioning pending)

---

## 5. Patch Testing Evidence (UAT Template)

**Test ID:** TST-2024-045
**Target:** SRV-IPA-01 (FreeIPA Master)

| Test Case | Procedure | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **LDAP Auth** | Attempt cross-domain login | Successful bind | Successful bind | Pass |
| **DNS Resolution** | Queries from VLAN 10 | Resolution successful | Resolution successful | Pass |
| **MFA Status** | Verify SSH with MFA | MFA prompt occurs | MFA prompt occurs | Pass |

**Verification Signature:** *Gani (System Lead)*

---

## 6. Impact Analysis Template

### 6.1 Assessment: Cisco IOS-XE Update (17.9.4a)
* **Affected Systems:** All Core Inter-VLAN routing (VLAN 10, 20, 30).
* **Risk (Patch):** 5-minute reboot downtime.
* **Risk (No Patch):** Unauthorized remote code execution via CVE-2023-XXXX.
* **Dependency:** FreeRADIUS must be reachable post-reboot for client re-auth.
* **Rollback Plan:** `boot system flash:packages.conf.old` via console.

---

## 7. Change Management Evidence

### 7.1 Change Request #CR-2024-88
* **Title:** Quarterly Sophos Firmware Upgrade
* **Requester:** Surya.K
* **CAB Approval:** Approved on 08-Mar-2024 by IT Steering Committee.
* **Implementation window:** 11:00 PM - 01:00 AM (Sunday).

---

## 8. Asset Coverage & Compliance Proof

| Layer | Technology | Coverage Method | Compliance Proof |
| :--- | :--- | :--- | :--- |
| **OS** | AlmaLinux | `dnf check-update` | Weekly Cron Report |
| **Network** | Cisco/Ruijie | SSH `show version` | Inventory Audit Log |
| **Perimeter** | Sophos | Firmware Autocheck | Dashboard Screenshot |
| **Services** | RADIUS/IPA | Service Status Check | Uptime Monitoring |

---

## 9. Audit Evidence Mapping Table

| Audit Requirement | Evidence Provided | Document Name |
| :--- | :--- | :--- |
| **Clause 3(x): Policy** | Patch Management Policy | `PM_Policy_v2.pdf` |
| **Clause 3(y): Register** | Patch Register Table | `Monthly_Patch_Audit_Mar24.xlsx` |
| **Clause 12(k): Testing** | UAT Reports & Impact Analysis | `Testing_Log_Q1.zip` |
| **Periodic Updates** | Monthly KPI Reports | `Compliance_Summary_Mar24.pdf` |

---

## 10. Conclusion
This pack demonstrates a robust, risk-based approach to patching as per enterprise standards. All documentation is kept in the central **ComplianceHub** repository for continuous auditor access.
