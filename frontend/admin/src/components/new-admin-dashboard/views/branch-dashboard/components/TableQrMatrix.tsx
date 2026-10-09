import React from 'react';

/**
 * Authentic SVG QR Code Matrix generator with classic finder patterns and deterministic seed
 */
export function TableQrMatrix({
  seed = 1,
  size = 96,
  lightColor = '#f3f4f6',
  darkColor = '#171717',
}: {
  seed?: number;
  size?: number;
  lightColor?: string;
  darkColor?: string;
}) {
  const gridSize = 17;
  const cellSize = size / gridSize;

  const isFinder = (r: number, c: number) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= gridSize - 7) return true;
    if (r >= gridSize - 7 && c < 7) return true;
    return false;
  };

  const isFinderFilled = (r: number, c: number) => {
    const checkCorner = (or: number, oc: number) => {
      const dr = r - or;
      const dc = c - oc;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };

    if (r < 7 && c < 7) return checkCorner(0, 0);
    if (r < 7 && c >= gridSize - 7) return checkCorner(0, gridSize - 7);
    if (r >= gridSize - 7 && c < 7) return checkCorner(gridSize - 7, 0);
    return false;
  };

  const cells: { r: number; c: number; filled: boolean }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isFinder(r, c)) {
        cells.push({ r, c, filled: isFinderFilled(r, c) });
      } else {
        const val = (r * 19 + c * 31 + seed * 13) % 100;
        const filled = val > 42;
        cells.push({ r, c, filled });
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-sm">
      <rect width={size} height={size} fill={darkColor} />
      {cells.map(({ r, c, filled }) =>
        filled ? (
          <rect
            key={`${r}-${c}`}
            x={c * cellSize + 0.4}
            y={r * cellSize + 0.4}
            width={cellSize - 0.8}
            height={cellSize - 0.8}
            rx={0.5}
            fill={lightColor}
          />
        ) : null
      )}
    </svg>
  );
}
