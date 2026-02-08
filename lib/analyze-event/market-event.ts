import { PolygonAgg } from "./polygon";

export type EventItem = {
  id: string;
  timestamp: string;
  open: number;
  close: number;
  high: number;
  low: number;
  movePercent: number;
  direction: "up" | "down";
  pattern: string;
  expectedDirection?: "up" | "down";
};

/**
 * How many candles we analyze before deciding pattern
 * Increasing = more stable signals, fewer events
 * Decreasing = more signals, noisier stats
 */
const LOOKBACK = 10;

/* ---------------- Helpers ---------------- */

function highestHigh(arr: PolygonAgg[]) {
  return Math.max(...arr.map(c => c.h));
}

function lowestLow(arr: PolygonAgg[]) {
  return Math.min(...arr.map(c => c.l));
}

function avgRange(arr: PolygonAgg[]) {
  return arr.reduce((s, c) => s + (c.h - c.l), 0) / arr.length;
}

function isStrongCandle(open: number, close: number, range: number) {
  return Math.abs(close - open) > range * 0.6;
}

/* ---------------- Pattern Engine ---------------- */

export function polygonToEvents(aggs: PolygonAgg[]): EventItem[] {
  const events: EventItem[] = [];

  if (aggs.length <= LOOKBACK) return events;

  for (let i = LOOKBACK; i < aggs.length; i++) {
    const c = aggs[i];
    const prev = aggs.slice(i - LOOKBACK, i);

    const open = c.o;
    const close = c.c;
    const high = c.h;
    const low = c.l;

    const range = high - low;
    const movePercent = ((close - open) / open) * 100;
    const direction: "up" | "down" = close >= open ? "up" : "down";

    const prevHigh = highestHigh(prev);
    const prevLow = lowestLow(prev);
    const prevMid = (prevHigh + prevLow) / 2;
    const prevAvgRange = avgRange(prev);

    let pattern = "raw_candle";
    let expectedDirection: "up" | "down" | undefined;

    /* ---------- BREAKOUT ---------- */
    if (close > prevHigh && isStrongCandle(open, close, range)) {
      pattern = "breakout";
      expectedDirection = "up";
    }

    /* ---------- FAKEOUT ---------- */
    else if (high > prevHigh && close < prevHigh) {
      pattern = "fakeout";
      expectedDirection = "up";
    }

    /* ---------- RETEST ---------- */
    else if (low <= prevHigh && close > prevMid && range < prevAvgRange * 1.2) {
      pattern = "retest";
      expectedDirection = "up";
    }

    /* ---------- HEAD & SHOULDERS (reversal proxy) ---------- */
    else if (close < prevLow && isStrongCandle(open, close, range)) {
      pattern = "head_and_shoulders";
      expectedDirection = "down";
    }

    /* ---------- CONTINUATION ---------- */
    else if (
      close > prevMid &&
      Math.abs(movePercent) > 0.2 &&
      range >= prevAvgRange
    ) {
      pattern = "continuation";
      expectedDirection = "up";
    }

    events.push({
      id: `evt-${i}`,
      timestamp: new Date(c.t).toISOString(),
      open,
      close,
      high,
      low,
      movePercent: Number(movePercent.toFixed(4)),
      direction,
      pattern,
      expectedDirection,
    });
  }

  return events;
}
