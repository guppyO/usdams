import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon - matches icon.tsx water waves design
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          borderRadius: 32,
        }}
      >
        {/* Water waves icon */}
        <svg
          width="140"
          height="140"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M6 11c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M6 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M6 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
