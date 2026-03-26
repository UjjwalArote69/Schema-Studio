/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Terminal, 
  Code, 
  Database, 
  Sparkles, 
  MousePointer2, 
  Zap,
  LayoutTemplate,
  Info
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Track the active section as the user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" } // Triggers when the section hits the top of the viewport
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: "introduction", title: "Introduction", icon: BookOpen },
    { id: "visual-editor", title: "Visual Editor", icon: MousePointer2 },
    { id: "ai-architect", title: "AI Architect", icon: Sparkles },
    { id: "templates", title: "Using Templates", icon: LayoutTemplate },
    { id: "import-export", title: "Import & Export", icon: Code },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for any fixed headers if you have them
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      
      {/* Symmetrical Header */}
      <div className="mb-10 md:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-white">
          Documentation
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
          The complete guide to architecting, visualizing, and deploying your database schemas with SchemaStudio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
        
        {/* Sticky Left Navigation */}
        <div className="col-span-1 hidden md:block">
          <div className="sticky top-8 space-y-1">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 px-3">
              On this page
            </h3>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`group w-full px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-all font-medium ${
                  activeSection === link.id
                    ? "bg-white dark:bg-zinc-800/80 text-black dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                    : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <link.icon className={`w-4 h-4 transition-colors ${
                  activeSection === link.id ? "text-black dark:text-white" : "text-zinc-400 group-hover:text-black dark:group-hover:text-white"
                }`} />
                {link.title}
              </a>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-20 pb-24">
          
          {/* Introduction */}
          <section id="introduction" className="scroll-mt-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              <Zap className="w-3 h-3" /> Quick Start
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Getting Started
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              SchemaStudio is a high-performance visual database designer. Whether you are starting from a blank canvas or migrating an existing project, our tools are designed to make database architecture intuitive and collaborative.
            </p>
            
            <div className="p-5 mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] flex gap-4 items-start shadow-sm">
              <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Architecture First</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We recommend finalizing your schema layout visually before exporting code to your ORM or SQL database. Changes made in the canvas are automatically saved to your workspace.
                </p>
              </div>
            </div>
          </section>

          {/* Visual Editor Section */}
          <section id="visual-editor" className="scroll-mt-8 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <MousePointer2 className="w-6 h-6" /> Visual Editor
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The core of SchemaStudio is the infinite canvas. It allows you to freely position tables, define columns, and draw relationships with standard drag-and-drop mechanics.
            </p>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-4">Editor Controls</h3>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
              {[
                { key: "Click + Drag Node", action: "Move tables around the workspace" },
                { key: "Drag Handle", action: "Connect columns to create relationships" },
                { key: "Double Click", action: "Select a table to edit name or columns" },
                { key: "Ctrl + Z", action: "Undo last modification" },
                { key: "Backspace", action: "Delete selected element (table or edge)" },
              ].map((shortcut, i) => (
                <div key={shortcut.key} className={`flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-zinc-100 dark:border-zinc-900' : ''}`}>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{shortcut.action}</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold font-mono text-black dark:text-white shadow-sm tracking-wide">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          {/* AI Architect Section */}
          <section id="ai-architect" className="scroll-mt-8 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6" /> AI Architect
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Powered by Google Gemini 1.5, the AI Architect allows you to generate entire relational schemas using natural language. Simply describe your application needs, and the system will calculate the necessary tables, columns, and foreign key relationships.
            </p>
            
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-3">Effective Prompting</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              For the best results, be specific about the entities and how they relate.
            </p>
            
            <div className="space-y-4">
              <div className="p-5 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Initial Generation</span>
                <code className="font-mono text-sm text-zinc-900 dark:text-zinc-300">
                  "Create a property management system with owners, tenants, and monthly rent tracking."
                </code>
              </div>
              
              <div className="p-5 bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Iterative Modification</span>
                <code className="font-mono text-sm text-zinc-900 dark:text-zinc-300">
                  "Add a maintenance requests table and link it to the tenants."
                </code>
              </div>
            </div>
          </section>

          {/* Templates Section */}
          <section id="templates" className="scroll-mt-8 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <LayoutTemplate className="w-6 h-6" /> Using Templates
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you don't want to rely on AI or build from scratch, our Template Gallery provides industry-standard architectures. These are heavily vetted schemas for common application types like multi-tenant SaaS, e-commerce, and social networks.
            </p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed marker:text-zinc-400">
              <li>Navigate to the <strong className="text-black dark:text-white">Templates</strong> tab in the sidebar.</li>
              <li>Preview the table and relationship counts.</li>
              <li>Click <strong className="text-black dark:text-white">Use</strong> to instantly clone the architecture into a new workspace.</li>
            </ul>
          </section>

          {/* Import & Export Section */}
          <section id="import-export" className="scroll-mt-8 space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              <Code className="w-6 h-6" /> Import & Export
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              SchemaStudio is designed to integrate seamlessly into your existing workflow. You are never locked in.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Import */}
              <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <Terminal className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">SQL Import</h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Upload a `.sql` file or paste raw `CREATE TABLE` statements. Our parser automatically identifies columns, data types, and primary/foreign keys to reconstruct your visual schema.
                </p>
              </div>

              <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <Database className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">Code Export</h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  Generate and download production-ready code for your application backend. Supported formats include:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['PostgreSQL', 'MySQL', 'Prisma', 'Mongoose'].map((tool) => (
                    <span key={tool} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}