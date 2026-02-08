/**
 * Polygon aggregate candle (OHLCV)
 * https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksTicker__range__multiplier___timespan___from___to
 */
export type PolygonAgg = {
  t: number; // timestamp (ms)
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
};

/**
 * Fetch historical candles from Polygon
 * Works on free tier (limited recent intraday history)
 */
export async function getPolygonCandles(
  symbol: string,
  multiplier: number = 5,
  timespan: "minute" | "hour" | "day" = "minute"
): Promise<PolygonAgg[]> {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    throw new Error(
      "POLYGON_API_KEY missing. Add it to .env.local and restart the dev server."
    );
  }

  // Use recent trading days (free tier safe window)
  const to = new Date();
  const from = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const url =
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromStr}/${toStr}` +
    `?adjusted=true&sort=asc&limit=5000&apiKey=${apiKey}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polygon request failed (${res.status}): ${text}`);
  }

  const json = await res.json();

  if (!json || !json.results) {
    return [];
  }

  // Normalize to our type
  return json.results.map((r: any) => ({
    t: r.t,
    o: r.o,
    h: r.h,
    l: r.l,
    c: r.c,
    v: r.v,
  })) as PolygonAgg[];
}
