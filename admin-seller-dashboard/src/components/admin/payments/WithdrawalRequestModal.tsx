"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import {
    User,
    Mail,
    Phone,
    Wallet,
    IndianRupee,
    X,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Banknote,
} from "lucide-react";
import { getToken } from "@/helper/tokenHelper";
import Badge from "@/components/ui/badge/Badge";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: any; // request object from list
    onActionComplete: () => void; // callback to refresh parent table
}

export default function WithdrawalRequestModal({
    isOpen,
    onClose,
    request,
    onActionComplete,
}: Props) {
    const [remarks, setRemarks] = useState("");
    const [confirming, setConfirming] = useState<"approve" | "reject" | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !request) return null;

    const token = getToken();

    const handleAction = async (action: "approve" | "reject") => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/wallet/handlewithdrawalrequest`,
                { requestId: request.requestId, action, remarks },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(`✅ ${res.data.message}`);
                onActionComplete();
                onClose();
            } else {
                toast.error(res.data.message || "Action failed");
            }
        } catch (err) {
            console.error("Action Error:", err);
            toast.error("❌ Something went wrong while processing request");
        } finally {
            setLoading(false);
            setConfirming(null);
        }
    };

    const statusColor = {
        pending: "warning",
        approved: "success",
        rejected: "error",
    } as const;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal Box */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5" /> Withdrawal Request
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8 overflow-y-auto text-sm">
                    {/* 🧍 User Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" /> User Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                            <p><span className="font-semibold">Name:</span> {request.user.name}</p>
                            <p><Mail className="inline w-4 h-4 mr-1" /> {request.user.email}</p>
                            <p><Phone className="inline w-4 h-4 mr-1" /> {request.user.phone}</p>
                            {/* <p><span className="font-semibold">Referral Code:</span> {request.user.referralCode}</p> */}
                            <p><span className="font-semibold">User ID:</span> {request.user.id}</p>
                            <p>
                                <span className="font-semibold">Status:</span>{" "}
                                <Badge size="sm" color={statusColor[request.status]}>
                                    {request.status}
                                </Badge>
                            </p>
                        </div>
                    </section>

                    {/* 💳 Wallet Balances */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-500" /> Wallet Balances
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                                <p className="text-xs opacity-80">E-Cart Wallet</p>
                                <p className="text-2xl font-bold mt-1">
                                    ₹{request.walletBalances.eCartWallet.toFixed(2)}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white shadow-lg">
                                <p className="text-xs opacity-80">ShortVideo Wallet</p>
                                <p className="text-2xl font-bold mt-1">
                                    ₹{request.walletBalances.shortVideoWallet.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 🏦 Bank Details */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-emerald-500" /> Bank Details
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p>
                                <strong>Account Holder:</strong>{" "}
                                {request.bankDetails.accountHolderName || "—"}
                            </p>
                            <p>
                                <strong>Account Number:</strong>{" "}
                                {request.bankDetails.accountNumber
                                    ? `${String(request.bankDetails.accountNumber)}`
                                    : "—"}
                            </p>
                            <p>
                                <strong>IFSC Code:</strong>{" "}
                                {request.bankDetails.ifscCode || "—"}
                            </p>
                            <p>
                                <strong>Bank Name:</strong>{" "}
                                {request.bankDetails.bankName || "—"}
                            </p>
                            <p>
                                <strong>UPI ID:</strong>{" "}
                                {request.bankDetails.upiId || "—"}
                            </p>
                            <p>
                                <strong>Branch:</strong>{" "}
                                {request.bankDetails.branchName || "—"}
                            </p>
                        </div>
                    </section>


                    {/* 💰 Withdrawal Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-yellow-500" /> Withdrawal Details
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl grid grid-cols-2 md:grid-cols-3 gap-4">
                            <p><strong>Requested:</strong> ₹{request.amountRequested.toFixed(2)}</p>
                            <p><strong>TDS:</strong> ₹{request.tdsAmount.toFixed(2)}</p>
                            {/* <p><strong>Payout:</strong> ₹{request.payoutAmount.toFixed(2)}</p> */}
                            <p className="text-green-700 font-extrabold text-xl bg-green-50 border border-green-200 px-4 py-2 rounded flex items-center shadow-sm">
                                <span className="mr-2"></span>
                                Payout: ₹{request.payoutAmount.toFixed(2)}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <Badge size="sm" color={statusColor[request.status]}>
                                    {request.status}
                                </Badge>
                            </p>
                            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                            {request.processedAt && (
                                <p><strong>Processed:</strong> {new Date(request.processedAt).toLocaleString()}</p>
                            )}
                        </div>
                    </section>

                    {/* 📝 Remarks */}
                    {request.status === "pending" && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Admin Remarks {"(Unique ID of payment)"}
                            </h3>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                rows={3}
                                placeholder="Add admin remarks..."
                            />
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold"
                    >
                        Close
                    </button>

                    {request.status === "pending" && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirming("reject")}
                                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => setConfirming("approve")}
                                className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
                            >
                                Approve
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ⚠️ Confirmation Modal */}
            {confirming && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setConfirming(null)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            {confirming === "approve"
                                ? "✅ Approve Withdrawal"
                                : "❌ Reject Withdrawal"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            {confirming === "approve"
                                ? "You are about to approve this withdrawal. Funds will be deducted and payout marked as successful."
                                : "You are about to reject this withdrawal. Transaction will be marked as failed."}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirming(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleAction(confirming)}
                                className={`px-5 py-2 rounded-md text-white font-semibold ${confirming === "approve"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    } ${loading ? "opacity-70" : ""}`}
                            >
                                {loading ? "Processing..." : confirming === "approve" ? "Confirm Approve" : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}