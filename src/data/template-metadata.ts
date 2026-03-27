/**
 * Lightweight template metadata for the client-side templates browser.
 *
 * This file contains only what's needed to render the template cards:
 * name, description, category, icon name, counts, and a lightweight
 * `preview` object with table names/positions and relation index pairs
 * for SVG thumbnail rendering.
 *
 * The full schema data (columns, column IDs, relation IDs) stays in
 * Template.ts which is only imported server-side by createFromTemplateById.
 *
 * ~6 KB total — still far smaller than the ~120 KB full Template.ts.
 */

export interface TemplatePreviewTable {
  name: string;
  x: number;
  y: number;
}

export interface TemplatePreviewData {
  /** Table name + raw canvas position (will be auto-normalized by the SVG renderer) */
  tables: TemplatePreviewTable[];
  /** Relation pairs as [sourceTableIndex, targetTableIndex] into the tables array */
  relations: [number, number][];
}

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Lucide icon name — mapped to the component in the page */
  iconName: string;
  tableCount: number;
  relationCount: number;
  /** Lightweight layout for SVG preview thumbnails */
  preview?: TemplatePreviewData;
}

export const TEMPLATE_METADATA: TemplateMeta[] = [
  {
    id: "saas-multi-tenant",
    name: "SaaS Multi-Tenant",
    category: "B2B",
    description:
      "Full multi-tenant SaaS with Organizations, Users, Roles, Plans, Subscriptions, Invoices, Feature Flags, API Keys, Webhooks, and Audit Logs.",
    iconName: "Building",
    tableCount: 12,
    relationCount: 17,
    preview: {
      tables: [
        { name: "Orgs", x: 50, y: 30 },
        { name: "Users", x: 500, y: 30 },
        { name: "Roles", x: 940, y: 30 },
        { name: "Plans", x: 50, y: 340 },
        { name: "Subs", x: 50, y: 630 },
        { name: "Invoices", x: 500, y: 630 },
        { name: "Invites", x: 500, y: 340 },
        { name: "ApiKeys", x: 940, y: 340 },
        { name: "Webhooks", x: 940, y: 630 },
        { name: "AuditLogs", x: 1350, y: 30 },
        { name: "Sessions", x: 1350, y: 340 },
        { name: "Notifs", x: 1350, y: 630 },
      ],
      relations: [
        [1, 0], [1, 2], [2, 0], [4, 0], [4, 3],
        [5, 0], [5, 4], [6, 0], [6, 1], [7, 0],
        [7, 1], [8, 0], [9, 0], [9, 1], [10, 1],
        [11, 0],
      ],
    },
  },
  {
    id: "e-commerce",
    name: "E-Commerce Store",
    category: "Retail",
    description:
      "Full e-commerce with Customers, Addresses, Categories, Products, Variants, Inventory, Cart, Orders, OrderItems, Payments, Refunds, Coupons, Reviews, and Wishlists.",
    iconName: "ShoppingCart",
    tableCount: 12,
    relationCount: 14,
    preview: {
      tables: [
        { name: "Customers", x: 50, y: 30 },
        { name: "Addresses", x: 50, y: 340 },
        { name: "Categories", x: 500, y: 30 },
        { name: "Products", x: 940, y: 30 },
        { name: "Images", x: 1350, y: 30 },
        { name: "Variants", x: 1350, y: 280 },
        { name: "Orders", x: 500, y: 340 },
        { name: "OrderItems", x: 500, y: 640 },
        { name: "Payments", x: 940, y: 640 },
        { name: "Coupons", x: 50, y: 640 },
        { name: "Reviews", x: 940, y: 340 },
        { name: "Wishlists", x: 1350, y: 540 },
      ],
      relations: [
        [1, 0], [3, 2], [4, 3], [5, 3], [6, 0],
        [6, 9], [7, 6], [7, 3], [7, 5], [8, 6],
        [10, 3], [10, 0], [11, 0], [11, 3],
      ],
    },
  },
  {
    id: "social-media",
    name: "Social Network",
    category: "Social",
    description:
      "Full social platform: Profiles, Posts, PostMedia, Comments, Likes, Follows, Stories, Notifications, Hashtags, PostHashtags, Reports, and BlockedUsers.",
    iconName: "Users",
    tableCount: 12,
    relationCount: 14,
    preview: {
      tables: [
        { name: "Profiles", x: 50, y: 30 },
        { name: "Posts", x: 500, y: 30 },
        { name: "PostMedia", x: 940, y: 30 },
        { name: "Comments", x: 500, y: 310 },
        { name: "Likes", x: 940, y: 310 },
        { name: "Follows", x: 50, y: 310 },
        { name: "Stories", x: 1350, y: 30 },
        { name: "Notifs", x: 50, y: 580 },
        { name: "Hashtags", x: 500, y: 580 },
        { name: "PostTags", x: 940, y: 580 },
        { name: "Reports", x: 1350, y: 310 },
        { name: "Blocked", x: 1350, y: 580 },
      ],
      relations: [
        [1, 0], [2, 1], [3, 1], [3, 0], [4, 0],
        [5, 0], [6, 0], [7, 0], [9, 1], [9, 8],
        [10, 0], [11, 0],
      ],
    },
  },
  {
    id: "healthcare",
    name: "Healthcare System",
    category: "Health",
    description:
      "Hospital EHR: Patients, InsurancePolicies, Departments, Doctors, DoctorSchedules, Appointments, MedicalRecords, Prescriptions, LabTests, LabResults, Billing, and InsuranceClaims.",
    iconName: "Stethoscope",
    tableCount: 10,
    relationCount: 17,
    preview: {
      tables: [
        { name: "Patients", x: 50, y: 30 },
        { name: "Insurance", x: 50, y: 370 },
        { name: "Depts", x: 500, y: 30 },
        { name: "Doctors", x: 940, y: 30 },
        { name: "Schedules", x: 1350, y: 30 },
        { name: "Appts", x: 500, y: 290 },
        { name: "Records", x: 940, y: 290 },
        { name: "Rx", x: 1350, y: 290 },
        { name: "LabTests", x: 50, y: 600 },
        { name: "Billing", x: 500, y: 600 },
      ],
      relations: [
        [1, 0], [3, 2], [4, 3], [5, 0], [5, 3],
        [5, 2], [6, 0], [6, 5], [6, 3], [7, 6],
        [7, 0], [7, 3], [8, 0], [8, 3], [9, 0],
        [9, 5], [9, 1],
      ],
    },
  },
  {
    id: "crm-system",
    name: "CRM System",
    category: "B2B",
    description:
      "Full sales CRM: Companies, Contacts, Pipelines, Stages, Deals, DealProducts, Activities, Tasks, EmailTracking, and Notes.",
    iconName: "Briefcase",
    tableCount: 10,
    relationCount: 14,
    preview: {
      tables: [
        { name: "Companies", x: 50, y: 30 },
        { name: "Contacts", x: 500, y: 30 },
        { name: "Pipelines", x: 940, y: 30 },
        { name: "Stages", x: 940, y: 260 },
        { name: "Deals", x: 500, y: 300 },
        { name: "Products", x: 50, y: 300 },
        { name: "Activities", x: 50, y: 560 },
        { name: "Tasks", x: 500, y: 560 },
        { name: "Emails", x: 940, y: 500 },
        { name: "Notes", x: 1350, y: 500 },
      ],
      relations: [
        [1, 0], [3, 2], [4, 2], [4, 3], [4, 0],
        [4, 1], [5, 4], [6, 4], [6, 1], [7, 4],
        [7, 1], [8, 1], [8, 4], [9, 4],
      ],
    },
  },
  {
    id: "lms",
    name: "Learning Management",
    category: "Education",
    description:
      "Full LMS: Instructors, Courses, Modules, Lessons, LessonProgress, Students, Enrollments, Quizzes, QuizQuestions, QuizSubmissions, Certificates, and CourseReviews.",
    iconName: "GraduationCap",
    tableCount: 11,
    relationCount: 14,
    preview: {
      tables: [
        { name: "Instructors", x: 50, y: 30 },
        { name: "Courses", x: 500, y: 30 },
        { name: "Modules", x: 940, y: 30 },
        { name: "Lessons", x: 940, y: 260 },
        { name: "Students", x: 50, y: 260 },
        { name: "Enrolls", x: 500, y: 310 },
        { name: "Quizzes", x: 1350, y: 30 },
        { name: "Questions", x: 1350, y: 260 },
        { name: "Submits", x: 500, y: 560 },
        { name: "Certs", x: 50, y: 500 },
        { name: "Reviews", x: 940, y: 500 },
      ],
      relations: [
        [1, 0], [2, 1], [3, 2], [5, 4], [5, 1],
        [6, 3], [7, 6], [8, 6], [8, 4], [9, 5],
        [9, 4], [9, 1], [10, 1], [10, 4],
      ],
    },
  },
  {
    id: "hotel-booking",
    name: "Hotel Reservation",
    category: "Travel",
    description:
      "Hotels, RoomTypes, Rooms, Guests, Bookings, BookingAddOns, Payments, Reviews with loyalty and housekeeping.",
    iconName: "Hotel",
    tableCount: 6,
    relationCount: 8,
    preview: {
      tables: [
        { name: "Hotels", x: 50, y: 30 },
        { name: "RoomTypes", x: 500, y: 30 },
        { name: "Guests", x: 50, y: 310 },
        { name: "Bookings", x: 500, y: 310 },
        { name: "Payments", x: 50, y: 580 },
        { name: "Reviews", x: 500, y: 580 },
      ],
      relations: [
        [1, 0], [3, 0], [3, 1], [3, 2],
        [4, 3], [5, 3], [5, 2], [5, 0],
      ],
    },
  },
  {
    id: "kanban-board",
    name: "Kanban Task Manager",
    category: "Productivity",
    description:
      "Workspaces, Members, Boards, Columns, Tasks, Subtasks, Labels, TaskLabels, Assignees, Comments, Attachments, and ActivityLog.",
    iconName: "CheckSquare",
    tableCount: 10,
    relationCount: 11,
    preview: {
      tables: [
        { name: "Spaces", x: 50, y: 30 },
        { name: "Members", x: 50, y: 260 },
        { name: "Boards", x: 500, y: 30 },
        { name: "Columns", x: 940, y: 30 },
        { name: "Tasks", x: 500, y: 280 },
        { name: "Labels", x: 940, y: 250 },
        { name: "TaskLabels", x: 940, y: 430 },
        { name: "Assignees", x: 50, y: 450 },
        { name: "Comments", x: 500, y: 530 },
        { name: "Files", x: 940, y: 530 },
      ],
      relations: [
        [1, 0], [2, 0], [3, 2], [4, 2], [4, 3],
        [5, 2], [6, 4], [6, 5], [7, 4], [8, 4],
        [9, 4],
      ],
    },
  },
  {
    id: "food-delivery",
    name: "Food Delivery",
    category: "Retail",
    description:
      "Restaurants, MenuCategories, MenuItems, ItemModifiers, Customers, Orders, OrderItems, Drivers, DeliveryTracking, PromoOffers, and Reviews.",
    iconName: "UtensilsCrossed",
    tableCount: 8,
    relationCount: 12,
    preview: {
      tables: [
        { name: "Restaurants", x: 50, y: 30 },
        { name: "Categories", x: 500, y: 30 },
        { name: "MenuItems", x: 940, y: 30 },
        { name: "Customers", x: 50, y: 310 },
        { name: "Orders", x: 500, y: 310 },
        { name: "OrderItems", x: 940, y: 310 },
        { name: "Drivers", x: 50, y: 560 },
        { name: "Reviews", x: 500, y: 560 },
      ],
      relations: [
        [1, 0], [2, 1], [2, 0], [4, 3], [4, 0],
        [4, 6], [5, 4], [5, 2], [7, 4], [7, 3],
        [7, 0], [7, 6],
      ],
    },
  },
  {
    id: "payment-fintech",
    name: "Payment System",
    category: "Finance",
    description:
      "Full fintech: Accounts, KYC, Wallets, PaymentMethods, Transactions, LedgerEntries, Transfers, Disputes, and Payouts.",
    iconName: "CreditCard",
    tableCount: 6,
    relationCount: 9,
    preview: {
      tables: [
        { name: "Accounts", x: 50, y: 30 },
        { name: "Wallets", x: 500, y: 30 },
        { name: "Methods", x: 940, y: 30 },
        { name: "Txns", x: 500, y: 310 },
        { name: "Ledger", x: 50, y: 310 },
        { name: "Disputes", x: 940, y: 310 },
      ],
      relations: [
        [1, 0], [2, 0], [3, 1], [3, 2],
        [4, 3], [4, 1], [5, 3], [5, 0],
      ],
    },
  },
  {
    id: "blog-cms",
    name: "Blog & CMS",
    category: "Content",
    description:
      "Headless CMS: Authors, Posts, Categories, Tags, PostCategories, PostTags, Comments, Revisions, MediaLibrary, and Newsletters.",
    iconName: "Newspaper",
    tableCount: 9,
    relationCount: 9,
    preview: {
      tables: [
        { name: "Authors", x: 50, y: 30 },
        { name: "Posts", x: 500, y: 30 },
        { name: "Categories", x: 940, y: 30 },
        { name: "Tags", x: 940, y: 240 },
        { name: "PostCats", x: 940, y: 400 },
        { name: "PostTags", x: 940, y: 520 },
        { name: "Comments", x: 500, y: 330 },
        { name: "Revisions", x: 50, y: 300 },
        { name: "Media", x: 50, y: 530 },
      ],
      relations: [
        [1, 0], [4, 1], [4, 2], [5, 1], [5, 3],
        [6, 1], [7, 1], [7, 0], [8, 0],
      ],
    },
  },
  {
    id: "blank",
    name: "Blank Canvas",
    category: "Utility",
    description: "Start from scratch with a completely empty schema.",
    iconName: "Database",
    tableCount: 0,
    relationCount: 0,
    // No preview — the card shows the dashed empty-state circle
  },
];