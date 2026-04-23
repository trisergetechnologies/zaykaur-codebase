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

export function AnalyticsAreaChart({
  categories,
  series,
  height = 300,
  formatY,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const base = getChartBaseOptions(isDark);
  const labelColor = isDark ? "#98a2b3" : "#667085";

  const options: ApexOptions = {
    ...base,
    colors: ["#465fff"],
    chart: {
      ...base.chart,
      type: "area",
      height,
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.42,
        opacityTo: 0.02,
        stops: [0, 92, 100],
      },
    },
    markers: {
      size: 0,
      hover: { size: 5 },
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
    <div className="w-full min-h-[200px]">
      <ReactApexChart options={options} series={series} type="area" height={height} />
    </div>
  );
}
