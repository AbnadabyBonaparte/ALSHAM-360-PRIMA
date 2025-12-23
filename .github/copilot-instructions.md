# GitHub Copilot Instructions - ALSHAM 360° PRIMA

## Project Context

ALSHAM 360° PRIMA is an enterprise CRM with:
- 150+ modules
- 6 cyberpunk themes with CSS variables
- shadcn/ui component library
- Supabase backend (PostgreSQL + Realtime)
- Multi-tenant architecture (org_id isolation)

## Critical Rules

### 1. NO Hardcoded Colors

❌ NEVER suggest:
```tsx
className="bg-white"
className="bg-gray-900"
className="text-emerald-500"
```

✅ ALWAYS suggest:
```tsx
className="bg-[var(--surface)]"
className="bg-[var(--bg)]"
className="text-[var(--accent-1)]"
```

### 2. Use shadcn/ui Components

❌ NEVER suggest custom components:
```tsx
<div className="card">
<button className="btn">
```

✅ ALWAYS suggest shadcn/ui:
```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
<Card><CardContent>...</CardContent></Card>
<Button>...</Button>
```

### 3. Real Data Only

❌ NEVER suggest mock data:
```tsx
const mockData = [...]
const FAKE_USERS = [...]
```

✅ ALWAYS suggest Supabase:
```tsx
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('org_id', currentOrgId)
```

## Color Mapping Reference

```
bg-white → bg-[var(--surface)]
bg-gray-50 → bg-[var(--surface-strong)]
bg-gray-900 → bg-[var(--bg)]
text-white → text-[var(--text)]
text-gray-500 → text-[var(--text-secondary)]
border-gray-200 → border-[var(--border)]

# Status
green-* → var(--accent-emerald)
blue-* → var(--accent-sky)
yellow-* → var(--accent-warning)
red-* → var(--accent-alert)
purple-* → var(--accent-purple)
```

## Available shadcn/ui Components

```tsx
// Import from @/components/ui/
Card, CardContent, CardHeader, CardTitle, CardDescription
Button
Badge
Input, Textarea, Label
Table, TableBody, TableCell, TableHead, TableHeader, TableRow
Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
Select, SelectContent, SelectItem, SelectTrigger, SelectValue
Tabs, TabsContent, TabsList, TabsTrigger
DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
Checkbox, Switch
Avatar, AvatarFallback, AvatarImage
Progress, Skeleton, Separator
Alert, AlertTitle, AlertDescription
```

## Preferred Patterns

### Loading State
```tsx
if (loading) {
  return <Skeleton className="h-64 w-full" />
}
```

### Error State
```tsx
if (error) {
  return (
    <Card className="border-[var(--accent-alert)]/30">
      <CardContent>
        <p className="text-[var(--accent-alert)]">Error: {error}</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </CardContent>
    </Card>
  )
}
```

### Empty State
```tsx
if (data.length === 0) {
  return (
    <Card className="border-dashed">
      <CardContent className="text-center py-12">
        <p className="text-[var(--text-secondary)]">No items found</p>
        <Button>Create New</Button>
      </CardContent>
    </Card>
  )
}
```

### Supabase Query
```tsx
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('org_id', currentOrgId)
  .order('created_at', { ascending: false })
```
