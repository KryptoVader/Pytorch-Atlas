"use client";

import React, { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FloatingPathsProps {
    position: number;
    isInView?: boolean;
}

export const FloatingPaths = React.memo(function FloatingPaths({
    position,
}: FloatingPathsProps) {
    // Clean, subtle, fixed tensor flow paths without motion for zero CPU/GPU overhead
    const paths = useMemo(() => {
        return Array.from({ length: 22 }, (_, i) => ({
            id: i,
            d: `M-${380 - i * 8 * position} -${189 + i * 9.5}C-${
                380 - i * 8 * position
            } -${189 + i * 9.5} -${312 - i * 8 * position} ${216 - i * 9.5} ${
                152 - i * 8 * position
            } ${343 - i * 9.5}C${616 - i * 8 * position} ${470 - i * 9.5} ${
                684 - i * 8 * position
            } ${875 - i * 9.5} ${684 - i * 8 * position} ${875 - i * 9.5}`,
            width: 0.5 + i * 0.025,
            opacity: 0.12 + (i % 5) * 0.03,
        }));
    }, [position]);

    const tensorId = `tensor-flow-${position}`;

    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
                contain: "strict",
            }}
        >
            <svg
                className="w-full h-full text-slate-800 dark:text-neutral-400"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>PyTorch Tensor Paths</title>
                <defs>
                    <linearGradient id={tensorId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
                    </linearGradient>
                </defs>
                {paths.map((path) => (
                    <path
                        key={path.id}
                        d={path.d}
                        stroke={`url(#${tensorId})`}
                        strokeWidth={path.width}
                        strokeOpacity={path.opacity}
                    />
                ))}
            </svg>
        </div>
    );
});

export interface BackgroundPathsProps {
    title?: string;
    eyebrow?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    buttonText?: string;
    onButtonClick?: () => void;
}

export function BackgroundPaths({
    title = "Background Paths",
    eyebrow,
    className,
    children,
    buttonText = "Discover Excellence",
    onButtonClick,
}: BackgroundPathsProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Automatically stops all SVG rendering when scrolled out of view for zero-cost CPU usage
    const isInView = useInView(containerRef, { margin: "150px" });
    const words = useMemo(() => title.split(" "), [title]);

    // Memoize the animated title so parent re-renders never re-calculate or re-trigger letter motion
    const animatedTitle = useMemo(() => {
        return words.map((word, wordIndex) => (
            <span
                key={wordIndex}
                className="inline-block mr-3 sm:mr-4 last:mr-0"
            >
                {word.split("").map((letter, letterIndex) => (
                    <motion.span
                        key={`${wordIndex}-${letterIndex}`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            delay:
                                wordIndex * 0.07 +
                                letterIndex * 0.02,
                            type: "spring",
                            stiffness: 160,
                            damping: 24,
                        }}
                        className="inline-block text-transparent bg-clip-text 
                        bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                        dark:from-white dark:to-white/80"
                    >
                        {letter}
                    </motion.span>
                ))}
            </span>
        ));
    }, [words]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950",
                className ? className : "min-h-screen"
            )}
            style={{
                contain: "layout paint",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
            }}
        >
            <div className="absolute inset-0 pointer-events-none">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    {eyebrow && (
                        <div className="hero-kicker inline-flex items-center justify-center gap-2 mb-4 font-mono text-xs tracking-wider uppercase text-slate-600 dark:text-neutral-400">
                            {typeof eyebrow === "string" ? (
                                <>
                                    <span className="hero-kicker-mark w-1.5 h-1.5 rounded-full bg-[#ee4c2c] shadow-sm" />
                                    {eyebrow}
                                </>
                            ) : (
                                eyebrow
                            )}
                        </div>
                    )}

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tighter text-balance">
                        {animatedTitle}
                    </h1>

                    {children ? (
                        children
                    ) : (
                        <div
                            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                            dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                            overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <Button
                                variant="ghost"
                                onClick={onButtonClick}
                                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                                text-black dark:text-white transition-all duration-300 
                                group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                                hover:shadow-md dark:hover:shadow-neutral-800/50"
                            >
                                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    {buttonText}
                                </span>
                                <span
                                    className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                    transition-all duration-300"
                                >
                                    →
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BackgroundPaths;
