# E06: Keyboard Navigation & Shortcuts

**Status:** Planned
**Priority:** P0 (Critical UX)
**Estimated Time:** 1-2 hours
**Dependencies:** E05 (Inline Editing)

## 🎯 Goal
Enable 100% keyboard-driven editing for power users, eliminating mouse dependency and achieving Excel-like navigation speed.

## 📋 Success Criteria
- [ ] Tab/Shift+Tab to navigate cells
- [ ] Enter to edit, Escape to cancel
- [ ] Arrow keys to move between cells
- [ ] Cmd+S to save all pending changes
- [ ] Cmd+Z/Cmd+Shift+Z for undo/redo
- [ ] Cmd+/ to show keyboard shortcuts help
- [ ] All shortcuts work globally

## 🛠️ Technical Implementation

### 1. Install Dependencies
```bash
npm install react-hotkeys-hook@^4.6.1
npm install use-undo@^1.0.0
```

### 2. Create Keyboard Context
**File:** `planwise-ui/src/contexts/KeyboardContext.tsx`

```typescript
interface KeyboardContextValue {
  activeCell: { row: number; col: number } | null
  setActiveCell: (cell: { row: number; col: number }) => void
  moveFocus: (direction: 'up' | 'down' | 'left' | 'right') => void
  enterEditMode: () => void
  exitEditMode: () => void
}
```

### 3. Create Keyboard Hook
**File:** `planwise-ui/src/hooks/useKeyboardNavigation.ts`

```typescript
export function useKeyboardNavigation(rows: any[], cols: any[]) {
  const [activeCell, setActiveCell] = useState<Cell | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Tab navigation
  useHotkeys('tab', (e) => {
    e.preventDefault()
    moveToNextCell()
  })

  // Arrow keys
  useHotkeys('up', () => moveCell('up'))
  useHotkeys('down', () => moveCell('down'))
  useHotkeys('left', () => moveCell('left'))
  useHotkeys('right', () => moveCell('right'))

  // Enter to edit
  useHotkeys('enter', () => {
    if (!isEditing) enterEditMode()
  })

  // Escape to cancel
  useHotkeys('escape', () => {
    exitEditMode()
  })

  return { activeCell, isEditing, moveFocus }
}
```

### 4. Global Shortcuts Hook
**File:** `planwise-ui/src/hooks/useGlobalShortcuts.ts`

```typescript
export function useGlobalShortcuts() {
  const queryClient = useQueryClient()
  const { undo, redo, canUndo, canRedo } = useUndo()

  // Save all
  useHotkeys('meta+s', (e) => {
    e.preventDefault()
    saveAllPending()
  })

  // Undo/Redo
  useHotkeys('meta+z', (e) => {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  })

  // Help
  useHotkeys('meta+/', (e) => {
    e.preventDefault()
    setShowShortcutsDialog(true)
  })

  // Quick filter
  useHotkeys('meta+f', (e) => {
    e.preventDefault()
    focusSearchInput()
  })
}
```

### 5. Keyboard Shortcuts Dialog
**File:** `planwise-ui/src/components/KeyboardShortcutsDialog.tsx`

Display all available shortcuts:
- Navigation (Tab, Arrow keys)
- Editing (Enter, Esc)
- Actions (Cmd+S, Cmd+Z)
- Search (Cmd+F)

### 6. Update EditableTable
**File:** `planwise-ui/src/components/EditableTable.tsx`

Add:
- Cell focus state tracking
- Keyboard event handlers
- Visual focus indicator (blue outline)
- Focus trap when editing

### 7. Undo/Redo System
**File:** `planwise-ui/src/hooks/useEditHistory.ts`

```typescript
export function useEditHistory() {
  const [history, setHistory] = useState<Edit[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const addEdit = (edit: Edit) => {
    // Add to history, clear future if in middle
    const newHistory = history.slice(0, currentIndex + 1)
    setHistory([...newHistory, edit])
    setCurrentIndex(newHistory.length)
  }

  const undo = () => {
    if (currentIndex >= 0) {
      const edit = history[currentIndex]
      revertEdit(edit)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const edit = history[currentIndex + 1]
      applyEdit(edit)
      setCurrentIndex(currentIndex + 1)
    }
  }

  return { undo, redo, canUndo: currentIndex >= 0, canRedo: currentIndex < history.length - 1 }
}
```

## 🎨 UI/UX Specifications

### Visual Focus Indicators
1. **Active cell**: 2px blue outline
2. **Editing cell**: 2px blue outline + yellow background
3. **Tab order**: Visible indicator (optional)

### Keyboard Feedback
- Toast on Cmd+S: "All changes saved ✓"
- Toast on Cmd+Z: "Undone: Match Formula"
- Error on invalid shortcut: Subtle shake animation

## ⌨️ Keyboard Shortcuts Reference

### Navigation
- `Tab` - Next cell (right)
- `Shift+Tab` - Previous cell (left)
- `↑` - Move up
- `↓` - Move down
- `←` - Move left
- `→` - Move right
- `Home` - First cell in row
- `End` - Last cell in row

### Editing
- `Enter` - Edit active cell
- `Escape` - Cancel edit
- `Delete` - Clear cell value
- `Backspace` - Clear and edit

### Actions
- `Cmd+S` - Save all pending changes
- `Cmd+Z` - Undo last edit
- `Cmd+Shift+Z` - Redo
- `Cmd+F` - Focus search
- `Cmd+/` - Show shortcuts help
- `Cmd+K` - Open command palette (E07)

### Multi-Select (if implemented)
- `Shift+Click` - Range select
- `Cmd+Click` - Multi-select
- `Cmd+A` - Select all

## 🧪 Testing Checklist

- [ ] Tab moves focus to next editable cell
- [ ] Shift+Tab moves backwards
- [ ] Arrow keys navigate correctly
- [ ] Enter starts edit mode
- [ ] Escape cancels edit without saving
- [ ] Cmd+S saves all pending changes
- [ ] Cmd+Z undoes last change
- [ ] Cmd+Shift+Z redoes
- [ ] Cmd+/ opens help dialog
- [ ] Shortcuts work from any cell
- [ ] Focus visible at all times
- [ ] No conflicts with browser shortcuts

## 📁 Files to Create/Modify

### New Files
- `planwise-ui/src/contexts/KeyboardContext.tsx`
- `planwise-ui/src/hooks/useKeyboardNavigation.ts`
- `planwise-ui/src/hooks/useGlobalShortcuts.ts`
- `planwise-ui/src/hooks/useEditHistory.ts`
- `planwise-ui/src/components/KeyboardShortcutsDialog.tsx`

### Modified Files
- `planwise-ui/src/components/EditableTable.tsx`
- `planwise-ui/src/components/EditableCell.tsx`
- `planwise-ui/src/App.tsx` (add KeyboardProvider)

## 🚀 Implementation Order

1. Install dependencies ✅
2. Create KeyboardContext ✅
3. Create useKeyboardNavigation hook ✅
4. Add focus tracking to EditableTable ✅
5. Implement arrow key navigation ✅
6. Add Enter/Escape handlers ✅
7. Create useGlobalShortcuts hook ✅
8. Implement undo/redo system ✅
9. Create shortcuts dialog ✅
10. Add visual focus indicators ✅
11. Test all shortcuts ✅

## ⚡ Performance Considerations

- Debounce rapid key presses
- Use event delegation for shortcuts
- Memoize shortcut handlers
- Only track 50 last edits for undo (memory)

## 🎁 Bonus Features (if time allows)

- [ ] Customizable shortcuts (user preferences)
- [ ] Vim-mode (j/k/h/l navigation)
- [ ] Record macros (repeat actions)
- [ ] Shortcut conflicts warning
- [ ] Platform-specific shortcuts (Ctrl vs Cmd)

---

**Next Epic:** E07 - Command Palette & Bulk Operations
