import { ToolStatus } from "./ToolStatus";
import { AboutCard } from "./AboutCard";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export function SettingsPage() {
    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 flex items-center gap-4"
            >
                <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                    <Settings className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Settings</h2>
                    <p className="text-slate-400">Configure SkillsLM global settings</p>
                </div>
            </motion.div>

            <div className="space-y-8">
                <ToolStatus />
                <AboutCard />
            </div>
        </div>
    );
}
