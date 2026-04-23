"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";
import { getChartBaseOptions } from "@/lib/chartTheme";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Series = { name: string; data: number[] };

type Props = {
  categories: string[];
  series: Series[];
  height?: number;
  formatY?: (n: number) => string;
};

export function AnalyticsLineChart({
  categories,
  series,
  height = 240,
  formatY,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const base = getChartBaseOptions(isDark);
  const labelColor = isDark ? "#98a2b3" : "#667085";

  const options: ApexOptions = {
    ...base,
    colors: ["#7a5af8"],
    chart: {
      ...base.chart,
      type: "line",
      height,
    },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "solid", opacity: 0 },
    markers: {
      size: 0,
      hover: { size: 6 },
      strokeWidth: 2,
      strokeColors: "#fff",
    },
    xaxis: {
      ...base.xaxis,
      categories,
    },
    yaxis: {
      labels: {
        ...(formatY
          ? {
              formatter: (v: string | number) =>
                formatY(typeof v === "number" ? v : Number(v)),
            }
          : {}),
        style: { colors: labelColor, fontSize: "11px", fontWeight: "500" },
      },
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
      ...base.tooltip,
      y: formatY
        ? {
            formatter: (val: number) => formatY(val),
          }
        : undefined,
    },
    legend: { show: series.length > 1 },
  };

  return (
    <div className="w-full min-h-[180px]">
      <ReactApexChart options={options} series={series} type="line" height={height} />
    </div>
  );
}
