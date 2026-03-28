/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Terminal, Check, Copy, Info, Lightbulb, AlertTriangle, ChevronDown } from "lucide-react";
import { useDocsContext } from "./layout";

function useScrollSpy() {
  const { setActiveSection } = useDocsContext();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { for (const entry of entries) { if (entry.isIntersecting) { setActiveSection(entry.target.id); break; } } },
      { rootMargin: "-80px 0px -75% 0px" },
    );
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [setActiveSection]);
}

// ── Reusable components ─────────────────────────────────────

function CodeBlock({ code, lang, filename }: { code: string; lang: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs font-mono text-zinc-400">{filename || lang}</span></div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-md transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-[13px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}
function Callout({ type = "info", title, children }: { type?: "info" | "tip" | "warning"; title?: string; children: React.ReactNode }) {
  const c = { info: { icon: Info, border: "border-blue-200 dark:border-blue-900/50", bg: "bg-blue-50/50 dark:bg-blue-950/20", ic: "text-blue-500", tc: "text-blue-900 dark:text-blue-300" }, tip: { icon: Lightbulb, border: "border-emerald-200 dark:border-emerald-900/50", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", ic: "text-emerald-500", tc: "text-emerald-900 dark:text-emerald-300" }, warning: { icon: AlertTriangle, border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50/50 dark:bg-amber-950/20", ic: "text-amber-500", tc: "text-amber-900 dark:text-amber-300" } }[type];
  const Icon = c.icon;
  return (<div className={`p-4 rounded-xl border ${c.border} ${c.bg} flex gap-3 items-start my-5`}><Icon className={`w-5 h-5 ${c.ic} shrink-0 mt-0.5`} /><div className="min-w-0">{title && <p className={`text-sm font-bold ${c.tc} mb-1`}>{title}</p>}<div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0">{children}</div></div></div>);
}
function H2({ id, children }: { id: string; children: React.ReactNode }) { return <h2 id={id} data-section="" className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight scroll-mt-20 pt-12 first:pt-0">{children}</h2>; }
function H3({ id, children }: { id: string; children: React.ReactNode }) { return <h3 id={id} data-section="" className="text-base md:text-lg font-bold text-zinc-900 dark:text-white scroll-mt-20 pt-8">{children}</h3>; }
function P({ children }: { children: React.ReactNode }) { return <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">{children}</p>; }
function IC({ children }: { children: React.ReactNode }) { return <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[13px] font-mono text-zinc-800 dark:text-zinc-200">{children}</code>; }
function Kbd({ children }: { children: React.ReactNode }) { return <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold font-mono text-zinc-700 dark:text-zinc-300 mx-0.5">{children}</kbd>; }
function B({ children }: { children: React.ReactNode }) { return <strong className="text-zinc-900 dark:text-white font-semibold">{children}</strong>; }
function UL({ children }: { children: React.ReactNode }) { return <ul className="list-disc list-outside pl-5 space-y-1.5 text-[15px] text-zinc-600 dark:text-zinc-400 my-3 marker:text-zinc-300 dark:marker:text-zinc-600">{children}</ul>; }
function Steps({ steps }: { steps: { title: string; desc: string }[] }) {
  return (<div className="space-y-4 my-5">{steps.map((s, i) => (<div key={i} className="flex gap-4 items-start"><div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div><div><p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">{s.title}</p><p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p></div></div>))}</div>);
}
function RefTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (<div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 my-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">{headers.map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className={i ? "border-t border-zinc-100 dark:border-zinc-800/50" : ""}>{row.map((cell, j) => <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap" : "text-zinc-600 dark:text-zinc-400"}`}>{cell}</td>)}</tr>)}</tbody></table></div>);
}

// ═══════════════════════════════════════════════════════════════

export default function DocsPage() {
  useScrollSpy();
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 md:py-12 pb-40">

      {/* ══════════ GETTING STARTED ══════════ */}
      <H2 id="overview">Overview</H2>
      <P>SchemaStudio is a visual database designer built for developers. You design schemas by dragging table nodes on an infinite canvas, drawing foreign key relationships between columns, and exporting production-ready code for your backend stack.</P>
      <P>It supports six export targets — PostgreSQL, MySQL, SQLite, Prisma ORM, Mongoose (TypeScript), and Mongoose (JavaScript) — and can also import existing SQL <IC>CREATE TABLE</IC> statements to reconstruct your schema visually. Every change is auto-saved, and you can generate entire schemas from plain English using the built-in AI Architect powered by Google Gemini.</P>
      <P>The app is built with Next.js 15, React 19, Tailwind CSS 4, Zustand for state management, Immer for immutable undo/redo patches, React Flow for the interactive canvas, Prisma ORM + Neon PostgreSQL for cloud persistence, NextAuth.js for authentication, and Google Gemini 2.5 Flash for AI generation.</P>
      <P>Internally, every schema is stored as a JSON object with two arrays: <IC>tables</IC> (each with an <IC>id</IC>, <IC>name</IC>, <IC>position &#123;x, y&#125;</IC>, and <IC>columns</IC> array) and <IC>relations</IC> (each with source/target table and column IDs plus a cardinality type). This is the exact format that gets saved to the database, sent to the AI as context, and used to generate export code.</P>

      <H3 id="quickstart">Quickstart</H3>
      <P>The fastest way from zero to a working schema:</P>
      <Steps steps={[
        { title: "Sign in or use sandbox", desc: "Sign in with email/password, GitHub, or Google at /login. Or go directly to /editor for a no-auth sandbox (data stays in browser memory only — not saved to any server)." },
        { title: "Create a project", desc: "From the dashboard, click \"New Schema\". This creates a project with a blank canvas and a unique URL like /editor/cm5abc123." },
        { title: "Describe what you want", desc: "Type a description into the AI Architect bar at the bottom of the canvas: \"a gym management system with members, memberships, classes, schedules, and instructors\". Press Enter or click Generate. The AI creates all tables, columns, types, and relationships." },
        { title: "Refine the schema", desc: "Click any table to open the floating sidebar. Rename columns, change types (UUID, VARCHAR, INT, etc.), toggle PK/UQ constraints, drag columns to reorder, and draw new relationship lines between tables by dragging from column handles." },
        { title: "Export your code", desc: "Click \"Export\" in the toolbar. Pick your format (PostgreSQL, MySQL, SQLite, Prisma, Mongoose TS, Mongoose JS), review the generated code in the modal, then copy to clipboard or download as a file." },
        { title: "Iterate", desc: "Use the AI to add more tables (\"add a reviews table linked to members and classes\"), or modify manually. Everything auto-saves within seconds. Save a version snapshot before big changes so you can roll back." },
      ]} />

      <H3 id="concepts">Core concepts</H3>
      <P>SchemaStudio works with three data primitives. Everything on the canvas is built from these:</P>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {[
          { title: "Table", desc: "A named entity positioned on the canvas. Contains an ordered list of columns. Maps to a CREATE TABLE in SQL, a model in Prisma, or a Schema in Mongoose. Has an internal ID like t_a7x9k2." },
          { title: "Column", desc: "A field inside a table. Has a name, data type (UUID, VARCHAR, INT, etc.), and optional constraints (primary key, unique). Each column gets left/right connection handles for drawing relations. Has an internal ID like c_b3m8f1." },
          { title: "Relation", desc: "A foreign key link between a column on one table and a column on another. Has a cardinality type: 1:1, 1:n, or m:n. Rendered as an animated dashed edge with a clickable type badge and delete button at the midpoint." },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <H3 id="workspace">Workspace &amp; projects</H3>
      <P>After signing in, you land on the <B>Dashboard</B> — your personal workspace. The main area shows all your projects as cards, each displaying the project name, table count, and last-updated timestamp. From here you can:</P>
      <UL>
        <li><B>New Schema</B> — creates a blank canvas with a unique URL. The project appears immediately in your list.</li>
        <li><B>Import SQL</B> — opens a modal where you can upload a <IC>.sql</IC> file or paste DDL code. Parses the SQL and creates a new project with the visual layout.</li>
        <li><B>Templates</B> — browse 11 pre-built schemas in the sidebar (SaaS, E-Commerce, Social Network, etc.). Click "Use" to clone one into a new project.</li>
        <li><B>Search</B> — filter projects by name using the search bar.</li>
        <li><B>Delete</B> — trash icon on each project card with a confirmation prompt. Permanent and irreversible.</li>
      </UL>
      <P>Each project has its own URL (<IC>/editor/[id]</IC>) where <IC>id</IC> is a Prisma-generated CUID. The dashboard sidebar shows your three most recently edited projects for quick access. Project names default to "Untitled Schema" and are editable by clicking the name in the editor toolbar.</P>
      <P>Projects are ordered by most recently updated first. The dashboard updates automatically when you create, rename, or delete a project.</P>

      <H3 id="authentication">Authentication</H3>
      <P>SchemaStudio supports three sign-in methods, all handled by NextAuth.js:</P>
      <UL>
        <li><B>Email + Password</B> — register at <IC>/register</IC>, sign in at <IC>/login</IC>. Passwords are hashed with bcrypt (12 salt rounds) before storage. Email addresses are case-insensitive and trimmed of whitespace. Minimum password length is 8 characters.</li>
        <li><B>GitHub OAuth</B> — click "Continue with GitHub" on the login page. On first sign-in, an account is automatically created using your GitHub email and display name. Subsequent sign-ins link to the same account.</li>
        <li><B>Google OAuth</B> — click "Continue with Google". Same auto-creation behavior as GitHub. Uses your Google email and profile name.</li>
      </UL>
      <P>Sessions use JWT tokens (not database sessions). The JWT contains your user ID, email, and name. Every server action and API route verifies the JWT and checks that the requesting user owns the project they're trying to access. There is no admin role or team functionality.</P>
      <Callout type="warning" title="Account linking"><p>If you register with email/password and later try to sign in with GitHub or Google using the same email, you'll see an error telling you which provider to use. Accounts are <B>not</B> automatically linked across providers. Use the same method you signed up with.</p></Callout>
      <Callout type="info" title="No password reset"><p>There is no password reset flow in the current version. If you forget your email/password credentials, sign in with GitHub or Google instead (if you used one of those initially, or register a new account).</p></Callout>

      <H3 id="sandbox-vs-cloud">Sandbox vs cloud</H3>
      <P>SchemaStudio has two operating modes depending on whether you're signed in:</P>
      <RefTable headers={["Feature", "Sandbox (/editor)", "Cloud (/editor/[id])"]} rows={[
        ["Authentication", "Not required", "Required (email, GitHub, Google)"],
        ["Data storage", "Browser memory only", "Neon PostgreSQL database"],
        ["Auto-save", "No — lost on tab close or refresh", "Yes — saves after a few seconds of inactivity"],
        ["Version history", "Not available", "Up to 30 snapshots per project"],
        ["AI Architect", "Disabled (requires sign-in)", "Fully available"],
        ["Export", "Available (works on in-memory data)", "Available"],
        ["Import SQL", "Available (loads into memory only)", "Available (saved to database)"],
        ["URL", "Always /editor (no project ID)", "Unique per project: /editor/[id]"],
        ["Project name", "Fixed as \"Untitled\"", "Editable in toolbar"],
        ["Dashboard access", "Not available", "Full project list"],
      ]} />
      <P>The sandbox is useful for quick experiments, demos, or trying the tool before signing up. For anything you want to keep, sign in and work in cloud mode. You cannot migrate a sandbox session to a cloud project — you'd need to export the schema and import it into a new project.</P>

      {/* ══════════ VISUAL EDITOR ══════════ */}
      <H2 id="canvas-controls">Canvas controls</H2>
      <P>The editor is an infinite canvas powered by <B>React Flow</B>. It handles panning, zooming, node dragging, edge drawing, and selection natively. SchemaStudio plugs custom <IC>TableNode</IC> and <IC>RelationEdge</IC> renderers into React Flow's node/edge system.</P>
      <RefTable headers={["Action", "Desktop", "Mobile / Tablet"]} rows={[
        ["Pan the canvas", "Drag the background", "Drag with one finger on background"],
        ["Zoom in / out", "Scroll wheel", "Pinch gesture"],
        ["Zoom to fit all tables", "Fit-view button (bottom-right)", "Fit-view button"],
        ["Select a table", "Click the node", "Tap the node"],
        ["Multi-select tables", "Drag a selection rectangle on background", "Not available on touch"],
        ["Move a table", "Drag the table node header", "Long-press then drag"],
        ["Connect columns", "Drag from column handle to another", "Drag from handle (larger on mobile: 12×12px)"],
        ["Delete selected", "Backspace or Delete key", "Use sidebar trash icon"],
        ["Undo / Redo", "Ctrl+Z / Ctrl+Shift+Z (⌘ on Mac)", "Not available via keyboard"],
        ["Deselect all", "Escape key or click background", "Tap background"],
      ]} />
      <P>The <B>minimap</B> in the top-right corner shows a bird's-eye overview. Click and drag inside it to navigate large schemas instantly. It's hidden on mobile viewports to save space.</P>
      <P>The <B>controls panel</B> in the bottom-right offers zoom-in (+), zoom-out (−), fit-view, and toggle-interactivity buttons. On mobile, these buttons are larger for touch targets.</P>

      <H3 id="table-node-anatomy">Table node anatomy</H3>
      <P>Each table on the canvas is rendered as a card with the following structure:</P>
      <UL>
        <li><B>Header bar</B> — colored strip at the top showing the table name in bold. Background turns blue (<IC>bg-blue-500</IC>) when the table is selected, gray otherwise. The table name is not editable directly on the node — click to select, then edit in the sidebar.</li>
        <li><B>Column rows</B> — each row shows: the column name (left-aligned), the data type as an uppercase badge (e.g. "UUID", "VARCHAR"), and optional constraint indicators. A gold key icon (<IC>🔑</IC>) appears for primary keys. A blue "UQ" badge appears for unique columns. Both can be present simultaneously.</li>
        <li><B>Connection handles</B> — invisible by default, they appear on hover as small vertical pills (6×20px, 12×12px on mobile) on the left and right edges of each column row. Left handles are <IC>target</IC> type (incoming foreign keys), right handles are <IC>source</IC> type (outgoing foreign keys). Handles glow blue when a connection drag is in progress nearby.</li>
      </UL>
      <P>Table nodes have a minimum width of ~220px and grow to fit longer column names. The entire node is wrapped in <IC>React.memo()</IC> with Immer's structural sharing — it only re-renders when its specific table data changes in the Zustand store, not when other tables are dragged or edited. This means dragging one table across a canvas of 50 tables causes zero re-renders on the other 49.</P>
      <P>The node also has a subtle <IC>transition-shadow</IC> animation — the box shadow intensifies when hovered and changes color when selected, providing visual feedback without the performance cost of <IC>transition-all</IC>.</P>

      <H3 id="creating-tables">Creating tables</H3>
      <P>Four ways to add tables to the canvas:</P>
      <UL>
        <li><B>Toolbar → Add Table</B> — creates a table named <IC>new_table</IC> with one column: <IC>id UUID PRIMARY KEY</IC>. Placed at a random position near the current viewport center so it's immediately visible.</li>
        <li><B>AI Architect</B> — describe your application in the text bar at the bottom. The AI generates all tables with appropriate columns, data types, primary keys, and foreign key relationships, laid out automatically in a grid.</li>
        <li><B>Import SQL</B> — paste <IC>CREATE TABLE</IC> DDL statements. Each statement becomes a table node. Foreign key references become visual edges. Tables are positioned in a 3-column grid (300px apart).</li>
        <li><B>Templates</B> — clone one of 11 pre-built schemas from the dashboard. Each template includes fully defined tables with realistic columns and all relationships.</li>
      </UL>
      <P>When the canvas is empty, a prominent <B>empty state</B> screen appears with three options front and center: a large AI input field ("Describe your database schema..."), an "Add Blank Table" button, a "Browse Templates" button, and an "Import SQL" button. The empty state disappears as soon as the first table is added.</P>

      <H3 id="editing-columns">Editing columns</H3>
      <P>Click any table node to select it and open the <B>floating sidebar</B> on the left side of the canvas (desktop) or as a bottom sheet covering ~60% of the screen (mobile). The sidebar shows everything about the selected table. For each column you can:</P>
      <UL>
        <li><B>Rename</B> — click the column name input field and type. The canvas node updates in real time (no save button needed — reactive binding via Zustand). Column names are not validated for SQL compatibility, so use snake_case by convention.</li>
        <li><B>Change type</B> — use the dropdown to select from the 8 supported types: <IC>UUID</IC>, <IC>VARCHAR</IC>, <IC>TEXT</IC>, <IC>INT</IC>, <IC>FLOAT</IC>, <IC>BOOLEAN</IC>, <IC>DATE</IC>, <IC>JSON</IC>. The change is instant — the type badge on the canvas node updates immediately.</li>
        <li><B>Toggle PK</B> — click the key icon to mark/unmark as primary key. A gold key icon appears on the canvas node. Only one column per table should be PK (the tool doesn't enforce this — it's your responsibility).</li>
        <li><B>Toggle UQ</B> — click the "UQ" button to add/remove a unique constraint. A blue "UQ" badge appears on the canvas. Can coexist with PK (though redundant since PKs are inherently unique).</li>
        <li><B>Reorder</B> — grab the grip handle (⠿ icon, visible on hover to the left of the name) and drag vertically. A blue indicator line shows the exact insertion position. Internally this calls <IC>reorderColumns()</IC> on the Zustand store.</li>
        <li><B>Delete</B> — click the ✕ icon (visible on hover). If the column has a relationship attached, the relationship is automatically removed too — a FK cannot exist without both its source and target columns.</li>
      </UL>
      <P>To add a new column, click the <B>+ Add Column</B> button at the bottom of the columns list. New columns default to <IC>new_column</IC> with type <IC>VARCHAR</IC>. Click the name to immediately rename it.</P>
      <Callout type="tip" title="Stable IDs"><p>Relationships are tracked by internal column IDs (e.g. <IC>c_a7x9k2</IC>), not by column names, types, or positions. You can safely rename a column from <IC>user_name</IC> to <IC>username</IC>, change its type from VARCHAR to TEXT, or drag it to a different position — all existing relationship connections remain intact.</p></Callout>

      <H3 id="sidebar-anatomy">Sidebar anatomy</H3>
      <P>The floating sidebar has four distinct sections from top to bottom:</P>
      <UL>
        <li><B>Header</B> — "Table Properties" label, a red trash icon to delete the entire table (with all its columns and relationships), and an editable table name input field. Changing the name here updates the table header on the canvas in real time.</li>
        <li><B>Columns list</B> — scrollable area with all columns in their current order. Each column row has: a drag grip handle (⠿), a name input, a type dropdown, PK toggle button, UQ toggle button, and a delete ✕ button. The PK and UQ buttons highlight when active.</li>
        <li><B>Relationships section</B> — collapsible via a chevron. Lists every relation where this table is the source or target. Each entry shows: a type badge (1:1 / 1:n / m:n, clickable to cycle through types), the connected table name, a direction arrow (→ for outgoing FKs where this table is the source, ← for incoming), the source and target column names, and a delete ✕ button.</li>
        <li><B>Footer</B> — "+ Add Column" button, always visible at the bottom.</li>
      </UL>
      <P>On desktop, the sidebar floats on the left side of the canvas (~320px wide), vertically centered, with a subtle shadow. On mobile, it appears as a bottom sheet with a pull-down handle. Click outside the sidebar (on the canvas background) or press <Kbd>Escape</Kbd> to close it.</P>
      <P>The sidebar itself is memoized — individual <IC>ColumnRow</IC> components only re-render when their specific column data changes, not when other columns in the same table are edited.</P>

      <H3 id="bulk-operations">Bulk operations</H3>
      <P>Drag a selection rectangle on the canvas background to select multiple tables at once. Selected tables show a blue border highlight. A floating <B>bulk actions toolbar</B> appears at the top center of the canvas:</P>
      <UL>
        <li><B>Selection count</B> — badge showing "N selected" (e.g. "5 selected").</li>
        <li><B>All</B> button — selects every table on the canvas in one click.</li>
        <li><B>Delete</B> button — removes all selected tables and every relationship connected to any of them. This creates a <B>single undo entry</B> in the Immer patch stack, so <Kbd>Ctrl+Z</Kbd> restores all deleted tables and relations at once — not one at a time.</li>
        <li><B>Keyboard hints</B> — shows <Kbd>⌫</Kbd> Delete · <Kbd>Esc</Kbd> Clear.</li>
      </UL>
      <P>The toolbar appears only when 2+ tables are selected. It hides when the selection drops to 0 or 1. Press <Kbd>Escape</Kbd> to clear the multi-selection.</P>

      {/* ══════════ RELATIONSHIPS ══════════ */}
      <H2 id="drawing-relations">Drawing relationships</H2>
      <P>Hover over any column row in a table node to reveal the <B>connection handles</B> — small vertical pills on the left (target/incoming) and right (source/outgoing) edges. Drag from a source handle on one table to a target handle on a different table to create a foreign key relationship.</P>
      <P>You can drag from either side — left or right. SchemaStudio determines the relationship direction from which table initiated the connection (source) and which received it (target). The edge renders as an animated dashed line with a smoothstep curve that avoids overlapping nodes.</P>
      <P>New relationships always default to <IC>1:n</IC> (one-to-many). You can change the type after creation by clicking the type badge on the edge.</P>
      <Callout type="info" title="Self-referencing tables"><p>You cannot connect a table to itself. The canvas does not support self-loop edges. If you need a self-referencing FK (e.g. a <IC>parent_id</IC> column in a <IC>categories</IC> table), add the column manually in the sidebar and handle the self-reference in your exported code.</p></Callout>

      <H3 id="relation-types">Relation types</H3>
      <P>Every relationship has a cardinality type that directly affects how the code is exported:</P>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {[
          { type: "1:1", name: "One-to-one", example: "User → Profile", desc: "Each row in A maps to exactly one row in B. The FK column gets a UNIQUE constraint in SQL exports. In Prisma, the FK field gets @unique. Use for exclusive ownership: user profile, user settings, product details.", color: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300" },
          { type: "1:n", name: "One-to-many", example: "User → Posts", desc: "One row in A relates to many rows in B. Standard FK with no unique constraint. The most common type in real schemas. Default for new connections. Use for: posts by user, orders by customer, comments on post.", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300" },
          { type: "m:n", name: "Many-to-many", example: "Students ↔ Courses", desc: "Multiple rows in A relate to multiple rows in B. SQL exports generate a junction table. Prisma uses implicit m:n arrays. Use for: tags on posts, students in courses, permissions for roles.", color: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300" },
        ].map((r) => (
          <div key={r.type} className={`p-4 rounded-xl border ${r.color}`}>
            <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold uppercase tracking-widest">{r.type}</span><span className="text-xs opacity-70">{r.name}</span></div>
            <p className="text-[13px] font-semibold mb-1">{r.example}</p>
            <p className="text-xs opacity-80 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <H3 id="relation-export-behavior">Export behavior per relation type</H3>
      <P>The cardinality you choose directly affects the generated code. Here's the exact output for each type in PostgreSQL (the most explicit format):</P>
      <P><B>1:1</B> — standard FK constraint plus a UNIQUE constraint on the FK column, ensuring one-to-one exclusivity:</P>
      <CodeBlock lang="sql" filename="1:1 — PostgreSQL output" code={`-- profiles.user_id → users.id (1:1)
ALTER TABLE "profiles"
  ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
-- UNIQUE ensures each user has at most one profile
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_user_id_unique" UNIQUE ("user_id");`} />
      <P><B>1:n</B> — standard FK constraint only (no unique, allowing many rows to reference the same parent):</P>
      <CodeBlock lang="sql" filename="1:n — PostgreSQL output" code={`-- posts.user_id → users.id (1:n)
ALTER TABLE "posts"
  ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");`} />
      <P><B>m:n</B> — auto-generated junction table with two FKs and a composite primary key:</P>
      <CodeBlock lang="sql" filename="m:n — PostgreSQL output" code={`-- Auto-generated junction table for students ↔ courses
CREATE TABLE "students_courses" (
  "students_id" UUID,
  "courses_id" UUID,
  PRIMARY KEY ("students_id", "courses_id"),
  FOREIGN KEY ("students_id") REFERENCES "students" ("id"),
  FOREIGN KEY ("courses_id") REFERENCES "courses" ("id")
);`} />
      <P>In <B>Prisma</B>, m:n relationships use implicit many-to-many — both models get array fields and Prisma auto-generates the join table internally. No junction model appears in your <IC>.prisma</IC> file.</P>
      <P>In <B>Mongoose</B>, m:n is not directly representable. The FK column exports as a standard <IC>ObjectId</IC> ref. You'll need to add array fields manually in your Mongoose schema for true bidirectional m:n.</P>

      <H3 id="managing-relations">Managing relationships</H3>
      <P>There are two places to manage relationships — both offer the same actions:</P>
      <P><B>On the canvas edge itself:</B></P>
      <UL>
        <li><B>Click the type badge</B> (e.g. "1:n" text at the midpoint) to cycle: <IC>1:n</IC> → <IC>m:n</IC> → <IC>1:1</IC> → <IC>1:n</IC>. The badge updates instantly.</li>
        <li><B>Click the ✕ button</B> next to the badge to delete the relationship permanently.</li>
        <li><B>Select the edge</B> by clicking it (it turns red with a glow effect), then press <Kbd>Delete</Kbd> or <Kbd>Backspace</Kbd>.</li>
      </UL>
      <P><B>In the sidebar (when a table is selected):</B></P>
      <UL>
        <li>The collapsible <B>Relationships</B> section lists all relations where the selected table is involved (either as source or target).</li>
        <li>Each entry shows: the type badge (clickable to cycle), the connected table name (resolved from the store via <IC>getState()</IC> to avoid reactive subscriptions), a direction arrow, and a delete button.</li>
        <li>Clicking cycle or delete here has the same effect as clicking on the canvas edge.</li>
      </UL>

      {/* ══════════ DATA TYPES ══════════ */}
      <H2 id="type-reference">Data types — mapping table</H2>
      <P>SchemaStudio supports 8 column types. Each maps to the appropriate native type in every export format. Here is the complete cross-format mapping:</P>
      <RefTable headers={["Type", "PostgreSQL", "MySQL", "SQLite", "Prisma", "Mongoose"]} rows={[
        ["UUID", "UUID", "VARCHAR(36)", "TEXT", "String @default(uuid())", "String"],
        ["VARCHAR", "VARCHAR(255)", "VARCHAR(255)", "TEXT", "String", "String"],
        ["TEXT", "TEXT", "TEXT", "TEXT", "String", "String"],
        ["INT", "INT", "INT", "INTEGER", "Int", "Number"],
        ["FLOAT", "FLOAT", "FLOAT", "REAL", "Float", "Number"],
        ["BOOLEAN", "BOOLEAN", "BOOLEAN", "INTEGER", "Boolean", "Boolean"],
        ["DATE", "DATE", "DATE", "TEXT", "DateTime", "Date"],
        ["JSON", "JSON", "JSON", "TEXT", "Json", "Schema.Types.Mixed"],
      ]} />

      <H3 id="type-guidance">When to use which type</H3>
      <P>A practical guide for choosing the right type for common real-world columns:</P>
      <RefTable headers={["Type", "Best for", "Avoid when"]} rows={[
        ["UUID", "Primary keys, foreign keys, unique identifiers, API tokens", "You need auto-incrementing integers or human-readable sequential IDs"],
        ["VARCHAR", "Short text: names, emails, slugs, URLs, phone numbers, status strings", "Content is frequently > 255 chars (use TEXT)"],
        ["TEXT", "Long text: descriptions, blog posts, markdown, JSON strings, notes", "You need indexing on the full value (use VARCHAR for indexed short columns)"],
        ["INT", "Counts, quantities, ages, prices in cents, years, foreign keys (non-UUID)", "You need decimal precision (use FLOAT) or values > 2.1 billion"],
        ["FLOAT", "Prices with decimals, ratings (4.5/5), coordinates, percentages", "You need exact decimal math (financial: use DECIMAL in production, not available here)"],
        ["BOOLEAN", "Feature flags, is_active, is_deleted, is_verified, toggles", "You need more than true/false states (use VARCHAR with enum-like values)"],
        ["DATE", "Timestamps: created_at, updated_at, birth dates, expiry dates", "You need timezone-aware timestamps (add TZ handling in application code)"],
        ["JSON", "Flexible/nested data: settings, metadata, tags arrays, addresses, feature flags", "The data has a fixed structure that should be normalized into separate columns"],
      ]} />
      <Callout type="info" title="Type limitations"><p>SchemaStudio does not support DECIMAL, BIGINT, SMALLINT, TIMESTAMP WITH TIME ZONE, ENUM, ARRAY, SERIAL, or custom composite types. These need to be adjusted manually after exporting. The 8 supported types cover the vast majority of schema design use cases.</p></Callout>

      {/* ══════════ AI ARCHITECT ══════════ */}
      <H2 id="generating-schemas">Generating schemas with AI</H2>
      <P>The AI Architect bar sits at the bottom of the canvas — full-width on desktop, or behind a floating ✨ button on mobile that opens a modal. Type a description of your application and press Enter or click Generate.</P>
      <P>The AI creates tables with appropriate column names, data types, primary keys, and foreign key relationships — all positioned automatically on the canvas in a grid layout (300px horizontal spacing, 400px vertical, wrapping after 3 columns).</P>
      <Callout type="info" title="Authentication required"><p>The AI Architect requires sign-in. In sandbox mode (<IC>/editor</IC>) the input field is disabled and shows a "Sign in to use AI" message with a link to the login page.</p></Callout>

      <H3 id="modifying-schemas">Modifying existing schemas</H3>
      <P>If tables already exist on the canvas, the AI receives your entire current schema as context alongside your new prompt. This means you can make incremental, targeted changes without the AI wiping your existing work:</P>
      <CodeBlock lang="text" filename="prompt — adding tables" code={`"Add a payments table linked to orders, with stripe_payment_id, amount, currency, and status"`} />
      <CodeBlock lang="text" filename="prompt — modifying columns" code={`"Rename the 'users' table to 'accounts' and add a 'role' column with type VARCHAR"`} />
      <CodeBlock lang="text" filename="prompt — simplifying" code={`"Remove the audit_logs and webhook_events tables — this is just an MVP"`} />
      <CodeBlock lang="text" filename="prompt — changing relations" code={`"Make the tags relationship with posts many-to-many instead of one-to-many"`} />
      <P>The AI preserves existing table/column internal IDs and positions so the canvas doesn't jump or break. Only the requested changes are applied.</P>

      <H3 id="ai-internals">How it works internally</H3>
      <P>When you press Generate, the following 5-step pipeline executes:</P>
      <Steps steps={[
        { title: "Client-side prompt sanitization", desc: "Your prompt text is trimmed to 2,000 characters maximum. Empty prompts are rejected before the network request." },
        { title: "Schema context sanitization", desc: "If tables exist on the canvas, they're deep-sanitized before being sent as context: table names are stripped to alphanumeric + underscores (max 64 chars), column types are whitelisted against the 8 supported types (unknown types become VARCHAR), relation types are validated (must be 1:1, 1:n, or m:n), and the entire payload is capped at 100 tables with 50 columns each. This prevents prompt injection via malicious table or column names." },
        { title: "Server action calls Gemini", desc: "The generateSchema() server action sends the sanitized prompt + schema context to Google Gemini 2.5 Flash. The system instruction constrains the model to output only SchemaStudio-compatible JSON: {tables: [{id, name, position, columns: [{id, name, type, primaryKey, unique}]}], relations: [{id, sourceTableId, sourceColumnId, targetTableId, targetColumnId, type}]}. The responseMimeType is set to 'application/json' for structured output." },
        { title: "Response parsing", desc: "The JSON response is stripped of any markdown code fences (```json...```) and parsed with JSON.parse(). If parsing fails (malformed JSON), a user-friendly error message is shown: \"AI failed to generate schema. Try a simpler prompt.\"" },
        { title: "Schema application", desc: "The parsed result is passed to setSchema() in the Zustand store, which replaces the entire canvas state (tables + relations). The undo/redo stack is cleared — you cannot Ctrl+Z an AI generation. Use version history snapshots to recover if the output isn't what you wanted." },
      ]} />

      <H3 id="prompting-tips">Prompting tips</H3>
      <P>The quality of the generated schema depends heavily on how specific your prompt is. These patterns consistently produce the best results:</P>
      <div className="space-y-3 my-5">
        {[
          { label: "Name entities explicitly", good: "A gym system with members, memberships (with start/end dates, plan tier), classes, schedules, and instructors", bad: "A gym app" },
          { label: "Describe relationships in plain English", good: "Members can book multiple classes. Each class has one instructor. Memberships belong to one member.", bad: "Make it work with classes and stuff" },
          { label: "Specify important columns and their types", good: "Orders should have status (VARCHAR), total_amount_cents (INT), currency (VARCHAR), and stripe_checkout_id (VARCHAR)", bad: "Add orders" },
          { label: "Request specific cardinalities", good: "Users have one profile (1:1). Users write many posts (1:n). Posts can have many tags and tags belong to many posts (m:n).", bad: "Connect everything together" },
          { label: "Give scale hints", good: "A simple blog with 5-6 tables: users, posts, comments, tags, categories. Keep it minimal — no analytics.", bad: "Build me a complete blogging platform" },
        ].map((tip) => (
          <div key={tip.label} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{tip.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-start gap-2 text-xs"><span className="text-emerald-500 mt-0.5 shrink-0">✓</span><span className="text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">{tip.good}</span></div>
              <div className="flex items-start gap-2 text-xs"><span className="text-red-400 mt-0.5 shrink-0">✗</span><span className="text-zinc-500 font-mono leading-relaxed">{tip.bad}</span></div>
            </div>
          </div>
        ))}
      </div>

      <H3 id="ai-limitations">AI limitations</H3>
      <UL>
        <li>Column types may be suboptimal — e.g. <IC>VARCHAR</IC> where <IC>INT</IC> fits better, or <IC>TEXT</IC> where <IC>JSON</IC> is more appropriate. Always review the output and adjust types manually.</li>
        <li>Relationship cardinalities often default to <IC>1:n</IC> even when <IC>m:n</IC> or <IC>1:1</IC> would be semantically correct. Click the type badge on each edge to verify and fix.</li>
        <li>Very complex prompts (10+ entities with detailed column lists) may produce incomplete schemas — the model has a context window and may truncate. Break large schemas into multiple prompts: generate core tables first, then add secondary tables in a follow-up.</li>
        <li>Cannot generate CHECK constraints, DEFAULT values, ENUMs, triggers, indexes, views, stored procedures, computed columns, or partial indexes. These must be added manually after export.</li>
        <li>Table positioning is formulaic (grid layout, 3 per row). The AI doesn't optimize for visual clarity or logical grouping — you'll want to manually drag related tables closer together.</li>
        <li>Column ordering follows the AI's preference, which may not match your team's conventions (e.g. id first, timestamps last). Use the sidebar drag-reorder to adjust.</li>
        <li><IC>setSchema()</IC> replaces the entire canvas and <B>clears the undo stack</B>. Always save a version snapshot before using AI on a schema you've invested time in. You cannot Ctrl+Z an AI generation.</li>
      </UL>

      {/* ══════════ TEMPLATES ══════════ */}
      <H2 id="templates">Templates</H2>
      <P>The template gallery provides 11 pre-built, production-grade schemas covering common application architectures. Each includes realistic columns with appropriate types (not just <IC>id</IC> and <IC>name</IC>) and all necessary foreign key relationships:</P>
      <RefTable headers={["Template", "Tables", "Relations", "Category"]} rows={[
        ["SaaS Multi-Tenant", "12", "17", "B2B"],
        ["E-Commerce Store", "12", "14", "Retail"],
        ["Social Network", "12", "14", "Social"],
        ["Healthcare System", "10", "17", "Health"],
        ["CRM System", "10", "14", "B2B"],
        ["Learning Management", "11", "14", "Education"],
        ["Hotel Reservation", "6", "8", "Travel"],
        ["Kanban Board", "10", "11", "Productivity"],
        ["Food Delivery", "8", "12", "Retail"],
        ["Payment System", "6", "9", "Finance"],
        ["Blog & CMS", "9", "9", "Content"],
      ]} />
      <P>Click <B>Use</B> on any template card to create a new project. The schema is fully cloned — your copy is independent and editable. Templates are accessible from the <B>Templates</B> link in the dashboard sidebar.</P>

      {/* ══════════ SQL IMPORT ══════════ */}
      <H2 id="import-usage">SQL import</H2>
      <P>Two entry points for importing existing SQL schemas:</P>
      <UL>
        <li><B>Dashboard → Import SQL</B> — opens a modal. Upload a <IC>.sql</IC> file or paste DDL. Creates a <B>new project</B> named after the file or "Imported Schema".</li>
        <li><B>Editor → Empty State or toolbar</B> — replaces the <B>current canvas</B>. Destructive if the canvas already has content.</li>
      </UL>
      <CodeBlock lang="sql" filename="example — full import" code={`CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  body TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  view_count INT DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`} />

      <H3 id="import-supported">Supported syntax</H3>
      <UL>
        <li>Table names from <IC>CREATE TABLE</IC> and <IC>CREATE TABLE IF NOT EXISTS</IC> statements.</li>
        <li>Quoted identifiers: backticks (<IC>`users`</IC>) and double quotes (<IC>"users"</IC>) are both handled.</li>
        <li>Column names and data types — mapped to the closest SchemaStudio type (see mapping below).</li>
        <li>Inline <IC>PRIMARY KEY</IC> constraint on individual columns.</li>
        <li>Inline <IC>UNIQUE</IC> constraint on individual columns.</li>
        <li><IC>FOREIGN KEY (column) REFERENCES table(column)</IC> clauses inside CREATE TABLE → drawn as <IC>1:n</IC> relationship edges.</li>
        <li>SQL comments — single-line (<IC>--</IC>) and multi-line (<IC>/* */</IC>) are stripped before parsing.</li>
      </UL>
      <P>Tables are auto-positioned in a grid layout: 300px horizontal spacing, starting at x=100. After 3 tables per row (at x=900), the layout wraps to a new row at y+400.</P>

      <H3 id="import-type-mapping">Type mapping</H3>
      <P>The parser maps SQL types to SchemaStudio types using case-insensitive prefix matching:</P>
      <RefTable headers={["SQL type (contains)", "Mapped to"]} rows={[
        ["UUID", "UUID"],
        ["INT, INTEGER, SMALLINT, BIGINT, TINYINT, SERIAL", "INT"],
        ["VARCHAR, CHAR, CHARACTER, TEXT, CLOB", "TEXT"],
        ["BOOL, BOOLEAN", "BOOLEAN"],
        ["DATE, TIME, TIMESTAMP, DATETIME", "DATE"],
        ["JSON, JSONB", "JSON"],
        ["FLOAT, REAL, DOUBLE, DECIMAL, NUMERIC, MONEY", "FLOAT"],
        ["Everything else (BLOB, BINARY, etc.)", "VARCHAR"],
      ]} />

      <H3 id="import-limitations">Import limitations</H3>
      <UL>
        <li><IC>NOT NULL</IC>, <IC>DEFAULT</IC>, <IC>CHECK</IC>, <IC>INDEX</IC>, and <IC>ON DELETE/UPDATE CASCADE</IC> are <B>not preserved</B> — only PK, UQ, and FK constraints are captured.</li>
        <li><IC>ALTER TABLE ... ADD FOREIGN KEY</IC> statements (outside CREATE TABLE) are <B>not parsed</B>. Foreign keys must be inline within the CREATE TABLE block.</li>
        <li>Composite primary keys (<IC>PRIMARY KEY (col_a, col_b)</IC>) are not supported — only single-column PKs are captured.</li>
        <li><IC>ENUM</IC> types are mapped to <IC>VARCHAR</IC>. The enum values are lost.</li>
        <li>Self-referencing FKs (e.g. <IC>parent_id REFERENCES categories(id)</IC>) are parsed but the canvas cannot render self-loops — the relation is created internally but no visual edge appears.</li>
        <li>Table and column name casing is preserved as-is from the SQL source.</li>
      </UL>
      <Callout type="warning" title="Overwrite behavior"><p>Importing into an existing editor canvas <B>replaces everything</B> — all tables and relations are removed first. Save a version snapshot before importing. Dashboard imports always create a new project and are non-destructive.</p></Callout>

      {/* ══════════ CODE EXPORT ══════════ */}
      <H2 id="export-formats">Supported export formats</H2>
      <P>Click <B>Export</B> in the toolbar to open the export modal. Select a format tab along the top, review the generated code, then copy to clipboard or download as a file. If no tables exist, the modal shows an "Add tables first" message.</P>
      <RefTable headers={["Format", "Ext", "Key details"]} rows={[
        ["PostgreSQL", ".sql", "CREATE TABLE + ALTER TABLE for FKs. 1:1 adds UNIQUE constraint. m:n generates junction table. Double-quoted identifiers."],
        ["MySQL", ".sql", "UUID → VARCHAR(36). Named FK constraints (fk_source_target). Backtick-quoted identifiers."],
        ["SQLite", ".sql", "PRAGMA foreign_keys = ON. FKs inline in CREATE TABLE (SQLite requirement). Types mapped: UUID→TEXT, BOOLEAN→INTEGER, DATE→TEXT."],
        ["Prisma ORM", ".prisma", "Full schema with generator + datasource blocks. @relation, @id, @unique, @default(uuid()). m:n = implicit arrays on both sides. 1:1 = @unique on FK field."],
        ["Mongoose (TS)", ".ts", "TypeScript interfaces (ITableName extends Document) + typed Schema definitions. ObjectId refs for FK columns. timestamps: true on all schemas."],
        ["Mongoose (JS)", ".js", "CommonJS require('mongoose'). module.exports for each model. Same ObjectId ref pattern as TS version."],
      ]} />

      <H3 id="export-examples">Output examples</H3>
      <P>Given <IC>users</IC> (id UUID PK, email VARCHAR UQ, name VARCHAR) with a <IC>1:n</IC> relation to <IC>posts</IC> (id UUID PK, user_id UUID, title VARCHAR, body TEXT):</P>
      <CodeBlock lang="sql" filename="PostgreSQL" code={`CREATE TABLE "users" (
  "id" UUID PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "name" VARCHAR(255)
);

CREATE TABLE "posts" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID,
  "title" VARCHAR(255),
  "body" TEXT
);

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id")
  REFERENCES "users" ("id");`} />
      <CodeBlock lang="sql" filename="MySQL" code={`CREATE TABLE \`users\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`email\` VARCHAR(255) UNIQUE,
  \`name\` VARCHAR(255)
);

CREATE TABLE \`posts\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36),
  \`title\` VARCHAR(255),
  \`body\` TEXT
);

ALTER TABLE \`posts\` ADD CONSTRAINT \`fk_posts_users\`
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`);`} />
      <CodeBlock lang="sql" filename="SQLite" code={`PRAGMA foreign_keys = ON;

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "name" TEXT
);

CREATE TABLE "posts" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT,
  "title" TEXT,
  "body" TEXT,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);`} />
      <CodeBlock lang="prisma" filename="schema.prisma" code={`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL_UNPOOLED")
}

model users {
  id    String @id @default(uuid())
  email String @unique
  name  String
  posts posts[]
}

model posts {
  id      String @id @default(uuid())
  user_id String
  title   String
  body    String
  users   users  @relation(fields: [user_id], references: [id])
}`} />
      <CodeBlock lang="typescript" filename="Mongoose — TypeScript" code={`import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUsers extends Document {
  email: string;
  name: string;
}

const UsersSchema: Schema = new Schema({
  email: { type: String, unique: true },
  name: { type: String },
}, { timestamps: true });

export const Users = mongoose.models.Users
  || mongoose.model<IUsers>('Users', UsersSchema);

export interface IPosts extends Document {
  user_id: Types.ObjectId;
  title: string;
  body: string;
}

const PostsSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'Users' },
  title: { type: String },
  body: { type: String },
}, { timestamps: true });

export const Posts = mongoose.models.Posts
  || mongoose.model<IPosts>('Posts', PostsSchema);`} />
      <CodeBlock lang="javascript" filename="Mongoose — JavaScript" code={`const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String },
}, { timestamps: true });

module.exports.Users = mongoose.model('Users', UsersSchema);

const PostsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  title: { type: String },
  body: { type: String },
}, { timestamps: true });

module.exports.Posts = mongoose.model('Posts', PostsSchema);`} />

      <H3 id="export-m2m">Many-to-many export output</H3>
      <P>When a <IC>m:n</IC> relationship exists (e.g. <IC>students ↔ courses</IC>), the output differs significantly by format:</P>
      <P><B>SQL (PostgreSQL/MySQL)</B> — generates an explicit junction table:</P>
      <CodeBlock lang="sql" filename="m:n — junction table" code={`CREATE TABLE "students_courses" (
  "students_id" UUID,
  "courses_id" UUID,
  PRIMARY KEY ("students_id", "courses_id"),
  FOREIGN KEY ("students_id") REFERENCES "students" ("id"),
  FOREIGN KEY ("courses_id") REFERENCES "courses" ("id")
);`} />
      <P><B>Prisma</B> — uses implicit many-to-many (no junction model in the schema file):</P>
      <CodeBlock lang="prisma" filename="m:n — Prisma" code={`model students {
  id        String    @id @default(uuid())
  name      String
  courses   courses[]
}

model courses {
  id        String    @id @default(uuid())
  title     String
  students  students[]
}`} />
      <P><B>Mongoose</B> — m:n is not directly representable with ObjectId refs. The FK column exports as a standard single ref. You'll need to manually convert it to an array field (<IC>[&#123; type: Schema.Types.ObjectId, ref: 'Courses' &#125;]</IC>) for true m:n behavior.</P>

      {/* ══════════ VERSION HISTORY ══════════ */}
      <H2 id="version-history">Version history</H2>
      <P>The version history panel lets you save named snapshots and restore previous states. Open from the <B>History</B> button in the editor toolbar — the panel slides in from the right side.</P>
      <P>Each snapshot captures the <B>full schema state</B>: every table (name, position, all columns with types and constraints) and every relationship (source, target, cardinality type).</P>
      <UL>
        <li><B>Save Current Version</B> — creates a snapshot labeled "Manual snapshot" with the current timestamp. You can save as many as you want up to the limit.</li>
        <li><B>Restore</B> — two-click safety process. First click shows an amber "Confirm?" button. Second click performs the actual restore. <B>Before restoring, the system automatically saves your current state</B> as a "Before restoring [snapshot label]" snapshot, so you can always undo a restore by restoring the auto-saved "Before..." snapshot.</li>
        <li><B>Delete</B> — hover over a snapshot to reveal the delete button. Removes the snapshot permanently.</li>
      </UL>
      <P>Limits and behavior: up to <B>30 snapshots</B> per project. When the limit is reached, the oldest snapshot is automatically pruned. Auto-snapshots (created by the system before AI generation) are throttled to at most one every 5 minutes to prevent spam.</P>
      <P>The panel shows relative timestamps that update as you view them — "2m ago", "3h ago", "5d ago". Snapshots older than 7 days show the full date.</P>
      <Callout type="tip" title="Recovery strategy"><p>Save a snapshot before: (1) using the AI Architect, (2) importing SQL, (3) bulk-deleting tables. These three operations can most dramatically change your schema and are not fully undoable via Ctrl+Z.</p></Callout>

      {/* ══════════ AUTO-SAVE ══════════ */}
      <H2 id="auto-save">Auto-save behavior</H2>
      <P>In authenticated mode (<IC>/editor/[id]</IC>), your schema is automatically saved to the Neon database after a short period of inactivity. Here's the exact flow:</P>
      <Steps steps={[
        { title: "State change detected", desc: "Any mutation to the Zustand store (table add/delete, column rename/retype/reorder, position change after drag, relation create/delete/type-change, project name edit) triggers the auto-save debounce timer." },
        { title: "Debounce period", desc: "The timer waits for ~1.5 seconds of inactivity. If another change occurs during this window, the timer resets. This prevents saving mid-drag (which fires 60 position updates per second) or mid-typing. Only the final state after you stop interacting gets saved." },
        { title: "Snapshot comparison", desc: "After the quiet period, the current schema state is JSON-serialized (tables + relations + project name) and compared by string equality to the last saved snapshot. If identical, no database write occurs — zero wasted queries." },
        { title: "Server action execution", desc: "If data changed, the updateSchema() server action is called. It validates with Zod: table/column structure, name lengths, relation integrity, and total payload ≤ 5MB. It verifies project ownership via the JWT session. Then it writes a single UPDATE query to the Neon database." },
        { title: "UI feedback", desc: "The toolbar cloud icon shows three states: idle (cloud), saving (spinning), saved (green checkmark ✓). If the save fails (network error, validation error), it retries on the next state change." },
      ]} />
      <P>Sandbox mode (<IC>/editor</IC>) has no auto-save. Data exists only in React state and browser memory — closing the tab or refreshing the page loses everything. Sign in to enable cloud persistence.</P>
      <Callout type="info" title="Efficiency notes"><p>Each save is a single <IC>UPDATE</IC> query writing one JSON blob to one row. Pan/zoom actions do <B>not</B> trigger saves (they change React Flow viewport state, not schema data). Dragging tables <B>does</B> trigger saves since table positions are part of the schema, but only after you stop dragging and the debounce expires.</p></Callout>

      {/* ══════════ KEYBOARD SHORTCUTS ══════════ */}
      <H2 id="keyboard-shortcuts">Keyboard shortcuts</H2>
      <P>These shortcuts are active when the canvas is focused. They are automatically disabled when your cursor is in an input field, textarea, or select dropdown.</P>
      <RefTable headers={["Shortcut", "Action", "Notes"]} rows={[
        ["Ctrl + Z", "Undo", "Reverses the last schema mutation. Uses Immer patches (~100 bytes each). Up to 50 undo steps in the stack."],
        ["Ctrl + Shift + Z", "Redo", "Re-applies the last undone action. Redo stack clears if you make a new change after undoing."],
        ["Ctrl + Y", "Redo (alt)", "Same as Ctrl+Shift+Z. Included for Windows users who expect this binding."],
        ["Backspace / Delete", "Delete selected", "Works on: single selected table, multiple selected tables (bulk), or a selected relationship edge."],
        ["Escape", "Deselect + close", "Clears all table/edge selection, closes the floating sidebar, and dismisses the bulk toolbar."],
      ]} />
      <P>On macOS, <Kbd>Ctrl</Kbd> is replaced by <Kbd>⌘ Cmd</Kbd> for all shortcuts. There is no shortcut customization.</P>
      <Callout type="info" title="Undo scope"><p>Undo covers: table add/delete, column add/delete/rename/retype/reorder, constraint toggles (PK/UQ), relation add/delete/type-change, table rename, and table position changes (grouped per drag operation, not per pixel). Undo does <B>not</B> cover AI schema generation or SQL import — those reset the undo stack entirely. Use version history to recover from those.</p></Callout>

      {/* ══════════ TROUBLESHOOTING ══════════ */}
      <H2 id="troubleshooting">Troubleshooting</H2>
      <P>Common issues and their solutions:</P>
      <div className="space-y-3 my-5">
        {[
          { issue: "Editor shows \"Editor Crashed\" error screen", fix: "The saved schema JSON may be corrupted or contain data React Flow can't render. Click \"Reset to Blank\" to clear the schema, or \"Dashboard\" to go back. If you have version history snapshots, restore a previous version from the History panel. This error is rare and usually caused by a failed AI generation that wrote partial JSON." },
          { issue: "AI generation fails with \"AI failed to generate schema\"", fix: "The Google Gemini API may be temporarily unavailable, rate-limited, or your prompt may be too complex. Try: (1) a simpler/shorter prompt, (2) wait 30 seconds and retry, (3) check that you're signed in (AI requires authentication). If persistent, the server's API key may have hit its quota." },
          { issue: "Can't draw a connection between two columns", fix: "Ensure you're dragging from a handle (the small pill on hover) to a handle on a DIFFERENT table. You can't connect a table to itself. Also try the click-to-connect method: click one handle, then click the target handle. If handles don't appear, make sure you're hovering directly over the column row, not the table header." },
          { issue: "Relationships disappear after editing columns", fix: "If you delete a column that has a relationship attached, the relationship is automatically removed — a FK can't exist without both its source and target columns. Check that you haven't accidentally deleted a column involved in a relation. Undo with Ctrl+Z if this was unintended." },
          { issue: "Changes aren't saving (cloud icon stuck spinning)", fix: "Check your network connection. Auto-save requires internet access to reach the Neon database. In sandbox mode (/editor), there IS no auto-save — that's expected. On /editor/[id], if the icon never turns green, the save may be failing silently. Try refreshing the page. Your latest unsaved changes may be lost, but the last successful save is preserved." },
          { issue: "Import SQL creates no tables or misses some", fix: "The parser requires valid CREATE TABLE statements. Check for: (1) database-specific syntax the parser doesn't handle (e.g. PostgreSQL CREATE EXTENSION, MySQL ENGINE=InnoDB), (2) ALTER TABLE ADD FOREIGN KEY statements which aren't parsed (FKs must be inline), (3) missing semicolons between statements. Simplify your SQL to basic CREATE TABLE blocks." },
          { issue: "Export code has wrong column types", fix: "SchemaStudio only supports 8 types (UUID, VARCHAR, TEXT, INT, FLOAT, BOOLEAN, DATE, JSON). If you need DECIMAL, BIGINT, ENUM, TIMESTAMP WITH TIME ZONE, etc., export with the closest supported type and manually adjust the output. The export is meant as a starting point, not a finalized migration file." },
          { issue: "Canvas is blank and no empty state appears", fix: "The schema may still be loading from the database. Wait a moment for initialization. If it persists, the project data might be null or corrupted. Go back to the dashboard and try reopening the project. As a last resort, the project may need to be deleted and recreated." },
        ].map((item, i) => (
          <details key={i} className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white pr-4">{item.issue}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50 pt-3">{item.fix}</div>
          </details>
        ))}
      </div>

      {/* ══════════ FAQ ══════════ */}
      <H2 id="faq">FAQ</H2>
      {[
        { q: "Where is my data stored?", a: "Authenticated schemas are stored in a Neon PostgreSQL database (Neon's free tier: 512MB storage, 100 compute hours/month). Each project's data — all tables, columns, positions, and relations — is serialized as a single JSON value in the 'data' column of the projects table. Passwords are hashed with bcrypt and stored in the users table. Sandbox mode stores everything in React/Zustand state (browser memory only) — nothing touches any server." },
        { q: "Can I collaborate with teammates in real-time?", a: "Not yet. SchemaStudio is single-user per project. There are no shared projects, team workspaces, or real-time collaboration features (like Figma-style cursors). This is planned for a future version. For now, export your schema and share the SQL/Prisma file, or share the project URL with someone who has access to your account." },
        { q: "Can I export to Django models, TypeORM, Drizzle, or Sequelize?", a: "Currently: PostgreSQL, MySQL, SQLite, Prisma ORM, and Mongoose (TypeScript + JavaScript). Additional ORM/framework export formats are on the roadmap. As a workaround, export PostgreSQL DDL and use your ORM's introspection or migration tool to convert it (e.g. 'prisma db pull', 'drizzle-kit introspect', 'sequelize-auto')." },
        { q: "Is there a limit on how many tables I can have?", a: "No hard UI limit — you can manually create hundreds of tables. The AI context sanitizer caps at 100 tables and 50 columns per table, but this only applies when sending schema data to the AI model, not to manual editing or export. Performance may degrade with 100+ tables due to React Flow rendering overhead." },
        { q: "Can I import from a live database connection string?", a: "No. Import only works with pasted SQL text or uploaded .sql files. There is no direct database introspection. To import an existing database, use your database's dump tool (pg_dump --schema-only, mysqldump --no-data) to export DDL, then paste it into SchemaStudio." },
        { q: "What happens if the AI generates a bad schema?", a: "Three recovery options: (1) Ctrl+Z does NOT work for AI generation — the undo stack is reset. (2) If you saved a version snapshot beforehand, restore it from History. (3) If you didn't save one, the system may have auto-created a snapshot before the AI ran. Check History for a 'Before AI generation' or recent auto-snapshot. Otherwise, you'll need to regenerate or rebuild manually." },
        { q: "Does it support dark mode?", a: "Yes. SchemaStudio follows your system theme by default (prefers-color-scheme), or you can toggle manually with the sun/moon button in the header. All UI elements adapt: canvas background, table nodes, relationship edges, sidebar, modals, code blocks, the minimap, and even the export modal syntax highlighting." },
        { q: "Can I use it on mobile or tablet?", a: "Yes — the editor is responsive. Table nodes have larger touch targets, connection handles are 12×12px (vs 6×20px on desktop), and the sidebar becomes a bottom sheet. However, the best experience is on desktop: multi-select drag rectangles, keyboard shortcuts, and precise column-to-column connections are much easier with a mouse." },
        { q: "Can I create self-referencing foreign keys?", a: "Not visually — the canvas doesn't render self-loop edges. Add a self-referencing column (e.g. parent_id) manually in the sidebar, set its type to UUID or INT, and handle the self-reference in your exported code. The SQL import parser does parse self-referencing FOREIGN KEY clauses, but they won't display as visual edges." },
        { q: "How does undo/redo work internally?", a: "Zustand + Immer's produceWithPatches(). When you rename a column, the undo entry is a tiny diff like: 'at tables[3].columns[2].name, changed \"user_name\" to \"username\"' — roughly 100 bytes. The undo stack holds up to 50 entries (~5KB total). Full schema snapshots would be 50KB+ each, so patches are dramatically more efficient. This is why undo feels instant even on schemas with 50+ tables." },
        { q: "What's the maximum schema size?", a: "The server-side Zod validator rejects payloads over 5MB. With 100 tables averaging 20 columns each, the serialized JSON is typically 200–500KB — well under the limit. You'd need an extraordinarily large schema (300+ tables with many columns each) to hit it." },
        { q: "Is the app open source?", a: "Check the GitHub link in the navbar or footer for the current repository status and license." },
      ].map((item, i) => (
        <details key={i} className="group border border-zinc-200 dark:border-zinc-800 rounded-xl my-3 overflow-hidden">
          <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors list-none">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white pr-4">{item.q}</span>
            <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/50 pt-3">{item.a}</div>
        </details>
      ))}

      <div className="h-24" />
    </div>
  );
}