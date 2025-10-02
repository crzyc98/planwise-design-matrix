# E07: Command Palette & Bulk Operations

**Status:** Planned
**Priority:** P1 (High Value)
**Estimated Time:** 2 hours
**Dependencies:** E05, E06

## 🎯 Goal
Add command palette (Cmd+K) for instant search/navigation and enable bulk editing to update multiple clients/fields simultaneously.

## 📋 Success Criteria
- [ ] Cmd+K opens command palette
- [ ] Search all fields across all clients
- [ ] Quick navigation to any client/field
- [ ] Execute actions (export, generate report)
- [ ] Multi-select rows with Shift+Click
- [ ] Bulk edit toolbar for selected rows
- [ ] Apply same value to multiple fields
- [ ] Batch validation before save

## 🛠️ Technical Implementation

### 1. Install Dependencies
```bash
npm install cmdk@^1.0.0
npm install @radix-ui/react-checkbox@^1.1.2
```

### 2. Create Command Palette
**File:** `planwise-ui/src/components/CommandPalette.tsx`

Features:
- Fuzzy search across all searchable content
- Command categories (Navigation, Actions, Recent)
- Keyboard navigation (↑↓ to select, Enter to execute)
- Recent items history
- Custom command actions

```typescript
const commands = [
  // Navigation
  { id: 'nav-client', label: 'Go to Client...', action: () => {} },
  { id: 'nav-field', label: 'Jump to Field...', action: () => {} },

  // Actions
  { id: 'export', label: 'Export to Excel', action: exportToExcel },
  { id: 'report', label: 'Generate Report', action: generateReport },
  { id: 'bulk-edit', label: 'Bulk Edit Mode', action: toggleBulkMode },

  // Recent
  { id: 'recent-1', label: 'Recent: Berkshire Health', action: () => {} },
]
```

### 3. Create Bulk Selection System
**File:** `planwise-ui/src/hooks/useBulkSelection.ts`

```typescript
export function useBulkSelection<T>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = (id: string, isShiftKey?: boolean) => {
    if (isShiftKey && lastSelectedId) {
      // Range select
      const start = items.findIndex(i => i.id === lastSelectedId)
      const end = items.findIndex(i => i.id === id)
      const range = items.slice(
        Math.min(start, end),
        Math.max(start, end) + 1
      )
      setSelectedIds(new Set([...selectedIds, ...range.map(r => r.id)]))
    } else {
      // Toggle single
      const newSet = new Set(selectedIds)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      setSelectedIds(newSet)
    }
  }

  const selectAll = () => setSelectedIds(new Set(items.map(i => i.id)))
  const clearSelection = () => setSelectedIds(new Set())

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount: selectedIds.size
  }
}
```

### 4. Create Bulk Edit Toolbar
**File:** `planwise-ui/src/components/BulkEditToolbar.tsx`

Appears when 2+ rows selected:
- "X items selected" counter
- Field picker dropdown
- Value input
- "Apply to All" button
- "Clear Selection" button
- Preview changes before save

### 5. Create Bulk Edit Modal
**File:** `planwise-ui/src/components/BulkEditModal.tsx`

Advanced bulk edit:
- Multi-field edit form
- Preview table (before/after)
- Validation warnings
- Reason dropdown (required for audit)
- Notes field
- Dry-run mode

### 6. Update PlanDesignMatrix
**File:** `planwise-ui/src/components/PlanDesignMatrix.tsx`

Add:
- Checkbox column for row selection
- Selection state management
- Bulk edit toolbar (conditional render)
- Selection keyboard shortcuts (Shift+Click, Cmd+A)

### 7. Create Search Index
**File:** `planwise-ui/src/utils/searchIndex.ts`

```typescript
export function buildSearchIndex(clients: Client[]) {
  return clients.flatMap(client => [
    {
      id: `client-${client.id}`,
      type: 'client',
      label: client.name,
      value: client.id,
      metadata: client
    },
    ...Object.entries(client.fields).map(([field, value]) => ({
      id: `field-${client.id}-${field}`,
      type: 'field',
      label: `${client.name} - ${field}: ${value}`,
      value: { clientId: client.id, field, value },
      metadata: { client, field }
    }))
  ])
}

export function fuzzySearch(index: SearchItem[], query: string) {
  // Simple fuzzy matching - can upgrade to Fuse.js if needed
  return index.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )
}
```

## 🎨 UI/UX Specifications

### Command Palette Design
- Modal overlay (dark backdrop)
- Search input at top (auto-focused)
- Results list (max 10 items, scroll if more)
- Category headers (Navigation, Actions, Recent)
- Keyboard shortcuts shown on right
- ESC to close

### Bulk Selection Visual
- Checkbox in first column
- Selected rows: Light blue background
- Selection count badge (top right)
- Floating toolbar at bottom
- Animated slide-up when appears

### Bulk Edit Workflow
1. Select rows (Shift+Click for range)
2. Toolbar appears → Choose field
3. Enter new value
4. Click "Preview Changes"
5. Review before/after table
6. Add reason + notes
7. Click "Apply to X clients"

## 📊 Command Categories

### Navigation Commands
- Go to Client → Shows client picker
- Jump to Field → Search across all fields
- Recent Edits → Jump to recently edited fields
- Filter by Status → Show only "Review" items

### Action Commands
- Export Selected → Export selected rows to Excel
- Generate Report → Create peer comparison report
- Bulk Edit → Enter bulk edit mode
- Copy to Clipboard → Copy selected data
- Refresh Data → Reload from server

### View Commands
- Show Low Confidence → Filter confidence < 88%
- Hide Verified → Show only "Review" status
- Toggle Dark Mode → Theme switcher
- Expand All Details → Show all field details

## 🧪 Testing Checklist

- [ ] Cmd+K opens command palette
- [ ] Search finds clients by name
- [ ] Search finds fields by value
- [ ] Arrow keys navigate results
- [ ] Enter executes selected command
- [ ] ESC closes palette
- [ ] Shift+Click selects range
- [ ] Cmd+A selects all rows
- [ ] Bulk toolbar appears when 2+ selected
- [ ] Bulk edit applies to all selected
- [ ] Validation runs before bulk save
- [ ] Error shows which rows failed
- [ ] Audit log records bulk changes

## 📁 Files to Create/Modify

### New Files
- `planwise-ui/src/components/CommandPalette.tsx`
- `planwise-ui/src/components/BulkEditToolbar.tsx`
- `planwise-ui/src/components/BulkEditModal.tsx`
- `planwise-ui/src/hooks/useBulkSelection.ts`
- `planwise-ui/src/utils/searchIndex.ts`
- `planwise-ui/src/components/ui/checkbox.tsx`

### Modified Files
- `planwise-ui/src/components/PlanDesignMatrix.tsx`
- `planwise-ui/src/hooks/useGlobalShortcuts.ts` (add Cmd+K)

## 🚀 Implementation Order

1. Install dependencies ✅
2. Create CommandPalette component ✅
3. Build search index utility ✅
4. Add Cmd+K global shortcut ✅
5. Create useBulkSelection hook ✅
6. Add checkbox column to table ✅
7. Implement Shift+Click range selection ✅
8. Create BulkEditToolbar ✅
9. Create BulkEditModal ✅
10. Integrate bulk update API ✅
11. Add validation + preview ✅
12. Test all bulk operations ✅

## ⚡ Performance Considerations

- Debounce command palette search (200ms)
- Limit search results to 50 items
- Virtual scroll for large result lists
- Memoize search index (rebuild on data change)
- Batch bulk API calls (max 50 at a time)

## 🎁 Bonus Features (if time allows)

- [ ] Recent commands history
- [ ] Command aliases (shortcuts)
- [ ] Custom user commands
- [ ] Command palette plugins
- [ ] AI-powered suggestions
- [ ] Smart bulk actions (e.g., "Apply peer median to selected")

## 🔄 Bulk Update Flow

```
User selects multiple rows
  → Shift+Click or Cmd+A
  → BulkEditToolbar appears
  → User picks field + enters value
  → Click "Preview"
  → BulkEditModal shows before/after
  → User adds reason + notes
  → Validate all changes
  → PUT /api/v1/clients/bulk-update
  → Show progress (5/10 saved...)
  → On complete: Toast "10 clients updated"
  → Invalidate queries, refresh table
```

---

**Next Epic:** E08 - UX Polish & Smart Validation
