"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BasicTableOne from "@/components/admin/orders/BasicTableOne";

/**
 * Orders table needs a ToastContainer — react-toastify does nothing without it.
 */
export default function OrdersPageContent() {
  return (
    <>
      <BasicTableOne />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        style={{ zIndex: 99999999 }}
      />
    </>
  );
}
