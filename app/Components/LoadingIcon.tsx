
import * as React from "react";

type CorporateLoaderProps = {
    /** Visual size in px (defaults big) */
    size?: number;
    /** Stroke thickness in px */
    strokeWidth?: number;
    /** Optional accessible label */
    label?: string;
    /** Optional className for layout tweaks */
    className?: string;
    title?: string;
};

export function CorporateLoader({
    size = 220,          // big by default
    strokeWidth = 14,
    label = "Loading",
    className,
    title = "Loading..."

}: CorporateLoaderProps) {
    // Keep the viewBox constant and scale via width/height for crispness
    const vb = 200;
    const r = 70;
    const cx = vb / 2;
    const cy = vb / 2;

    // A rounded ring with a “corporate” highlight + soft inner detail (still flat)
    return (
        <>
            <div
                role="status"
                aria-label={label}
                className={className}
                style={{
                    width: size,
                    height: size,
                    display: "inline-grid",
                    placeItems: "center",
                }}
            >
                <h1 className="text-slate-800 text-md font-semibold whitespace-nowrap">
  {title}
</h1>


                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${vb} ${vb}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        overflow: "visible",
                    }}
                >
                    <defs>
                        {/* Subtle enterprise gradient (neutral -> blue accent) */}
                        <linearGradient id="corpStroke" x1="40" y1="40" x2="160" y2="160">
                            <stop offset="0%" stopColor="#111827" stopOpacity="0.22" />
                            <stop offset="45%" stopColor="#0F172A" stopOpacity="0.60" />
                            <stop offset="70%" stopColor="#2563EB" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#0B1220" stopOpacity="0.35" />
                        </linearGradient>

                        {/* Highlight gradient for the “leading edge” */}
                        <linearGradient id="corpHead" x1="90" y1="20" x2="140" y2="80">
                            <stop offset="0%" stopColor="#93C5FD" stopOpacity="1" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
                        </linearGradient>

                        {/* Slight blur for premium softness (still subtle) */}
                        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="0.6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Base ring (very faint, shows the track) */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke="#0F172A"
                        strokeOpacity="0.10"
                        strokeWidth={strokeWidth}
                    />

                    {/* Main animated ring segment */}
                    <g
                        style={{
                            transformOrigin: "50% 50%",
                            animation: "corpSpin 1.1s linear infinite",
                        }}
                    >
                        {/* Smooth corporate “arc” using dasharray */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            stroke="url(#corpStroke)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray="210 260"
                            filter="url(#softGlow)"
                        />

                        {/* Leading edge accent dot (gives premium motion cue) */}
                        <circle
                            cx={cx}
                            cy={cy - r}
                            r={strokeWidth * 0.34}
                            fill="url(#corpHead)"
                            filter="url(#softGlow)"
                        />
                    </g>

                    {/* Inner detail ring (optional, adds “designed” feel) */}
                    <g
                        style={{
                            transformOrigin: "50% 50%",
                            animation: "corpSpinReverse 2.2s ease-in-out infinite",
                        }}
                    >
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r - strokeWidth * 1.15}
                            stroke="#0B1220"
                            strokeOpacity="0.10"
                            strokeWidth={Math.max(2, Math.round(strokeWidth * 0.22))}
                            strokeLinecap="round"
                            strokeDasharray="80 420"
                        />
                    </g>
                </svg>

                {/* CSS keyframes inline so it “just works” */}
                <style>{`
        @keyframes corpSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes corpSpinReverse {
          0%   { transform: rotate(0deg); opacity: 0.55; }
          50%  { transform: rotate(-180deg); opacity: 0.95; }
          100% { transform: rotate(-360deg); opacity: 0.55; }
        }
      `}</style>
            </div>
        </>
    );
}
