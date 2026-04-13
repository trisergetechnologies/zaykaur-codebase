import ClientLayout from "./ClientLayout";
import { headers } from "next/headers";
import { getStoreFromHost } from "@/lib/store/store.utils";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const host = headers().get("host");
  const store = getStoreFromHost(host);

  return (
    <ClientLayout store={store}>
      {children}
    </ClientLayout>
  );
}