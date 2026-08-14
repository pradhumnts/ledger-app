export const SIDE_TILT = 6;

export function clampIndex(value, count) {
  return Math.max(0, Math.min(count - 1, value));
}

export function linearOffset(i, index) {
  return i - index;
}

export function carouselEdgeOffset(stageWidth, cardWidth, sidePeek) {
  const neighborScale = 0.9;
  const gap = 28;
  const spread = cardWidth * (0.5 + neighborScale / 2) + gap;
  const keepVisible =
    stageWidth / 2 + (cardWidth * neighborScale) / 2 - sidePeek;
  return Math.min(spread, keepVisible);
}

export function carouselCardStyle({
  offset,
  dragging,
  dragX,
  cardWidth,
  edgeOffset,
  sideTilt = SIDE_TILT,
}) {
  const progress = dragging ? dragX / (cardWidth * 0.9) : 0;
  const x = offset + progress;
  const distance = Math.abs(x);
  const t = Math.min(distance, 1);
  const sign = x === 0 ? 0 : x > 0 ? 1 : -1;

  const beyond = Math.max(0, distance - 1) * cardWidth;
  const translateX = sign * (edgeOffset * t + beyond);
  const rotate = sign * sideTilt * t;
  const translateY = t * t * 10;
  const scale = 1 - 0.1 * t;

  return {
    transform: `translateX(-50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
    zIndex: Math.round(50 - distance * 10),
    pointerEvents: distance > 1.2 ? "none" : "auto",
  };
}
