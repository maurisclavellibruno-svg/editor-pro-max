import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photoBuffer = await readFile(join(process.cwd(), "public/assets/mauris.jpg"));
  const photoDataUrl = `data:image/jpeg;base64,${photoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0E0D0B",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 70% 30%, rgba(198,161,91,0.22), transparent 60%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", flex: 1 }}>
          <span style={{ color: "#C6A15B", fontSize: 28, letterSpacing: 2, display: "flex" }}>MAURISBARBER</span>
          <span style={{ color: "#EFE9DD", fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 24, display: "flex", maxWidth: 620 }}>
            No elijas un corte al azar.
          </span>
          <span style={{ color: "#9A9385", fontSize: 30, marginTop: 24, display: "flex", maxWidth: 580 }}>
            Asesoría de imagen y cortes en Montevideo
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingRight: 70 }}>
          <img
            src={photoDataUrl}
            alt=""
            width={420}
            height={420}
            style={{ borderRadius: 32, objectFit: "cover", border: "4px solid #C6A15B" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
