import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center flex-wrap gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link 
                href={item.href} 
                onClick={item.onClick}
                className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : item.onClick && !isLast ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="!p-0 !rounded-none !bg-transparent hover:!bg-transparent hover:!translate-y-0 text-[var(--text-muted)] hover:text-[var(--primary)] font-medium"
              >
                {item.label}
              </Button>
            ) : (
              <span className="text-[var(--text)] font-semibold" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 ml-2 text-[var(--text-muted)] opacity-50" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
