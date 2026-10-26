import React, { useMemo } from 'react';
import QRCode from 'qrcode';
import { getCustomerAppUrl } from '@/redux/api/baseApi';

export interface TableQrMatrixProps {
  value?: string;
  seed?: number;
  size?: number;
  lightColor?: string;
  darkColor?: string;
  className?: string;
  margin?: number;
}

/**
 * Authentic, spec-compliant SVG QR Code Matrix generator with standard Reed-Solomon
 * error correction, finder patterns, and high-contrast scannability for all smartphone cameras.
 */
export function TableQrMatrix({
  value,
  seed = 1,
  size = 96,
  lightColor = '#ffffff',
  darkColor = '#000000',
  className = '',
  margin = 2,
}: TableQrMatrixProps) {
  const qrData = useMemo(() => {
    const text =
      value && value.trim()
        ? value.trim()
        : `${getCustomerAppUrl()}/menu?table=T-${String(seed || 1).padStart(2, '0')}&seed=${seed}`;

    try {
      const qr = QRCode.create(text, {
        errorCorrectionLevel: 'M',
      });
      return { qr, error: null };
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      try {
        const fallback = QRCode.create('https://tavonza.com', {
          errorCorrectionLevel: 'M',
        });
        return { qr: fallback, error: null };
      } catch (fallbackErr: any) {
        return { qr: null, error: fallbackErr };
      }
    }
  }, [value, seed]);

  if (!qrData.qr) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-zinc-900 text-neutral-400 text-xs ${className}`}
      >
        QR Error
      </div>
    );
  }

  const { qr } = qrData;
  const numModules = qr.modules.size;
  const totalUnits = numModules + margin * 2;

  const rects: React.ReactNode[] = [];
  for (let r = 0; r < numModules; r++) {
    for (let c = 0; c < numModules; c++) {
      if (qr.modules.get(r, c)) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c + margin}
            y={r + margin}
            width={1}
            height={1}
            fill={darkColor}
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalUnits} ${totalUnits}`}
      shapeRendering="crispEdges"
      className={`rounded-sm select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Table QR Code"
    >
      <rect width={totalUnits} height={totalUnits} fill={lightColor} />
      {rects}
    </svg>
  );
}
