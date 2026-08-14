/** Shared Ledger mark for generated PWA / favicon assets. */
export function PwaIconMark({ letter = "L" }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b301f",
        borderRadius: "22%",
      }}
    >
      <div
        style={{
          width: "62%",
          height: "62%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c8e86a",
          borderRadius: "28%",
          fontSize: "46%",
          fontWeight: 700,
          color: "#0b301f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {letter}
      </div>
    </div>
  );
}
