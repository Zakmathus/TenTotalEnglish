// src/components/ui/Button.tsx
type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
}: Props) {
  const bg =
    variant === "primary" ? "#F59E0B" : "#0B1C3D";

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 8,
        border: "none",
        background: bg,
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  );
}
