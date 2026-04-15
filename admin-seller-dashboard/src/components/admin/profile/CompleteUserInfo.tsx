// "use client";

// import React, { useState } from "react";
// import axios from "axios";
// import Image from "next/image";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { getToken } from "@/helper/tokenHelper";
// import {
//   Users,
//   Wallet,
//   Gift,
//   Video,
//   CheckCircle,
//   Package as PackageIcon,
// } from "lucide-react";

// // format helpers
// const fmt = (n?: number) =>
//   typeof n === "number"
//     ? `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
//     : "—";
// const dt = (d: string) =>
//   d ? new Date(d).toLocaleString() : "";

// export default function AdminUserCompleteInfo() {
//   const [email, setEmail] = useState("");
//   const [data, setData] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);

//   const fetchInfo = async () => {
//     if (!email.trim()) return toast.warn("⚠️ Please enter an email");
//     setLoading(true);
//     try {
//       const token = getToken();
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getcompleteinfo?email=${encodeURIComponent(email)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (res.data?.success) {
//         setData(res.data.data);
//         toast.success("✅ User info loaded");
//       } else {
//         toast.error(res.data?.message || "Failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("❌ Error fetching user info");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Search */}
//       <div className="flex gap-2">
//         <input
//           type="email"
//           placeholder="Enter email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="flex-1 border px-3 py-2 rounded-lg"
//         />
//         <button
//           onClick={fetchInfo}
//           disabled={loading}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
//         >
//           {loading ? "Loading..." : "Search"}
//         </button>
//       </div>

//       {data && (
//         <div className="space-y-8">
//           {/* User Card */}
//           <div className="border rounded-xl p-6 bg-white dark:bg-gray-900">
//             <h2 className="text-2xl font-bold mb-2">{data.user.name}</h2>
//             <p>{data.user.email}</p>
//             <p>Phone: {data.user.phone}</p>
//             <p>Role: {data.user.role}</p>
//             <p>Serial Number: {data.user.serialNumber}</p>
//             <p>Referral Code: {data.user.referralCode}</p>
//             <div className="mt-2">
//               Package:{" "}
//               <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800">
//                 {data.user.package?.name} ({fmt(data.user.package?.price)})
//               </span>
//             </div>
//           </div>

//           {/* Wallets */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {Object.entries(data.wallets).map(([k, v]) => (
//               <div
//                 key={k}
//                 className="p-4 border rounded-lg bg-white dark:bg-gray-900"
//               >
//                 <h4 className="font-semibold">{k}</h4>
//                 <p className="text-xl">{Array.isArray(v) ? v.length : fmt(v)}</p>
//               </div>
//             ))}
//           </div>

//           {/* Achievements */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
//             <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-500" /> Achievements
//             </h3>
//             {data.achievements.length ? (
//               <ul className="space-y-2">
//                 {data.achievements.map((a: any) => (
//                   <li key={a._id} className="border p-2 rounded">
//                     {a.title} – Level {a.level} ({dt(a.achievedAt)})
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No achievements</p>
//             )}
//           </div>

//           {/* Orders Table */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
//             <h3 className="text-lg font-semibold mb-3">Orders</h3>
//             <table className="w-full text-sm border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2">ID</th>
//                   <th>Items</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.recentOrders.map((o: any) => (
//                   <tr key={o._id} className="border-t">
//                     <td className="p-2">{o._id.slice(-6)}</td>
//                     <td>
//                       {o.items.map((i: any) => (
//                         <div key={i.productId}>
//                           {i.productTitle} x{i.quantity}
//                         </div>
//                       ))}
//                     </td>
//                     <td>{fmt(o.finalAmountPaid)}</td>
//                     <td>{o.status}</td>
//                     <td>{dt(o.createdAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Wallet Transactions Table */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
//             <h3 className="text-lg font-semibold mb-3">Wallet Transactions</h3>
//             <table className="w-full text-sm border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2">Type</th>
//                   <th>From</th>
//                   <th>To</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Notes</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.recentWalletTransactions.map((t: any) => (
//                   <tr key={t._id} className="border-t">
//                     <td className="p-2">{t.type}</td>
//                     <td>{t.fromWallet}</td>
//                     <td>{t.toWallet || "-"}</td>
//                     <td>{fmt(t.amount)}</td>
//                     <td>{t.status}</td>
//                     <td>{t.notes}</td>
//                     <td>{dt(t.createdAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Earning Logs Table */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
//             <h3 className="text-lg font-semibold mb-3">Earning Logs</h3>
//             <table className="w-full text-sm border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2">Source</th>
//                   <th>From User</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.recentEarningLogs.map((e: any) => (
//                   <tr key={e._id} className="border-t">
//                     <td className="p-2">{e.source}</td>
//                     <td>{e.fromUser}</td>
//                     <td>{fmt(e.amount)}</td>
//                     <td>{e.status}</td>
//                     <td>{dt(e.createdAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Coupons */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
//             <h3 className="text-lg font-semibold mb-3">Coupons</h3>
//             <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
//               {data.recentCoupons.map((c: any) => (
//                 <div
//                   key={c._id}
//                   className="p-3 border rounded bg-pink-50 flex justify-between"
//                 >
//                   <div>
//                     <p className="font-bold">{c.title}</p>
//                     <p>{c.code}</p>
//                   </div>
//                   <span>{fmt(c.value)}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Videos */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
//             <h3 className="text-lg font-semibold mb-3">Videos</h3>
//             <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
//               {data.recentVideos.map((v: any) => (
//                 <div key={v._id} className="border rounded overflow-hidden">
//                   <div className="h-32 bg-gray-100 flex items-center justify-center">
//                     {v.thumbnailUrl ? (
//                       <Image
//                         src={v.thumbnailUrl}
//                         alt={v.title}
//                         width={200}
//                         height={128}
//                         className="object-cover"
//                       />
//                     ) : (
//                       <Video className="w-8 h-8 text-gray-400" />
//                     )}
//                   </div>
//                   <div className="p-2 text-sm">
//                     <p className="font-semibold">{v.title}</p>
//                     <p>{(v.durationInSec / 60).toFixed(1)} min</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Referrals */}
//           <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
//             <h3 className="text-lg font-semibold mb-3">Immediate Referrals</h3>
//             <table className="w-full text-sm border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2">Name</th>
//                   <th>Email</th>
//                   <th>Phone</th>
//                   <th>Serial</th>
//                   <th>Package</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.immediateReferrals.map((r: any) => (
//                   <tr key={r._id} className="border-t">
//                     <td className="p-2">{r.name}</td>
//                     <td>{r.email}</td>
//                     <td>{r.phone || "-"}</td>
//                     <td>{r.serialNumber}</td>
//                     <td>
//                       {typeof r.package === "object"
//                         ? r.package.name
//                         : r.package}
//                     </td>
//                     <td>{dt(r.createdAt)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={2500} theme="colored" />
//     </div>
//   );
// }



"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";
import {
  Users,
  Wallet,
  Gift,
  Video,
  CheckCircle,
  Package as PackageIcon,
} from "lucide-react";

// format helpers
const fmt = (n?: number) =>
  typeof n === "number"
    ? `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "—";
const dt = (d: string) =>
  d ? new Date(d).toLocaleString() : "";

export default function AdminUserCompleteInfo() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInfo = async () => {
    if (!email.trim()) return toast.warn("⚠️ Please enter an email");
    setLoading(true);
    try {
      const token = getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getcompleteinfo?email=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setData(res.data.data);
        toast.success("✅ User info loaded");
      } else {
        toast.error(res.data?.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error fetching user info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg"
        />
        <button
          onClick={fetchInfo}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {data && (
        <div className="space-y-8">
          {/* User Card */}
          <div className="border rounded-xl p-6 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold mb-2">{data.user.name}</h2>
            <p>{data.user.email}</p>
            <p>Phone: {data.user.phone}</p>
            <p>Role: {data.user.role}</p>
            <p>Serial Number: {data.user.serialNumber}</p>
            <p>Referral Code: {data.user.referralCode}</p>
            <div className="mt-2">
              Package:{" "}
              <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                {data.user.package?.name} ({fmt(data.user.package?.price)})
              </span>
            </div>
          </div>

          {/* Wallets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(data.wallets).map(([k, v]) => (
              <div
                key={k}
                className="p-4 border rounded-lg bg-white dark:bg-gray-900"
              >
                <h4 className="font-semibold">{k}</h4>
                <p className="text-xl">{Array.isArray(v) ? v.length : fmt(v)}</p>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Achievements
            </h3>
            {data.achievements.length ? (
              <ul className="space-y-2">
                {data.achievements.map((a: any) => (
                  <li key={a._id} className="border p-2 rounded">
                    {a.title} – Level {a.level} ({dt(a.achievedAt)})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No achievements</p>
            )}
          </div>

          {/* Orders Table */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Orders</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">ID</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o: any) => (
                  <tr key={o._id} className="border-t">
                    <td className="p-2">{o._id.slice(-6)}</td>
                    <td>
                      {o.items.map((i: any) => (
                        <div key={i.productId}>
                          {i.productTitle} x{i.quantity}
                        </div>
                      ))}
                    </td>
                    <td>{fmt(o.finalAmountPaid)}</td>
                    <td>{o.status}</td>
                    <td>{dt(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Wallet Transactions Table */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Wallet Transactions</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentWalletTransactions.map((t: any) => (
                  <tr key={t._id} className="border-t">
                    <td className="p-2">{t.type}</td>
                    <td>{t.fromWallet}</td>
                    <td>{t.toWallet || "-"}</td>
                    <td>{fmt(t.amount)}</td>
                    <td>{t.status}</td>
                    <td>{t.notes}</td>
                    <td>{dt(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Earning Logs Table */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Earning Logs</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Source</th>
                  <th>From User</th>
                  <th>Sr. No.</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEarningLogs.map((e: any) => (
                  <tr key={e._id} className="border-t">
                    <td className="p-2">{e.source}</td>
                    <td>{e.fromUser.email}</td>
                    <td>{e.fromUser.serialNumber}</td>
                    <td>{fmt(e.amount)}</td>
                    <td>{e.status}</td>
                    <td>{dt(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Coupons */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-3">Coupons</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.recentCoupons.map((c: any) => (
                <div
                  key={c._id}
                  className="p-3 border rounded bg-pink-50 flex justify-between"
                >
                  <div>
                    <p className="font-bold">{c.title}</p>
                    <p>{c.code}</p>
                  </div>
                  <span>{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-3">Videos</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.recentVideos.map((v: any) => (
                <div key={v._id} className="border rounded overflow-hidden">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    {v.thumbnailUrl ? (
                      <Image
                        src={v.thumbnailUrl}
                        alt={v.title}
                        width={200}
                        height={128}
                        className="object-cover"
                      />
                    ) : (
                      <Video className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="p-2 text-sm">
                    <p className="font-semibold">{v.title}</p>
                    <p>{(v.durationInSec / 60).toFixed(1)} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referrals */}
          <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Immediate Referrals</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Serial</th>
                  <th>Package</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.immediateReferrals.map((r: any) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-2">{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || "-"}</td>
                    <td>{r.serialNumber}</td>
                    <td>
                      {typeof r.package === "object"
                        ? r.package.name
                        : r.package}
                    </td>
                    <td>{dt(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
