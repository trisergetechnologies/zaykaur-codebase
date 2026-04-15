import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersPageContent from "./OrdersPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Orders | Zaykaur Dashboard",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        <ComponentCard title="All Orders">
          <OrdersPageContent />
        </ComponentCard>
      </div>
    </div>
  );
}
