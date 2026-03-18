/**
 * Tabs Component — Refined segment control with animated sliding indicator
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
      <div className="flex overflow-x-auto" role="tablist">
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
                'relative flex items-center justify-center gap-2 px-5 py-3 text-sm font-body font-medium',
                'transition-colors duration-[180ms] whitespace-nowrap outline-none',
                'hover:text-[var(--text)]',
                isActive
                  ? 'text-[var(--primary)] font-semibold'
                  : 'text-[var(--text-muted)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 focus-visible:ring-inset'
              )}
            >
              {tab.icon && (
                <span className={cn(
                  'shrink-0 transition-colors duration-[180ms]',
                  isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                )}>
                  {tab.icon}
                </span>
              )}

              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1 inline-flex items-center justify-center text-[10px] font-semibold leading-none',
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
        className="absolute bottom-0 h-[2px] bg-[var(--primary)] rounded-full transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
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
      className={cn('pt-6 animate-fade-in', className)}
    >
      {children}
    </div>
  );
}
