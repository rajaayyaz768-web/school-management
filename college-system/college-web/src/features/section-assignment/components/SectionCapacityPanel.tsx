'use client';

import { SectionInfo, AssignmentPreview } from '../types/section-assignment.types';
import { Card, Input } from '@/components/ui';

interface SectionCapacityPanelProps {
  sections: SectionInfo[];
  sectionCapacities: { sectionId: string; capacity: number }[];
  onCapacityChange: (sectionId: string, capacity: number) => void;
  previewData: AssignmentPreview[];
}

export function SectionCapacityPanel({
  sections,
  sectionCapacities,
  onCapacityChange,
  previewData,
}: SectionCapacityPanelProps) {
  
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const capacityRecord = sectionCapacities.find((c) => c.sectionId === section.id);
        // Default to the original if manual override doesn't exist yet
        const displayCapacity = capacityRecord ? capacityRecord.capacity : section.capacity;
        
        const previewRecord = previewData.find((p) => p.sectionId === section.id);
        const incomingCount = previewRecord ? previewRecord.students.length : 0;
        
        const totalProjected = section.currentCount + incomingCount;
        const fillPercentage = displayCapacity > 0 ? Math.min(100, (totalProjected / displayCapacity) * 100) : 100;

        let fillColorClass = 'bg-[var(--success)]';
        if (fillPercentage > 100) {
          fillColorClass = 'bg-[var(--danger)]';
        } else if (fillPercentage >= 80) {
          fillColorClass = 'bg-[var(--warning)]';
        }

        return (
          <Card key={section.id} className="overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-lg font-bold text-[var(--text)]">{section.name}</h4>
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  {section.currentCount} existing students
                </div>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="0"
                  value={displayCapacity}
                  onChange={(e) => onCapacityChange(section.id, parseInt(e.target.value) || 0)}
                  className="text-right"
                />
              </div>
            </div>

            {incomingCount > 0 && (
              <div className="text-sm font-semibold text-[var(--primary)] mb-2">
                +{incomingCount} students pending assignment
              </div>
            )}

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-[var(--text-muted)]">Fill Status ({totalProjected} / {displayCapacity})</span>
                <span className="text-[var(--text)]">{Math.round(fillPercentage)}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${fillColorClass}`}
                  style={{ width: `${Math.max(0, Math.min(100, fillPercentage))}%` }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
