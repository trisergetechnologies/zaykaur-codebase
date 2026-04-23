"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";
import { getChartBaseOptions } from "@/lib/chartTheme";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  categories: string[];
  data: number[];
  height?: number;
  formatX?: (n: number) => string;
};

export function AnalyticsHorizontalBarChart({
  categories,
  data,
  height,
  formatX,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const base = getChartBaseOptions(isDark);
  const labelColor = isDark ? "#98a2b3" : "#667085";
  const computedHeight = height ?? Math.max(200, 48 + categories.length * 36);

  const options: ApexOptions = {
    ...base,
    colors: ["#465fff"],
    chart: {
      ...base.chart,
      type: "bar",
      height: computedHeight,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "72%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    stroke: { width: 0 },
    fill: { opacity: 1, type: "solid" },
    xaxis: {
      categories,
      labels: {
        formatter: formatX
          ? (v: string) => formatX(Number(v))
          : undefined,
        style: { colors: labelColor, fontSize: "11px", fontWeight: "500" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        maxWidth: 160,
        style: { colors: labelColor, fontSize: "11px", fontWeight: "500" },
      },
    },
    grid: {
      ...base.grid,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      ...base.tooltip,
      y: {
        formatter: (val: number) => (formatX ? formatX(val) : String(val)),
      },
    },
    dataLabels: { enabled: false },
  };

  const series = [{ name: "Value", data }];

  return (
    <div className="w-full min-h-[160px]">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={computedHeight}
      />
    </div>
  );
}
