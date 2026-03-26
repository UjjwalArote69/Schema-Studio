/**
 * Lightweight template metadata for the client-side templates browser.
 *
 * This file contains only what's needed to render the template cards:
 * name, description, category, icon name, and counts. The full schema
 * data (tables, relations, columns) stays in Template.ts which is only
 * imported server-side by the createFromTemplateById action.
 *
 * ~3KB vs ~100KB+ — this is what gets shipped in the JS bundle.
 */

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Lucide icon name — mapped to the component in the page */
  iconName: string;
  tableCount: number;
  relationCount: number;
}

export const TEMPLATE_METADATA: TemplateMeta[] = [
  {
    id: "saas-multi-tenant",
    name: "SaaS Multi-Tenant",
    category: "B2B",
    description: "Full multi-tenant SaaS with Organizations, Users, Roles, Plans, Subscriptions, Invoices, Feature Flags, API Keys, Webhooks, and Audit Logs.",
    iconName: "Building",
    tableCount: 12,
    relationCount: 17,
  },
  {
    id: "e-commerce",
    name: "E-Commerce Store",
    category: "Retail",
    description: "Full e-commerce with Customers, Addresses, Categories, Products, Variants, Inventory, Cart, Orders, OrderItems, Payments, Refunds, Coupons, Reviews, and Wishlists.",
    iconName: "ShoppingCart",
    tableCount: 12,
    relationCount: 14,
  },
  {
    id: "social-media",
    name: "Social Network",
    category: "Social",
    description: "Full social platform: Profiles, Posts, PostMedia, Comments, Likes, Follows, Stories, Notifications, Hashtags, PostHashtags, Reports, and BlockedUsers.",
    iconName: "Users",
    tableCount: 12,
    relationCount: 14,
  },
  {
    id: "healthcare",
    name: "Healthcare System",
    category: "Health",
    description: "Hospital EHR: Patients, InsurancePolicies, Departments, Doctors, DoctorSchedules, Appointments, MedicalRecords, Prescriptions, LabTests, LabResults, Billing, and InsuranceClaims.",
    iconName: "Stethoscope",
    tableCount: 10,
    relationCount: 17,
  },
  {
    id: "crm-system",
    name: "CRM System",
    category: "B2B",
    description: "Full sales CRM: Companies, Contacts, Pipelines, Stages, Deals, DealProducts, Activities, Tasks, EmailTracking, and Notes.",
    iconName: "Briefcase",
    tableCount: 10,
    relationCount: 14,
  },
  {
    id: "lms",
    name: "Learning Management",
    category: "Education",
    description: "Full LMS: Instructors, Courses, Modules, Lessons, LessonProgress, Students, Enrollments, Quizzes, QuizQuestions, QuizSubmissions, Certificates, and CourseReviews.",
    iconName: "GraduationCap",
    tableCount: 11,
    relationCount: 14,
  },
  {
    id: "hotel-booking",
    name: "Hotel Reservation",
    category: "Travel",
    description: "Hotels, RoomTypes, Rooms, Guests, Bookings, BookingAddOns, Payments, Reviews with loyalty and housekeeping.",
    iconName: "Hotel",
    tableCount: 6,
    relationCount: 8,
  },
  {
    id: "kanban-board",
    name: "Kanban Task Manager",
    category: "Productivity",
    description: "Workspaces, Members, Boards, Columns, Tasks, Subtasks, Labels, TaskLabels, Assignees, Comments, Attachments, and ActivityLog.",
    iconName: "CheckSquare",
    tableCount: 10,
    relationCount: 11,
  },
  {
    id: "food-delivery",
    name: "Food Delivery",
    category: "Retail",
    description: "Restaurants, MenuCategories, MenuItems, ItemModifiers, Customers, Orders, OrderItems, Drivers, DeliveryTracking, PromoOffers, and Reviews.",
    iconName: "UtensilsCrossed",
    tableCount: 8,
    relationCount: 12,
  },
  {
    id: "payment-fintech",
    name: "Payment System",
    category: "Finance",
    description: "Full fintech: Accounts, KYC, Wallets, PaymentMethods, Transactions, LedgerEntries, Transfers, Disputes, and Payouts.",
    iconName: "CreditCard",
    tableCount: 6,
    relationCount: 9,
  },
  {
    id: "blog-cms",
    name: "Blog & CMS",
    category: "Content",
    description: "Headless CMS: Authors, Posts, Categories, Tags, PostCategories, PostTags, Comments, Revisions, MediaLibrary, and Newsletters.",
    iconName: "Newspaper",
    tableCount: 9,
    relationCount: 9,
  },
  {
    id: "blank",
    name: "Blank Canvas",
    category: "Utility",
    description: "Start from scratch with a completely empty schema.",
    iconName: "Database",
    tableCount: 0,
    relationCount: 0,
  },
];