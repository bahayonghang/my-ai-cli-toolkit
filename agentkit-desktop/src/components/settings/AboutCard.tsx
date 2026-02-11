import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AgentKitLogo } from "@/components/icons/AgentKitLogo";

export function AboutCard() {
    const { t } = useTranslation();
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
                    <h3 className="text-xl font-bold text-white">{t('about.title')}</h3>
                    <p className="text-sm text-slate-400">{t('about.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">{t('about.appName')}</span>
                    <span className="text-white font-medium">{t('about.appNameValue')}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">{t('about.version')}</span>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded border border-primary-500/30">
                            v{__APP_VERSION__}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400 text-sm">{t('about.description')}</span>
                    <span className="text-white font-medium text-right max-w-[60%]">
                        {__APP_DESCRIPTION__}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <span className="text-slate-400 text-sm">{t('about.author')}</span>
                    <span className="text-white font-medium">Yonghang Li</span>
                </div>
            </div>
        </motion.div>
    );
}
