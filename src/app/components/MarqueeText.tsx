import React, { useRef, useEffect, useState } from 'react';

interface MarqueeTextProps {
  text: string;
  speed?: number;
}

export default function MarqueeText({ text, speed = 50 }: MarqueeTextProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [duration, setDuration] = useState(0);
  const overflow = duration > 0;

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const textWidth = textRef.current.scrollWidth;
    const containerWidth = containerRef.current.clientWidth;
    if (textWidth > containerWidth) {
      setDuration(textWidth / speed);
    } else {
      setDuration(0);
    }
  }, [text, speed]);

  return (
    <div ref={containerRef} className="overflow-hidden flex w-full">
      <div
        className="inline-flex whitespace-nowrap"
        style={{ animation: overflow ? `marquee ${duration}s linear infinite` : 'none' }}
      >
        <span ref={textRef} className={overflow ? 'pr-4' : ''}>{text}</span>
        {overflow && <span className="pr-4">{text}</span>}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
