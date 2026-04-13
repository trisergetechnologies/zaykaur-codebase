"use client";

import { useState, useEffect } from "react";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import AddressSheet from "@/components/checkout/AddressSheet";
import { Button } from "@/components/ui/button";
import useCartStore from "@/store/cartStore";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { apiPost } from "@/lib/api";

type Step = "address" | "payment" | "review";

const CheckoutPage = () => {

const router = useRouter();

const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/sign-in?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [isAuthenticated, router]);

  const {
  cartItems,
  clearCart,
  getTotalPrice,
  getTax,
  getShippingFee,
  getTotalAmount
} = useCartStore();


  const [step, setStep] = useState<Step>("address");
  const [openAddress, setOpenAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");



  const subtotal = getTotalPrice();
  const tax = getTax();
  const shipping = getShippingFee();
  const total = getTotalAmount();

const placeOrder = async () => {
  if (!isAuthenticated) {
    toast.error("Please sign in to place an order.");
    router.replace(`/sign-in?redirect=${encodeURIComponent("/checkout")}`);
    return;
  }

  const toastId = toast.loading("Placing your order...");

  try {
    const shippingAddress = {
      fullName: selectedAddress?.name || "",
      phone: selectedAddress?.phone || "",
      street: selectedAddress?.address || "",
      city: selectedAddress?.city || "",
      state: "",
      postalCode: selectedAddress?.pincode || "",
      country: "India",
    };

    const res = await apiPost<any>("/api/v1/customer/order", {
      paymentMethod,
      shippingAddress,
    });

    if (res.success && res.data) {
      clearCart();
      toast.success("Order placed successfully", { id: toastId });
      const orderId = res.data.orderNumber || res.data._id || res.data.id;
      setTimeout(() => {
        router.push(`/order-success?orderId=${orderId}`);
      }, 800);
      return;
    }
    toast.error(res.message || "Failed to place order", { id: toastId });
  } catch {
    toast.error("Failed to place order", { id: toastId });
  }
};

  if (!isAuthenticated) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50/60 pt-14 pb-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50/60 pt-10 pb-12">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <CheckoutSteps currentStep={step} />
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {step === "address" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-1 text-lg font-semibold text-slate-900">Delivery Address</h2>
                <p className="mb-4 text-sm text-slate-500">Choose where your order should be delivered.</p>

                {selectedAddress ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{selectedAddress.name}</p>
                    <p className="text-sm text-slate-600">
                      {selectedAddress.address}, {selectedAddress.city} - {selectedAddress.pincode}
                    </p>

                    <Button
                      variant="outline"
                      className="mt-3 rounded-lg border-slate-300"
                      onClick={() => setOpenAddress(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setOpenAddress(true)}
                    className="rounded-lg bg-pink-600 hover:bg-pink-700"
                  >
                    Select Address
                  </Button>
                )}
              </div>
            )}

            {step === "payment" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-1 text-lg font-semibold text-slate-900">Payment Method</h2>
                <p className="mb-4 text-sm text-slate-500">Select your preferred payment option.</p>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-pink-300">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-pink-600"
                    />
                    <span className="text-sm font-medium text-slate-800">Cash on Delivery</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-pink-300">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="accent-pink-600"
                    />
                    <span className="text-sm font-medium text-slate-800">UPI / Card / Net Banking</span>
                  </label>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Review Order</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{selectedAddress?.name}</p>
                  <p className="text-sm text-slate-600">
                    {selectedAddress?.address}
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-900">Items</p>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <span>
                        ₹{formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <p>
                    Payment Method:{" "}
                    <span className="font-medium text-slate-900">
                      {paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:col-span-4 lg:h-fit">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Order Summary</h2>
              <p className="mt-1 text-xs text-slate-500">Final amount shown includes taxes and shipping</p>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">₹{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-slate-900">
                  {shipping === 0 ? "Free" : `₹${formatPrice(shipping)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium text-slate-900">₹{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{formatPrice(total)}</span>
            </div>

            {step === "address" && (
              <Button
                disabled={!selectedAddress}
                onClick={() => setStep("payment")}
                className="h-11 w-full rounded-lg bg-pink-600 text-sm font-semibold uppercase tracking-wide hover:bg-pink-700"
              >
                Continue to Payment
              </Button>
            )}

            {step === "payment" && (
              <Button
                onClick={() => setStep("review")}
                className="h-11 w-full rounded-lg bg-pink-600 text-sm font-semibold uppercase tracking-wide hover:bg-pink-700"
              >
                Review Order
              </Button>
            )}

            {step === "review" && (
              <Button
                onClick={placeOrder}
                className="h-11 w-full rounded-lg bg-emerald-600 text-sm font-semibold uppercase tracking-wide hover:bg-emerald-700"
              >
                Place Order
              </Button>
            )}
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              Secure checkout with encrypted payment and buyer protection.
            </div>
          </aside>
        </div>
      </div>
      <AddressSheet
        open={openAddress}
        setOpen={setOpenAddress}
        onSelect={setSelectedAddress}
      />
    </section>
  );
};

export default CheckoutPage;