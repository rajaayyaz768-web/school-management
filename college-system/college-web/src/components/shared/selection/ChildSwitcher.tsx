'use client'

import { Button } from '@/components/ui/Button'
import { MyChild } from '@/features/parents/types/parents.types'

interface ChildSwitcherProps {
  children: MyChild[]
  activeId: string
  onChange: (studentId: string) => void
}

export function ChildSwitcher({ children, activeId, onChange }: ChildSwitcherProps) {
  if (children.length < 2) return null

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      {children.map((c) => (
        <Button
          key={c.student.id}
          variant={activeId === c.student.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChange(c.student.id)}
        >
          {c.student.firstName} {c.student.lastName}
          {c.isPrimary && <span className="ml-1 text-[10px] opacity-70">(Primary)</span>}
        </Button>
      ))}
    </div>
  )
}
