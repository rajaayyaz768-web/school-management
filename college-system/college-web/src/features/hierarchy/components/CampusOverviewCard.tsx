'use client';

import { Campus } from '@/features/campus/types/campus.types';
import { Card, Badge } from '@/components/ui';
import { Building2, ArrowRight } from 'lucide-react';

interface CampusOverviewCardProps {
  campus: Campus;
  onClick: (campus: Campus) => void;
}

export function CampusOverviewCard({ campus, onClick }: CampusOverviewCardProps) {
  return (
    <div onClick={() => onClick(campus)} className="cursor-pointer group h-full">
      <Card className="h-full transition-all duration-200 group-hover:shadow-md group-hover:border-[var(--primary)] group-hover:bg-[var(--surface-hover)]">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-[var(--primary-tint)] rounded-xl text-[var(--primary)]">
            <Building2 className="w-6 h-6" />
          </div>
          <Badge variant={campus.isActive ? 'success' : 'danger'}>
            {campus.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">
          {campus.name}
        </h3>
        
        <div className="flex gap-2 mb-6">
          <Badge variant="neutral">{campus.code}</Badge>
        </div>
        
        <div className="text-sm font-semibold text-[var(--primary)] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
          Explore Campus <ArrowRight className="w-4 h-4" />
        </div>
      </Card>
    </div>
  );
}
