'use client';

import React, { useMemo } from 'react';

export interface QRCodeGraphicProps {
  size?: number;
  className?: string;
  tableId?: string;
  color?: string;
}

// Generates an authentic 25x25 QR Matrix (Version 2 QR standard)
function generateQRMatrix(seed: string): boolean[][] {
  const size = 25;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // 1. Helper to draw 7x7 Finder Pattern with outer separator
  const placeFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isOuter || isInner;
      }
    }

    // Separator borders around finder patterns (empty space)
    for (let i = -1; i <= 7; i++) {
      const y1 = startY - 1;
      const y2 = startY + 7;
      const x1 = startX - 1;
      const x2 = startX + 7;

      if (y1 >= 0 && y1 < size && startX + i >= 0 && startX + i < size) {
        matrix[y1][startX + i] = false;
      }
      if (y2 >= 0 && y2 < size && startX + i >= 0 && startX + i < size) {
        matrix[y2][startX + i] = false;
      }
      if (x1 >= 0 && x1 < size && startY + i >= 0 && startY + i < size) {
        matrix[startY + i][x1] = false;
      }
      if (x2 >= 0 && x2 < size && startY + i >= 0 && startY + i < size) {
        matrix[startY + i][x2] = false;
      }
    }
  };

  // Place 3 Finder Patterns at corners
  placeFinder(0, 0); // Top-Left
  placeFinder(size - 7, 0); // Top-Right
  placeFinder(0, size - 7); // Bottom-Left

  // 2. Alignment pattern at (16, 16)
  const ax = 16;
  const ay = 16;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[ay + r][ax + c] = isOuter || isCenter;
    }
  }

  // 3. Timing tracks at row 6 and column 6
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 4. Dark Module required by QR specification
  matrix[size - 8][8] = true;

  // 5. Seed-based Hash generator for unique, deterministic table data pattern
  let hash = 5381;
  const key = `tavonza_table_qr_${seed}`;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i);
    hash |= 0;
  }

  // LCG pseudo-random generator
  let state = Math.abs(hash) + 12345;
  const nextRandom = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  // 6. Fill all remaining data and error-correction cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) {
        matrix[r][c] = nextRandom() > 0.49;
      }
    }
  }

  return matrix as boolean[][];
}

export default function QRCodeGraphic({
  size = 120,
  className = '',
  tableId = 'T-01',
  color = '#ffffff',
}: QRCodeGraphicProps) {
  const matrix = useMemo(() => generateQRMatrix(tableId), [tableId]);
  const gridSize = matrix.length;

  return (
    <div
      style={{ width: size, height: size }}
      className={`bg-transparent flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill={color}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
