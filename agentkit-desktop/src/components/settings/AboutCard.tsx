import { motion } from "framer-motion";
import { AgentKitLogo } from "@/components/icons/AgentKitLogo";
import packageJson from "../../../package.json"; // Direct import for simple sync

export function AboutCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
                <AgentKitLogo className="w-64 h-64" />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-lg">
                    <AgentKitLogo className="w-12 h-12" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">About AgentKit</h3>
                    <p className="text-sm text-slate-400">Desktop Manager</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Application Name</span>
                    <span className="text-white font-medium">AgentKit Desktop</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Version</span>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded border border-primary-500/30">
                            v{packageJson.version}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">Description</span>
                    <span className="text-white font-medium text-right max-w-[60%]">
                        {packageJson.description}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <span className="text-slate-400 text-sm">Author</span>
                    <span className="text-white font-medium">Yonghang Li</span>
                </div>
            </div>
        </motion.div>
    );
}
