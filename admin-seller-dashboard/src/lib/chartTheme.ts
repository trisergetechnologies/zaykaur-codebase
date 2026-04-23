import type { ApexOptions } from "apexcharts";

const BRAND = "#465fff";
const BRAND_SOFT = "#9cb9ff";

export function getChartBaseOptions(isDark: boolean): ApexOptions {
  const label = isDark ? "#98a2b3" : "#667085";
  const grid = isDark ? "#344054" : "#e4e7ec";
  return {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 500 },
    },
    colors: [BRAND, BRAND_SOFT],
    grid: {
      borderColor: grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 8, right: 8, bottom: 0, left: 4 },
    },
    xaxis: {
      labels: { style: { colors: label, fontSize: "11px", fontWeight: "500" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: label, fontSize: "11px", fontWeight: "500" },
      },
    },
    legend: {
      fontFamily: "Outfit, sans-serif",
      labels: { colors: label },
      markers: { width: 8, height: 8, radius: 2 },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      style: { fontSize: "12px" },
      fillSeriesColor: false,
      marker: { show: true },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
  };
}
