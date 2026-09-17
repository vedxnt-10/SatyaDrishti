import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MagnifyingGlass, Fingerprint, Lightning, ArrowRight } from '@phosphor-icons/react';

const ease = [0.32, 0.72, 0, 1];

export default function Landing() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } },
  };

  return (
    <div className="relative">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Full viewport, centered, cinematic
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 py-28">
        <motion.div
          initial={reduce ? 'visible' : 'hidden'}
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
          }}
          className="flex flex-col items-center text-center max-w-[800px] mx-auto relative z-10"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="status-badge mb-8">
            <ShieldCheck weight="fill" className="h-3 w-3 text-accent-primary" />
            <span className="text-text-secondary">Document Forensics Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold tracking-[-0.035em] leading-[1.08] mb-6 text-text-primary text-balance"
          >
            Detect forged documents{' '}
            <br className="hidden md:block" />
            with{' '}
            <span className="bg-gradient-to-r from-accent-primary via-accent-cyan to-accent-primary bg-[length:200%_100%] bg-clip-text text-transparent">
              forensic precision
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-text-secondary max-w-[56ch] mx-auto mb-12 leading-relaxed"
          >
            SatyaDrishti combines Error Level Analysis, noise profiling, and
            face-splicing detection to expose tampered and AI-generated identity
            documents — with court-admissible precision under Section 65B.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            <Link
              to="/scan"
              className="group flex items-center gap-2.5 h-12 px-7 bg-accent-primary text-bg-primary font-semibold text-sm rounded-xl transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] active:scale-[0.97]"
            >
              Start scanning
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-text-primary/10 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={12} weight="bold" />
              </span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center h-12 px-7 text-text-secondary font-medium text-sm rounded-xl border border-border-subtle hover:text-text-primary hover:border-border-hover hover:bg-text-primary/5 transition-all duration-300 active:scale-[0.97]"
            >
              View analytics
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease }}
          className="flex flex-wrap justify-center gap-x-16 gap-y-6 mt-24 relative z-10"
        >
          {[
            { value: '5', label: 'Forensic layers' },
            { value: '< 3s', label: 'Analysis time' },
            { value: 'Sec 65B', label: 'Court-admissible' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-semibold font-mono text-text-primary tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] text-text-muted mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border border-border-subtle flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-text-muted"
            />
          </div>
        </motion.div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES — Asymmetric bento (no boring 3-card grid)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-6 pb-36">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] mb-4 text-balance">
            Multi-layer analysis engine
          </h2>
          <p className="text-text-secondary max-w-[48ch] mx-auto text-base">
            Every document passes through five independent forensic checks
            before a verdict is reached.
          </p>
        </motion.div>

        {/* Bento grid — 2-column asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              icon: MagnifyingGlass,
              title: 'Pixel-level forensics',
              desc: 'Error Level Analysis reveals hidden compression artifacts, exposing regions modified by image editors or generative AI tools.',
              span: 'md:col-span-3',
            },
            {
              icon: ShieldCheck,
              title: 'Structural validation',
              desc: 'Validates security features like QR signatures and internal consistency of OCR-extracted data fields.',
              span: 'md:col-span-2',
            },
            {
              icon: Fingerprint,
              title: 'Face boundary analysis',
              desc: 'Detects pasted facial images by comparing high-frequency noise and compression at face-to-background boundaries.',
              span: 'md:col-span-2',
            },
            {
              icon: Lightning,
              title: 'AI generation detection',
              desc: 'Identifies synthetic documents created by diffusion models through spectral analysis and pattern matching.',
              span: 'md:col-span-3',
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className={`glass-card p-8 md:p-10 flex flex-col ${feat.span}`}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-primary/8 border border-accent-primary/15 flex items-center justify-center mb-6 flex-shrink-0">
                <feat.icon className="h-5 w-5 text-accent-primary" weight="duotone" />
              </div>
              <h3 className="text-[17px] font-semibold text-text-primary mb-2.5 tracking-[-0.01em]">
                {feat.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 numbered steps
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-6 pb-36">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-[-0.025em] mb-4">
            How it works
          </h2>
          <p className="text-text-secondary max-w-[48ch] mx-auto text-base">
            Upload any identity document and receive a comprehensive forensic
            report in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {[
            {
              step: '01',
              title: 'Upload',
              desc: 'Drag any government ID document — Aadhaar, PAN, passport, or driving licence.',
            },
            {
              step: '02',
              title: 'Analyze',
              desc: 'Our 5-layer forensic pipeline processes the document in under 3 seconds.',
            },
            {
              step: '03',
              title: 'Report',
              desc: 'Receive a court-admissible Sec 65B report with detailed layer diagnostics.',
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease }}
              className="flex flex-col"
            >
              <span className="text-[3.5rem] font-bold font-mono text-border-hover leading-none mb-5 tracking-tighter">
                {s.step}
              </span>
              <h3 className="text-lg font-semibold mb-2 tracking-[-0.01em]">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          CTA STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-6 pb-36">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="glass-card p-12 md:p-16 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-4">
            Ready to verify?
          </h2>
          <p className="text-text-secondary mb-8 max-w-[40ch] mx-auto">
            Upload a document and see SatyaDrishti's forensic engine in action.
          </p>
          <Link
            to="/scan"
            className="group inline-flex items-center gap-2.5 h-12 px-8 bg-accent-primary text-bg-primary font-semibold text-sm rounded-xl transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] active:scale-[0.97]"
          >
            Launch scanner
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER — Minimal, professional
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-border-subtle py-10 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck weight="fill" className="h-4 w-4 text-accent-primary" />
            <span className="font-semibold text-sm tracking-[-0.01em]">SatyaDrishti</span>
          </div>
          <p className="text-xs text-text-muted">
            Smart India Hackathon — Problem Statement 26188
          </p>
        </div>
      </footer>
    </div>
  );
}
