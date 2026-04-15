import { getToken } from "@/helper/tokenHelper";
import { getApiBase, apiUrl } from "@/lib/api";

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (ct.includes("application/json") && text) {
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j?.message && typeof j.message === "string") return j.message;
    } catch {
      /* ignore */
    }
  }
  return text?.trim() || fallback;
}

/**
 * Downloads shipping label as PDF. Set `openInNewTab` to preview/open in a new tab instead of forcing download.
 */
export const downloadSellerShippingLabel = async (
  orderId: string,
  orderNumber?: string,
  openInNewTab?: boolean
): Promise<void> => {
  const token = getToken();
  if (!token) {
    alert("You are not authenticated");
    return;
  }

  const safeOrderId = encodeURIComponent(String(orderId));
  const base = getApiBase();
  const url = base
    ? `${base}/api/v1/seller/orders/${safeOrderId}/shipping-label`
    : apiUrl(`/api/v1/seller/orders/${safeOrderId}/shipping-label`);

  const safeRef = String(orderNumber || orderId)
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "order";
  const filename = `shipping-label-${safeRef}.pdf`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf, application/json",
      },
    });

    if (!res.ok) {
      const msg = await parseErrorMessage(res, `HTTP ${res.status}`);
      throw new Error(msg);
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const buf = await res.arrayBuffer();

    if (!contentType.includes("pdf") && buf.byteLength > 0) {
      try {
        const text = new TextDecoder().decode(buf.slice(0, 512));
        if (text.trimStart().startsWith("{")) {
          const j = JSON.parse(text) as { message?: string };
          throw new Error(j?.message || "Server returned JSON instead of a PDF");
        }
      } catch (e) {
        if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
      }
    }

    const blob = new Blob([buf], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);

    if (openInNewTab) {
      const w = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        alert("Popup blocked. Allow popups for this site or try again.");
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
      return;
    }

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60_000);
  } catch (err) {
    console.error("Failed to download shipping label:", err);
    const message = err instanceof Error ? err.message : "Failed to generate shipping label";
    alert(message);
  }
};
