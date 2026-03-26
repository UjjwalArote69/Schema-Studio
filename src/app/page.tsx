/* eslint-disable react/jsx-no-comment-textnodes */
"use client"

import Link from "next/link";
import { ArrowRight, Database, LayoutTemplate, Zap, Code2, CheckCircle2, Terminal, Layers } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-300 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="p-1.5 bg-black dark:bg-white rounded-lg shadow-sm">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span>SchemaStudio</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            <Link href="#features" className="hidden sm:block hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="https://github.com" target="_blank" className="hidden sm:block hover:text-black dark:hover:text-white transition-colors">GitHub</Link>
            
            <ThemeToggle /> 

            <div className="hidden sm:block w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

            {status === "loading" ? (
              <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            ) : session ? (
              <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                Workspace <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="hidden sm:block hover:text-black dark:hover:text-white transition-colors">
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
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

        {/* Center Glow (Monochrome) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-200/30 dark:bg-zinc-800/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-8 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
            SchemaStudio 1.0 is now live <ArrowRight className="w-3 h-3" />
          </Link>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-balance leading-tight">
            Design your database. <br />
            <span className="text-zinc-400 dark:text-zinc-500">
              Generate the code.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 text-balance leading-relaxed font-medium">
            The interactive, drag-and-drop schema builder. Visually map out your tables and relationships, then instantly export to SQL, Prisma, or Mongoose.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link 
              href="/editor" 
              className="group flex items-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              Start Designing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:border-zinc-800 dark:text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
              <Code2 className="w-4 h-4 text-zinc-400" /> View Output Examples
            </Link>
          </div>

          {/* High-Fidelity App Mockup */}
          <div className="w-full max-w-5xl relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            {/* Mac OS Window Header */}
            <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-md border border-zinc-200 dark:border-zinc-700">
                <Layers className="w-3 h-3 text-zinc-400" />
                <span className="text-[10px] font-mono font-bold text-zinc-500">ecommerce_schema</span>
              </div>
              <div className="w-12" /> {/* Spacer for centering */}
            </div>

            {/* Split Pane Interface */}
            <div className="grid md:grid-cols-2 h-112.5">
              
              {/* Left: Interactive Canvas Mock */}
              <div className="relative p-8 border-r border-zinc-200 dark:border-zinc-800 flex bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-size-[16px_16px] overflow-hidden">
                
                {/* SVG Connecting Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <path 
                    d="M 220 120 C 300 120, 200 300, 280 300" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="text-zinc-300 dark:text-zinc-700"
                  />
                </svg>

                {/* Table 1: Users */}
                <div className="absolute top-12 left-12 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-10">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-bold border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Database className="w-3 h-3 text-zinc-400" /> Users
                  </div>
                  <div className="p-2.5 space-y-2.5">
                    <div className="flex justify-between text-[11px]"><span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2.5">email</span><span className="text-zinc-500 font-mono">VARCHAR</span></div>
                  </div>
                </div>

                {/* Table 2: Orders */}
                <div className="absolute top-52 left-64 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-10 ring-2 ring-black/5 dark:ring-white/10">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-bold border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <Database className="w-3 h-3 text-zinc-400" /> Orders
                  </div>
                  <div className="p-2.5 space-y-2.5">
                    <div className="flex justify-between text-[11px]"><span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2.5">user_id</span><span className="text-zinc-500 font-mono">UUID</span></div>
                    <div className="flex justify-between text-[11px]"><span className="font-semibold text-zinc-700 dark:text-zinc-300 ml-2.5">total</span><span className="text-zinc-500 font-mono">INT</span></div>
                  </div>
                </div>
              </div>

              {/* Right: Code Mock (Dark Theme Always for contrast) */}
              <div className="p-8 bg-[#0d1117] flex flex-col font-mono text-[13px] text-left overflow-hidden">
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400">schema.prisma</span>
                </div>
                
                <div className="text-zinc-500 mb-4">// Generated Prisma Schema</div>
                
                <div className="mb-4">
                  <span className="text-zinc-400">model</span> <span className="text-white font-bold">User</span> {"{"}<br/>
                  <div className="pl-4">
                    <span className="text-zinc-300">id</span><span className="text-zinc-500 ml-8">String @id @default(uuid())</span><br/>
                    <span className="text-zinc-300">email</span><span className="text-zinc-500 ml-5">String @unique</span><br/>
                    <span className="text-zinc-300">orders</span><span className="text-zinc-500 ml-4">Order[]</span>
                  </div>
                  <span className="text-white">{"}"}</span>
                </div>

                <div>
                  <span className="text-zinc-400">model</span> <span className="text-white font-bold">Order</span> {"{"}<br/>
                  <div className="pl-4">
                    <span className="text-zinc-300">id</span><span className="text-zinc-500 ml-9">String @id @default(uuid())</span><br/>
                    <span className="text-zinc-300">user_id</span><span className="text-zinc-500 ml-4">String</span><br/>
                    <span className="text-zinc-300">total</span><span className="text-zinc-500 ml-6">Int</span><br/>
                    <span className="text-zinc-300">user</span><span className="text-zinc-500 ml-7">User @relation(fields: [user_id], references: [id])</span>
                  </div>
                  <span className="text-white">{"}"}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Supported Tech Banner */}
      <div className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-10 md:gap-20 text-zinc-500 dark:text-zinc-500 text-xs font-bold tracking-widest uppercase">
          <span className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white"/> PostgreSQL</span>
          <span className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white"/> MySQL</span>
          <span className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white"/> Prisma ORM</span>
          <span className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white"/> Mongoose</span>
        </div>
      </div>

      {/* Feature Teaser */}
      <section id="features" className="py-24 md:py-32 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-white">
              Everything you need to architect data.
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Built by developers, for developers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-6 h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Visual Canvas</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Drag and drop tables onto an infinite canvas. Effortlessly map out complex relationships without touching a line of code.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Instant Export</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Stop writing boilerplate. Export your visual schema directly into production-ready TypeScript, SQL, or Prisma models.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-black dark:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Multi-ORM Support</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">Whether you are building with Node.js, Next.js, or Django, SchemaStudio exports exactly the syntax your backend stack requires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
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