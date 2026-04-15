import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersPageContent from "@/app/admin/orders/OrdersPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Orders",
  description: "Seller Orders | Zaykaur Dashboard",
};

export default function SellerOrdersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        <ComponentCard title="My Orders">
          <OrdersPageContent />
        </ComponentCard>
      </div>
    </div>
  );
}

