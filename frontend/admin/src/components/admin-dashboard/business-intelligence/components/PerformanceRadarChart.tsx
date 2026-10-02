'use client';

import React, { useState } from 'react';
import { BIRadarMetric } from '../types';

export interface PerformanceRadarChartProps {
  metrics: BIRadarMetric[];
}

export default function PerformanceRadarChart({
  metrics,
}: PerformanceRadarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 260;
  const center = size / 2;
  const maxRadius = 78;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const angleStep = (2 * Math.PI) / metrics.length;
  // Start from top (-PI/2)
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = valueRatio * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Construct hexagonal level rings
  const levelPolygons = levels.map((lvl) => {
    return metrics
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // Construct data polygon
  const dataPoints = metrics.map((m, i) =>
    getCoordinates(i, m.value / 100)
  );
  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Outer label placement positions with slight offset
  const labelPositions = metrics.map((m, i) => {
    const { x, y, angle } = getCoordinates(i, 1.32);
    return { ...m, x, y, angle, idx: i };
  });

  return (
    <div className="w-full bg-white/10 rounded-2xl border border-white/20 backdrop-blur-lg p-5 md:p-6 flex flex-col justify-between shadow-2xl relative">
      <div>
        {/* Header */}
        <h3 className="text-white text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5">
          Performance Radar
        </h3>

        {/* SVG Radar */}
        <div className="relative flex items-center justify-center py-1">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-56 h-56 overflow-visible"
          >
            {/* Concentric Hexagonal Rings */}
            {levelPolygons.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
                strokeDasharray={idx === levels.length - 1 ? 'none' : '2 2'}
              />
            ))}

            {/* Radial Axis Lines */}
            {metrics.map((_, idx) => {
              const outer = getCoordinates(idx, 1.0);
              return (
                <line
                  key={idx}
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Data Polygon */}
            <polygon
              points={dataPolygonString}
              fill="rgba(234, 179, 8, 0.35)"
              stroke="#eab308"
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* Data Vertex Points */}
            {dataPoints.map((p, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={14}
                    fill="transparent"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3.5}
                    fill="#eab308"
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Text Labels around radar */}
            {labelPositions.map((lbl) => {
              const isHovered = hoveredIdx === lbl.idx;

              return (
                <text
                  key={lbl.axis}
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-xs font-['Inter'] transition-colors cursor-pointer ${
                    isHovered
                      ? 'fill-yellow-400 font-bold'
                      : 'fill-slate-400 font-medium'
                  }`}
                  onMouseEnter={() => setHoveredIdx(lbl.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {lbl.label}
                </text>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIdx !== null && (
            <div className="absolute top-2 bg-neutral-950/95 border border-yellow-500/50 rounded-lg px-2.5 py-1 text-sm text-white shadow-2xl pointer-events-none z-30 font-['Inter']">
              <span className="font-semibold text-yellow-400">
                {metrics[hoveredIdx].label}:
              </span>{' '}
              <span className="font-bold text-white">
                {metrics[hoveredIdx].value}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Health Score */}
      <div className="text-center pt-2 border-t border-white/5">
        <div className="text-white text-4xl font-bold font-['Plus_Jakarta_Sans'] leading-8">
          91
        </div>
        <div className="text-green-400 text-sm font-semibold font-['Inter'] mt-0.5">
          Overall Health Score
        </div>
      </div>
    </div>
  );
}
