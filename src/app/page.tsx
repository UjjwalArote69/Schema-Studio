/* eslint-disable react/jsx-no-comment-textnodes */
"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, LayoutTemplate, Zap, Code2, CheckCircle2, Terminal, Layers, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // console.log(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
  
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-300 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* ═══════════════════════════════════════════════════════════
          Navigation
          ═══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="p-1.5 bg-black dark:bg-white rounded-lg shadow-sm">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span>SchemaStudio</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="https://github.com" target="_blank" className="hover:text-black dark:hover:text-white transition-colors">GitHub</Link>
            
            <ThemeToggle /> 

            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

            {status === "loading" ? (
              <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : session ? (
              <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                Workspace <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="hover:text-black dark:hover:text-white transition-colors">
                  Sign up
                </Link>
              </>
            )}

            {!session && (
              <Link 
                href="/editor" 
                className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:scale-105 transition-all font-bold shadow-sm ml-2"
              >
                Open Editor
              </Link>
            )}
          </div>

          {/* Mobile Nav Controls */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pb-4 pt-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
              Features
            </Link>
            <Link href="https://github.com" target="_blank" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
              GitHub
            </Link>
            
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

            {status === "loading" ? (
              <div className="px-3 py-2.5"><div className="w-20 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></div>
            ) : session ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                Go to Workspace <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                  Sign up
                </Link>
              </>
            )}

            {!session && (
              <Link 
                href="/editor"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-lg font-bold shadow-sm mt-2"
              >
                Open Editor
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          Hero Section
          ═══════════════════════════════════════════════════════════ */}
      <main className="relative pt-28 pb-16 md:pt-40 md:pb-32 overflow-hidden">
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

        {/* Center Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-zinc-200/30 dark:bg-zinc-800/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-6 md:mb-8 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
            <span className="hidden sm:inline">SchemaStudio 1.0 is now live</span>
            <span className="sm:hidden">Now live</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-5 md:mb-6 text-balance leading-[1.1]">
            Design your database.{" "}
            <span className="text-zinc-400 dark:text-zinc-500 block sm:inline">
              Generate the code.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-8 md:mb-10 text-balance leading-relaxed font-medium px-2">
            The interactive, drag-and-drop schema builder. Visually map out your tables and relationships, then instantly export to SQL, Prisma, or Mongoose.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-14 md:mb-20 px-4 sm:px-0">
            <Link 
              href="/editor" 
              className="group flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 w-full sm:w-auto"
            >
              Start Designing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:border-zinc-800 dark:text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 w-full sm:w-auto"
            >
              <Code2 className="w-4 h-4 text-zinc-400" /> View Output Examples
            </Link>
          </div>

          {/* ─── App Mockup ─────────────────────────────────────── */}
          <div className="w-full max-w-5xl relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            {/* Mac OS Window Header */}
            <div className="h-10 sm:h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-3 sm:px-4 justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-md border border-zinc-200 dark:border-zinc-700">
                <Layers className="w-3 h-3 text-zinc-400 hidden sm:block" />
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-500">ecommerce_schema</span>
              </div>
              <div className="w-8 sm:w-12" />
            </div>

            {/* Split Pane Interface */}
            <div className="grid md:grid-cols-2">
              
              {/* Left: Interactive Canvas Mock */}
              <div className="relative p-4 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] overflow-hidden min-h-[200px] sm:min-h-[280px] md:min-h-0">
                
                {/* SVG Connecting Line — hidden on very small screens */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block" style={{ zIndex: 0 }}>
                  <path 
                    d="M 220 120 C 300 120, 200 300, 280 300" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="text-zinc-300 dark:text-zinc-700"
                  />
                </svg>

                {/* Table 1: Users */}
                <div className="absolute top-4 left-3 sm:top-12 sm:left-12 w-36 sm:w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-10">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 sm:gap-2">
                    <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" /> Users
                  </div>
                  <div className="p-2 sm:p-2.5 space-y-1.5 sm:space-y-2.5">
                    <div className="flex justify-between text-[9px] sm:text-[11px]"><span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-400"/> id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[9px] sm:text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2 sm:ml-2.5">email</span><span className="text-zinc-500 font-mono">VARCHAR</span></div>
                  </div>
                </div>

                {/* Table 2: Orders */}
                <div className="absolute top-28 right-3 sm:top-52 sm:left-64 w-36 sm:w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-10 ring-2 ring-black/5 dark:ring-white/10">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 sm:gap-2">
                    <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" /> Orders
                  </div>
                  <div className="p-2 sm:p-2.5 space-y-1.5 sm:space-y-2.5">
                    <div className="flex justify-between text-[9px] sm:text-[11px]"><span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1"><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-400"/> id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[9px] sm:text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2 sm:ml-2.5">user_id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[9px] sm:text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2 sm:ml-2.5">total</span><span className="text-zinc-500 font-mono">INT</span></div>
                  </div>
                </div>
              </div>

              {/* Right: Code Mock */}
              <div className="p-4 sm:p-8 bg-[#0d1117] flex flex-col font-mono text-[11px] sm:text-[13px] text-left overflow-hidden min-h-[220px] sm:min-h-[280px] md:min-h-0">
                <div className="flex items-center gap-2 mb-4 sm:mb-6 border-b border-white/10 pb-2 sm:pb-3">
                  <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
                  <span className="text-zinc-400 text-[10px] sm:text-sm">schema.prisma</span>
                </div>
                
                <div className="text-zinc-500 mb-3 sm:mb-4 text-[10px] sm:text-[13px]">// Generated Prisma Schema</div>
                
                <div className="mb-3 sm:mb-4">
                  <span className="text-zinc-400">model</span> <span className="text-white font-bold">User</span> {"{"}<br/>
                  <div className="pl-3 sm:pl-4">
                    <span className="text-zinc-300">id</span><span className="text-zinc-500 ml-4 sm:ml-8">String @id @default(uuid())</span><br/>
                    <span className="text-zinc-300">email</span><span className="text-zinc-500 ml-2 sm:ml-5">String @unique</span><br/>
                    <span className="text-zinc-300">orders</span><span className="text-zinc-500 ml-1 sm:ml-4">Order[]</span>
                  </div>
                  <span className="text-white">{"}"}</span>
                </div>

                <div>
                  <span className="text-zinc-400">model</span> <span className="text-white font-bold">Order</span> {"{"}<br/>
                  <div className="pl-3 sm:pl-4">
                    <span className="text-zinc-300">id</span><span className="text-zinc-500 ml-4 sm:ml-9">String @id @default(uuid())</span><br/>
                    <span className="text-zinc-300">user_id</span><span className="text-zinc-500 ml-1 sm:ml-4">String</span><br/>
                    <span className="text-zinc-300">total</span><span className="text-zinc-500 ml-2 sm:ml-6">Int</span><br/>
                    <span className="text-zinc-300 hidden sm:inline">user</span><span className="text-zinc-500 hidden sm:inline ml-7">User @relation(fields: [user_id], references: [id])</span>
                    <span className="text-zinc-300 sm:hidden">user</span><span className="text-zinc-500 sm:hidden ml-3">User @relation(...)</span>
                  </div>
                  <span className="text-white">{"}"}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          Supported Tech Banner
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-10 md:gap-20 text-zinc-500 dark:text-zinc-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
          <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white"/> PostgreSQL</span>
          <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white"/> MySQL</span>
          <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white"/> Prisma ORM</span>
          <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white"/> Mongoose</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Features Section
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-24 md:py-32 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Everything you need to architect data.
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">Built by developers, for developers.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-zinc-900 dark:text-white">Visual Canvas</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Drag and drop tables onto an infinite canvas. Effortlessly map out complex relationships without touching a line of code.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-zinc-900 dark:text-white">Instant Export</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Stop writing boilerplate. Export your visual schema directly into production-ready TypeScript, SQL, or Prisma models.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-zinc-900 dark:text-white">Multi-ORM Support</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Whether you are building with Node.js, Next.js, or Django, SchemaStudio exports exactly the syntax your backend stack requires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
            <Database className="w-4 h-4" /> SchemaStudio
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} SchemaStudio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}