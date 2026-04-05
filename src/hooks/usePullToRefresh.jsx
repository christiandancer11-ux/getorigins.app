import { useEffect, useRef, useState, useCallback } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const containerRef = useRef(null);
  const startY = useRef(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const threshold = 72;

  // Keep onRefresh ref up to date without re-registering listeners
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const onTouchStart = (e) => {
      const scrollTop = containerRef.current
        ? containerRef.current.scrollTop
        : window.scrollY;
      if (scrollTop === 0) startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (startY.current == null || isRefreshingRef.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        const clamped = Math.min(dy, threshold * 1.5);
        pullDistanceRef.current = clamped;
        setPullDistance(clamped);
      }
    };

    const onTouchEnd = async () => {
      if (pullDistanceRef.current >= threshold && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(0);
        pullDistanceRef.current = 0;
        startY.current = null;
        await onRefreshRef.current();
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
        startY.current = null;
      }
    };

    const target = containerRef.current || window;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd);
    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // Empty deps — listeners registered once, stable forever

  const progress = Math.min(pullDistance / threshold, 1);

  const PullIndicator = useCallback(() => {
    if (pullDistance <= 8 && !isRefreshing) return null;
    return (
      <div
        className="flex items-center justify-center transition-all"
        style={{ height: isRefreshing ? 44 : pullDistance * 0.6 }}
      >
        <div
          className={`w-7 h-7 rounded-full border-2 border-primary border-t-transparent ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ opacity: isRefreshing ? 1 : progress, transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
    );
  }, [pullDistance, isRefreshing, progress]);

  return { containerRef, isRefreshing, PullIndicator };
}