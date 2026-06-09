'use client';
import { useEffect, useState } from 'react';

const ON = '#0A0A0A';
const LIME = '#D4FF00';
const OFF = '#E5E5E0';

/**
 * Generic pixel canvas — takes a 2D matrix of 0/1/2 (off/on/accent).
 * 0 → soft, 1 → ink, 2 → lime accent
 */
export function PixelCanvas({
  matrix,
  cell = 6,
  gap = 1,
  className = '',
}: {
  matrix: number[][];
  cell?: number;
  gap?: number;
  className?: string;
}) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      shapeRendering="crispEdges"
    >
      {matrix.flatMap((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * (cell + gap)}
            y={r * (cell + gap)}
            width={cell}
            height={cell}
            fill={v === 2 ? LIME : v === 1 ? ON : OFF}
          />
        )),
      )}
    </svg>
  );
}

/* ============== PADLOCK (security) ============== */
export function PixelPadlock({ cell = 5 }: { cell?: number }) {
  const _ = 0; const X = 1; const A = 2;
  const m = [
    [_,_,_,X,X,X,X,X,X,X,_,_,_],
    [_,_,X,_,_,_,_,_,_,_,X,_,_],
    [_,X,_,_,X,X,X,X,X,_,_,X,_],
    [_,X,_,X,_,_,_,_,_,X,_,X,_],
    [X,_,_,X,_,_,_,_,_,X,_,_,X],
    [X,A,A,A,A,A,A,A,A,A,A,A,X],
    [X,A,A,A,A,A,A,A,A,A,A,A,X],
    [X,A,A,A,A,X,X,A,A,A,A,A,X],
    [X,A,A,A,X,_,_,X,A,A,A,A,X],
    [X,A,A,A,X,_,_,X,A,A,A,A,X],
    [X,A,A,A,A,X,X,A,A,A,A,A,X],
    [X,A,A,A,A,A,X,A,A,A,A,A,X],
    [X,A,A,A,A,A,A,A,A,A,A,A,X],
    [X,X,X,X,X,X,X,X,X,X,X,X,X],
  ];
  return <PixelCanvas matrix={m} cell={cell} />;
}

/* ============== GLOBE (world reach) ============== */
export function PixelGlobe({ cell = 5 }: { cell?: number }) {
  // 16x16 dot map silhouette
  const _ = 0; const X = 1; const A = 2;
  const m = [
    [_,_,_,_,_,X,X,X,X,_,_,_,_,_,_,_],
    [_,_,_,X,X,_,_,_,_,X,X,_,_,_,_,_],
    [_,_,X,_,X,X,_,X,_,_,_,X,_,_,_,_],
    [_,X,_,_,_,_,X,_,X,_,_,_,X,_,_,_],
    [_,X,A,X,_,X,_,_,_,X,_,A,X,_,_,_],
    [X,_,_,_,X,_,_,A,_,_,X,_,_,X,_,_],
    [X,_,A,_,_,X,_,_,_,X,_,_,A,X,_,_],
    [X,_,_,_,X,_,_,A,_,_,X,_,_,X,_,_],
    [X,A,_,X,_,_,X,_,X,_,_,A,_,X,_,_],
    [_,X,_,_,X,_,_,_,_,X,_,_,X,_,_,_],
    [_,X,A,_,_,X,_,X,X,_,_,X,_,_,_,_],
    [_,_,X,X,_,_,X,_,_,X,X,_,_,_,_,_],
    [_,_,_,_,X,X,X,X,X,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];
  return <PixelCanvas matrix={m} cell={cell} />;
}

/* ============== BAR CHART (paid signals) ============== */
export function PixelBars({ values, cell = 7 }: { values: number[]; cell?: number }) {
  const max = 12;
  const cols = values.length;
  const m: number[][] = Array.from({ length: max }, () => Array(cols).fill(0));
  values.forEach((v, c) => {
    for (let r = 0; r < v; r++) m[max - 1 - r][c] = r === v - 1 ? 2 : 1;
  });
  return <PixelCanvas matrix={m} cell={cell} gap={2} />;
}

/* ============== SCANNER (search) ============== */
export function PixelScanner({ cell = 5 }: { cell?: number }) {
  const _ = 0; const X = 1; const A = 2;
  const m = [
    [_,_,X,X,X,X,X,_,_,_,_,_,_,_],
    [_,X,_,_,_,_,_,X,_,_,_,_,_,_],
    [X,_,_,A,A,A,_,_,X,_,_,_,_,_],
    [X,_,A,_,_,_,A,_,X,_,_,_,_,_],
    [X,_,A,_,_,_,A,_,X,_,_,_,_,_],
    [X,_,A,_,_,_,A,_,X,_,_,_,_,_],
    [X,_,_,A,A,A,_,_,X,_,_,_,_,_],
    [_,X,_,_,_,_,_,X,X,_,_,_,_,_],
    [_,_,X,X,X,X,X,_,_,X,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,X,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,X,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,X,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,X],
  ];
  return <PixelCanvas matrix={m} cell={cell} />;
}

/* ============== N-LOGO (mark) ============== */
export function PixelNLogo({ cell = 6 }: { cell?: number }) {
  const _ = 0; const X = 1; const A = 2;
  const m = [
    [X,X,_,_,_,_,_,_,_,_,X,X],
    [X,X,X,_,_,_,_,_,_,_,X,X],
    [X,X,X,X,_,_,_,_,_,_,X,X],
    [X,X,A,X,X,_,_,_,_,_,X,X],
    [X,X,_,X,X,X,_,_,_,_,X,X],
    [X,X,_,_,X,X,X,_,_,_,X,X],
    [X,X,_,_,_,X,X,X,_,A,X,X],
    [X,X,_,_,_,_,X,X,X,_,X,X],
    [X,X,_,_,_,_,_,X,X,X,X,X],
    [X,X,_,_,_,_,_,_,X,X,X,X],
    [X,X,_,_,_,_,_,_,_,X,X,X],
    [X,X,_,_,_,_,_,_,_,_,X,X],
  ];
  return <PixelCanvas matrix={m} cell={cell} />;
}

/* ============== ROUND DIAL (progress %) — pure SVG ring ============== */
export function PixelDial({ value, size = 140, cellArc = 8 }: { value: number; size?: number; cellArc?: number }) {
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const segments = 24;
  const filled = Math.round((value / 100) * segments);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} shapeRendering="crispEdges">
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r - cellArc / 2;
        const y = cy + Math.sin(angle) * r - cellArc / 2;
        const isFilled = i < filled;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={cellArc}
            height={cellArc}
            fill={isFilled ? '#0A0A0A' : '#E5E5E0'}
            transform={`rotate(${(i / segments) * 360} ${x + cellArc / 2} ${y + cellArc / 2})`}
          />
        );
      })}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={size / 4.5}
        fontWeight={800}
        fill="#0A0A0A"
      >
        {value}%
      </text>
    </svg>
  );
}

/* ============== LED MATRIX (progress wide bar) ============== */
export function PixelMatrix({ pct, rows = 4, cols = 32, cell = 10, gap = 2 }: {
  pct: number; rows?: number; cols?: number; cell?: number; gap?: number;
}) {
  const filled = Math.round((pct / 100) * cols);
  const m: number[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (_, c) => (c < filled ? 2 : 0)),
  );
  return <PixelCanvas matrix={m} cell={cell} gap={gap} />;
}

/* ============== TIMELINE GRID (pipeline throughput by month) ============== */
export function PixelTimeline({
  months,
  cell = 10,
  gap = 2,
}: {
  months: { label: string; intensities: number[] }[];
  cell?: number;
  gap?: number;
}) {
  return (
    <div className="space-y-3">
      {months.map((m, mi) => (
        <div key={mi} className="flex items-center gap-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim w-12">
            {m.label}
          </div>
          <div className="flex gap-[2px]">
            {m.intensities.map((v, i) => (
              <div
                key={i}
                style={{
                  width: cell,
                  height: cell,
                  background: v === 0 ? '#E5E5E0' : v === 2 ? LIME : ON,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============== AUDIO WAVE (used to imply "live" / streaming) ============== */
export function PixelWave({ width = 24, height = 8, cell = 6 }: { width?: number; height?: number; cell?: number }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 200);
    return () => clearInterval(t);
  }, []);
  const heights = Array.from({ length: width }, (_, i) =>
    Math.max(2, Math.round(((Math.sin((i + tick) * 0.6) + 1) / 2) * height) + 1),
  );
  const m: number[][] = Array.from({ length: height }, (_, r) =>
    Array.from({ length: width }, (_, c) => (height - 1 - r < heights[c] ? (r === 0 ? 2 : 1) : 0)),
  );
  return <PixelCanvas matrix={m} cell={cell} />;
}
