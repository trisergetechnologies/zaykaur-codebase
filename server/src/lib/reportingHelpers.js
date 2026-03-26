const REPORT_PERIODS = new Set(["weekly", "monthly"]);

export const normalizeReportPeriod = (period) => {
  if (!period || typeof period !== "string") return "monthly";
  const normalized = period.toLowerCase().trim();
  return REPORT_PERIODS.has(normalized) ? normalized : "monthly";
};

export const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getIsoWeekParts = (date) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return { year: utcDate.getUTCFullYear(), week: weekNo };
};

export const buildPeriodKey = (dateValue, period) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "unknown";

  if (period === "weekly") {
    const { year, week } = getIsoWeekParts(date);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const getOrderReturnedFlag = (orderStatus, shipments = [], sellerId) => {
  if (orderStatus === "returned") return true;
  if (!Array.isArray(shipments) || !sellerId) return false;
  return shipments.some((shipment) => {
    if (!shipment?.sellerId) return false;
    return String(shipment.sellerId) === String(sellerId) && shipment.status === "returned";
  });
};

export const buildTaxBreakdown = (taxLines = [], taxRuleByCode = new Map()) => {
  const grouped = {};

  for (const line of taxLines) {
    const code = line?.taxCode || "unknown";
    const amount = Number(line?.taxAmount || 0);
    const rate = Number(line?.taxRate || 0);
    const taxRule = taxRuleByCode.get(code);
    const type = taxRule?.type || line?.taxType || "unknown";
    const key = `${type}:${code}`;

    if (!grouped[key]) {
      grouped[key] = {
        type,
        code,
        rate,
        amount: 0,
      };
    }

    grouped[key].amount += amount;
    if (!grouped[key].rate && rate) grouped[key].rate = rate;
  }

  return Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));
};
