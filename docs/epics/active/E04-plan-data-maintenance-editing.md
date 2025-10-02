# EPIC-004: Plan Data Maintenance & Editing

**Epic Owner:** Product Management
**Technical Lead:** Full Stack Engineering
**Priority:** P1 (High - Data Quality Foundation)
**Target Release:** Phase 2 (Month 3-4)
**Estimated Effort:** 3-4 weeks
**Dependencies:** E02 (Plan Analysis Dashboard)

**Status:** 🟢 Phase 1 & 2 COMPLETE | Phase 3 Pending
**Completion Date:** October 1, 2025 (Phase 1 & 2)
**See:** `E04_COMPLETION_SUMMARY.md` for detailed implementation summary

---

## Epic Overview

Build a comprehensive plan data maintenance and editing system that allows users to review, correct, and update retirement plan design data directly from the dashboard. This transforms the platform from read-only to a living, maintainable data system where the database becomes the single source of truth.

### Business Value

- **Primary Use Case:** Analysts and data stewards need to correct inaccurate data, fill in missing fields, and maintain plan information as it changes over time
- **Success Metric:** 90%+ of data corrections happen in-app (vs. Excel re-import)
- **Data Quality Impact:** Reduce data errors from 8% → 2% through inline validation and structured editing
- **Time Savings:** Update 10 plans in 15 minutes (vs. 2 hours for Excel round-trip)

### User Story

> "As a Data Analyst, I want to quickly correct and update plan design data directly in the dashboard, so that I can maintain accurate data without waiting for Excel re-imports or IT intervention."

---

## Problem Statement

**Current State:**
- Data flows one-way: Excel → Database → Dashboard (read-only)
- To fix errors: Edit Excel → Re-run import script → Hope nothing breaks
- Review buttons on dashboard do nothing
- No audit trail for changes
- No way to track data quality improvements over time

**Desired State:**
- Database is the **single source of truth**
- Dashboard provides **inline editing** capabilities
- All changes logged with **audit trail** (who, when, what, why)
- Excel becomes **import/export tool** (not live data source)
- Real-time validation prevents bad data from entering system

---

## Design Philosophy: Database as Source of Truth

This epic establishes a critical architectural principle:

**✅ Database is the source of truth**
**❌ Excel is NOT a live data store**

### Recommended Data Flow

```
Initial Load:
Excel Template → [excel_to_duckdb.py] → DuckDB Database

Ongoing Maintenance:
Dashboard UI → [API] → DuckDB Database → [API] → Dashboard UI

Optional Export:
DuckDB Database → [export script] → Excel Snapshot
```

### Why Database-First?

| Factor | Database-First | Excel-First (Two-Way Sync) |
|--------|----------------|----------------------------|
| **Audit Trail** | ✅ Built-in with timestamps | ❌ No version history |
| **Multi-User** | ✅ Safe concurrent editing | ❌ File locking conflicts |
| **Validation** | ✅ Real-time in UI | ❌ After import |
| **Data Integrity** | ✅ Foreign keys, constraints | ❌ Manual validation |
| **Complexity** | ✅ Simple one-way | ❌ Complex bidirectional sync |
| **Change Tracking** | ✅ Field-level audit log | ❌ File-level (git diff) |

**Decision: Database becomes source of truth. Excel used only for initial import and optional exports.**

---

## UI Specification

### Option 1: Modal-Based Editing (Recommended for Phase 1)

#### Visual Design

```
┌──────────────────────────────────────────────────────────────────────┐
│  Edit Plan Design: Albany Medical Center               [✕ Close]     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Field: Auto-Enrollment Rate                                         │
│  Category: Auto-Enrollment                                           │
│                                                                       │
│  Current Value:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 3%                                                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  New Value:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 4%                                                         [✓]   ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ℹ️  Value must be between 0% and 15%                                │
│                                                                       │
│  Reason for Change: (Required)                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ▼ Data correction                                                ││
│  │   - Data correction                                              ││
│  │   - Plan amendment                                               ││
│  │   - Low confidence extraction                                    ││
│  │   - Missing data added                                           ││
│  │   - Other                                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  Additional Notes: (Optional)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Updated per 2024 plan amendment document                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                       │
│  Change History:                                                     │
│  2024-09-15 by John Smith: 3% → 3% (Initial import from Excel)      │
│  2024-09-20 by AI System: ø → 3% (Extracted with 78% confidence)    │
│                                                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                       │
│  [Cancel]                                         [Save Changes]     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

#### Functionality

1. **Modal Trigger:**
   - Click "Review" button on any field in Plan Design Matrix
   - Opens modal with field pre-populated
   - Loads change history from audit log

2. **Form Fields:**
   - **Current Value:** Read-only display of existing value
   - **New Value:** Editable input with type-specific control (text, number, dropdown, date)
   - **Reason for Change:** Required dropdown with predefined options
   - **Additional Notes:** Optional free-text for context

3. **Validation:**
   - Real-time validation as user types
   - Type checking (e.g., decimal for rates, integer for years)
   - Range validation (e.g., 0-15% for enrollment rates)
   - Required field enforcement
   - Show ✓ checkmark when valid, ❌ when invalid

4. **Change History:**
   - Show last 5 changes to this field
   - Display: Date, User, Old → New value, Reason
   - Link to full audit log (see all changes)

5. **Actions:**
   - **Cancel:** Close modal without saving, discard changes
   - **Save Changes:** Validate, save to database, update audit log, refresh UI

### Option 2: Inline Editing (Phase 2 Enhancement)

```
Plan Design Matrix

┌──────────────────┬──────────────────┬──────────────┬──────────────┐
│ Feature          │ Value            │ Confidence   │ Status       │
├──────────────────┼──────────────────┼──────────────┼──────────────┤
│ Auto-Enrollment  │ ┌──────────────┐ │ ███████░ 78% │ ⚠ Review     │
│ Rate             │ │ 3%      [✓]  │ │              │              │
│                  │ └──────────────┘ │              │              │
│                  │ ℹ️  0-15% range   │              │              │
└──────────────────┴──────────────────┴──────────────┴──────────────┘
```

**Interaction:**
- Double-click value cell to edit
- Enter key to save
- Esc key to cancel
- Auto-save on blur with validation
- Show inline validation errors

---

## API Specification

### Update Single Field

```typescript
PATCH /api/v1/clients/{client_id}/fields/{field_name}

Request Body:
{
  "new_value": "0.04",
  "reason": "data_correction",
  "notes": "Updated per 2024 plan amendment",
  "updated_by": "john.smith@fidelity.com"
}

Response (200 OK):
{
  "client_id": "70006",
  "field_name": "auto_enrollment_rate",
  "old_value": "0.03",
  "new_value": "0.04",
  "updated_at": "2024-09-30T14:23:45Z",
  "updated_by": "john.smith@fidelity.com",
  "audit_log_id": "audit-12345"
}

Error Response (400 Bad Request):
{
  "error": "validation_error",
  "message": "auto_enrollment_rate must be between 0 and 0.15",
  "field": "auto_enrollment_rate",
  "provided_value": "0.25"
}
```

### Bulk Update (Multiple Fields)

```typescript
PUT /api/v1/clients/{client_id}

Request Body:
{
  "updates": [
    {
      "field_name": "auto_enrollment_rate",
      "new_value": "0.04",
      "reason": "data_correction"
    },
    {
      "field_name": "auto_escalation_cap",
      "new_value": "0.15",
      "reason": "plan_amendment"
    }
  ],
  "notes": "Updated per 2024 plan document review",
  "updated_by": "john.smith@fidelity.com"
}

Response (200 OK):
{
  "client_id": "70006",
  "updates_applied": 2,
  "changes": [
    {
      "field_name": "auto_enrollment_rate",
      "old_value": "0.03",
      "new_value": "0.04",
      "status": "success"
    },
    {
      "field_name": "auto_escalation_cap",
      "old_value": "0.10",
      "new_value": "0.15",
      "status": "success"
    }
  ],
  "audit_log_ids": ["audit-12345", "audit-12346"]
}
```

### Get Field History

```typescript
GET /api/v1/clients/{client_id}/fields/{field_name}/history

Response (200 OK):
{
  "client_id": "70006",
  "field_name": "auto_enrollment_rate",
  "current_value": "0.04",
  "changes": [
    {
      "timestamp": "2024-09-30T14:23:45Z",
      "old_value": "0.03",
      "new_value": "0.04",
      "updated_by": "john.smith@fidelity.com",
      "reason": "data_correction",
      "notes": "Updated per 2024 plan amendment"
    },
    {
      "timestamp": "2024-09-20T09:15:22Z",
      "old_value": null,
      "new_value": "0.03",
      "updated_by": "ai_extraction_system",
      "reason": "ai_extraction",
      "confidence_score": 0.78
    }
  ]
}
```

### Export to Excel

```typescript
POST /api/v1/export/excel

Request Body:
{
  "client_ids": ["70001", "70002", "70006"],  // optional, defaults to all
  "include_audit_trail": false  // optional, defaults to false
}

Response (200 OK):
{
  "export_id": "export-789",
  "download_url": "/api/v1/exports/export-789/download",
  "expires_at": "2024-09-30T16:00:00Z",
  "file_name": "planwise_export_2024-09-30.xlsx",
  "record_count": 3
}
```

---

## Database Schema Updates

### 1. Add Metadata Fields to `plan_designs` Table

```sql
ALTER TABLE plan_designs ADD COLUMN updated_at TIMESTAMP;
ALTER TABLE plan_designs ADD COLUMN updated_by VARCHAR(255);
ALTER TABLE plan_designs ADD COLUMN data_quality_score DECIMAL(3,2);  -- 0.00-1.00
ALTER TABLE plan_designs ADD COLUMN last_verified_at TIMESTAMP;
ALTER TABLE plan_designs ADD COLUMN verified_by VARCHAR(255);
```

### 2. Create `audit_log` Table

```sql
CREATE TABLE audit_log (
    id VARCHAR PRIMARY KEY DEFAULT ('audit-' || uuid()),
    client_id VARCHAR NOT NULL,
    field_name VARCHAR NOT NULL,
    old_value VARCHAR,
    new_value VARCHAR,
    change_type VARCHAR NOT NULL,  -- 'update', 'correction', 'amendment', 'extraction'
    reason VARCHAR NOT NULL,       -- 'data_correction', 'plan_amendment', etc.
    notes TEXT,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence_score DECIMAL(3,2),  -- for AI extractions

    FOREIGN KEY (client_id) REFERENCES plan_designs(client_id)
);

-- Index for fast lookups
CREATE INDEX idx_audit_log_client_field ON audit_log(client_id, field_name);
CREATE INDEX idx_audit_log_timestamp ON audit_log(updated_at DESC);
```

### 3. Create `field_validation_rules` Table

```sql
CREATE TABLE field_validation_rules (
    field_name VARCHAR PRIMARY KEY,
    data_type VARCHAR NOT NULL,        -- 'decimal', 'integer', 'boolean', 'text', 'enum'
    required BOOLEAN DEFAULT FALSE,
    min_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    allowed_values TEXT[],             -- for enums
    validation_regex VARCHAR,
    help_text TEXT
);

-- Example data
INSERT INTO field_validation_rules VALUES
('auto_enrollment_rate', 'decimal', TRUE, 0.0, 0.15, NULL, NULL, 'Auto-enrollment default rate (0% to 15%)'),
('auto_escalation_cap', 'decimal', FALSE, 0.0, 0.20, NULL, NULL, 'Maximum auto-escalation percentage (0% to 20%)'),
('vesting_schedule', 'enum', FALSE, NULL, NULL, ARRAY['Immediate', '3-year cliff', '5-year cliff', 'Graded'], NULL, 'Vesting schedule type'),
('industry', 'enum', TRUE, NULL, NULL, ARRAY['healthcare', 'higher_ed', 'manufacturing', 'other'], NULL, 'Client industry classification');
```

---

## Change Reason Taxonomy

Structured reasons for all data changes (for audit log):

### Primary Reasons

| Reason Code | Display Name | Description |
|-------------|--------------|-------------|
| `data_correction` | Data Correction | Fixing inaccurate data from initial import |
| `plan_amendment` | Plan Amendment | Plan design changed per official amendment |
| `missing_data_added` | Missing Data Added | Previously blank field now populated |
| `low_confidence_review` | Low Confidence Review | Correcting AI extraction with low confidence |
| `annual_update` | Annual Update | Routine annual plan review/update |
| `merger_acquisition` | Merger/Acquisition | Plan change due to M&A activity |
| `regulatory_compliance` | Regulatory Compliance | Change required by law (SECURE 2.0, etc.) |
| `data_quality_initiative` | Data Quality Initiative | Systematic data cleanup project |
| `other` | Other | Other reason (requires notes) |

---

## Validation Rules

### Auto-Enrollment Rate
- **Type:** Decimal
- **Range:** 0.0 - 0.15 (0% to 15%)
- **Required:** If `auto_enrollment_enabled = true`
- **Format:** Two decimal places (e.g., 0.03 for 3%)

### Auto-Escalation Cap
- **Type:** Decimal
- **Range:** 0.0 - 0.20 (0% to 20%)
- **Required:** If `auto_escalation_enabled = true`
- **Format:** Two decimal places

### Match Effective Rate
- **Type:** Decimal
- **Range:** 0.0 - 0.15 (0% to 15%)
- **Required:** If `has_match = true`
- **Format:** Four decimal places (e.g., 0.0625 for 6.25%)

### Vesting Schedule
- **Type:** Enum
- **Allowed Values:** 'Immediate', '2-year cliff', '3-year cliff', '5-year cliff', 'Graded', 'Other'
- **Required:** No
- **Format:** Exact string match (case-insensitive)

### Industry
- **Type:** Enum
- **Allowed Values:** 'healthcare', 'higher_ed', 'manufacturing', 'nonprofit', 'government', 'other'
- **Required:** Yes
- **Format:** Lowercase

### Employee Count
- **Type:** Integer
- **Range:** 1 - 1,000,000
- **Required:** Yes
- **Format:** Whole number

---

## Permission Model

### User Roles

| Role | View Data | Edit Data | Approve Changes | Manage Permissions |
|------|-----------|-----------|-----------------|-------------------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Analyst** | ✅ | ✅ | ❌ | ❌ |
| **Senior Analyst** | ✅ | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

### Field-Level Permissions (Optional Phase 2)

Some fields may require approval workflow:

- **Tier 1 Fields** (High Impact): Auto-approval for Analysts
  - auto_enrollment_rate
  - auto_escalation_cap
  - vesting_schedule

- **Tier 2 Fields** (Medium Impact): Requires Senior Analyst approval
  - match_effective_rate
  - industry classification
  - employee_count

- **Tier 3 Fields** (Low Impact): Auto-approval for all
  - notes
  - data_source
  - metadata fields

---

## User Stories & Acceptance Criteria

### Story 1: Edit Single Field via Modal

**As an** Analyst
**I want to** click a "Review" button to edit a plan field
**So that** I can correct inaccurate data quickly

**Acceptance Criteria:**
- [ ] Clicking "Review" button opens edit modal for that field
- [ ] Modal displays current value (read-only) and new value (editable)
- [ ] Reason dropdown is required with predefined options
- [ ] Notes field is optional for additional context
- [ ] Real-time validation shows errors before submission
- [ ] Change history shows last 5 edits to this field
- [ ] Saving creates audit log entry with all metadata
- [ ] UI refreshes to show new value immediately after save
- [ ] Error messages are clear and actionable

### Story 2: View Field Edit History

**As a** Senior Analyst
**I want to** view the complete edit history for any field
**So that** I can audit changes and understand data evolution

**Acceptance Criteria:**
- [ ] "History" link in modal shows full audit log
- [ ] Audit log displays: date, user, old → new value, reason, notes
- [ ] History is sortable by date (newest first by default)
- [ ] AI extractions are clearly marked with confidence scores
- [ ] Export history to CSV for compliance reporting

### Story 3: Bulk Edit Multiple Fields

**As an** Analyst
**I want to** edit multiple fields in one operation
**So that** I can efficiently update related data (e.g., after plan amendment)

**Acceptance Criteria:**
- [ ] "Bulk Edit" button opens modal with multi-field form
- [ ] Can select which fields to edit (checkboxes)
- [ ] One reason applies to all changes in bulk operation
- [ ] Validation runs for each field independently
- [ ] All changes saved atomically (all succeed or all fail)
- [ ] Single audit log entry created for bulk operation

### Story 4: Export Database to Excel

**As a** Data Steward
**I want to** export current database to Excel
**So that** I can share a snapshot with external stakeholders or perform offline analysis

**Acceptance Criteria:**
- [ ] "Export to Excel" button in dashboard header
- [ ] Export includes all clients and all fields
- [ ] Optional: Include audit trail in separate sheet
- [ ] File naming: `planwise_export_YYYY-MM-DD.xlsx`
- [ ] Download link expires after 1 hour (signed URL)
- [ ] Export completes in <10 seconds for 850 clients

### Story 5: Validation Prevents Bad Data

**As the** System
**I want to** validate all data changes before saving
**So that** data integrity is maintained

**Acceptance Criteria:**
- [ ] Type validation (decimal, integer, boolean, text, enum)
- [ ] Range validation (min/max for numeric fields)
- [ ] Required field enforcement
- [ ] Enum validation (allowed values only)
- [ ] Cross-field validation (e.g., rate required if enabled = true)
- [ ] Helpful error messages explain what's wrong and how to fix
- [ ] Cannot save invalid data (save button disabled)

---

## Technical Implementation

### Frontend Components

```
src/
├── components/
│   ├── PlanDesignMatrix.tsx           # Existing component
│   ├── EditFieldModal.tsx             # NEW: Modal for editing single field
│   ├── BulkEditModal.tsx              # NEW: Modal for editing multiple fields
│   ├── FieldHistoryModal.tsx          # NEW: View audit log for field
│   └── ui/
│       ├── FormField.tsx               # Reusable validated input
│       ├── ValidationMessage.tsx       # Error/success messages
│       └── AuditLogTable.tsx           # Display change history
├── hooks/
│   ├── useUpdateField.ts               # NEW: Mutation for updating field
│   ├── useBulkUpdate.ts                # NEW: Mutation for bulk update
│   ├── useFieldHistory.ts              # NEW: Fetch audit log
│   └── useFieldValidation.ts           # NEW: Client-side validation
└── utils/
    ├── validation.ts                   # Validation rules and helpers
    └── fieldMetadata.ts                # Field definitions and types
```

### Backend Routes

```python
# backend/main.py

@app.patch("/api/v1/clients/{client_id}/fields/{field_name}")
async def update_field(
    client_id: str,
    field_name: str,
    update: FieldUpdate,
    user: User = Depends(get_current_user)
):
    """Update a single field with validation and audit logging."""
    # 1. Validate field_name exists
    # 2. Get validation rules for field
    # 3. Validate new_value against rules
    # 4. Get old_value from database
    # 5. Update plan_designs table
    # 6. Insert audit_log entry
    # 7. Return updated value
    pass

@app.put("/api/v1/clients/{client_id}")
async def bulk_update_fields(
    client_id: str,
    updates: BulkUpdate,
    user: User = Depends(get_current_user)
):
    """Update multiple fields in single transaction."""
    # 1. Validate all field updates
    # 2. Start database transaction
    # 3. Update all fields
    # 4. Insert all audit_log entries
    # 5. Commit or rollback
    pass

@app.get("/api/v1/clients/{client_id}/fields/{field_name}/history")
async def get_field_history(
    client_id: str,
    field_name: str,
    limit: int = 20
):
    """Get audit log for a specific field."""
    pass

@app.post("/api/v1/export/excel")
async def export_to_excel(
    export_request: ExportRequest,
    user: User = Depends(get_current_user)
):
    """Export database to Excel file."""
    # 1. Query plan_designs for requested clients
    # 2. Convert to pandas DataFrame
    # 3. Write to Excel with openpyxl
    # 4. Upload to temp storage (S3 or local)
    # 5. Generate signed download URL
    # 6. Return download link
    pass
```

### State Management

```typescript
// Zustand store for edit state
interface EditStore {
  isEditModalOpen: boolean;
  editingField: string | null;
  editingClientId: string | null;

  openEditModal: (clientId: string, fieldName: string) => void;
  closeEditModal: () => void;
}

// TanStack Query mutations
const updateFieldMutation = useMutation({
  mutationFn: (data: FieldUpdate) => api.updateField(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['client', clientId]);
    toast.success('Field updated successfully');
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

---

## Testing Strategy

### Unit Tests

```typescript
// EditFieldModal.test.tsx
describe('EditFieldModal', () => {
  it('validates auto_enrollment_rate is between 0-15%', () => {
    // Test validation logic
  });

  it('requires reason when updating field', () => {
    // Test required field enforcement
  });

  it('displays change history correctly', () => {
    // Test audit log rendering
  });
});

// validation.test.ts
describe('Field Validation', () => {
  it('rejects negative auto_enrollment_rate', () => {
    expect(validateField('auto_enrollment_rate', -0.05)).toHaveError();
  });

  it('accepts valid enum values for industry', () => {
    expect(validateField('industry', 'healthcare')).toBeValid();
  });
});
```

### Integration Tests

```python
# test_update_field.py
def test_update_field_creates_audit_log():
    """Test that updating field creates audit log entry."""
    response = client.patch(
        "/api/v1/clients/70006/fields/auto_enrollment_rate",
        json={
            "new_value": "0.04",
            "reason": "data_correction",
            "updated_by": "test@example.com"
        }
    )
    assert response.status_code == 200

    # Verify audit log was created
    audit = get_latest_audit_log("70006", "auto_enrollment_rate")
    assert audit["old_value"] == "0.03"
    assert audit["new_value"] == "0.04"
    assert audit["reason"] == "data_correction"

def test_validation_rejects_invalid_rate():
    """Test that validation prevents invalid values."""
    response = client.patch(
        "/api/v1/clients/70006/fields/auto_enrollment_rate",
        json={"new_value": "0.25"}  # Too high
    )
    assert response.status_code == 400
    assert "must be between 0 and 0.15" in response.json()["message"]
```

### E2E Tests (Playwright)

```typescript
test('edit field workflow: open modal → change value → save', async ({ page }) => {
  await page.goto('/clients/70006');

  // Click review button
  await page.click('[data-testid="review-auto_enrollment_rate"]');

  // Modal opens
  await expect(page.locator('[data-testid="edit-modal"]')).toBeVisible();

  // Change value
  await page.fill('[data-testid="new-value-input"]', '4');

  // Select reason
  await page.selectOption('[data-testid="reason-select"]', 'data_correction');

  // Save
  await page.click('[data-testid="save-button"]');

  // Success toast
  await expect(page.locator('text=Field updated successfully')).toBeVisible();

  // Table updates
  await expect(page.locator('[data-testid="auto_enrollment_rate-value"]')).toHaveText('4%');
});
```

---

## Release Plan

### Phase 1: Core Editing (Week 1-2) ✅ COMPLETE
- [x] Database schema updates (audit_log, validation_rules)
- [x] Backend: Update single field endpoint with validation
- [x] Backend: Get field history endpoint
- [x] Frontend: EditFieldModal component
- [x] Frontend: Update PlanDesignMatrix to wire up Review button
- [x] Unit tests for validation logic
- [x] Integration tests for API endpoints

### Phase 2: Enhanced Features (Week 3) ✅ COMPLETE
- [x] Bulk edit endpoint (PUT /api/v1/clients/{id})
- [x] Export to Excel functionality (POST /api/v1/export/excel)
- [ ] Bulk edit modal UI (deferred to Phase 3)
- [ ] Field-level permissions (RBAC) (deferred to Phase 3)
- [ ] Inline editing (double-click) (deferred to Phase 3)
- [ ] Advanced validation (cross-field dependencies) (deferred to Phase 3)

### Phase 3: Audit & Compliance (Week 4) ⏳ PENDING
- [ ] Full audit log viewer (all changes, all clients)
- [ ] Export audit log to CSV
- [ ] Data quality dashboard (% verified, % pending review)
- [ ] Notification system (email on change for watched clients)
- [ ] Performance optimization for large datasets
- [ ] Bulk edit modal UI
- [ ] Field-level permissions (RBAC)
- [ ] Inline editing (double-click to edit)

---

## Success Metrics

### Leading Indicators (Week 1-2)
- Edit modal loads in <200ms
- Validation runs in <50ms
- All edits create audit log entries (100%)
- Zero data corruption incidents

### Usage Metrics (Month 1)
- 50+ analysts using editing feature weekly
- 200+ field updates per week
- 80%+ of updates use structured reasons (not "Other")
- <5% of updates require rollback

### Impact Metrics (Month 2-3)
- Data error rate: 8% → 2% (75% reduction)
- Time to fix errors: 2 hours → 15 minutes (87.5% reduction)
- 90%+ of corrections happen in-app (vs. Excel)
- Data quality score: 75 → 95 (out of 100)

---

## Open Questions

1. **Approval Workflow:** Should high-impact field changes require approval from Senior Analyst before taking effect?
2. **Field Locking:** Should fields be lockable after verification to prevent accidental edits?
3. **Bulk Operations:** What's the max number of fields that can be edited in one bulk operation?
4. **Excel Export Frequency:** Should we auto-export to Excel nightly for backup? Or on-demand only?
5. **Mobile Support:** Do analysts need to edit data on mobile/tablet? Or desktop-only?
6. **Notifications:** Should users get notified when someone edits a client they're "watching"?
7. **Version Control:** Should we support "rollback to previous version" at the client level?
8. **AI Re-training:** Should human corrections be fed back to improve AI extraction models?

---

## Dependencies & Risks

### Dependencies
- E02 (Plan Analysis Dashboard) - Review buttons already exist as placeholders
- Database migration tools for schema updates
- User authentication system for `updated_by` tracking
- Permission/role system for access control

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Concurrent edit conflicts | High | Optimistic locking, last-write-wins with conflict detection |
| Data validation gaps allow bad data | High | Comprehensive validation rules, extensive testing, gradual rollout |
| Audit log table grows too large | Medium | Partition by year, archive old logs, index optimization |
| Users bypass UI and edit database directly | Medium | Database triggers to enforce audit logging, restrict direct access |
| Excel export performance degrades with 850+ clients | Low | Stream export, paginate, or limit to 100 clients per export |

---

## Appendix: Example Validation Rules

```typescript
// validation.ts

interface ValidationRule {
  field_name: string;
  data_type: 'decimal' | 'integer' | 'boolean' | 'text' | 'enum';
  required: boolean;
  min_value?: number;
  max_value?: number;
  allowed_values?: string[];
  validation_regex?: RegExp;
  help_text: string;
}

export const validationRules: Record<string, ValidationRule> = {
  auto_enrollment_rate: {
    field_name: 'auto_enrollment_rate',
    data_type: 'decimal',
    required: false,  // Required if auto_enrollment_enabled = true
    min_value: 0.0,
    max_value: 0.15,
    help_text: 'Auto-enrollment default rate (0% to 15%)',
  },

  auto_escalation_cap: {
    field_name: 'auto_escalation_cap',
    data_type: 'decimal',
    required: false,
    min_value: 0.0,
    max_value: 0.20,
    help_text: 'Maximum auto-escalation percentage (0% to 20%)',
  },

  vesting_schedule: {
    field_name: 'vesting_schedule',
    data_type: 'enum',
    required: false,
    allowed_values: [
      'Immediate',
      '2-year cliff',
      '3-year cliff',
      '5-year cliff',
      'Graded',
      'Other'
    ],
    help_text: 'Vesting schedule type',
  },

  industry: {
    field_name: 'industry',
    data_type: 'enum',
    required: true,
    allowed_values: [
      'healthcare',
      'higher_ed',
      'manufacturing',
      'nonprofit',
      'government',
      'other'
    ],
    help_text: 'Client industry classification (required)',
  },

  employee_count: {
    field_name: 'employee_count',
    data_type: 'integer',
    required: true,
    min_value: 1,
    max_value: 1000000,
    help_text: 'Total number of employees (required)',
  },
};

export function validateField(fieldName: string, value: any): ValidationResult {
  const rule = validationRules[fieldName];
  if (!rule) {
    return { valid: true }; // No rule = no validation
  }

  // Check required
  if (rule.required && (value === null || value === undefined || value === '')) {
    return {
      valid: false,
      error: `${rule.field_name} is required`
    };
  }

  // Type validation
  if (rule.data_type === 'decimal' || rule.data_type === 'integer') {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return {
        valid: false,
        error: `${rule.field_name} must be a number`
      };
    }

    if (rule.min_value !== undefined && numValue < rule.min_value) {
      return {
        valid: false,
        error: `${rule.field_name} must be at least ${rule.min_value}`
      };
    }

    if (rule.max_value !== undefined && numValue > rule.max_value) {
      return {
        valid: false,
        error: `${rule.field_name} must not exceed ${rule.max_value}`
      };
    }
  }

  // Enum validation
  if (rule.data_type === 'enum' && rule.allowed_values) {
    if (!rule.allowed_values.includes(value)) {
      return {
        valid: false,
        error: `${rule.field_name} must be one of: ${rule.allowed_values.join(', ')}`
      };
    }
  }

  return { valid: true };
}
```

---

**Status:** Ready for Development
**Next Steps:**
1. Review epic with engineering team for technical feasibility
2. Prioritize Phase 1 features for MVP
3. Design detailed UI mockups in Figma
4. Create database migration script
5. Begin Phase 1 development (2-week sprint)
