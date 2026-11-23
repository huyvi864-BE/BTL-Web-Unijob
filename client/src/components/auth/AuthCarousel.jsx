import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './AuthCarousel.module.css';

const AUTOPLAY_MS = 3000;
const TRANSITION_MS = 600;

export default function AuthCarousel({ slides }) {
  // Hai bản sao ở hai đầu giúp ảnh cuối trượt tiếp về ảnh đầu một cách liền mạch.
  const count = slides.length;
  const items = [slides[count - 1], ...slides, slides[0]];
  const [position, setPosition] = useState(1);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [instant, setInstant] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const gesture = useRef(null);
  const activeSlide = (position - 1 + count) % count;

  const moveTo = useCallback((nextPosition) => {
    if (isMoving || nextPosition === position) return;
    setInstant(false);
    setIsMoving(true);
    setPosition(nextPosition);
  }, [isMoving, position]);

  const settle = useCallback(() => {
    setIsMoving(false);
    if (position === 0 || position === count + 1) {
      setInstant(true);
      setPosition(position === 0 ? count : 1);
    }
  }, [count, position]);

  useEffect(() => {
    if (isDragging || count < 2) return;
    const timer = window.setTimeout(() => {
      setIsMoving(true);
      setPosition((current) => current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeSlide, count, isDragging]);

  // Dự phòng khi trình duyệt không phát transitionend, ví dụ lúc đổi tab.
  useEffect(() => {
    if (!isMoving) return;
    const timer = window.setTimeout(settle, TRANSITION_MS + 100);
    return () => window.clearTimeout(timer);
  }, [isMoving, settle]);

  useEffect(() => {
    if (!instant) return;
    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [instant]);

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || isMoving || instant) return;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function drag(event) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      start.horizontal = true;
    }
    if (start.horizontal) {
      const limit = event.currentTarget.clientWidth * .85;
      setDragOffset(Math.max(-limit, Math.min(limit, dx)));
    }
  }

  function endDrag(event, cancelled = false) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    setDragOffset(0);
    if (cancelled || !start.horizontal) return;
    const dx = event.clientX - start.x;
    const threshold = Math.min(80, event.currentTarget.clientWidth * .16);
    if (Math.abs(dx) >= threshold) moveTo(position + (dx < 0 ? 1 : -1));
  }

  function keyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(position + (event.key === 'ArrowRight' ? 1 : -1));
    }
  }

  return (
    <section className={styles.carousel} aria-label="Khám phá UniJob" aria-roledescription="trình chiếu">
      <div
        className={styles.viewport}
        tabIndex={0}
        role="group"
        aria-label="Kéo, vuốt hoặc dùng phím mũi tên để chuyển ảnh"
        data-dragging={isDragging}
        onKeyDown={keyDown}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={(event) => endDrag(event, true)}
        onLostPointerCapture={(event) => endDrag(event, true)}
      >
        <div
          className={styles.track}
          data-instant={instant || isDragging}
          style={{
            transform: `translate3d(calc(${-position * 100}% + ${dragOffset}px), 0, 0)`,
            '--slide-duration': `${TRANSITION_MS}ms`,
          }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === 'transform') settle();
          }}
        >
          {items.map((slide, index) => (
            <div
              key={`${slide.image}-${index}`}
              className={styles.slide}
              aria-hidden={index === 0 || index === count + 1 || index - 1 !== activeSlide}
            >
              <img src={slide.image} alt={slide.description} width="687" height="1024" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.dots} role="group" aria-label="Chọn ảnh giới thiệu">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            className={styles.dotButton}
            aria-label={`Xem ảnh ${index + 1}. ${slide.description}`}
            aria-current={index === activeSlide ? 'true' : undefined}
            onClick={() => moveTo(index + 1)}
          >
            <span className={styles.dot} />
          </button>
        ))}
      </div>
    </section>
  );
}
