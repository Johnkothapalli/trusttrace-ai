import { describe, expect, it } from "vitest";
import { demoTraces, demoTrend } from "@/lib/demo-data";
import { buildTrendPath, filterTraces, formatCompactCurrency, formatLatency } from "@/lib/format";

describe("dashboard data transforms", () => {
  it("builds a finite SVG trend path for every point", () => {
    const path = buildTrendPath(demoTrend, "blocked");
    expect(path).toMatch(/^M/);
    expect(path.split(" ")).toHaveLength(demoTrend.length);
    expect(path).not.toContain("NaN");
  });

  it("filters traces by free text and risk", () => {
    expect(filterTraces(demoTraces, "invoice", "high").map((trace) => trace.id)).toEqual(["tr_13be4c"]);
    expect(filterTraces(demoTraces, "OpenAI", "low")).toHaveLength(3);
    expect(filterTraces(demoTraces, "not-present", "all")).toEqual([]);
  });

  it("formats operator-facing units consistently", () => {
    expect(formatLatency(1840)).toBe("1.84s");
    expect(formatLatency(842)).toBe("842ms");
    expect(formatCompactCurrency(0.0084)).toBe("$0.0084");
  });
});
