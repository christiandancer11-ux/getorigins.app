import { useEffect, useRef, useState, useCallback } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const containerRef = useRef(null);
  const startY = useRef(null);
  const startX = useRef(null);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const isPullingRef = useRef(false); // confirmed pull gesture (not horizontal scroll)
  const onRefreshRef = useRef(onRefresh);
  const threshold = 72;

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const getScrollTop = () =>
      containerRef.current ? containerRef.current.scrollTop : window.scrollY;

    const reset = () => {
      startY.current = null;
      startX.current = null;
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    const onTouchStart = (e) => {
      if (isRefreshingRef.current) return;
      if (getScrollTop() === 0) {
        startY.current = e.touches[0].clientY;
        startX.current = e.touches[0].clientX;
        isPullingRef.current = false;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current == null || isRefreshingRef.current) return;

      const dy = e.touches[0].clientY - startY.current;
      const dx = Math.abs(e.touches[0].clientX - startX.current);

      // If horizontal movement dominates, abort — it's a swipe not a pull
      if (!isPullingRef.current && dx > Math.abs(dy)) {
        reset();
        return;
      }

      // Only engage pull if downward
      if (dy <= 0) {
        reset();
        return;
      }

      // Confirmed vertical pull gesture
      isPullingRef.current = true;
      e.preventDefault();
      const clamped = Math.min(dy, threshold * 1.5);
      pullDistanceRef.current = clamped;
      setPullDistance(clamped);
    };

    const onTouchEnd = async () => {
      if (!isPullingRef.current) {
        reset();
        return;
      }

      if (pullDistanceRef.current >= threshold && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        reset();
        try {
          await onRefreshRef.current();
        } finally {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
        }
      } else {
        reset();
      }
    };

    const onTouchCancel = () => {
      reset();
    };

    const target = containerRef.current || window;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    target.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);

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