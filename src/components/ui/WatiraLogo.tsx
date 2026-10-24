import React from "react";
import Svg, { Rect } from "react-native-svg";

type Props = {
  size?: number;
  /** badge: مربع نيلي مع الشعار | mark: الشعار وحده للخلفيات الداكنة | markDark: الشعار وحده للخلفيات الفاتحة */
  variant?: "badge" | "mark" | "markDark";
};

const INDIGO = "#4F46E5";
const AMBER = "#FBBF24";

export function WatiraLogo({ size = 48, variant = "badge" }: Props) {
  const main = variant === "markDark" ? INDIGO : "#FFFFFF";
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      accessibilityLabel="شعار وتيرة"
    >
      {variant === "badge" && (
        <Rect width={1024} height={1024} rx={224} fill={INDIGO} />
      )}
      <Rect x={464} y={291} width={310} height={110} rx={55} fill={main} />
      <Rect x={264} y={457} width={420} height={110} rx={55} fill={AMBER} />
      <Rect x={324} y={623} width={270} height={110} rx={55} fill={main} />
    </Svg>
  );
}
