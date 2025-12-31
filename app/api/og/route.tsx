import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  const geistMono = fetch(
    new URL("https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/GeistMono-Medium.ttf"),
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0f0f12 0%, #1a1a22 50%, #0f0f12 100%)",
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          tw="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Glow effect behind text */}
        <div
          tw="absolute"
          style={{
            width: "400px",
            height: "200px",
            background: "radial-gradient(ellipse, rgba(220, 80, 60, 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Main content */}
        <div tw="flex flex-col items-center justify-center">
          {/* Brand text */}
          <div
            tw="flex items-baseline"
            style={{ fontFamily: "GeistMono" }}
          >
            <span
              tw="text-8xl font-medium tracking-tight"
              style={{ color: "#fafafa" }}
            >
              codings
            </span>
            <span
              tw="text-8xl font-medium"
              style={{ color: "#dc5040" }}
            >
              _
            </span>
          </div>

          {/* Tagline */}
          <div
            tw="flex mt-6 text-2xl tracking-wide"
            style={{
              fontFamily: "GeistMono",
              color: "#71717a",
            }}
          >
            type faster. code better.
          </div>
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 320,
      fonts: [
        {
          name: "GeistMono",
          data: await geistMono,
          style: "normal",
          weight: 500,
        },
      ],
    },
  )
}

