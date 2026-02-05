import { motion } from "framer-motion";

export function AgentKitLogo({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <div className={className}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(0,70,140,0.5)]"
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100">
                        <stop offset="0%" stopColor="#00468C" /> {/* YSU Blue */}
                        <stop offset="100%" stopColor="#38bdf8" /> {/* Sky Blue */}
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Stylized 'A' Frame / Network Node */}
                <motion.path
                    d="M50 15 L85 85 H15 L50 15 Z M50 15 L50 45"
                    stroke="url(#logo-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Horizontal Connection Bar */}
                <motion.path
                    d="M33 55 H67"
                    stroke="url(#logo-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                />

                {/* Central Core (AI Brain) */}
                <motion.circle
                    cx="50"
                    cy="45"
                    r="6"
                    fill="#00468C"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                />

                {/* Tech Circuit Nodes */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <circle cx="15" cy="85" r="3" fill="#38bdf8" />
                    <circle cx="85" cy="85" r="3" fill="#38bdf8" />
                    <circle cx="50" cy="15" r="3" fill="#38bdf8" />
                </motion.g>

                {/* Pulse Effect around Core */}
                <motion.circle
                    cx="50"
                    cy="45"
                    r="6"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    fill="none"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ delay: 1.5, duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
            </svg>
        </div>
    );
}
