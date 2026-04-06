# Frappe/ERPNext Compliance Maker-Checker Implementation

This document contains the technical components for implementing the Compliance Maker-Checker system in a Frappe/ERPNext environment.

## 1. Data Model (DocTypes)

### Compliance Category (DocType)
- **Fields**:
  - `category_name` (Data, Unique)
  - `description` (Small Text)

### Compliance Requirement (DocType)
- **Fields**:
  - `category` (Link to Compliance Category)
  - `description` (Small Text)
  - `is_mandatory` (Check)

### Audit Submission (DocType)
- **Fields**:
  - `date` (Date, Default: Today)
  - `category` (Link to Compliance Category)
  - `frequency` (Select: Daily, Weekly, Monthly)
  - `auditor` (Link to User, Read Only, Default: Session User)
  - `reviewer` (Link to User)
  - `status` (Select: Draft, Pending Review, Approved, Rejected, Default: Draft)
  - `evidence_table` (Table, Child Table: Audit Evidence)
  - `checker_comments` (Text, Mandatory if Rejected)

### Audit Evidence (Child DocType)
- **Fields**:
  - `requirement_description` (Small Text, Read Only)
  - `text_response` (Small Text)
  - `file_attachment` (Attach)
  - `remarks` (Small Text)

---

## 2. Python Controller (`audit_submission.py`)

```python
import frappe
from frappe.model.document import Document

class AuditSubmission(Document):
    def validate(self):
        self.validate_maker_checker()
        if self.status == "Rejected" and not self.checker_comments:
            frappe.throw("Comments are mandatory when rejecting a submission.")

    def validate_maker_checker(self):
        # Prevent Maker from being the Checker
        if self.auditor == self.reviewer:
            frappe.throw("Auditor (Maker) and Reviewer (Checker) cannot be the same person.")
        
        # Prevent Maker from approving their own work
        if self.status in ["Approved", "Rejected"] and frappe.session.user == self.auditor:
            frappe.throw("You cannot approve or reject your own audit submission.")

    def on_submit(self):
        if self.status != "Approved":
            frappe.throw("Only Approved submissions can be submitted.")

    @frappe.whitelist()
    def get_requirements(self):
        requirements = frappe.get_all("Compliance Requirement", 
            filters={"category": self.category}, 
            fields=["description"])
        
        self.set("evidence_table", [])
        for req in requirements:
            self.append("evidence_table", {
                "requirement_description": req.description
            })
```

---

## 3. Client Script (`audit_submission.js`)

```javascript
frappe.ui.form.on('Audit Submission', {
    category: function(frm) {
        if (frm.doc.category) {
            frm.call({
                doc: frm.doc,
                method: 'get_requirements',
                callback: function(r) {
                    frm.refresh_field('evidence_table');
                }
            });
        }
    },
    
    refresh: function(frm) {
        if (frm.doc.status === "Pending Review" && frappe.session.user === frm.doc.reviewer) {
            frm.add_custom_button(__('Approve'), function() {
                frm.set_value('status', 'Approved');
                frm.save();
            }, __('Actions'));
            
            frm.add_custom_button(__('Reject'), function() {
                frappe.prompt([
                    {label: 'Reason for Rejection', fieldname: 'reason', fieldtype: 'Small Text', reqd: 1}
                ], (values) => {
                    frm.set_value('checker_comments', values.reason);
                    frm.set_value('status', 'Rejected');
                    frm.save();
                }, 'Reject Submission', 'Submit');
            }, __('Actions'));
        }
    }
});
```

---

## 4. Local Hosting (Bench Instructions)

1. **Create App**: `bench new-app compliance_mgmt`
2. **Install App**: `bench --site [your-site] install-app compliance_mgmt`
3. **Create DocTypes**: Use the Frappe Desk UI or `bench make-doctype`.
4. **Roles**: Create roles "Compliance Maker" and "Compliance Checker".
5. **Permissions**: 
   - Maker: Read, Write, Create on Audit Submission (if status is Draft).
   - Checker: Read, Write on Audit Submission (if status is Pending Review).
6. **Start**: `bench start`
