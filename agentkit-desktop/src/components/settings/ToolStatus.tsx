import { usePlatformStore } from "@/stores";
import { PLATFORM_DISPLAY_NAMES } from "@/types";
import { motion } from "framer-motion";
import { Check, RefreshCw, X } from "lucide-react";

export function ToolStatus() {
    const { platforms, loading, detectPlatforms } = usePlatformStore();

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Tool Status</h3>
                    <p className="text-sm text-slate-400">Detect installed AI coding tools</p>
                </div>
                <button
                    onClick={() => detectPlatforms()}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300 rounded-lg transition-colors border border-white/10 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Refreshing..." : "Refresh Status"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                    <motion.div
                        key={platform.platform}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                        className={`
              relative overflow-hidden rounded-xl border p-4 transition-colors group
              ${platform.detected
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-white/5 border-white/5"
                            }
            `}
                    >
                        {/* Status Indicator */}
                        <div className="flex flex-col items-center justify-center text-center py-4 relative z-10">
                            <div
                                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3 ${platform.detected ? "text-green-400" : "text-slate-500"
                                    }`}
                            >
                                {platform.detected ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Installed
                                    </>
                                ) : (
                                    <>
                                        <X className="w-3.5 h-3.5" />
                                        Not Installed
                                    </>
                                )}
                            </div>

                            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                                {PLATFORM_DISPLAY_NAMES[platform.platform]}
                            </h4>

                            <p className="text-xs text-slate-500 font-mono bg-black/20 px-2 py-0.5 rounded">
                                {platform.platform}
                            </p>
                        </div>

                        {/* Background Glow */}
                        {platform.detected && (
                            <div className="absolute inset-0 bg-green-500/5 blur-xl pointer-events-none transition-opacity duration-300 group-hover:bg-green-500/10" />
                        )}

                        {/* Hover Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
