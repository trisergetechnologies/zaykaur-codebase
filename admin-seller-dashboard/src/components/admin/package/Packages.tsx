"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";
import { Gem, Package, Star, Users, Crown, Zap, CheckCircle, XCircle, Sparkles, TrendingUp, Shield, Network } from "lucide-react";

interface Package {
  _id: string;
  name: string;
  price: number;
  membersUpto: number;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  userCount: number;
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getpackageswithusercount`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setPackages(res.data.data);
        } else {
          toast.error(res.data.message || "❌ Failed to fetch packages");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        toast.error("❌ Error fetching packages");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Enhanced icon mapping
  const getPackageIcon = (icon: string, index: number) => {
    const iconClass = "w-12 h-12";
    switch (icon?.toLowerCase()) {
      case "star-outline":
        return <Star className={`${iconClass} text-amber-500`} fill="currentColor" />;
      case "diamond-outline":
        return <Gem className={`${iconClass} text-cyan-500`} />;
      case "crown":
        return <Crown className={`${iconClass} text-purple-500`} />;
      case "zap":
        return <Zap className={`${iconClass} text-yellow-500`} fill="currentColor" />;
      default:
        // Alternate icons for variety
        const defaultIcons = [
          <Star className={`${iconClass} text-amber-500`} fill="currentColor" />,
          <Gem className={`${iconClass} text-cyan-500`} />
        ];
        return defaultIcons[index % 2];
    }
  };

  // Premium gradients for each package
  const getPackageTheme = (index: number) => {
    const themes = [
      {
        gradient: "from-amber-500 via-orange-500 to-red-500",
        bgGradient: "from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20",
        borderGradient: "from-amber-200 to-red-200 dark:from-amber-800 dark:to-red-800",
        shadowColor: "shadow-amber-500/25",
        accentColor: "text-amber-600 dark:text-amber-400"
      },
      {
        gradient: "from-cyan-500 via-blue-500 to-indigo-500",
        bgGradient: "from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20",
        borderGradient: "from-cyan-200 to-indigo-200 dark:from-cyan-800 dark:to-indigo-800",
        shadowColor: "shadow-cyan-500/25",
        accentColor: "text-cyan-600 dark:text-cyan-400"
      }
    ];
    return themes[index % 2];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading Packages</h3>
            <p className="text-gray-500 dark:text-gray-400">Fetching the latest package information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Packages Available</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">There are no subscription packages configured in the system at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-16">

        {/* Packages Container - responsive grid for any number of packages */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
            {packages?.map((pkg, index) => {
              const theme = getPackageTheme(index);
              return (
                <div key={pkg._id} className="group relative">
                  
                  {/* Main Card */}
                  <div className={`relative bg-gradient-to-br ${theme.bgGradient} rounded-3xl border-2 border-gradient-to-r ${theme.borderGradient} shadow-2xl ${theme.shadowColor} hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 overflow-hidden`}>
                    
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white transform rotate-12 scale-110"></div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-6 right-6 z-20">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border-2 transition-all duration-300 ${
                        pkg.isActive 
                          ? "bg-emerald-100/90 text-emerald-700 border-emerald-300 shadow-emerald-200/50 shadow-lg" 
                          : "bg-red-100/90 text-red-700 border-red-300 shadow-red-200/50 shadow-lg"
                      }`}>
                        {pkg.isActive ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {pkg.isActive ? "Active Plan" : "Inactive"}
                      </div>
                    </div>

                    <div className="relative p-10">
                      
                      {/* Package Header */}
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500">
                          {getPackageIcon(pkg.icon, index)}
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500">
                          {pkg.name}
                        </h2>
                      </div>

                      {/* Pricing Section */}
                      <div className="text-center mb-10">
                        <div className="flex items-baseline justify-center gap-2 mb-4">
                          <span className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">/month</span>
                        </div>
                        <div className={`mb-2 inline-flex items-center gap-2 px-4 py-2 ${theme.accentColor} bg-white/50 dark:bg-gray-800/50 rounded-full border border-current/20`}>
                          <Users className="w-5 h-5" />
                          <span className="font-semibold">Up to {pkg.membersUpto.toLocaleString()} Above & Below</span>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${theme.accentColor} bg-white/50 dark:bg-gray-800/50 rounded-full border border-current/20`}>
                          <Network className="w-5 h-5" />
                          <span className="font-semibold">Up to {(pkg.membersUpto/2).toLocaleString()} Levels of User</span>
                        </div>
                      </div>

                      {/* Description */}
                      {/* <div className="mb-12">
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 dark:border-gray-700/40">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Package Features
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                            {pkg.description || `Experience the full potential of our ${pkg.name} package with comprehensive features, priority support, and scalable member management. Perfect for ${pkg.membersUpto <= 10 ? 'small teams' : 'growing organizations'} looking to maximize their productivity and success.`}
                          </p>
                        </div>
                      </div> */}

                      {/* Subscriber Count */}
                      <div className="relative">
                        <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-2xl`}>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <TrendingUp className="w-8 h-8" />
                              <span className="text-5xl font-extrabold">
                                {pkg.userCount.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-lg font-semibold opacity-90 uppercase tracking-wider">
                              Active Subscribers
                            </p>
                            <div className="mt-4 text-sm opacity-75">
                              {pkg.userCount > 0 ? '🎉 Growing community' : '🚀 Be the first to join'}
                            </div>
                          </div>
                          
                          {/* Decorative Elements */}
                          <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/15 rounded-full animate-pulse delay-1000"></div>
                          <div className="absolute top-1/2 left-8 w-4 h-4 bg-white/10 rounded-full animate-pulse delay-500"></div>
                        </div>
                      </div>
                      
                    </div>

                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-all duration-700 pointer-events-none`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
