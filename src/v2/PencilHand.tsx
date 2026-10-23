// Bàn tay cầm bút chì; đầu ngòi nằm ở gốc toạ độ (0, 0) của nhóm SVG.
export const PencilHand = ({
  x,
  y,
  opacity,
}: {
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}) => (
  <svg
    width={520}
    height={520}
    viewBox="-20 -500 520 520"
    style={{
      position: "absolute",
      left: x - 20,
      top: y - 500,
      opacity,
      overflow: "visible",
      pointerEvents: "none",
      filter: "drop-shadow(6px 10px 10px rgba(0,0,0,0.18))",
    }}
  >
    <g transform="rotate(-58)">
      {/* Bút chì: ngòi chì, phần gỗ, thân vàng, khâu kim loại, tẩy */}
      <polygon points="0,0 30,-11 30,11" fill="#e8c9a0" />
      <polygon points="0,0 10,-3.7 10,3.7" fill="#2b2b2b" />
      <rect x={30} y={-11} width={190} height={22} fill="#f2b53a" />
      <rect x={30} y={-11} width={190} height={7} fill="#f7c65a" />
      <rect x={220} y={-12} width={22} height={24} fill="#b9bcc2" />
      <rect x={242} y={-12} width={26} height={24} rx={5} fill="#e98a8a" />
      {/* Bàn tay: các ngón ôm thân bút và nắm tay */}
      <rect
        x={70}
        y={-30}
        width={34}
        height={24}
        rx={12}
        fill="#f1c4a1"
        stroke="#c9946f"
        strokeWidth={2}
      />
      <rect
        x={96}
        y={-36}
        width={36}
        height={26}
        rx={13}
        fill="#f1c4a1"
        stroke="#c9946f"
        strokeWidth={2}
      />
      <ellipse
        cx={150}
        cy={6}
        rx={62}
        ry={44}
        fill="#f1c4a1"
        stroke="#c9946f"
        strokeWidth={2}
      />
      <rect
        x={78}
        y={6}
        width={50}
        height={22}
        rx={11}
        fill="#f1c4a1"
        stroke="#c9946f"
        strokeWidth={2}
      />
      {/* Cổ tay áo và ống tay */}
      <rect
        x={196}
        y={-44}
        width={34}
        height={96}
        rx={8}
        fill="#ffffff"
        stroke="#d9d4cc"
        strokeWidth={2}
      />
      <rect x={226} y={-50} width={320} height={108} rx={14} fill="#3f5fd6" />
    </g>
  </svg>
);
