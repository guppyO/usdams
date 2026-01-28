import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Water waves design - matches public/favicon.svg
export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        {/* Water waves icon */}
        <svg
          width="24"
          height="24"
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
