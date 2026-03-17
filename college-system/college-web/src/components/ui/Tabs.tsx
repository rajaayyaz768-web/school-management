/**
 * Tabs Component
 * 
 * Provides a highly customizable tabbed interface following the design system.
 * Used for navigating between different views within the same page context
 * (e.g., Student Profile tabs, Settings tabs).
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type Tab = {
  id: string;
  label: string;
  count?: number;
  countVariant?: 'alert' | 'neutral';
  icon?: React.ReactNode;
};

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];

    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className={cn('relative w-full border-b border-[var(--border)]', className)}>
      <div className="flex custom-scrollbar overflow-x-auto" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-body font-medium transition-colors whitespace-nowrap outline-none',
                isActive 
                  ? 'text-[var(--primary)] font-semibold' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
              )}
            >
              {tab.icon && (
                <span className={cn('shrink-0', isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]')}>
                  {tab.icon}
                </span>
              )}
              
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 inline-flex items-center justify-center text-xs font-semibold leading-none',
                    tab.countVariant === 'alert'
                      ? 'bg-[var(--danger)] text-white px-1.5 py-0.5 rounded-full min-w-[1.25rem]'
                      : 'text-[var(--text-muted)]'
                  )}
                >
                  {tab.countVariant === 'alert' && tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Bottom Border Indicator */}
      <div 
        className="absolute bottom-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ease-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
}

export interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ tabId, activeTab, children, className }: TabPanelProps) {
  const isActive = tabId === activeTab;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      className={cn('pt-6 animate-in fade-in duration-150', className)}
    >
      {children}
    </div>
  );
}
