'use client'

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import DetailsModal from "./DetailsModal";
import TeamTreeModal from "./TeamTreeModal";
import NetworkModal from "./NetworkModal";
import Pagination from "./Pagination";
import { getToken } from "@/helper/tokenHelper";

// ------------------ Interfaces ------------------
interface Address {
  addressName: string;
  slugName: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

interface ECartProfile {
  orders: string[];
  addresses: Address[];
  bankDetails?: BankDetails;
}

interface ShortVideoProfile {
  watchTime: number;
  videoUploads: string[];
}

interface Wallets {
  shortVideoWallet: number;
  eCartWallet: number;
  rewardWallet: string[];
}

interface Package {
  _id: string;
  name: string;
  price: number;
  membersUpto: number;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender: string;
  role: string;
  applications: string[];
  state_address: string;
  referralCode: string;
  referredBy?: string;
  serialNumber?: number;
  package?: Package;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;

  shortVideoProfile: ShortVideoProfile;
  eCartProfile: ECartProfile;
  wallets: Wallets;
}

// ------------------ Component ------------------
export default function BasicTableOne() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [openTeam, setOpenTeam] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);

   // Network modal
  const [openNetwork, setOpenNetwork] = useState(false);
  const [networkData, setNetworkData] = useState<any>(null);

  // filters + sorting (backend-driven)
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const token = getToken();
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/user/getusers`;

  const fetchUsers = useCallback(async (pageNum: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, limit, sortField, sortOrder };
      if (search.trim()) params.search = search.trim();
      const res = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }, [token, search, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const handleSearchApply = () => {
    setPage(1);
    fetchUsers(1);
  };
  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleOpen = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    console.log("Deleted");
  };

    // ✅ fetch team for user
  const handleShowTeam = async (user: User) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getteam/?userId=${user._id}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.data)
      setTeamData(res.data.data);
      setOpenTeam(true);
    } catch (err) {
      console.error("Error fetching team", err);
    }
  };

    const handleShowNetwork = async (user: User) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getnetwork/?userId=${user._id}`;
      
      const res = await axios.get(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNetworkData(res.data.data);
      setOpenNetwork(true);
    } catch (err) {
      console.error("Error fetching network", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
      
      {/* Filters + Sorting (backend-driven) */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, referral..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
          className="border px-3 py-2 rounded-md w-full md:w-1/3 dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          onClick={handleSearchApply}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Search
        </button>
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => handleSortChange(e.target.value, sortOrder)}
            className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="referralCode">Referral Code</option>
            <option value="serialNumber">Serial Number</option>
          </select>
          <button
            onClick={() => handleSortChange(sortField, sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader>User</TableCell>
                <TableCell isHeader>Application</TableCell>
                <TableCell isHeader>Team</TableCell>
                <TableCell isHeader>Network</TableCell>
                <TableCell isHeader>Referral Code</TableCell>
                <TableCell isHeader>Serial Number(Package)</TableCell>
                <TableCell isHeader>Package</TableCell>
                <TableCell isHeader>F&E Wallet</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>More</TableCell>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  {/* User */}
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={user.image || "https://avatar.iran.liara.run/public"}
                          alt={user.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90">
                          {user.name}
                        </span>
                        <span className="block text-gray-500 text-sm">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Applications */}
                  <TableCell className="px-5 py-4">
                    {user.applications.map((app) => (
                      <span
                        key={app}
                        className="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                      >
                        {app == 'eCart' ? 'Dream Mart' : app == 'shortVideo' && 'Fun & Enjoy'}
                      </span>
                    ))}
                  </TableCell>

                  {/* Team Button */}
                  <TableCell className="px-5 py-4">
                    <button onClick={()=> handleShowTeam(user)} className="px-2 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Show Team
                    </button>
                  </TableCell>

                  {/* Network Button */}
                  <TableCell className="px-5 py-4">
                    <button disabled={user.serialNumber ? false : true} onClick={()=> handleShowNetwork(user)} className={`px-2 py-2 ${user.serialNumber ? 'bg-green-600': 'bg-green-400'} text-white text-sm rounded-lg hover:bg-green-700`}>
                      Show Network
                    </button>
                  </TableCell>

                  {/* Referral */}
                  <TableCell className="px-5 py-4">{user.referralCode}</TableCell>

                  {/* Serial */}
                  <TableCell className="px-5 py-4">{user.serialNumber || "-"}</TableCell>

                  {/* Package */}
                  <TableCell className="px-5 py-4">
                    <div
                      className="p-1 rounded-sm text-center"
                      style={{
                        background: user.package?.color || "#e5e7eb",
                        color: user.package?.color ? "#fff" : "#374151"
                      }}
                    >
                      <h2 className="text-sm font-bold">
                        {user.package?.name || "None"}
                      </h2>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4">₹{user.wallets.shortVideoWallet?.toFixed(2) || 0}</TableCell>

                  {/* Status */}
                  <TableCell className="px-5 py-4">
                    <Badge size="sm" color={user.isActive ? "success" : "error"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* More Button */}
                  <TableCell>
                    <button
                      className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg"
                      onClick={() => handleOpen(user)}
                    >
                      <svg
                        className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Details Modal */}
      {selectedUser && (
        <DetailsModal
          onDelete={handleDelete}
          open={open}
          onClose={handleClose}
          refreshUser={() => fetchUsers(page)}
          user={selectedUser}
        />
      )}
      {/* ✅ Team Modal */}
      {teamData && (
        <TeamTreeModal
          open={openTeam}
          onClose={() => setOpenTeam(false)}
          data={teamData}
        />
      )}
      {networkData && (
        <NetworkModal
          open={openNetwork}
          onClose={() => setOpenNetwork(false)}
          data={networkData}
        />
      )}
    </div>
  );
}
