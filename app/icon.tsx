import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#080a12", // deep midnight blue
          border: "1.5px solid #8b93ff", // bright periwinkle border
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8b93ff", // matching periwinkle letter
          borderRadius: "8px", // squircle shape
          fontWeight: "900", // extra bold S
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    }
  );
}
