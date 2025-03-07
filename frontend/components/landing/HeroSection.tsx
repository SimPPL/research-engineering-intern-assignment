"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Disc3, Music2, AudioWaveformIcon as Waveform, ShieldCheck, FileCheck2, UserCheck, Globe2 } from "lucide-react"
import AnimatedBackgroundPaths from "@/components/landing/AnimatedBackgroundPaths" // Import the background component

const FloatingParticle = ({ delay }: { delay: number }) => {
  const y = useMotionValue(0)
  const ySpring = useSpring(y, { stiffness: 100, damping: 10 })

  useEffect(() => {
    const moveParticle = () => {
      y.set(Math.random() * -100)
      setTimeout(moveParticle, Math.random() * 5000 + 3000)
    }
    setTimeout(moveParticle, delay)
  }, [y, delay])

  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        x: `${Math.random() * 100}%`,
        y: ySpring,
        opacity: 0.5,
      }}
    />
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const [isHovered, setIsHovered] = useState(false)

  const stats = [
    { icon: <ShieldCheck className="w-6 h-6" />, label: "Facts Verified", value: "100K+" },
    { icon: <FileCheck2 className="w-6 h-6" />, label: "Articles Checked", value: "50K+" },
    { icon: <UserCheck className="w-6 h-6" />, label: "Active Users", value: "25K+" },
    { icon: <Globe2 className="w-6 h-6" />, label: "Countries", value: "50+" },
  ]

  return (
    <section ref={containerRef} className="min-h-screen relative overflow-hidden bg-emerald-50/50 dark:bg-black">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-white dark:from-emerald-950/30 dark:to-black"></div>
        {/* Add the animated background paths below the gradient */}
        <AnimatedBackgroundPaths/>
        {/* Floating particles on top */}
        {[...Array(50)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 100} />
        ))}
      </div>

      <motion.div style={{ y, opacity }} className="relative pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-7xl md:text-8xl font-bold mb-6 tracking-tight relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-400 dark:to-emerald-600">
                Find The Fake
              </span>
              <motion.span
                className="absolute -inset-1 bg-emerald-600 dark:bg-emerald-500 rounded-full blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-emerald-800 dark:text-emerald-400 max-w-3xl mx-auto">
              See the Spread. Stop the Lies. — AI-Powered Misinformation Tracker Across Social Media.
            </p>
            <div className="relative inline-block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                <Button
                  size="lg"
                  className="bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 text-lg px-8 py-6 rounded-full transition-colors relative overflow-hidden group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  asChild
                >
                  <a href="https://simppl.org/" target="_blank" rel="noopener noreferrer">
                    <span className="relative z-10">Visit SimPPL</span>
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white"
                      initial={{ x: "100%" }}
                      animate={{ x: isHovered ? "0%" : "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.span
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 relative z-10"
                    >
                      →
                    </motion.span>
                  </a>
                </Button>

                
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl p-6 backdrop-blur-lg border border-emerald-200 dark:border-emerald-500/20 transition-colors hover:border-emerald-300 dark:hover:border-emerald-500/30"
                >
                  <div className="mb-2 text-emerald-700 dark:text-emerald-400 flex justify-center">{stat.icon}</div>
                  <motion.div
                    className="text-3xl font-bold mb-1 text-emerald-900 dark:text-emerald-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-500">{stat.label}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}