'use client';

import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface InfiniteScrollSentinelProps {
  onVisible: () => void;
  hasMore: boolean;
  isFetching: boolean;
}

export function InfiniteScrollSentinel({ onVisible, hasMore, isFetching }: InfiniteScrollSentinelProps) {
  const trigger = useCallback(() => {
    if (hasMore && !isFetching) onVisible();
  }, [hasMore, isFetching, onVisible]);

  const ref = useIntersectionObserver(trigger);

  if (!hasMore && !isFetching) return null;

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more…
        </div>
      )}
    </div>
  );
}
