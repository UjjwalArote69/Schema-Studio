/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Terminal, Check, Copy, Info, Lightbulb, AlertTriangle, BookOpen, Target } from "lucide-react";
import { useLearnContext } from "./layout";

function useScrollSpy() {
  const { setActiveSection } = useLearnContext();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveSection(entry.target.id); break; }
        }
      },
      { rootMargin: "-80px 0px -75% 0px" },
    );
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [setActiveSection]);
}

// ── Shared UI components ────────────────────────────────────────

function CodeBlock({ code, lang = "sql", filename }: { code: string; lang?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs font-mono text-zinc-400">{filename || lang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-md transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-[13px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({ type = "info", title, children }: { type?: "info" | "tip" | "warning"; title?: string; children: React.ReactNode }) {
  const styles = {
    info: { icon: Info, border: "border-blue-200 dark:border-blue-900/50", bg: "bg-blue-50/50 dark:bg-blue-950/20", ic: "text-blue-500", tc: "text-blue-900 dark:text-blue-300" },
    tip: { icon: Lightbulb, border: "border-emerald-200 dark:border-emerald-900/50", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", ic: "text-emerald-500", tc: "text-emerald-900 dark:text-emerald-300" },
    warning: { icon: AlertTriangle, border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50/50 dark:bg-amber-950/20", ic: "text-amber-500", tc: "text-amber-900 dark:text-amber-300" },
  }[type];
  const Icon = styles.icon;
  return (
    <div className={`p-4 rounded-xl border ${styles.border} ${styles.bg} flex gap-3 items-start my-5`}>
      <Icon className={`w-5 h-5 ${styles.ic} shrink-0 mt-0.5`} />
      <div className="min-w-0">
        {title && <p className={`text-sm font-bold ${styles.tc} mb-1`}>{title}</p>}
        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0">{children}</div>
      </div>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} data-section="" className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight scroll-mt-20 pt-12 first:pt-0">{children}</h2>;
}
function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return <h3 id={id} data-section="" className="text-base md:text-lg font-bold text-zinc-900 dark:text-white scroll-mt-20 pt-8">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">{children}</p>;
}
function IC({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[13px] font-mono text-zinc-800 dark:text-zinc-200">{children}</code>;
}
function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-zinc-900 dark:text-white font-semibold">{children}</strong>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-outside pl-5 space-y-1.5 text-[15px] text-zinc-600 dark:text-zinc-400 my-3 marker:text-zinc-300 dark:marker:text-zinc-600">{children}</ul>;
}
function RefTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 my-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i ? "border-t border-zinc-100 dark:border-zinc-800/50" : ""}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap" : "text-zinc-600 dark:text-zinc-400"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LevelBadge({ level }: { level: "beginner" | "intermediate" | "advanced" }) {
  const styles = {
    beginner: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
    intermediate: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
    advanced: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50",
  }[level];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles}`}>{level}</span>;
}

function Quiz({ question, options, answer }: { question: string; options: string[]; answer: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="my-5 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quick Check</span>
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => { setSelected(i); setRevealed(true); }}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-all ${
              !revealed
                ? "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400"
                : i === answer
                  ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : i === selected
                    ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600"
            }`}
          >
            <span className="font-mono text-[11px] font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>
      {revealed && (
        <p className={`text-xs mt-3 font-medium ${selected === answer ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {selected === answer ? "Correct! Well done." : `Incorrect. The correct answer is ${String.fromCharCode(65 + answer)}.`}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════

export default function LearnPage() {
  useScrollSpy();

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 md:py-12 pb-40">

      {/* Hero */}
      <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-900 dark:to-black border border-zinc-700 dark:border-zinc-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">SQL Complete Guide</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">Learn SQL from Zero to Hero</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
            A hands-on SQL curriculum covering basic queries, JOINs, aggregations, subqueries, window functions,
            CTEs, transactions, query optimization, and database normalization.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-full uppercase tracking-wider">Beginner</span>
            <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[11px] font-bold rounded-full uppercase tracking-wider">Intermediate</span>
            <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[11px] font-bold rounded-full uppercase tracking-wider">Advanced</span>
          </div>
        </div>
      </div>

      {/* ═══════════════ BEGINNER ═══════════════ */}

      <H2 id="intro">What is SQL?</H2>
      <div className="flex items-center gap-2 mt-2 mb-1"><LevelBadge level="beginner" /></div>
      <P>SQL (Structured Query Language) is the standard language for managing and querying relational databases. Created at IBM in the 1970s and standardized in 1987, it is supported by virtually every major database — PostgreSQL, MySQL, SQLite, SQL Server, and Oracle — with only minor dialect differences.</P>
      <P>Relational databases organize data into <B>tables</B>, where each table has named <B>columns</B> (the structure) and any number of <B>rows</B> (the data). SQL lets you create those structures, insert and modify data, query with complex conditions, and enforce data integrity through constraints and transactions.</P>
      <P>SQL statements fall into four categories:</P>
      <RefTable
        headers={["Category", "Abbreviation", "Examples"]}
        rows={[
          ["Data Definition Language", "DDL", "CREATE, ALTER, DROP, TRUNCATE"],
          ["Data Manipulation Language", "DML", "SELECT, INSERT, UPDATE, DELETE"],
          ["Data Control Language", "DCL", "GRANT, REVOKE"],
          ["Transaction Control Language", "TCL", "BEGIN, COMMIT, ROLLBACK"],
        ]}
      />
      <Callout type="tip" title="SQL is case-insensitive (mostly)">
        <p>Keywords like <code>SELECT</code> and <code>WHERE</code> can be written in any case. Convention is uppercase keywords, lowercase identifiers. This guide follows that convention.</p>
      </Callout>

      {/* ── Databases & Tables ── */}
      <H3 id="databases-tables">Databases &amp; Tables</H3>
      <P>A <B>database</B> is a named container for related tables. A <B>table</B> is a grid with named, typed columns. Before storing data you define the structure with DDL.</P>
      <CodeBlock lang="sql" filename="create-table.sql" code={`-- Create a table
CREATE TABLE authors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  bio        TEXT,
  born_at    DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE books (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  author_id    INT REFERENCES authors(id) ON DELETE CASCADE,
  isbn         VARCHAR(20) UNIQUE,
  price        DECIMAL(10, 2),
  published_at DATE,
  in_stock     BOOLEAN DEFAULT TRUE
);`} />
      <UL>
        <li><IC>SERIAL</IC> auto-increments. MySQL: <IC>INT AUTO_INCREMENT</IC>. SQLite: <IC>INTEGER</IC>.</li>
        <li><IC>PRIMARY KEY</IC> enforces uniqueness and disallows NULL. Every table should have one.</li>
        <li><IC>REFERENCES authors(id)</IC> creates a foreign key linking to another table.</li>
        <li><IC>DEFAULT NOW()</IC> automatically fills the current timestamp when no value is supplied.</li>
      </UL>
      <CodeBlock lang="sql" code={`-- Add a column
ALTER TABLE books ADD COLUMN page_count INT;

-- Remove a column
ALTER TABLE books DROP COLUMN page_count;

-- Delete the table (and all its data)
DROP TABLE IF EXISTS books;

-- Remove all rows quickly (cannot be rolled back in most DBs)
TRUNCATE TABLE books;`} />
      <Quiz
        question="Which SQL statement creates a new table structure?"
        options={["INSERT INTO", "CREATE TABLE", "ADD TABLE", "MAKE TABLE"]}
        answer={1}
      />

      {/* ── SELECT ── */}
      <H3 id="select">SELECT Basics</H3>
      <P><IC>SELECT</IC> retrieves rows from a table. It is the most-used SQL statement.</P>
      <CodeBlock lang="sql" code={`-- All columns, all rows
SELECT * FROM authors;

-- Specific columns only
SELECT name, email FROM authors;

-- Rename columns in output with AS
SELECT name AS author_name, email AS contact FROM authors;

-- Computed columns
SELECT
  title,
  price,
  price * 0.9 AS discounted_price
FROM books;

-- String concatenation (PostgreSQL / SQLite use ||)
SELECT first_name || ' ' || last_name AS full_name FROM users;

-- MySQL uses CONCAT
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;`} />
      <Callout type="warning" title="Avoid SELECT * in production">
        <p>Using <code>SELECT *</code> is fine for exploration, but it retrieves every column (including ones you don't need), wastes network bandwidth, and breaks if someone adds or reorders columns. Always name the columns you need.</p>
      </Callout>

      {/* ── WHERE ── */}
      <H3 id="where">Filtering with WHERE</H3>
      <P>The <IC>WHERE</IC> clause filters rows. Only rows where the condition evaluates to <IC>TRUE</IC> are returned.</P>
      <CodeBlock lang="sql" code={`-- Equality and comparison operators: =  <>  !=  <  >  <=  >=
SELECT * FROM books WHERE author_id = 3;
SELECT * FROM books WHERE price > 20.00;
SELECT * FROM books WHERE price <> 9.99;     -- same as !=

-- Multiple conditions
SELECT * FROM books WHERE price < 15 AND in_stock = TRUE;
SELECT * FROM books WHERE price > 50 OR in_stock = FALSE;

-- NOT negates a condition
SELECT * FROM books WHERE NOT in_stock;

-- BETWEEN (inclusive on both ends)
SELECT * FROM books WHERE price BETWEEN 10 AND 30;

-- IN: match any value from a list
SELECT * FROM books WHERE author_id IN (1, 3, 7);

-- LIKE: % = any characters, _ = exactly one character
SELECT * FROM authors WHERE name LIKE 'J%';          -- starts with J
SELECT * FROM authors WHERE email LIKE '%@gmail.com';
SELECT * FROM books  WHERE title LIKE '%Harry%';     -- contains Harry

-- ILIKE: case-insensitive (PostgreSQL only)
SELECT * FROM authors WHERE name ILIKE 'john%';`} />
      <Callout type="tip" title="Parentheses control operator precedence">
        <p>AND binds tighter than OR. Write <code>(city = 'NYC' OR city = 'LA') AND active = TRUE</code> to get the intended result.</p>
      </Callout>
      <Quiz
        question="Which operator checks if a value matches any item in a given list?"
        options={["BETWEEN", "LIKE", "IN", "EXISTS"]}
        answer={2}
      />

      {/* ── ORDER BY / LIMIT ── */}
      <H3 id="order-limit">Sorting &amp; Limiting</H3>
      <P>Control row order with <IC>ORDER BY</IC> and the number of rows returned with <IC>LIMIT</IC> / <IC>OFFSET</IC>.</P>
      <CodeBlock lang="sql" code={`-- Ascending (default)
SELECT * FROM books ORDER BY price;

-- Descending
SELECT * FROM books ORDER BY price DESC;

-- Sort by multiple columns
SELECT * FROM books ORDER BY author_id ASC, price DESC;

-- Return only the 10 most recent books
SELECT * FROM books ORDER BY published_at DESC LIMIT 10;

-- Pagination: skip 20 rows, then return 10
SELECT * FROM books ORDER BY id LIMIT 10 OFFSET 20;

-- Control NULL placement
SELECT * FROM books ORDER BY price ASC NULLS LAST;`} />
      <Callout type="info" title="Always pair LIMIT with ORDER BY">
        <p>Without ORDER BY the database may return rows in any order — even if it looks consistent during development. Always sort before limiting.</p>
      </Callout>

      {/* ── INSERT / UPDATE / DELETE ── */}
      <H3 id="dml">INSERT, UPDATE, DELETE</H3>
      <P>DML statements add, modify, and remove data inside tables.</P>
      <CodeBlock lang="sql" code={`-- INSERT: one row
INSERT INTO authors (name, email, bio)
VALUES ('George Orwell', 'orwell@example.com', 'English novelist');

-- INSERT: multiple rows at once
INSERT INTO books (title, author_id, price, isbn)
VALUES
  ('1984',        1, 12.99, '978-0451524935'),
  ('Animal Farm', 1,  9.99, '978-0451526342');

-- RETURNING: get the inserted row back (PostgreSQL)
INSERT INTO authors (name, email)
VALUES ('Aldous Huxley', 'huxley@example.com')
RETURNING id, name;

-- UPDATE: change one or more columns
UPDATE books SET price = 14.99 WHERE id = 1;

-- Update multiple columns
UPDATE books
SET price = 10.99, in_stock = TRUE
WHERE author_id = 1;

-- Update using a computed value
UPDATE books SET price = price * 1.10 WHERE published_at < '2000-01-01';

-- DELETE: remove matching rows
DELETE FROM books WHERE id = 3;

-- DELETE all rows (slower than TRUNCATE but logged and rollback-safe)
DELETE FROM books;`} />
      <Callout type="warning" title="Always test with SELECT before UPDATE / DELETE">
        <p>A missing WHERE clause in an UPDATE or DELETE affects every row in the table. Run the equivalent SELECT first to preview which rows will change.</p>
      </Callout>

      {/* ── DATA TYPES ── */}
      <H3 id="data-types">Data Types</H3>
      <P>Picking the right data type improves storage efficiency, query speed, and data integrity. Types vary slightly between databases.</P>
      <RefTable
        headers={["Category", "Type", "Use when"]}
        rows={[
          ["Integer", "SMALLINT", "Small whole numbers (–32 768 to 32 767)"],
          ["Integer", "INT / INTEGER", "Standard whole numbers (up to ~2.1 billion)"],
          ["Integer", "BIGINT", "Very large whole numbers (user IDs, event counts)"],
          ["Auto-ID", "SERIAL / BIGSERIAL", "Auto-incrementing PKs (PostgreSQL). MySQL: AUTO_INCREMENT"],
          ["Decimal", "DECIMAL(p, s) / NUMERIC(p, s)", "Exact money — p total digits, s after the decimal point"],
          ["Decimal", "FLOAT / DOUBLE PRECISION", "Scientific data where tiny rounding errors are acceptable"],
          ["Text", "CHAR(n)", "Fixed-length strings (e.g., 2-letter country codes)"],
          ["Text", "VARCHAR(n)", "Variable-length text with an upper bound"],
          ["Text", "TEXT", "Unlimited length text (PostgreSQL, MySQL)"],
          ["Date/Time", "DATE", "Calendar date only — 2024-01-15"],
          ["Date/Time", "TIMESTAMP", "Date + time, no timezone"],
          ["Date/Time", "TIMESTAMPTZ", "Date + time stored as UTC (recommended)"],
          ["Boolean", "BOOLEAN", "TRUE / FALSE values"],
          ["Identifier", "UUID", "Globally unique IDs — use gen_random_uuid() in PostgreSQL 13+"],
          ["JSON", "JSONB", "Semi-structured data with indexing support (PostgreSQL)"],
        ]}
      />
      <Callout type="tip" title="Prefer TIMESTAMPTZ over TIMESTAMP">
        <p>TIMESTAMPTZ stores values in UTC and converts to the client timezone on display. TIMESTAMP stores the literal value with no timezone — causing subtle bugs when your users span multiple timezones.</p>
      </Callout>

      {/* ═══════════════ INTERMEDIATE ═══════════════ */}

      <H2 id="joins">JOINs</H2>
      <div className="flex items-center gap-2 mt-2 mb-1"><LevelBadge level="intermediate" /></div>
      <P>JOINs combine rows from two or more tables based on a related column. Mastering JOINs is essential for working with normalized relational data.</P>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
        {[
          { title: "INNER JOIN", desc: "Returns only rows with a matching row in both tables. Non-matching rows from either side are excluded." },
          { title: "LEFT JOIN", desc: "All rows from the left table plus matching rows from the right. Non-matching right rows fill with NULL." },
          { title: "RIGHT JOIN", desc: "All rows from the right table plus matching rows from the left. Non-matching left rows fill with NULL." },
          { title: "FULL OUTER JOIN", desc: "All rows from both tables. NULL fills whichever side has no match." },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{item.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      <CodeBlock lang="sql" filename="joins.sql" code={`-- INNER JOIN: only books that have a matching author
SELECT b.title, b.price, a.name AS author_name
FROM books b
INNER JOIN authors a ON b.author_id = a.id;

-- LEFT JOIN: all books, even those without an author
SELECT b.title, a.name AS author_name
FROM books b
LEFT JOIN authors a ON b.author_id = a.id;
-- books with no author_id → author_name will be NULL

-- Multiple JOINs
SELECT
  b.title,
  a.name  AS author_name,
  g.name  AS genre_name
FROM books b
INNER JOIN authors     a  ON b.author_id   = a.id
INNER JOIN book_genres bg ON b.id          = bg.book_id
INNER JOIN genres      g  ON bg.genre_id   = g.id;

-- Self-join: employees and their managers (same table!)
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;`} />
      <Callout type="tip" title="Table aliases keep JOINs readable">
        <p>Always alias tables: <code>FROM books b</code> lets you write <code>b.title</code> instead of <code>books.title</code>. Essential when joining the same table twice (self-join).</p>
      </Callout>
      <Quiz
        question="You want all customers, even those who haven't placed any orders. Which JOIN do you use?"
        options={["INNER JOIN", "LEFT JOIN (customers on left)", "RIGHT JOIN (orders on right)", "B and C both work"]}
        answer={3}
      />

      {/* ── AGGREGATES ── */}
      <H3 id="aggregates">Aggregate Functions</H3>
      <P>Aggregate functions compute a single value from a set of rows. They are almost always paired with <IC>GROUP BY</IC>.</P>
      <CodeBlock lang="sql" code={`-- COUNT
SELECT COUNT(*)              FROM books;   -- all rows
SELECT COUNT(isbn)           FROM books;   -- rows where isbn IS NOT NULL
SELECT COUNT(DISTINCT author_id) FROM books; -- unique author count

-- SUM and AVG
SELECT SUM(price)   FROM books;
SELECT AVG(price)   FROM books;
SELECT ROUND(AVG(price), 2) FROM books;    -- round to 2 decimal places

-- MIN and MAX
SELECT MIN(price)        FROM books;
SELECT MAX(published_at) FROM books;       -- most recent date

-- String aggregation (PostgreSQL)
SELECT STRING_AGG(name, ', ' ORDER BY name) FROM authors;

-- String aggregation (MySQL)
SELECT GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') FROM authors;`} />

      {/* ── GROUP BY / HAVING ── */}
      <H3 id="groupby">GROUP BY &amp; HAVING</H3>
      <P><IC>GROUP BY</IC> collapses multiple rows with the same value into one group so aggregate functions can run per group. <IC>HAVING</IC> filters those groups — it is like WHERE but runs after aggregation.</P>
      <CodeBlock lang="sql" code={`-- Books per author
SELECT author_id, COUNT(*) AS book_count
FROM books
GROUP BY author_id;

-- With a JOIN to get author names
SELECT a.name, COUNT(b.id) AS book_count, AVG(b.price) AS avg_price
FROM books b
INNER JOIN authors a ON b.author_id = a.id
GROUP BY a.id, a.name
ORDER BY avg_price DESC;

-- HAVING: authors with more than 3 books
SELECT author_id, COUNT(*) AS book_count
FROM books
GROUP BY author_id
HAVING COUNT(*) > 3;

-- WHERE + GROUP BY + HAVING together:
-- Average price of in-stock books per author, only where avg > $15
SELECT a.name, AVG(b.price) AS avg_price
FROM books b
INNER JOIN authors a ON b.author_id = a.id
WHERE b.in_stock = TRUE            -- filters rows BEFORE grouping
GROUP BY a.id, a.name
HAVING AVG(b.price) > 15           -- filters groups AFTER aggregation
ORDER BY avg_price DESC;`} />
      <RefTable
        headers={["Clause", "When it runs", "What it filters"]}
        rows={[
          ["WHERE", "Before GROUP BY", "Individual rows"],
          ["HAVING", "After GROUP BY", "Aggregated groups"],
        ]}
      />
      <Quiz
        question="To show only departments whose employee count exceeds 10, you write:"
        options={[
          "WHERE COUNT(*) > 10",
          "HAVING COUNT(*) > 10",
          "FILTER COUNT(*) > 10",
          "GROUP BY dept LIMIT 10",
        ]}
        answer={1}
      />

      {/* ── SUBQUERIES ── */}
      <H3 id="subqueries">Subqueries</H3>
      <P>A subquery is a query nested inside another query. They can live in <IC>SELECT</IC>, <IC>FROM</IC>, <IC>WHERE</IC>, or <IC>HAVING</IC>.</P>
      <CodeBlock lang="sql" code={`-- Books priced above the overall average
SELECT title, price FROM books
WHERE price > (SELECT AVG(price) FROM books);

-- Books by authors born before 1950
SELECT title FROM books
WHERE author_id IN (
  SELECT id FROM authors WHERE born_at < '1950-01-01'
);

-- Correlated subquery: books pricier than their author's own average
SELECT b1.title, b1.price
FROM books b1
WHERE b1.price > (
  SELECT AVG(b2.price)
  FROM books b2
  WHERE b2.author_id = b1.author_id  -- references outer query
);

-- Derived table (subquery in FROM)
SELECT author_id, avg_price
FROM (
  SELECT author_id, AVG(price) AS avg_price
  FROM books
  GROUP BY author_id
) AS author_avgs
WHERE avg_price > 15;

-- EXISTS: true if the subquery returns at least one row
SELECT a.name FROM authors a
WHERE EXISTS (
  SELECT 1 FROM books b WHERE b.author_id = a.id AND b.in_stock = TRUE
);`} />
      <Callout type="tip" title="EXISTS vs IN for performance">
        <p>Use <code>EXISTS</code> when the subquery could return many rows. EXISTS short-circuits at the first match; IN evaluates the entire list first.</p>
      </Callout>

      {/* ── CONSTRAINTS ── */}
      <H3 id="constraints">Constraints</H3>
      <P>Constraints enforce data integrity rules at the database level — they catch bad data before it enters your tables.</P>
      <CodeBlock lang="sql" code={`CREATE TABLE orders (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL,
  product_id   INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  status       VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,

  CONSTRAINT fk_orders_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,

  CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);

-- Add a constraint after creation
ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);

-- Composite UNIQUE: no duplicate (user, product) pairs
ALTER TABLE cart_items
ADD CONSTRAINT uq_cart_item UNIQUE (user_id, product_id);`} />
      <RefTable
        headers={["Constraint", "Enforces"]}
        rows={[
          ["PRIMARY KEY", "Uniqueness + NOT NULL. At most one per table."],
          ["FOREIGN KEY", "Values must exist in the referenced table (referential integrity)."],
          ["UNIQUE", "No two rows share the same value(s) in the column(s). NULLs are exempt."],
          ["NOT NULL", "Column may not contain NULL."],
          ["CHECK", "A custom boolean expression must be TRUE for every row."],
          ["DEFAULT", "Fallback value when no value is provided on INSERT."],
        ]}
      />
      <RefTable
        headers={["FK Action", "Meaning"]}
        rows={[
          ["ON DELETE CASCADE", "Automatically delete child rows when the parent is deleted."],
          ["ON DELETE RESTRICT", "Prevent deletion if any child rows exist (default in most databases)."],
          ["ON DELETE SET NULL", "Set the FK column to NULL when the parent is deleted."],
          ["ON UPDATE CASCADE", "Propagate PK changes to child FK values."],
        ]}
      />

      {/* ── INDEXES ── */}
      <H3 id="indexes">Indexes</H3>
      <P>An index is a separate data structure the database maintains alongside your table to speed up lookups. Without an index, the database reads every row (full table scan). With the right index it jumps directly to matching rows.</P>
      <CodeBlock lang="sql" code={`-- Standard BTree index
CREATE INDEX idx_books_author_id ON books(author_id);

-- Unique index (also enforces uniqueness)
CREATE UNIQUE INDEX idx_books_isbn ON books(isbn);

-- Composite index (queries filtering on both columns benefit)
CREATE INDEX idx_books_author_price ON books(author_id, price);

-- Partial index: only index in-stock books (smaller, faster)
CREATE INDEX idx_books_instock_price ON books(price)
  WHERE in_stock = TRUE;

-- Expression index (supports LOWER() queries without a function scan)
CREATE INDEX idx_authors_email_lower ON authors(LOWER(email));

-- See whether a query uses your index
EXPLAIN SELECT * FROM books WHERE author_id = 5;
-- Look for "Index Scan" in the output

-- Remove an index
DROP INDEX idx_books_author_id;`} />
      <Callout type="warning" title="Indexes have overhead">
        <p>Each index speeds up reads but slows INSERT / UPDATE / DELETE because the index structure must also be maintained. Index columns with high cardinality (user_id, email) that appear in WHERE clauses and JOIN conditions. Avoid indexing low-cardinality columns like booleans.</p>
      </Callout>

      {/* ── NULL HANDLING ── */}
      <H3 id="null-handling">NULL Handling</H3>
      <P>NULL represents the absence of a value — it is not zero, not empty string, not false. Any comparison with NULL returns NULL (not TRUE or FALSE), so you must use <IC>IS NULL</IC> or <IC>IS NOT NULL</IC>.</P>
      <CodeBlock lang="sql" code={`-- Correct NULL checks
SELECT * FROM books WHERE isbn IS NULL;
SELECT * FROM books WHERE isbn IS NOT NULL;

-- WRONG — this never matches any rows
SELECT * FROM books WHERE isbn = NULL;

-- COALESCE: returns the first non-NULL argument
SELECT title, COALESCE(isbn, 'No ISBN') AS isbn_display FROM books;

-- Multiple fallbacks
SELECT COALESCE(preferred_name, first_name, 'Anonymous') AS display_name
FROM users;

-- NULLIF: return NULL if both arguments are equal (avoids divide-by-zero)
SELECT total_sales / NULLIF(total_visits, 0) AS conversion_rate
FROM campaign_stats;

-- Aggregate functions ignore NULLs (except COUNT(*))
SELECT COUNT(*)    FROM books;  -- all rows
SELECT COUNT(isbn) FROM books;  -- only rows where isbn is not NULL
SELECT AVG(price)  FROM books;  -- NULLs excluded from the calculation

-- Control NULL sorting
SELECT * FROM books ORDER BY isbn NULLS LAST;
SELECT * FROM books ORDER BY isbn NULLS FIRST;`} />

      {/* ── ALIASES & DISTINCT ── */}
      <H3 id="aliases-distinct">Aliases &amp; DISTINCT</H3>
      <P><IC>AS</IC> gives a column or table a temporary name in the query output. <IC>DISTINCT</IC> removes duplicate rows from the result set.</P>
      <CodeBlock lang="sql" code={`-- Column aliases
SELECT
  name                               AS author_name,
  LOWER(email)                       AS normalized_email,
  EXTRACT(YEAR FROM born_at)         AS birth_year
FROM authors;

-- Table aliases in JOINs (AS is optional)
SELECT b.title, a.name
FROM books b
INNER JOIN authors a ON b.author_id = a.id;

-- DISTINCT: unique values
SELECT DISTINCT author_id FROM books;

-- Distinct combinations across multiple columns
SELECT DISTINCT city, country FROM addresses;

-- Count unique values
SELECT COUNT(DISTINCT author_id) AS unique_authors FROM books;`} />

      {/* ═══════════════ ADVANCED ═══════════════ */}

      <H2 id="window-functions">Window Functions</H2>
      <div className="flex items-center gap-2 mt-2 mb-1"><LevelBadge level="advanced" /></div>
      <P>Window functions compute values across a set of rows related to the current row — without collapsing rows the way GROUP BY does. They are one of the most powerful features in SQL.</P>
      <P>Syntax: <IC>function() OVER (PARTITION BY ... ORDER BY ...)</IC></P>
      <CodeBlock lang="sql" filename="window-functions.sql" code={`-- ROW_NUMBER: sequential number within each partition
SELECT
  author_id,
  title,
  price,
  ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY price DESC) AS rank_in_author
FROM books;

-- RANK vs DENSE_RANK (both handle ties differently)
-- Tied rows get the same rank; RANK skips numbers, DENSE_RANK does not
SELECT
  title,
  price,
  RANK()        OVER (ORDER BY price DESC) AS rank,
  DENSE_RANK()  OVER (ORDER BY price DESC) AS dense_rank
FROM books;

-- Running total (cumulative SUM)
SELECT
  id,
  price,
  SUM(price) OVER (ORDER BY id) AS running_total
FROM books;

-- Running total partitioned by author
SELECT
  author_id,
  title,
  price,
  SUM(price) OVER (PARTITION BY author_id ORDER BY published_at) AS author_running_total
FROM books;

-- LAG / LEAD: access adjacent rows
SELECT
  title,
  price,
  LAG(price,  1) OVER (ORDER BY published_at) AS prev_price,
  LEAD(price, 1) OVER (ORDER BY published_at) AS next_price
FROM books;

-- NTILE: divide rows into N equal buckets
SELECT title, price, NTILE(4) OVER (ORDER BY price) AS price_quartile
FROM books;

-- FIRST_VALUE / LAST_VALUE
SELECT
  title,
  price,
  FIRST_VALUE(title) OVER (PARTITION BY author_id ORDER BY price DESC) AS most_expensive_by_author
FROM books;`} />
      <Callout type="tip" title="Window functions keep all rows">
        <p>GROUP BY collapses multiple rows into one. Window functions compute across rows but preserve every row in the output. You can also use aggregate functions (SUM, AVG, COUNT) as window functions by adding OVER().</p>
      </Callout>
      <Quiz
        question="Which window function assigns equal ranks to ties but leaves no gaps in the numbering?"
        options={["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()"]}
        answer={2}
      />

      {/* ── CTEs ── */}
      <H3 id="cte">Common Table Expressions (CTEs)</H3>
      <P>A CTE, written with the <IC>WITH</IC> clause, is a named temporary result set you can reference in the main query. CTEs make complex queries readable by breaking them into named steps.</P>
      <CodeBlock lang="sql" code={`-- Basic CTE
WITH expensive_books AS (
  SELECT * FROM books WHERE price > 20
)
SELECT b.title, a.name
FROM expensive_books b
INNER JOIN authors a ON b.author_id = a.id;

-- Multiple chained CTEs
WITH
  author_stats AS (
    SELECT author_id, COUNT(*) AS book_count, AVG(price) AS avg_price
    FROM books GROUP BY author_id
  ),
  prolific AS (
    SELECT author_id FROM author_stats WHERE book_count >= 3
  )
SELECT a.name, s.book_count, s.avg_price
FROM author_stats s
INNER JOIN prolific p  ON s.author_id = p.author_id
INNER JOIN authors  a  ON a.id        = s.author_id
ORDER BY s.avg_price DESC;

-- RECURSIVE CTE: traverse a hierarchy (org chart, category tree)
WITH RECURSIVE subordinates AS (
  -- Anchor: start with the root manager (id = 1)
  SELECT id, name, manager_id, 0 AS depth
  FROM employees WHERE id = 1

  UNION ALL

  -- Recursive step: join employees to already-found rows
  SELECT e.id, e.name, e.manager_id, s.depth + 1
  FROM employees e
  INNER JOIN subordinates s ON e.manager_id = s.id
)
SELECT id, name, depth FROM subordinates ORDER BY depth, name;`} />
      <Callout type="info" title="CTE vs Subquery">
        <p>CTEs and subqueries are often interchangeable. Prefer CTEs when: (1) you need to reference the same result more than once, (2) the query is complex and benefits from named steps, (3) you need recursion.</p>
      </Callout>

      {/* ── TRANSACTIONS ── */}
      <H3 id="transactions">Transactions &amp; ACID</H3>
      <P>A transaction is a unit of work that either fully succeeds or fully fails. Transactions are the foundation of data integrity in relational databases.</P>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
        {[
          { letter: "A", title: "Atomicity", desc: "All operations succeed or all fail. No partial commits." },
          { letter: "C", title: "Consistency", desc: "A transaction moves the database from one valid state to another. Constraints are never violated." },
          { letter: "I", title: "Isolation", desc: "Concurrent transactions behave as if they ran sequentially. No dirty reads." },
          { letter: "D", title: "Durability", desc: "Committed changes survive crashes and power failures." },
        ].map((item) => (
          <div key={item.letter} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center text-sm font-black shrink-0">{item.letter}</div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mb-0.5">{item.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <CodeBlock lang="sql" filename="transactions.sql" code={`-- Basic transaction
BEGIN;
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;  -- debit
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;  -- credit
COMMIT;   -- both updates are persisted atomically

-- Rollback on error
BEGIN;
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
ROLLBACK;  -- nothing is saved

-- SAVEPOINT: partial rollback inside a transaction
BEGIN;
  INSERT INTO orders (user_id, total) VALUES (1, 299.99);
  SAVEPOINT after_order;

  INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 42, 1);
  -- Something failed — undo only the item insert, keep the order
  ROLLBACK TO after_order;

COMMIT;

-- Isolation levels (set before the first statement)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- default in most DBs
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;     -- strongest guarantee`} />

      {/* ── VIEWS ── */}
      <H3 id="views">Views</H3>
      <P>A view is a saved SQL query that behaves like a virtual table. Views simplify complex queries, provide an abstraction layer, and can restrict which columns or rows users can see.</P>
      <CodeBlock lang="sql" code={`-- Create a view
CREATE VIEW book_details AS
SELECT
  b.id,
  b.title,
  b.price,
  b.in_stock,
  a.name  AS author_name,
  a.email AS author_email
FROM books b
INNER JOIN authors a ON b.author_id = a.id;

-- Use it just like a table
SELECT * FROM book_details WHERE in_stock = TRUE;
SELECT author_name, COUNT(*) FROM book_details GROUP BY author_name;

-- Replace a view definition
CREATE OR REPLACE VIEW book_details AS
SELECT b.id, b.title, b.price, a.name AS author_name
FROM books b
INNER JOIN authors a ON b.author_id = a.id
WHERE b.published_at IS NOT NULL;

-- Drop a view
DROP VIEW IF EXISTS book_details;

-- Materialized view (PostgreSQL): stores results on disk
CREATE MATERIALIZED VIEW author_stats AS
SELECT author_id, COUNT(*) AS book_count, AVG(price) AS avg_price
FROM books GROUP BY author_id;

REFRESH MATERIALIZED VIEW author_stats;              -- update cached data
REFRESH MATERIALIZED VIEW CONCURRENTLY author_stats; -- non-blocking`} />

      {/* ── FUNCTIONS & PROCEDURES ── */}
      <H3 id="functions">Functions &amp; Stored Procedures</H3>
      <P>Functions and stored procedures encapsulate reusable SQL logic inside the database. Functions return a value; procedures perform actions (and commit their own transactions in PostgreSQL 11+).</P>
      <CodeBlock lang="sql" filename="functions.sql" code={`-- Simple SQL function (PostgreSQL)
CREATE OR REPLACE FUNCTION author_book_count(p_author_id INT)
RETURNS INT AS $$
  SELECT COUNT(*) FROM books WHERE author_id = p_author_id;
$$ LANGUAGE sql STABLE;

-- Use it in a query
SELECT name, author_book_count(id) AS book_count FROM authors;

-- PL/pgSQL function with logic
CREATE OR REPLACE FUNCTION discounted_price(p_book_id INT, p_pct NUMERIC)
RETURNS DECIMAL AS $$
DECLARE
  v_price DECIMAL;
BEGIN
  SELECT price INTO v_price FROM books WHERE id = p_book_id;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Book % not found', p_book_id;
  END IF;

  RETURN v_price * (1 - p_pct / 100);
END;
$$ LANGUAGE plpgsql;

-- Table-returning function
CREATE OR REPLACE FUNCTION books_by_author(p_author_id INT)
RETURNS TABLE(id INT, title VARCHAR, price DECIMAL) AS $$
  SELECT id, title, price FROM books WHERE author_id = p_author_id;
$$ LANGUAGE sql;

SELECT * FROM books_by_author(3);

-- Stored procedure (PostgreSQL 11+)
CREATE OR REPLACE PROCEDURE transfer_balance(
  p_from INT, p_to INT, p_amount DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
  COMMIT;
END;
$$;

CALL transfer_balance(1, 2, 100.00);`} />

      {/* ── QUERY OPTIMIZATION ── */}
      <H3 id="query-optimization">Query Optimization</H3>
      <P>Understanding how the database executes your queries helps you write faster SQL and create the right indexes. <IC>EXPLAIN</IC> is your primary tool.</P>
      <CodeBlock lang="sql" code={`-- Show the query plan without running the query
EXPLAIN SELECT * FROM books WHERE author_id = 5;

-- Run the query AND show actual timings
EXPLAIN ANALYZE SELECT * FROM books WHERE author_id = 5;

-- Detailed output including buffer usage
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT * FROM books WHERE author_id = 5;`} />
      <RefTable
        headers={["Plan node", "What it means"]}
        rows={[
          ["Seq Scan", "Full table scan — reads every row. Slow on large tables."],
          ["Index Scan", "Jumps to matching rows via an index. Fast for selective queries."],
          ["Index Only Scan", "All needed data lives in the index itself. Fastest possible."],
          ["Bitmap Heap Scan", "Index locates row positions; then heap pages are fetched in bulk."],
          ["Nested Loop", "For each outer row, scan the inner table. Best for small sets."],
          ["Hash Join", "Builds a hash table of the smaller input; probes with the larger. Good for big joins."],
          ["Merge Join", "Merges two pre-sorted inputs efficiently."],
        ]}
      />
      <CodeBlock lang="sql" code={`-- Optimization patterns

-- 1. Avoid wrapping indexed columns in functions
-- BAD: LOWER() prevents index use on email
SELECT * FROM authors WHERE LOWER(email) = 'john@example.com';

-- GOOD: functional index matches the expression
CREATE INDEX idx_authors_email_lower ON authors(LOWER(email));
SELECT * FROM authors WHERE LOWER(email) = 'john@example.com';

-- 2. Name only the columns you need
SELECT title, price FROM books WHERE author_id = 5;

-- 3. EXISTS is faster than COUNT for existence checks
SELECT EXISTS(SELECT 1 FROM orders WHERE user_id = 42 AND status = 'open');

-- 4. Stale statistics cause bad plans → refresh them
ANALYZE books;

-- 5. Covering index: store extra columns in the index to avoid a heap lookup
CREATE INDEX idx_books_cover ON books(author_id) INCLUDE (title, price);`} />
      <Callout type="tip" title="Look at row estimates vs actual rows">
        <p>Large differences between estimated and actual row counts in EXPLAIN ANALYZE usually mean the statistics are stale. Run <code>ANALYZE table_name</code> to update them.</p>
      </Callout>

      {/* ── NORMALIZATION ── */}
      <H3 id="normalization">Database Normalization</H3>
      <P>Normalization organizes a relational database to reduce redundancy and improve integrity. It is applied through a series of <B>normal forms</B>.</P>
      <div className="space-y-4 my-5">
        {[
          {
            nf: "1NF", title: "First Normal Form",
            rule: "Every column holds atomic (indivisible) values. No repeating groups or multi-value cells.",
            bad: "customer | orders\nAlice    | order1, order2, order3",
            good: "customer_id | order_id\n1           | 1\n1           | 2\n1           | 3",
          },
          {
            nf: "2NF", title: "Second Normal Form",
            rule: "Must be in 1NF. Every non-key column must depend on the ENTIRE primary key — no partial dependencies.",
            bad: "order_id | product_id | qty | product_name\n-- product_name depends only on product_id",
            good: "orders(order_id, product_id, qty)\nproducts(product_id, product_name)",
          },
          {
            nf: "3NF", title: "Third Normal Form",
            rule: "Must be in 2NF. No non-key column depends on another non-key column — no transitive dependencies.",
            bad: "employee_id | dept_id | dept_name\n-- dept_name depends on dept_id, not employee_id",
            good: "employees(employee_id, dept_id)\ndepartments(dept_id, dept_name)",
          },
          {
            nf: "BCNF", title: "Boyce-Codd Normal Form",
            rule: "Stricter than 3NF: for every functional dependency X → Y, X must be a superkey of the table.",
            bad: "student | course | teacher\n-- teacher determines course, but teacher is not a key",
            good: "teacher_course(teacher, course)\nstudent_teacher(student, teacher)",
          },
        ].map((item) => (
          <div key={item.nf} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <span className="px-2 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[11px] font-black rounded">{item.nf}</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{item.rule}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden border border-red-200 dark:border-red-900/40">
                  <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/40 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Violates {item.nf}
                  </div>
                  <pre className="p-3 text-[12px] font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{item.bad}</pre>
                </div>
                <div className="rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-900/40">
                  <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Satisfies {item.nf}
                  </div>
                  <pre className="p-3 text-[12px] font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{item.good}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Callout type="tip" title="Don't over-normalize">
        <p>Normalization reduces redundancy but multiplies JOINs. In analytical or reporting workloads, deliberate denormalization — storing computed or duplicated values — can dramatically improve read speed. Benchmark before committing to either extreme.</p>
      </Callout>

      {/* ── QUICK REFERENCE ── */}
      <H2 id="cheatsheet">Quick Reference Cheat Sheet</H2>
      <RefTable
        headers={["Concept", "Key syntax", "Notes"]}
        rows={[
          ["SELECT", "SELECT col1, col2 FROM tbl", "Name columns explicitly — avoid SELECT *"],
          ["Filter rows", "WHERE col = val AND col2 > val2", "AND binds tighter than OR; use parentheses"],
          ["Sort", "ORDER BY col DESC NULLS LAST", "Default is ASC; always pair with LIMIT"],
          ["Paginate", "LIMIT 10 OFFSET 20", "Page 3 of 10 results = OFFSET 20 LIMIT 10"],
          ["Join tables", "JOIN tbl ON a.id = b.fk", "LEFT JOIN to keep all rows from the left"],
          ["Count rows", "COUNT(*) / COUNT(col)", "COUNT(*) includes NULLs; COUNT(col) excludes them"],
          ["Group & filter groups", "GROUP BY col HAVING COUNT(*) > 1", "HAVING runs after GROUP BY; WHERE runs before"],
          ["Deduplicate", "SELECT DISTINCT col", "Or use GROUP BY without aggregates"],
          ["Check NULL", "col IS NULL / IS NOT NULL", "Never use = NULL"],
          ["NULL fallback", "COALESCE(col, default)", "Returns first non-NULL argument"],
          ["Window function", "fn() OVER (PARTITION BY … ORDER BY …)", "Computes across rows without collapsing them"],
          ["CTE", "WITH name AS (…) SELECT …", "Named, reusable result sets; supports recursion"],
          ["Transaction", "BEGIN; …; COMMIT;", "Use ROLLBACK to undo everything"],
          ["View", "CREATE VIEW name AS SELECT …", "Virtual table; MATERIALIZED VIEW caches results"],
          ["Explain plan", "EXPLAIN ANALYZE SELECT …", "Shows actual vs estimated rows and timings"],
        ]}
      />

    </div>
  );
}
