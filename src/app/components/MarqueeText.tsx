import React, { useRef, useEffect, useState } from 'react';

interface MarqueeTextProps {
  text: string;
  speed?: number;
}

export default function MarqueeText({ text, speed = 50 }: MarqueeTextProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (containerRef.current && wrapperRef.current) {
      const overflow = wrapperRef.current.scrollWidth / 2 > containerRef.current.clientWidth;
      if (overflow) {
        const width = wrapperRef.current.scrollWidth / 2;
        setDuration(width / speed);
      } else {
        setDuration(0);
      }
    }
  }, [text, speed]);

  return (
    <div ref={containerRef} className="overflow-hidden flex w-full">
      <div
        ref={wrapperRef}
        className="inline-flex whitespace-nowrap"
        style={{
          animation: duration ? `marquee ${duration}s linear infinite` : 'none',
        }}
      >
        <span className="pr-4">{text}</span>
        <span className="pr-4">{text}</span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
