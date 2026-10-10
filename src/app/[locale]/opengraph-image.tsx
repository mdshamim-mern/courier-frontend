import { ImageResponse } from "next/og";

export const alt = "Dropzo — book, track and deliver your parcel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(125deg, #f5efff, #e8daf9)",
        color: "#30233f",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          color: "#7134ba",
          marginBottom: 35,
        }}
      >
        Dropzo.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        Send a parcel.
        <br />
        Follow every step.
      </div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 30 }}>
        Approved coverage · Transparent costs · Recorded tracking
      </div>
    </div>,
    size,
  );
}
