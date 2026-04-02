import { useEffect, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(null);
  const containerRef = useRef(null);
  const threshold = 72;

  useEffect(() => {
    const onTouchStart = (e) => {
      const scrollTop = containerRef.current
        ? containerRef.current.scrollTop
        : window.scrollY;
      if (scrollTop === 0) startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (startY.current == null || isRefreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        setPullDistance(Math.min(dy, threshold * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        startY.current = null;
        await onRefresh();
        setIsRefreshing(false);
      } else {
        setPullDistance(0);
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
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  const PullIndicator = () => {
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
  };

  return { containerRef, isRefreshing, PullIndicator };
}