
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/product/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description: "Products | Zaykaur Dashboard",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ComponentCard title="All Products">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
