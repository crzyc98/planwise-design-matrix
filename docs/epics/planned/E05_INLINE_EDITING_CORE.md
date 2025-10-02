# E05: Core Inline Editing System

**Status:** Planned
**Priority:** P0 (Blocking - Foundation)
**Estimated Time:** 2-3 hours
**Dependencies:** None

## 🎯 Goal
Transform the Plan Design Matrix from modal-based editing to instant inline editing with auto-save, reducing edit time from 5 clicks to 1-2 clicks per field.

## 📋 Success Criteria
- [ ] Click any cell to edit in-place (no modal)
- [ ] Auto-save with 500ms debounce after typing stops
- [ ] Optimistic UI updates (instant feedback)
- [ ] Rollback on error with toast notification
- [ ] Keep modal for complex multi-field edits
- [ ] All existing validation rules preserved

## 🛠️ Technical Implementation

### 1. Install Dependencies
```bash
npm install @tanstack/react-table@^8.20.5
npm install use-debounce@^10.0.3
npm install @radix-ui/react-toast@^1.2.2
npm install immer@^10.1.1
```

### 2. Create TanStack Table Wrapper
**File:** `planwise-ui/src/components/EditableTable.tsx`

Core features:
- Column definitions with cell renderers
- Inline edit mode state per cell
- Auto-save hook with debounce
- Optimistic updates via React Query

### 3. Create Editable Cell Component
**File:** `planwise-ui/src/components/EditableCell.tsx`

Features:
- Double-click or click to edit
- Auto-focus input on edit
- Save on blur or Enter key
- Cancel on Escape key
- Visual feedback (yellow → green)
- Loading spinner during save

### 4. Update PlanDesignMatrix Component
**File:** `planwise-ui/src/components/PlanDesignMatrix.tsx`

Changes:
- Replace basic `<table>` with `<EditableTable>`
- Move mutation logic to shared hook
- Keep modal for "complex edit" button
- Add toast notifications for save/error

### 5. Create Auto-Save Hook
**File:** `planwise-ui/src/hooks/useAutoSave.ts`

```typescript
export function useAutoSave(clientId: string) {
  const [pendingChanges, setPendingChanges] = useState({})
  const debouncedSave = useDebouncedCallback(
    (changes) => {
      // Batch save all pending changes
      updateFieldMutation.mutate(changes)
    },
    500
  )

  return { updateField, pendingChanges }
}
```

### 6. Add Toast System
**File:** `planwise-ui/src/components/ui/toast.tsx`

Toast types:
- Success: "Field saved ✓"
- Error: "Save failed - retrying..."
- Info: "3 pending changes"

## 🎨 UI/UX Specifications

### Visual States
1. **Default**: Normal cell appearance
2. **Hover**: Slight highlight + edit icon
3. **Editing**: Yellow border, focused input
4. **Saving**: Pulsing yellow border
5. **Saved**: Green flash → normal
6. **Error**: Red border + error tooltip

### Interaction Patterns
- **Click**: Enter edit mode
- **Double-click**: Select all text
- **Enter**: Save and move down
- **Tab**: Save and move right
- **Shift+Tab**: Save and move left
- **Escape**: Cancel edit

## 📊 Field Type Handling

### Text Fields (eligibility, formulas)
- `<input type="text">` with validation
- Character limit indicator
- Smart autocomplete from peer values

### Numeric Fields (rates, caps)
- `<input type="number">` with step
- Min/max validation
- Percentage formatter (0.045 → "4.5%")

### Boolean Fields (auto_enrollment_enabled)
- Toggle switch or checkbox
- Instant save on change

### Select Fields (vesting_schedule)
- Dropdown with common values
- "Other" option → text input

## 🔄 Data Flow

```
User edits cell
  → updateField(fieldName, value)
  → Add to pendingChanges state
  → Debounce 500ms
  → Optimistic update UI (show saving state)
  → PATCH /api/v1/clients/{id}/fields/{field}
  → On success: Show green flash, invalidate query
  → On error: Rollback, show toast, keep in pendingChanges
```

## 🧪 Testing Checklist

- [ ] Edit text field → auto-saves after 500ms
- [ ] Edit numeric field → validates min/max
- [ ] Rapid edits → debounces correctly (one API call)
- [ ] Network error → shows error toast, allows retry
- [ ] Concurrent edits → handles correctly
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Validation errors prevent save
- [ ] Optimistic update → rollback on error

## 📁 Files to Create/Modify

### New Files
- `planwise-ui/src/components/EditableTable.tsx`
- `planwise-ui/src/components/EditableCell.tsx`
- `planwise-ui/src/hooks/useAutoSave.ts`
- `planwise-ui/src/components/ui/toast.tsx`
- `planwise-ui/src/components/ui/toaster.tsx`

### Modified Files
- `planwise-ui/src/components/PlanDesignMatrix.tsx`
- `planwise-ui/src/App.tsx` (add Toaster)
- `planwise-ui/package.json` (dependencies)

## 🚀 Implementation Order

1. Install dependencies ✅
2. Create toast UI system ✅
3. Create useAutoSave hook ✅
4. Create EditableCell component ✅
5. Create EditableTable wrapper ✅
6. Update PlanDesignMatrix to use new table ✅
7. Test all field types ✅
8. Add visual polish (transitions, icons) ✅

## ⚡ Performance Considerations

- Debounce saves to prevent API spam
- Memoize column definitions
- Use React.memo for EditableCell
- Only re-render changed cells
- Batch multiple field saves when possible

## 🎁 Bonus Features (if time allows)

- [ ] Show "X pending changes" indicator
- [ ] Bulk save button (save all pending)
- [ ] Undo last edit (Cmd+Z)
- [ ] Copy cell value on right-click
- [ ] Field history popover on icon click

---

**Next Epic:** E06 - Keyboard Navigation & Shortcuts
