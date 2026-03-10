# 🏫 College Management System — Complete Project Documentation

> **Project Type:** Dedicated Single-Institution College Management System  
> **Gift Project For:** College Principal  
> **Developer:** Solo Developer  
> **Last Updated:** February 2026  
> **Status:** Planning Complete — Ready For Development  

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Product Strategy & Planning](#2-product-strategy--planning)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Online vs Offline Strategy](#5-online-vs-offline-strategy)
6. [Database Architecture](#6-database-architecture)
7. [UI/UX Design System](#7-uiux-design-system)
8. [APK Distribution & Update Strategy](#8-apk-distribution--update-strategy)
9. [Deployment & Hosting](#9-deployment--hosting)
10. [Long-Term Scalability](#10-long-term-scalability)
11. [Folder & File Structure](#11-folder--file-structure)
12. [Feature Specifications](#12-feature-specifications)
13. [Development Sprints](#13-development-sprints)
14. [API Reference](#14-api-reference)
15. [Security Guidelines](#15-security-guidelines)

---

## 1. Project Overview

### 1.1 What Is This System?

A fully custom, production-grade **College Management System** built exclusively for a single college institution. The system covers administration, academics, communication, attendance, fees, and student life in one unified platform — accessible via both a **Web Application** and a **Mobile Application (Android)**.

### 1.2 The Core Vision

> *"A real-time, role-based college management platform that gives the principal complete visibility and control over every aspect of the college — from live classroom monitoring to individual student records — while empowering teachers, parents, and students with their own tailored portals."*

### 1.3 Institution Profile

| Property | Details |
|---|---|
| Institution Type | Intermediate College (FSc / ICS / ICom / FA) |
| Campuses | Two — Boys Campus & Girls Campus |
| Student Count | 1000+ students |
| Staff Count | ~45+ teaching and admin staff |
| Programs | FSc Pre-Medical, FSc Pre-Engineering, ICS, ICom, FA |
| Grade Structure | Part 1 (Year 1) and Part 2 (Year 2) per program |
| Section Structure | Multiple sections per grade (A, B, C, D...) |
| Shared Staff | Some teachers work across both campuses |
| Country | Pakistan (Single country, single currency — PKR) |

### 1.4 Problems This System Solves

**For Administration:**
- Manual fee tracking leads to errors and revenue leakage
- No centralized student or staff records
- Communication happens through paper notices or WhatsApp groups
- Report generation is time-consuming and error-prone
- Timetable creation is a complex, error-prone manual task
- No real-time visibility into which teacher is in which class

**For the Principal:**
- No live overview of what's happening across both campuses simultaneously
- No instant alert when a teacher is absent and a class is unattended
- No quick way to find a free substitute teacher
- No drill-down view from campus level all the way to individual student

**For Teachers:**
- No structured way to manage homework, attendance, and grades
- Communication with parents is fragmented
- No digital timetable — relying on paper

**For Parents:**
- No real-time visibility into their child's progress or school updates
- Fee receipts get lost, payment history unclear
- Find out about problems too late

**For Students:**
- Assignments forgotten or lost
- Results take days to reach them
- No way to track their own academic performance

### 1.5 Key Decisions Summary

| Decision | Choice | Reason |
|---|---|---|
| Product Type | Dedicated single-institution | Gift project for one college |
| Monetization | None | Gift — no billing needed |
| Multi-tenant | No | Single college only |
| Campuses | Two (Boys + Girls) | Institution structure |
| Language | English only | Confirmed by requirement |
| Country | Pakistan (PKR) — expand later | Single country first |
| Hosting | Local server first → Cloud later | Practical & cost-effective |
| Mobile Platform | Android APK first, iOS later | Primary user devices |
| Distribution | Website APK download | Simple, fast, no approval needed |

---

## 2. Product Strategy & Planning

### 2.1 User Roles

The system has five distinct user roles, each with a completely different portal and permission set.

```
SUPER_ADMIN (Principal)
  └── Full access to everything across both campuses
      Live dashboard, all reports, all student/staff data
      Internal chat with all teachers
      Substitute assignment, timetable override

ADMIN
  └── Full school management for their assigned campus
      Student & staff management
      Fee collection (mark as paid)
      Timetable management
      Staff attendance marking
      Announcements

TEACHER
  └── Their own classes only
      Mark student attendance
      Enter exam marks
      View own timetable
      Internal chat with principal

PARENT
  └── Their own child's data only (view only)
      Attendance history
      Fee status and payment history
      Results and report cards
      Announcements
      WhatsApp contact button for teacher

STUDENT
  └── Their own profile only (view only)
      Personal timetable
      Attendance summary
      Results and grades
      Announcements
```

### 2.2 Feature List By Role

#### 🔴 Principal / Super Admin Features
- Live command dashboard with real-time college status
- Live timetable view — see which teacher is in which class right now
- Absent teacher alerts with affected class list
- Free teacher finder for substitute assignment
- Temporary substitute assignment
- Hierarchical student browser (Campus → Program → Grade → Section → Student)
- Full individual student profile (all records in one view)
- Full individual staff profile with timetable
- WhatsApp click-to-chat with any parent or teacher
- Internal chat with all teachers
- Both campus views — unified and individual
- All reports and analytics
- College-wide announcements

#### 🛠️ Admin Features
- Staff management (add, edit, deactivate)
- Student enrollment and record management
- Class and section management
- Fee structure setup
- Manual fee collection (mark student as paid)
- Fee defaulters list
- Staff attendance marking (every morning)
- Absence alert trigger (notifies principal)
- Timetable guided builder with conflict detection
- Timetable template save and copy
- Exam scheduling
- Result verification
- Announcement creation
- Student and staff reports

#### 👨‍🏫 Teacher Features
- Personal dashboard with today's schedule
- Student attendance marking (per class, per period)
- Offline attendance marking with sync queue
- Exam marks entry
- View own timetable
- View class student list with full details
- Internal chat with principal
- WhatsApp button to contact parents

#### 👨‍👩‍👧 Parent Features
- Child's attendance history and percentage
- Fee payment status and receipt history
- Exam results and report card
- Announcements from college
- WhatsApp button to contact class teacher
- Push notifications for important updates

#### 🎓 Student Features
- Personal timetable for the day/week
- Attendance summary and history
- Exam results and grades
- College announcements
- Push notifications

### 2.3 Exam Structure

| Exam Type | Description | Tracked In System |
|---|---|---|
| Monthly Tests | Regular short tests throughout semester | ✅ Full marks entry |
| Mid-Term Exams | Semester mid-point assessment | ✅ Full marks entry |
| Final / Annual Exams | End of year — before Board | ✅ Full marks entry |
| Practical Exams | Lab-based assessments | ✅ Full marks entry |
| BISE / Board Exams | External board examinations | ✅ Tracked separately (board roll no, marks only) |

### 2.4 Fee System Design

The fee system is intentionally simple — manual cash collection at the office.

**Flow:**
1. Admin sets up fee structure per program per semester (one-time setup)
2. System auto-generates a fee record for every student
3. Student pays cash at the admin office
4. Admin opens student profile → clicks "Mark as Paid"
5. Admin enters: amount received, date, receipt number
6. Status changes from PENDING → PAID
7. System generates a digital receipt
8. Student/Parent sees updated status on their app instantly

**No online payment gateway is needed for Phase 1.**

### 2.5 Timetable Strategy

**Phase 1 (Build Now):** Guided Step-by-Step Builder
- Step-by-step wizard walks admin through timetable creation
- Real-time conflict detection (red warning if teacher double-booked)
- Shared teacher awareness across both campuses
- Save as template feature
- Copy from last semester feature

**Phase 2 (Add Later):** Auto-Generation Engine
- Admin provides constraints (subjects, teachers, periods needed)
- System generates a complete conflict-free draft timetable
- Admin reviews and adjusts via drag-and-drop
- Built on top of Phase 1 foundation — no rewrite needed

### 2.6 Staff Attendance — Advanced Module

This is one of the most sophisticated features in the system.

**Morning Workflow:**
1. Admin opens staff attendance page every morning
2. All staff listed with toggle buttons (Present / Absent)
3. Admin marks each teacher's status
4. System saves attendance with timestamp

**When A Teacher Is Marked Absent:**
1. System immediately checks that teacher's timetable for today
2. Identifies all affected periods and classes
3. Sends real-time alert to Principal's dashboard:
   - Teacher name
   - All affected classes and periods
   - List of currently free teachers who can substitute
4. Principal can assign substitute directly from the alert
5. Timetable live view updates to show the substitute or mark class as unattended

**Principal's Live Timetable View:**
- Shows all classes at the current period in real-time
- 🟢 Green = Teacher present, class running
- 🔴 Red = Teacher absent, class unattended — action needed
- 🟡 Yellow = Break or free period
- Updates automatically as periods change throughout the day

**Free Teacher Finder:**
- At any period, principal can see exactly which teachers have no assigned class
- Cross-campus awareness — won't suggest a teacher who's at the other campus
- One-click substitute assignment

---

## 3. Technology Stack

### 3.1 Chosen Stack

```
┌─────────────────────────────────────────────┐
│          COMPLETE TECHNOLOGY STACK           │
├─────────────────────────────────────────────┤
│  Mobile App    →   React Native + Expo       │
│  Web App       →   Next.js 14 + TypeScript   │
│  Backend API   →   Node.js + Express + TS    │
│  Database      →   PostgreSQL                │
│  ORM           →   Prisma                    │
│  Styling       →   Tailwind CSS + ShadCN UI  │
│  State (Web)   →   Zustand + React Query     │
│  Real-time     →   Socket.io                 │
│  File Storage  →   Local → Cloudinary        │
│  Auth          →   JWT + Refresh Tokens      │
│  Hosting (Web) →   Vercel (free)             │
│  Hosting (API) →   Local → Railway/Render    │
│  Monitoring    →   UptimeRobot (free)        │
└─────────────────────────────────────────────┘
```

### 3.2 Technology Decisions — Reasoning

#### Backend: Node.js + Express + TypeScript
- Same language (JavaScript/TypeScript) across backend and frontend — one language for the entire system
- Non-blocking I/O handles concurrent users efficiently (perfect for 500+ simultaneous users at peak)
- Native WebSocket support via Socket.io for real-time features
- Massive ecosystem and community
- TypeScript catches bugs before runtime

#### Frontend Web: Next.js 14
- File-based routing — no router configuration needed
- Server-side rendering — fast initial page loads
- Built-in image optimization
- Perfect for large multi-page applications like a college portal
- First-class TypeScript support

#### Mobile: React Native + Expo
- Same React knowledge from web frontend transfers directly
- One codebase for Android (and iOS later)
- Expo ecosystem: push notifications, local storage, background sync, APK building
- EAS Build generates production APK files easily

#### Database: PostgreSQL
- Ideal for relational data (students → classes → teachers → results)
- Excellent performance with proper indexing
- ACID compliant — critical for financial (fee) data
- Full JSON support when needed
- Free and open source

#### ORM: Prisma
- Clean, readable database queries
- Auto-generates TypeScript types from schema
- Migration system built-in
- Prevents SQL injection by design

### 3.3 Key Libraries

| Library | Purpose |
|---|---|
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT generation and verification |
| `helmet` | Security headers |
| `express-rate-limit` | Prevent brute force attacks |
| `zod` | Request validation |
| `multer` | File upload handling |
| `socket.io` | Real-time communication |
| `react-query` | Data fetching, caching, sync |
| `zustand` | Lightweight global state |
| `axios` | HTTP client |
| `react-navigation` | Mobile app navigation |
| `expo-notifications` | Push notifications |
| `expo-sqlite` | Local offline database |
| `expo-background-fetch` | Background sync |
| `expo-secure-store` | Secure token storage on device |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌──────────────────┐         ┌──────────────────┐
│    Web App        │         │   Mobile App      │
│   (Next.js)       │         │ (React Native)    │
└────────┬─────────┘         └────────┬──────────┘
         │                            │
         │      HTTPS REST API        │
         │    + WebSocket (RT)        │
         ▼                            ▼
┌──────────────────────────────────────────────┐
│              Backend API Server               │
│           (Node.js + Express + TS)            │
│                                               │
│  ┌─────────────┐    ┌─────────────────────┐  │
│  │  REST API   │    │   WebSocket Server  │  │
│  │  Routes     │    │    (Socket.io)       │  │
│  └─────────────┘    └─────────────────────┘  │
│                                               │
│  ┌─────────────┐    ┌─────────────────────┐  │
│  │ Auth Middle │    │   File Upload       │  │
│  │    ware     │    │    Handler          │  │
│  └─────────────┘    └─────────────────────┘  │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │PostgreSQL│ │  Redis   │ │Cloudinary│
   │(Main DB) │ │ (Cache)  │ │ (Files)  │
   └──────────┘ └──────────┘ └──────────┘
```

**Core Principle:** Both the Web App and Mobile App talk to the **same single backend API**. There is no separate backend for mobile. One API serves all clients.

### 4.2 Authentication Flow

**Technology:** JWT (JSON Web Tokens) with Refresh Token Rotation

```
LOGIN FLOW:
User submits email + password
        │
        ▼
Backend verifies credentials (bcrypt compare)
        │
        ▼
Backend issues TWO tokens:
  ├── Access Token  (expires: 15 minutes)
  └── Refresh Token (expires: 7 days)
        │
        ▼
Web App  → Stores in HttpOnly cookies (XSS safe)
Mobile   → Stores in Expo SecureStore (encrypted)
        │
        ▼
Every API request:
  └── Sends Access Token in Authorization header
      Authorization: Bearer <access_token>
        │
        ▼
When Access Token expires:
  └── App auto-uses Refresh Token → gets new Access Token
      User never sees a logout
        │
        ▼
When Refresh Token expires (after 7 days):
  └── User must log in again
```

### 4.3 Role-Based Access Control (RBAC)

Every API endpoint checks the user's role before returning data. Access control lives at the API level, not the UI level.

```
Request arrives at API
        │
        ▼
Auth Middleware: Is token valid?
  ├── No  → 401 Unauthorized
  └── Yes → Attach user to request
        │
        ▼
Role Middleware: Does this role have permission?
  ├── No  → 403 Forbidden
  └── Yes → Pass to Controller
        │
        ▼
Campus Filter: Does this user belong to this campus?
  ├── No  → 403 Forbidden
  └── Yes → Execute and return data
```

| Role | Accessible Data |
|---|---|
| SUPER_ADMIN | Everything — both campuses |
| ADMIN | Their assigned campus only |
| TEACHER | Their own classes and profile |
| PARENT | Their child's data only |
| STUDENT | Their own profile and data |

### 4.4 Real-Time Communication (Socket.io)

Used for features that need instant updates without page refresh.

| Event | Trigger | Recipients |
|---|---|---|
| `teacher:absent` | Admin marks teacher absent | Principal dashboard |
| `substitute:assigned` | Principal assigns substitute | All relevant teachers |
| `timetable:update` | Timetable slot changes | Teachers and students of that section |
| `announcement:new` | New announcement posted | Target audience |
| `chat:message` | New message sent | Specific chat recipient |
| `fee:paid` | Fee marked as paid | Parent of that student |
| `notification:push` | System notification | Specific user |

### 4.5 API Structure

All endpoints follow this pattern: `/api/v1/{module}/{action}`

The `v1` prefix ensures backward compatibility — if breaking changes are needed in future, a `v2` can be created without breaking existing mobile app users.

```
/api/v1/
├── /auth
│     ├── POST   /login
│     ├── POST   /logout
│     └── POST   /refresh-token
├── /campus
├── /programs
├── /grades
├── /sections
├── /students
├── /parents
├── /staff
├── /subjects
├── /timetable
├── /attendance/students
├── /attendance/staff
├── /fees
├── /exams
├── /results
├── /announcements
├── /chat
├── /notifications
├── /leave
├── /reports
├── /dashboard/principal
├── /dashboard/admin
├── /dashboard/teacher
├── /dashboard/parent
├── /dashboard/student
└── /app/version
```

---

## 5. Online vs Offline Strategy

### 5.1 Chosen Architecture: Smart Hybrid

The app is **online-first** by default, but selected critical features cache their data locally so they continue working during brief connection drops.

**Why not fully online?** Teachers mark attendance on mobile on campus — signal may drop. A fully online app would make attendance marking fail.

**Why not fully offline-first?** Internet at the college is mostly reliable. A full offline system adds enormous complexity that isn't justified.

**Smart Hybrid** is the right balance: seamless online experience with graceful offline fallback for critical actions.

### 5.2 Offline Feature Matrix

| Feature | Role | Offline Support | Reason |
|---|---|---|---|
| Mark attendance | Teacher | ✅ Queue & sync | Daily critical task |
| View class timetable | Teacher | ✅ Cached | Read-only, rarely changes |
| View student list | Teacher | ✅ Cached | Needed to mark attendance |
| Enter exam marks | Teacher | ✅ Queue & sync | Exam period critical |
| View child's attendance | Parent | ✅ Cached | Most common parent action |
| View fee history | Parent | ✅ Cached | Reference data |
| View results | Parent/Student | ✅ Cached | Reference data |
| View timetable | Student | ✅ Cached | Most accessed feature |
| View announcements | All | ✅ Cached | Already downloaded |
| Pay fees online | Admin | ❌ Online only | Requires live confirmation |
| Message teacher | Parent | ❌ Online only | Real-time communication |
| Live dashboard | Principal | ❌ Online only | Must be real-time |
| Fee management | Admin | ❌ Online only | Financial data must be live |

### 5.3 How Data Syncing Works

```
STEP 1 — Cache on Fetch
Every successful API response is saved locally.
User sees data → data also written to SQLite cache.

STEP 2 — Detect Offline
App monitors network status continuously.
When offline: show banner "You're offline — showing last updated data"
Read actions → serve from cache normally
Write actions → add to Sync Queue

STEP 3 — Sync Queue (for write actions)
Teacher marks attendance offline:
  └── Saved to Sync Queue:
        action: "MARK_ATTENDANCE"
        data: { sectionId, date, records: [...] }
        timestamp: exact time of action
        status: "PENDING"

STEP 4 — Auto Sync When Back Online
Internet restored → app detects it immediately
  └── Process Sync Queue (oldest first)
  └── Send each pending action to server
  └── Server confirms → remove from queue
  └── Toast: "Attendance synced successfully ✓"

STEP 5 — Background Sync
Every 15 minutes (app in background via Expo Background Fetch):
  └── Check internet
  └── Process pending sync queue
  └── Refresh cached data
  └── Trigger push notification if new data found
```

### 5.4 Conflict Resolution Rules

| Scenario | Rule |
|---|---|
| Teacher marked attendance offline, online sync arrives | Last write wins by timestamp |
| Admin updated student info on web, teacher had cached version | Server version wins for read data |
| Two records edited same data offline simultaneously | Flag for admin manual review |
| Parent views stale fee data | Show "last updated" label — don't sync automatically |

---

## 6. Database Architecture

### 6.1 All Modules

```
01. Authentication & Users
02. Campus Management
03. Program Management
04. Grade Management (Part 1 / Part 2)
05. Section Management
06. Student Profiles
07. Parent Profiles & Student-Parent Linking
08. Staff Profiles
09. Staff-Campus Assignment (shared teacher handling)
10. Subject Management
11. Section-Subject-Teacher Assignment
12. Timetable
13. Student Attendance
14. Staff Attendance (Advanced)
15. Fee Structure & Fee Records
16. Exam Management
17. Result Management
18. Announcements
19. Staff Leave & HR
20. Notifications
21. Internal Chat
22. Audit Logs
```

### 6.2 Entity Relationship Overview

```
CAMPUS
  └──< PROGRAMS
         └──< GRADES
                └──< SECTIONS
                       ├──< STUDENT_PROFILES
                       │      ├──< STUDENT_ATTENDANCE
                       │      ├──< EXAM_RESULTS
                       │      ├──< FEE_RECORDS
                       │      └──>  PARENT_PROFILES (via link table)
                       │
                       ├──< SECTION_SUBJECT_TEACHER
                       │      ├──> SUBJECTS
                       │      └──> STAFF_PROFILES
                       │
                       └──< TIMETABLE_SLOTS
                              ├──> SUBJECTS
                              └──> STAFF_PROFILES

STAFF_PROFILES
  ├──< STAFF_CAMPUS_ASSIGNMENT ──> CAMPUS
  ├──< STAFF_LEAVE
  └──< STAFF_ATTENDANCE

EXAMS
  ├──> SECTION
  ├──> SUBJECT
  └──< EXAM_RESULTS ──> STUDENT_PROFILES
```

### 6.3 Complete Table Definitions

#### USERS
```sql
id                UUID PRIMARY KEY
email             VARCHAR(255) UNIQUE NOT NULL
phone             VARCHAR(20)
password_hash     VARCHAR(255) NOT NULL
role              ENUM('SUPER_ADMIN','ADMIN','TEACHER','PARENT','STUDENT')
is_active         BOOLEAN DEFAULT true
last_login        TIMESTAMP
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP
```

#### CAMPUS
```sql
id                UUID PRIMARY KEY
name              VARCHAR(100) NOT NULL  -- "Boys Campus" / "Girls Campus"
address           TEXT
contact_number    VARCHAR(20)
campus_code       VARCHAR(10)            -- "BOY" / "GIRL"
is_active         BOOLEAN DEFAULT true
```

#### PROGRAMS
```sql
id                UUID PRIMARY KEY
campus_id         UUID REFERENCES campus(id)
name              VARCHAR(100)           -- "FSc Pre-Medical"
code              VARCHAR(10)            -- "FSPM"
total_years       INTEGER DEFAULT 2
is_active         BOOLEAN DEFAULT true
```

#### GRADES
```sql
id                UUID PRIMARY KEY
program_id        UUID REFERENCES programs(id)
name              VARCHAR(50)            -- "Part 1" / "Part 2"
year_number       INTEGER                -- 1 or 2
is_active         BOOLEAN DEFAULT true
```

#### SECTIONS
```sql
id                UUID PRIMARY KEY
grade_id          UUID REFERENCES grades(id)
campus_id         UUID REFERENCES campus(id)
name              VARCHAR(10)            -- "A", "B", "C"
class_teacher_id  UUID REFERENCES staff_profiles(id)
room_number       VARCHAR(20)
academic_year     VARCHAR(10)            -- "2024-2025"
max_students      INTEGER
is_active         BOOLEAN DEFAULT true
```

#### STUDENT_PROFILES
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
campus_id         UUID REFERENCES campus(id)
section_id        UUID REFERENCES sections(id)
roll_number       VARCHAR(20)
registration_no   VARCHAR(50) UNIQUE
full_name         VARCHAR(200) NOT NULL
father_name       VARCHAR(200)
date_of_birth     DATE
gender            ENUM('MALE','FEMALE')
cnic_b_form       VARCHAR(20)
address           TEXT
phone             VARCHAR(20)
profile_photo_url TEXT
admission_date    DATE
status            ENUM('ACTIVE','SUSPENDED','GRADUATED','WITHDRAWN')
created_at        TIMESTAMP DEFAULT NOW()
```

#### PARENT_PROFILES
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
full_name         VARCHAR(200) NOT NULL
relationship      ENUM('FATHER','MOTHER','GUARDIAN')
cnic              VARCHAR(20)
phone             VARCHAR(20) NOT NULL
email             VARCHAR(255)
occupation        VARCHAR(100)
address           TEXT
```

#### STUDENT_PARENT_LINK
```sql
id                UUID PRIMARY KEY
student_id        UUID REFERENCES student_profiles(id)
parent_id         UUID REFERENCES parent_profiles(id)
is_primary        BOOLEAN DEFAULT true
```

#### STAFF_PROFILES
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
primary_campus_id UUID REFERENCES campus(id)
employee_id       VARCHAR(50) UNIQUE
full_name         VARCHAR(200) NOT NULL
designation       VARCHAR(100)           -- "Professor", "Lecturer"
specialization    VARCHAR(100)           -- "Physics", "Mathematics"
cnic              VARCHAR(20)
phone             VARCHAR(20)
email             VARCHAR(255)
date_of_joining   DATE
employment_type   ENUM('PERMANENT','CONTRACT','VISITING')
profile_photo_url TEXT
is_active         BOOLEAN DEFAULT true
```

#### STAFF_CAMPUS_ASSIGNMENT
```sql
id                UUID PRIMARY KEY
staff_id          UUID REFERENCES staff_profiles(id)
campus_id         UUID REFERENCES campus(id)
is_primary        BOOLEAN
available_days    JSONB                  -- ["MON","WED","FRI"]
assigned_from     DATE
```

#### SUBJECTS
```sql
id                UUID PRIMARY KEY
name              VARCHAR(100) NOT NULL  -- "Physics"
code              VARCHAR(10)            -- "PHY"
type              ENUM('THEORY','PRACTICAL','BOTH')
total_periods_per_week INTEGER
is_active         BOOLEAN DEFAULT true
```

#### SECTION_SUBJECT_TEACHER
```sql
id                UUID PRIMARY KEY
section_id        UUID REFERENCES sections(id)
subject_id        UUID REFERENCES subjects(id)
teacher_id        UUID REFERENCES staff_profiles(id)
periods_per_week  INTEGER
academic_year     VARCHAR(10)
is_active         BOOLEAN DEFAULT true
```

#### TIMETABLE_PERIODS_CONFIG
```sql
id                UUID PRIMARY KEY
campus_id         UUID REFERENCES campus(id)
period_number     INTEGER
start_time        TIME
end_time          TIME
label             VARCHAR(50)            -- "Period 1", "Break", "Lunch"
```

#### TIMETABLE_SLOTS
```sql
id                UUID PRIMARY KEY
section_id        UUID REFERENCES sections(id)
subject_id        UUID REFERENCES subjects(id)
teacher_id        UUID REFERENCES staff_profiles(id)
campus_id         UUID REFERENCES campus(id)
day_of_week       ENUM('MON','TUE','WED','THU','FRI','SAT')
period_number     INTEGER
start_time        TIME
end_time          TIME
room_number       VARCHAR(20)
slot_type         ENUM('THEORY','PRACTICAL','BREAK')
academic_year     VARCHAR(10)
```

#### STUDENT_ATTENDANCE
```sql
id                UUID PRIMARY KEY
student_id        UUID REFERENCES student_profiles(id)
section_id        UUID REFERENCES sections(id)
subject_id        UUID REFERENCES subjects(id)
teacher_id        UUID REFERENCES staff_profiles(id)
date              DATE NOT NULL
status            ENUM('PRESENT','ABSENT','LATE','LEAVE')
marked_at         TIMESTAMP
remarks           TEXT
is_synced         BOOLEAN DEFAULT true   -- false if came from offline queue
```

#### MONTHLY_ATTENDANCE_SUMMARY
```sql
id                UUID PRIMARY KEY
student_id        UUID REFERENCES student_profiles(id)
section_id        UUID REFERENCES sections(id)
month             INTEGER
year              INTEGER
total_days        INTEGER
present_days      INTEGER
absent_days       INTEGER
late_days         INTEGER
attendance_percentage DECIMAL(5,2)
```

#### STAFF_ATTENDANCE
```sql
id                UUID PRIMARY KEY
staff_id          UUID REFERENCES staff_profiles(id)
campus_id         UUID REFERENCES campus(id)
date              DATE NOT NULL
status            ENUM('PRESENT','ABSENT','ON_LEAVE','HALF_DAY','HOLIDAY')
marked_by         UUID REFERENCES users(id)
marked_at         TIMESTAMP
leave_id          UUID REFERENCES staff_leave(id)
remarks           TEXT
```

#### FEE_STRUCTURE
```sql
id                UUID PRIMARY KEY
campus_id         UUID REFERENCES campus(id)
program_id        UUID REFERENCES programs(id)
grade_id          UUID REFERENCES grades(id)
academic_year     VARCHAR(10)
semester          VARCHAR(20)
total_amount      DECIMAL(10,2)
due_date          DATE
fee_breakdown     JSONB                  -- {admission: 2000, tuition: 8000}
```

#### FEE_RECORDS
```sql
id                UUID PRIMARY KEY
student_id        UUID REFERENCES student_profiles(id)
fee_structure_id  UUID REFERENCES fee_structure(id)
academic_year     VARCHAR(10)
semester          VARCHAR(20)
amount_due        DECIMAL(10,2)
amount_paid       DECIMAL(10,2)
payment_date      DATE
receipt_number    VARCHAR(50)
collected_by      UUID REFERENCES staff_profiles(id)
payment_method    VARCHAR(20) DEFAULT 'CASH'
status            ENUM('PENDING','PARTIAL','PAID','WAIVED','OVERDUE')
remarks           TEXT
```

#### EXAM_TYPES
```sql
id                UUID PRIMARY KEY
campus_id         UUID REFERENCES campus(id)
name              VARCHAR(100)           -- "Monthly Test", "Mid-Term"
code              VARCHAR(10)            -- "MT", "MID", "FIN"
contributes_to_result BOOLEAN
academic_year     VARCHAR(10)
```

#### EXAMS
```sql
id                UUID PRIMARY KEY
exam_type_id      UUID REFERENCES exam_types(id)
section_id        UUID REFERENCES sections(id)
subject_id        UUID REFERENCES subjects(id)
campus_id         UUID REFERENCES campus(id)
name              VARCHAR(200)
exam_date         DATE
total_marks       INTEGER
passing_marks     INTEGER
duration_minutes  INTEGER
status            ENUM('SCHEDULED','ONGOING','COMPLETED','CANCELLED')
```

#### EXAM_RESULTS
```sql
id                UUID PRIMARY KEY
exam_id           UUID REFERENCES exams(id)
student_id        UUID REFERENCES student_profiles(id)
marks_obtained    DECIMAL(5,2)
grade             VARCHAR(5)             -- Auto-calculated: A+, A, B, C
is_absent         BOOLEAN DEFAULT false
remarks           TEXT
entered_by        UUID REFERENCES staff_profiles(id)
entered_at        TIMESTAMP
is_verified       BOOLEAN DEFAULT false
```

#### BOARD_EXAM_RECORDS
```sql
id                UUID PRIMARY KEY
student_id        UUID REFERENCES student_profiles(id)
subject_id        UUID REFERENCES subjects(id)
board_roll_no     VARCHAR(50)
board_marks       DECIMAL(5,2)
board_grade       VARCHAR(5)
year              INTEGER
```

#### ANNOUNCEMENTS
```sql
id                UUID PRIMARY KEY
created_by        UUID REFERENCES users(id)
campus_id         UUID                   -- NULL = both campuses
title             VARCHAR(300) NOT NULL
content           TEXT NOT NULL
target_audience   ENUM('ALL','STUDENTS','PARENTS','TEACHERS','SECTION')
section_id        UUID REFERENCES sections(id)
program_id        UUID REFERENCES programs(id)
attachment_url    TEXT
is_pinned         BOOLEAN DEFAULT false
published_at      TIMESTAMP
expires_at        TIMESTAMP
```

#### CHAT_CONVERSATIONS
```sql
id                UUID PRIMARY KEY
participant_one   UUID REFERENCES users(id)
participant_two   UUID REFERENCES users(id)
created_at        TIMESTAMP DEFAULT NOW()
last_message_at   TIMESTAMP
```

#### CHAT_MESSAGES
```sql
id                UUID PRIMARY KEY
conversation_id   UUID REFERENCES chat_conversations(id)
sender_id         UUID REFERENCES users(id)
content           TEXT NOT NULL
is_read           BOOLEAN DEFAULT false
sent_at           TIMESTAMP DEFAULT NOW()
read_at           TIMESTAMP
```

#### NOTIFICATIONS
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
title             VARCHAR(300)
body              TEXT
type              VARCHAR(50)
reference_id      UUID
reference_type    VARCHAR(50)
is_read           BOOLEAN DEFAULT false
sent_at           TIMESTAMP DEFAULT NOW()
read_at           TIMESTAMP
```

#### STAFF_LEAVE
```sql
id                UUID PRIMARY KEY
staff_id          UUID REFERENCES staff_profiles(id)
campus_id         UUID REFERENCES campus(id)
leave_type        ENUM('SICK','CASUAL','ANNUAL','EMERGENCY','UNPAID')
from_date         DATE
to_date           DATE
total_days        INTEGER
reason            TEXT
status            ENUM('PENDING','APPROVED','REJECTED','CANCELLED')
applied_at        TIMESTAMP
reviewed_by       UUID REFERENCES users(id)
reviewed_at       TIMESTAMP
remarks           TEXT
```

#### AUDIT_LOGS
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
action            VARCHAR(100)           -- "CREATE","UPDATE","DELETE","MARK_PAID"
entity_type       VARCHAR(100)           -- "STUDENT","FEE_RECORD"
entity_id         UUID
old_values        JSONB
new_values        JSONB
ip_address        VARCHAR(45)
created_at        TIMESTAMP DEFAULT NOW()
```

### 6.4 Database Indexes (Performance)

```sql
-- Student lookups
CREATE INDEX idx_students_campus ON student_profiles(campus_id);
CREATE INDEX idx_students_section ON student_profiles(section_id);
CREATE INDEX idx_students_roll ON student_profiles(roll_number);
CREATE INDEX idx_students_status ON student_profiles(status);

-- Attendance queries
CREATE INDEX idx_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_attendance_date ON student_attendance(date);
CREATE INDEX idx_attendance_section ON student_attendance(section_id);
CREATE INDEX idx_attendance_compound ON student_attendance(section_id, date);

-- Fee lookups
CREATE INDEX idx_fees_student ON fee_records(student_id);
CREATE INDEX idx_fees_status ON fee_records(status);
CREATE INDEX idx_fees_year ON fee_records(academic_year);

-- Timetable queries
CREATE INDEX idx_timetable_section ON timetable_slots(section_id);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week, period_number);

-- Results
CREATE INDEX idx_results_student ON exam_results(student_id);
CREATE INDEX idx_results_exam ON exam_results(exam_id);

-- Audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### 6.5 Two-Campus Data Architecture

```
PRINCIPAL / SUPER_ADMIN
         │
  Sees EVERYTHING combined
         │
    ┌────┴────┐
    ▼         ▼
BOYS         GIRLS
CAMPUS       CAMPUS
  │             │
  ├─ Programs   ├─ Programs
  ├─ Sections   ├─ Sections
  ├─ Students   ├─ Students
  ├─ Fees       ├─ Fees
  └─ Timetable  └─ Timetable
         │
    SHARED TEACHERS
    (assigned to both,
     scheduled per day)
```

Every API query is automatically filtered by `campus_id` based on the logged-in admin's campus. An admin from Boys Campus can never see Girls Campus data. This is enforced at the API middleware level.

---

## 7. UI/UX Design System

### 7.1 Color Palette

**Theme: Deep Navy + Gold — Prestigious Academic**

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1B3A6B` | Sidebar, headers, primary buttons |
| `primary-dark` | `#0F2347` | Hover states, deep backgrounds |
| `primary-light` | `#2D5AA0` | Links, active states |
| `gold` | `#C9A84C` | Accents, badges, highlights |
| `gold-light` | `#F0C93A` | Hover gold states |
| `success` | `#10B981` | Present, Paid, Active, Approved |
| `warning` | `#F59E0B` | Pending, Late, Review needed |
| `danger` | `#EF4444` | Absent, Overdue, Alert, Rejected |
| `info` | `#3B82F6` | Information notices |
| `background` | `#F4F6F9` | Page backgrounds |
| `card` | `#FFFFFF` | Cards and panels |
| `border` | `#E2E8F0` | Borders and dividers |
| `text-primary` | `#1A202C` | Main readable text |
| `text-secondary` | `#64748B` | Labels, captions |
| `text-muted` | `#94A3B8` | Placeholders, disabled |

### 7.2 Typography

| Style | Size | Weight | Usage |
|---|---|---|---|
| Display | 36px | Bold | Dashboard welcome, major headings |
| Heading 1 | 28px | SemiBold | Page titles |
| Heading 2 | 22px | SemiBold | Section headers |
| Heading 3 | 18px | Medium | Card titles |
| Body Large | 16px | Regular | Primary content |
| Body | 14px | Regular | Standard UI text, tables |
| Small | 12px | Regular | Labels, timestamps |
| Tiny | 11px | Medium | Badges, chips |

**Fonts:**
- UI Font: `Inter` — clean, modern, highly readable
- Display Font: `Playfair Display` — elegant for major headings only

### 7.3 Status Badge System

```
ATTENDANCE:
  🟢 Present  → bg-green-100  text-green-800
  🔴 Absent   → bg-red-100    text-red-800
  🟡 Late     → bg-amber-100  text-amber-800
  🔵 Leave    → bg-blue-100   text-blue-800

FEE STATUS:
  ✅ Paid     → bg-green-100  text-green-800
  ⏳ Pending  → bg-amber-100  text-amber-800
  ❌ Overdue  → bg-red-100    text-red-800
  🔄 Partial  → bg-purple-100 text-purple-800

STAFF STATUS:
  🟢 Present     → green
  🔴 Absent      → red
  📋 On Leave    → blue
  🕐 Late        → amber

EXAM GRADES:
  🏆 A+   → bg-yellow-100  text-yellow-800 (gold tint)
  ✅ Pass → bg-green-100   text-green-800
  ❌ Fail → bg-red-100     text-red-800
```

### 7.4 Component Standards

#### Button Variants
- **Primary** — Navy background, white text → Save, Submit, Confirm
- **Secondary** — White background, navy border → Cancel, Back, View
- **Danger** — Red background, white text → Delete, Reject
- **Ghost** — Transparent, navy text → Minor actions
- **Gold** — Gold background, dark text → Special actions (Generate Timetable, Export)
- **Icon** — Circle with icon only → WhatsApp, Edit, Delete in tables

#### Table Standards
- Alternating row colors (white / very light gray)
- Hover highlight (light navy tint)
- Sticky header when scrolling
- Sortable columns
- Search bar above every table
- Pagination (25 rows per page default)
- Export button (PDF / Excel) on all major tables
- Bulk selection checkboxes

#### Loading States
- **Skeleton screens** (not center spinners) — matches the shape of loading content
- Button loading → spinner replaces text, button disabled
- Page loading → full skeleton matching page layout

#### Toast Notifications
- Position: top-right corner
- Auto-dismiss: 4 seconds
- Maximum 3 visible simultaneously
- Types: Success (green), Warning (amber), Error (red), Info (blue)

#### Empty States
- Always include relevant illustration icon
- Short friendly explanation of why it's empty
- Action button to resolve the empty state

### 7.5 Web Navigation Structure

```
LAYOUT:
┌─────────────────────────────────────────────────────┐
│ TOP BAR                                             │
│ [🏫 College Logo + Name]    [🔔][💬][👤 Profile]   │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│   SIDEBAR     │         MAIN CONTENT AREA           │
│   (Fixed)     │         (Scrollable)                │
│               │                                     │
│ ─ Dashboard   │  Page Title                         │
│ ─ Students    │  Breadcrumb: Home > Students > List │
│ ─ Staff       │                                     │
│ ─ Attendance  │  Content area                       │
│ ─ Timetable   │                                     │
│ ─ Fees        │                                     │
│ ─ Exams       │                                     │
│ ─ Results     │                                     │
│ ─ Reports     │                                     │
│ ─ Settings    │                                     │
│               │                                     │
│ ─ [Logout]    │                                     │
└───────────────┴─────────────────────────────────────┘
```

Sidebar is collapsible (icon-only mode). Role-based — each role sees only their menu items.

### 7.6 Mobile Navigation Structure

**Bottom Tab Bar (always visible):**

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 |
|---|---|---|---|---|
| Principal/Admin | 🏠 Dashboard | 👥 Browse | 🔔 Alerts | 👤 Profile |
| Teacher | 🏠 My Day | ✅ Attendance | 📝 Results | 💬 Chat |
| Parent | 🏠 Home | 📅 Attendance | 💰 Fees | 🔔 Updates |
| Student | 🏠 Home | 📅 Timetable | 📊 Results | 📢 Notice |

### 7.7 Mobile Design Rules

- Minimum touch target: 48x48px
- Bottom navigation only (thumbs can't reach top comfortably)
- Cards instead of tables on mobile screens
- Swipe right on list item → WhatsApp button
- Swipe left on list item → Edit/View options
- Pull down to refresh
- Portrait mode primary (landscape supported)
- Minimum font size: 14px
- Offline banner at top when disconnected

### 7.8 Dashboard Layouts

#### Principal Dashboard Sections (Top to Bottom)

1. **Live Alerts** — Absent teacher alerts, urgent notifications (red, most prominent)
2. **Live Timetable** — Current period view across all classes, color-coded
3. **Quick Stats** — Students present today, Staff present, Fee collected today
4. **Campus Overview** — Boys and Girls campus summary cards (expandable)
5. **Recent Activity** — Last fee payments, recent messages

#### Admin Dashboard Sections
1. **Key Stats** — Student count, staff present, fee collection %, upcoming exams
2. **Staff Attendance Widget** — Quick morning attendance marking
3. **Pending Fees** — Count and total of overdue fees
4. **Quick Actions** — Post announcement, add student, view reports

#### Teacher Dashboard Sections
1. **Today's Schedule** — Periods with subject, class, room (current highlighted)
2. **Quick Attendance** — One-tap access to mark current class attendance
3. **Pending Tasks** — Marks to enter, submissions to review
4. **Recent Messages** — Latest chat from principal

#### Parent Dashboard Sections
1. **Child Summary Card** — Attendance %, fee status, last result
2. **Weekly Attendance Strip** — Mon–Fri visual indicator for this week
3. **Latest Announcement** — Most recent school notice
4. **Contact Buttons** — WhatsApp teacher, Call college office

#### Student Dashboard Sections
1. **Today's Timetable** — Full period list with current period highlighted
2. **Quick Stats** — Attendance %, fee status, last test score
3. **Latest Announcement** — Most recent notice

---

## 8. APK Distribution & Update Strategy

### 8.1 Distribution Method: Website Download

**Chosen:** APK download from college website

**Distribution Flow:**
```
Developer builds APK using Expo EAS Build
          │
          ▼
APK file downloaded from Expo servers
          │
          ▼
APK uploaded to college website downloads page
          │
          ▼
College staff share download link with parents/students
          │
          ▼
Users open college website on phone → Tap "Download App"
          │
          ▼
Android prompts: "Allow install from unknown sources"
          │
          ▼
User allows (one-time setting per device)
          │
          ▼
App installs in ~30 seconds ✅
```

### 8.2 Installation Guide (For Users)

This guide should be printed and distributed by admin, and also available on the download page:

1. Open your phone's browser and go to: `[college website URL]/download`
2. Tap the **"Download Android App"** button
3. When download completes, tap the downloaded file
4. If prompted about "Unknown sources" — tap Settings → enable "Install unknown apps" for your browser → go back and tap Install
5. Tap **Open** when installation completes
6. Login with your credentials provided by the college

### 8.3 In-App Update System

**Approach: Version Check on App Open**

Every time the app opens, it silently checks the server for the latest version.

```
App opens
    │
    ▼
GET /api/v1/app/version
Response: {
  "latest": "1.1.0",
  "current_installed": "1.0.0",
  "is_required": false,
  "release_notes": "Bug fixes and performance improvements",
  "download_url": "https://college.edu.pk/app/v1.1.0.apk"
}
    │
    ▼
If update available (optional):
┌─────────────────────────────────────┐
│ 📲 Update Available                 │
│ Version 1.1.0 is now available.    │
│ [Update Now]          [Later]       │
└─────────────────────────────────────┘

If update required (critical):
┌─────────────────────────────────────┐
│ 🔴 Required Update                  │
│ You must update to continue.        │
│          [Update Now]               │
└─────────────────────────────────────┘
(App locked until updated — no Later button)
```

### 8.4 Version Management

**Versioning Convention:** `Major.Minor.Patch`
- Major (x.0.0) → Complete redesign or architecture change
- Minor (1.x.0) → New feature added
- Patch (1.0.x) → Bug fix only

**APP_VERSIONS Database Table:**
```
version_name    "1.1.0"
version_code    110           (always increasing integer)
release_notes   "Fixed attendance sync, improved speed"
apk_url         "https://college.edu.pk/app/v1.1.0.apk"
is_required     false
min_supported   "1.0.0"       (below this → force update)
released_at     timestamp
```

### 8.5 Security Considerations

| Risk | Mitigation |
|---|---|
| Anyone can download the APK | App requires login — useless without valid credentials |
| APK redistribution/tampering | APK signed with keystore — only your signed version works with your server |
| Reverse engineering | No secrets stored in app — all sensitive operations on server |
| Old buggy versions in use | Force update system for critical patches |

### 8.6 Future: Google Play Store Migration

When ready to professionalize distribution:
1. Create Google Play Developer account ($25 one-time fee)
2. Prepare store listing (icon, screenshots, description)
3. Submit for review (3–7 days first time)
4. Once approved — remove website APK, direct all users to Play Store
5. Play Store handles automatic silent updates going forward

---

## 9. Deployment & Hosting

### 9.1 Strategy: Local First → Cloud Later

The system is built to be **environment-agnostic** — all location-specific configuration lives in a single `.env` file. Migrating from local to cloud is changing variable values, not rewriting code.

### 9.2 Phase 1: Local Server Setup

#### Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| CPU | Any quad-core (last 8 years) | Intel i5/i7 or equivalent |
| RAM | 8GB | 16GB |
| Storage | 500GB HDD | 1TB SSD |
| Network | 100Mbps wired ethernet | 1Gbps wired ethernet |
| Power | UPS required | UPS with 1 hour backup |
| OS | Windows 10 | Ubuntu Server 22.04 LTS |

> ⚠️ **UPS is mandatory.** Power cuts kill PostgreSQL — a UPS prevents data corruption.

#### Software Stack on Local Server

```
Ubuntu Server 22.04 LTS
├── Node.js v20 LTS          → Backend API runtime
├── PostgreSQL 16             → Main database
├── Nginx                     → Reverse proxy + static file serving
│     Routes: /api/* → Node.js server
│              /*    → Next.js or static files
├── PM2                       → Process manager
│     Keeps Node.js alive 24/7
│     Auto-restart on crash
│     Auto-start on server reboot
├── Certbot (Let's Encrypt)   → Free HTTPS/SSL certificate
└── UFW Firewall              → Blocks all ports except 80, 443, SSH
```

#### Local Network Architecture

```
Internet Router (with static IP from ISP)
        │
        ├── Server PC (static local IP: 192.168.1.100)
        │     ├── Backend API (port 3000)
        │     ├── PostgreSQL (port 5432 — internal only)
        │     └── Nginx (port 80/443 — internet facing)
        │
        ├── Admin PCs (web browser)
        ├── Staff PCs
        └── College WiFi → Teacher/Student/Parent phones
```

**For parents accessing from home:** Requires internet-facing access.
- **Option A (Best):** Get a static IP from ISP → point domain to it
- **Option B (Free):** Use Cloudflare Tunnel (free, secure, no static IP needed)

#### Environment Variables (.env)

```bash
# Database
DATABASE_URL="postgresql://college_user:password@localhost:5432/college_db"

# Server
PORT=3000
NODE_ENV=production
API_URL="http://192.168.1.100:3000"          # Local — change for cloud

# JWT
JWT_SECRET="[strong-random-secret-min-64-chars]"
JWT_REFRESH_SECRET="[different-strong-secret]"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Storage
STORAGE_TYPE="local"                          # Change to "cloudinary" on cloud
LOCAL_STORAGE_PATH="/var/college-files"

# Cloudinary (fill when migrating to cloud)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App Version
LATEST_APP_VERSION="1.0.0"
FORCE_UPDATE_BELOW="0.0.0"

# Frontend URL (for CORS)
FRONTEND_URL="http://192.168.1.100"          # Change to domain on cloud
```

### 9.3 Backup Strategy

#### Automated Daily Backup Script

Runs every night at 2:00 AM via cron job:

```bash
# What it does:
1. Export PostgreSQL database → compressed .sql.gz file
2. Compress /var/college-files (student photos, documents)
3. Save to local external USB drive
4. Upload to Google Drive via rclone (free 15GB)
5. Delete backups older than 30 days
6. Send success/failure notification
```

#### Backup Retention Policy

| Frequency | Keep For |
|---|---|
| Daily backups | 7 days |
| Weekly backups | 4 weeks |
| Monthly backups | 12 months |

#### Disaster Recovery Plan

If the server completely dies:
1. Buy replacement PC (any similar specs)
2. Install Ubuntu + same software stack (2–3 hours)
3. Restore PostgreSQL from latest backup (30 minutes)
4. Restore files from backup (30 minutes)
5. Update DNS if IP changed
6. System back online same day

### 9.4 Phase 2: Cloud Migration

#### Recommended Cloud Stack

| Service | Provider | Cost/Month |
|---|---|---|
| VPS Server | DigitalOcean Droplet (2GB RAM) | ~$12 |
| Database | PostgreSQL on same VPS | Included |
| Frontend | Vercel | Free |
| File Storage | Cloudinary | Free tier |
| CDN + Security | Cloudflare | Free |
| Monitoring | UptimeRobot | Free |
| **Total** | | **~$12–15/month** |

#### Migration Day Checklist

```
Morning (2–3 hours):
□ Create DigitalOcean droplet (Ubuntu 22.04)
□ Install Node.js, PostgreSQL, Nginx, PM2, Certbot
□ Export database from local server
□ Import database to cloud server
□ Upload files to Cloudinary

Afternoon (2–3 hours):
□ Update .env file with cloud values
□ Deploy backend code to cloud server
□ Deploy frontend to Vercel
□ Point domain DNS to new server (via Cloudflare)
□ Install SSL certificate (certbot)
□ Test all features end-to-end

Evening (1 hour):
□ Update mobile app API URL in .env
□ Build new APK with cloud API URL
□ Upload new APK to college website
□ Send update notification to all users
□ Monitor for 24 hours
□ Local server now serves as backup/archive
```

### 9.5 Security Requirements

#### Network Security
- HTTPS everywhere (SSL via Let's Encrypt — free)
- Firewall: only ports 80, 443, and SSH (22) open
- SSH access via key only (password SSH disabled)
- PostgreSQL port (5432) never exposed to internet

#### Application Security
- JWT authentication on every API route
- Role + campus enforcement on every data query
- Rate limiting: 100 requests/minute per IP
- Input validation (Zod) on all incoming data
- Prisma ORM prevents SQL injection by design
- CORS: only allowed frontend domains
- Helmet.js security headers on all responses

#### Data Security
- Passwords hashed with bcrypt (cost factor 12)
- Sensitive data never logged
- Audit logs for all critical actions (who did what, when)
- Student photos served only to authenticated users
- No secrets stored in mobile app — all server-side

### 9.6 Monitoring & Maintenance

#### Automated Monitoring
- **UptimeRobot** (free) — checks server every 5 minutes
- Sends WhatsApp/email alert if server goes down
- Tracks uptime percentage

#### Maintenance Schedule

| Frequency | Task | Time |
|---|---|---|
| Daily (automated) | Database backup, error log collection | 0 min |
| Weekly | Review error logs, verify backups completed | 15 min |
| Monthly | Apply OS security updates, check disk space | 1 hour |
| Per release | Deploy new version, test, notify users | 2–4 hours |

---

## 10. Long-Term Scalability

### 10.1 Current Scale Analysis

```
EXPECTED PEAK LOAD (8:00–9:00 AM):
├── Admin marking attendance:      ~5 users
├── Teachers checking timetable:   ~45 users
├── Parents checking morning:      ~200 users
├── Students checking timetable:   ~300 users
└── Total peak concurrent:         ~550 users

Node.js + Express handles 550 concurrent users
comfortably on even modest hardware.
PostgreSQL with proper indexes handles this effortlessly.
```

### 10.2 Database Performance Strategy

- Indexes on all frequently queried columns (see Section 6.4)
- Pre-calculated monthly attendance summaries (not computed live)
- Dashboard stats cached and refreshed every 5 minutes
- Pagination on all list queries (never load all 1000+ students at once)
- Reports generated in background (not blocking UI)
- Attendance sheets loaded one section at a time

### 10.3 Scalability Growth Path

```
Stage 1 — Current (1 college, local server):
  Single server, single database
  Cost: Hardware already owned
  Handles: Up to ~1000 concurrent users

Stage 2 — Cloud migration:
  DigitalOcean 2GB droplet
  Cost: ~$12/month
  Handles: Up to ~2000 concurrent users

Stage 3 — If expanded to multiple colleges:
  Larger VPS ($24/month) + Redis caching
  Add multi-tenant support (college_id field)
  Handles: Up to ~10,000 concurrent users

Stage 4 — Large scale (if ever needed):
  Load balancer + multiple API servers
  Read replica database
  CDN for file delivery
  Handles: Unlimited with horizontal scaling
```

The current architecture supports this entire growth path without any rewrites — just adding resources and layers on top.

---

## 11. Folder & File Structure

### 11.1 Project Root

```
college-system/                    ← root workspace folder
├── 📁 college-backend/            ← Node.js + Express API
├── 📁 college-web/                ← Next.js web application
├── 📁 college-mobile/             ← React Native + Expo app
└── 📄 README.md                   ← project overview
```

### 11.2 Backend Structure (`college-backend/`)

```
college-backend/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── .gitignore
│
├── prisma/
│     ├── schema.prisma
│     └── migrations/
│
└── src/
      ├── app.ts                   ← Express app setup
      ├── server.ts                ← Server entry point
      │
      ├── config/
      │     ├── database.ts        ← Prisma client
      │     ├── jwt.ts
      │     ├── cors.ts
      │     ├── socket.ts
      │     └── storage.ts
      │
      ├── middlewares/
      │     ├── auth.middleware.ts
      │     ├── role.middleware.ts
      │     ├── error.middleware.ts
      │     ├── validate.middleware.ts
      │     ├── rateLimit.middleware.ts
      │     └── upload.middleware.ts
      │
      ├── utils/
      │     ├── response.ts        ← Standard API response format
      │     ├── password.ts
      │     ├── token.ts
      │     ├── dateTime.ts
      │     ├── pagination.ts
      │     ├── whatsapp.ts        ← WhatsApp link generator
      │     └── logger.ts
      │
      ├── types/
      │     ├── express.d.ts
      │     └── common.types.ts
      │
      ├── modules/
      │     ├── auth/
      │     │     ├── auth.routes.ts
      │     │     ├── auth.controller.ts
      │     │     ├── auth.service.ts
      │     │     ├── auth.validation.ts
      │     │     └── auth.types.ts
      │     │
      │     ├── campus/
      │     ├── programs/
      │     ├── grades/
      │     ├── sections/
      │     ├── students/
      │     ├── parents/
      │     ├── staff/
      │     ├── subjects/
      │     │
      │     ├── timetable/
      │     │     ├── timetable.routes.ts
      │     │     ├── timetable.controller.ts
      │     │     ├── timetable.service.ts
      │     │     ├── timetable.conflictChecker.ts
      │     │     ├── timetable.validation.ts
      │     │     └── timetable.types.ts
      │     │
      │     ├── attendance/
      │     │     ├── student-attendance/
      │     │     │     ├── studentAttendance.routes.ts
      │     │     │     ├── studentAttendance.controller.ts
      │     │     │     ├── studentAttendance.service.ts
      │     │     │     ├── studentAttendance.validation.ts
      │     │     │     └── studentAttendance.types.ts
      │     │     └── staff-attendance/
      │     │           ├── staffAttendance.routes.ts
      │     │           ├── staffAttendance.controller.ts
      │     │           ├── staffAttendance.service.ts
      │     │           ├── staffAttendance.alerter.ts
      │     │           ├── staffAttendance.validation.ts
      │     │           └── staffAttendance.types.ts
      │     │
      │     ├── fees/
      │     ├── exams/
      │     │
      │     ├── results/
      │     │     ├── results.routes.ts
      │     │     ├── results.controller.ts
      │     │     ├── results.service.ts
      │     │     ├── results.gradeCalculator.ts
      │     │     ├── results.validation.ts
      │     │     └── results.types.ts
      │     │
      │     ├── announcements/
      │     ├── leave/
      │     ├── notifications/
      │     │
      │     ├── chat/
      │     │     ├── chat.routes.ts
      │     │     ├── chat.controller.ts
      │     │     ├── chat.service.ts
      │     │     ├── chat.socket.ts
      │     │     └── chat.types.ts
      │     │
      │     ├── reports/
      │     │
      │     ├── dashboard/
      │     │     ├── principal/
      │     │     ├── admin/
      │     │     ├── teacher/
      │     │     ├── parent/
      │     │     └── student/
      │     │
      │     └── app-version/
      │
      └── routes/
            └── index.ts           ← Registers all module routes
```

**Module File Roles:**
- `*.routes.ts` — URL paths, middleware, points to controller functions
- `*.controller.ts` — Receives request, calls service, sends response
- `*.service.ts` — All business logic and database queries
- `*.validation.ts` — Validates incoming request data with Zod
- `*.types.ts` — TypeScript interfaces for this module

### 11.3 Web App Structure (`college-web/`)

```
college-web/
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
│
├── public/
│     ├── college-logo.png
│     ├── favicon.ico
│     └── icons/
│
└── src/
      ├── app/
      │     ├── layout.tsx
      │     ├── page.tsx             ← redirect to login or dashboard
      │     ├── not-found.tsx
      │     │
      │     ├── (auth)/
      │     │     ├── layout.tsx     ← clean layout, no sidebar
      │     │     └── login/
      │     │           └── page.tsx
      │     │
      │     ├── (principal)/
      │     │     ├── layout.tsx
      │     │     ├── dashboard/page.tsx
      │     │     ├── live-view/page.tsx
      │     │     ├── students/
      │     │     │     ├── page.tsx
      │     │     │     └── [id]/page.tsx
      │     │     ├── staff/
      │     │     │     ├── page.tsx
      │     │     │     └── [id]/page.tsx
      │     │     ├── campus/
      │     │     │     ├── boys/page.tsx
      │     │     │     └── girls/page.tsx
      │     │     ├── reports/page.tsx
      │     │     └── chat/page.tsx
      │     │
      │     ├── (admin)/
      │     │     ├── layout.tsx
      │     │     ├── dashboard/page.tsx
      │     │     ├── students/
      │     │     │     ├── page.tsx
      │     │     │     ├── add/page.tsx
      │     │     │     └── [id]/
      │     │     │           ├── page.tsx
      │     │     │           └── edit/page.tsx
      │     │     ├── staff/
      │     │     │     ├── page.tsx
      │     │     │     ├── add/page.tsx
      │     │     │     └── [id]/
      │     │     │           ├── page.tsx
      │     │     │           └── edit/page.tsx
      │     │     ├── attendance/
      │     │     │     ├── staff/page.tsx
      │     │     │     └── students/page.tsx
      │     │     ├── timetable/
      │     │     │     ├── page.tsx
      │     │     │     ├── builder/page.tsx
      │     │     │     └── templates/page.tsx
      │     │     ├── fees/
      │     │     │     ├── page.tsx
      │     │     │     ├── structure/page.tsx
      │     │     │     ├── collect/page.tsx
      │     │     │     └── defaulters/page.tsx
      │     │     ├── exams/
      │     │     │     ├── page.tsx
      │     │     │     └── schedule/page.tsx
      │     │     ├── results/
      │     │     │     ├── page.tsx
      │     │     │     └── enter/page.tsx
      │     │     ├── announcements/
      │     │     │     ├── page.tsx
      │     │     │     └── create/page.tsx
      │     │     └── settings/page.tsx
      │     │
      │     ├── (teacher)/
      │     │     ├── layout.tsx
      │     │     ├── dashboard/page.tsx
      │     │     ├── attendance/
      │     │     │     ├── page.tsx
      │     │     │     └── history/page.tsx
      │     │     ├── my-classes/page.tsx
      │     │     ├── results/page.tsx
      │     │     ├── timetable/page.tsx
      │     │     └── chat/page.tsx
      │     │
      │     ├── (parent)/
      │     │     ├── layout.tsx
      │     │     ├── dashboard/page.tsx
      │     │     ├── attendance/page.tsx
      │     │     ├── fees/page.tsx
      │     │     ├── results/page.tsx
      │     │     └── announcements/page.tsx
      │     │
      │     └── (student)/
      │           ├── layout.tsx
      │           ├── dashboard/page.tsx
      │           ├── timetable/page.tsx
      │           ├── attendance/page.tsx
      │           ├── results/page.tsx
      │           └── announcements/page.tsx
      │
      ├── features/
      │     ├── auth/
      │     │     ├── api/auth.api.ts
      │     │     ├── components/LoginForm.tsx
      │     │     ├── hooks/useAuth.ts
      │     │     └── types/auth.types.ts
      │     │
      │     ├── students/
      │     │     ├── api/students.api.ts
      │     │     ├── components/
      │     │     │     ├── StudentTable.tsx
      │     │     │     ├── StudentCard.tsx
      │     │     │     ├── StudentProfile.tsx
      │     │     │     ├── StudentForm.tsx
      │     │     │     └── StudentFilters.tsx
      │     │     ├── hooks/
      │     │     │     ├── useStudents.ts
      │     │     │     └── useStudent.ts
      │     │     └── types/students.types.ts
      │     │
      │     ├── staff/
      │     ├── attendance/
      │     │     ├── student-attendance/
      │     │     └── staff-attendance/
      │     ├── timetable/
      │     │     └── components/
      │     │           ├── TimetableGrid.tsx
      │     │           ├── TimetableBuilder.tsx
      │     │           ├── LiveTimetable.tsx
      │     │           ├── ConflictWarning.tsx
      │     │           └── TeacherAvailability.tsx
      │     ├── fees/
      │     ├── exams/
      │     ├── results/
      │     ├── announcements/
      │     ├── chat/
      │     └── dashboard/
      │           ├── principal/
      │           │     └── components/
      │           │           ├── LiveAlerts.tsx
      │           │           ├── LiveClassView.tsx
      │           │           ├── AbsentTeacherAlert.tsx
      │           │           ├── FreeTeacherFinder.tsx
      │           │           └── CampusOverview.tsx
      │           ├── admin/
      │           ├── teacher/
      │           ├── parent/
      │           └── student/
      │
      ├── components/
      │     ├── ui/
      │     │     ├── Button.tsx
      │     │     ├── Input.tsx
      │     │     ├── Select.tsx
      │     │     ├── Modal.tsx
      │     │     ├── Table.tsx
      │     │     ├── Badge.tsx
      │     │     ├── Card.tsx
      │     │     ├── Toast.tsx
      │     │     ├── Skeleton.tsx
      │     │     ├── EmptyState.tsx
      │     │     ├── ErrorState.tsx
      │     │     ├── Pagination.tsx
      │     │     ├── DatePicker.tsx
      │     │     ├── FileUpload.tsx
      │     │     └── ConfirmDialog.tsx
      │     ├── layout/
      │     │     ├── Sidebar.tsx
      │     │     ├── TopBar.tsx
      │     │     ├── PageHeader.tsx
      │     │     ├── Breadcrumb.tsx
      │     │     └── OfflineBanner.tsx
      │     └── charts/
      │           ├── AttendanceChart.tsx
      │           ├── FeeCollectionChart.tsx
      │           └── ResultsChart.tsx
      │
      ├── lib/
      │     ├── axios.ts             ← Configured API client
      │     ├── queryClient.ts       ← React Query setup
      │     ├── socket.ts            ← Socket.io client
      │     └── utils.ts
      │
      ├── store/
      │     ├── authStore.ts
      │     ├── campusStore.ts
      │     └── notificationStore.ts
      │
      ├── hooks/
      │     ├── useOnline.ts
      │     ├── usePermission.ts
      │     └── useDebounce.ts
      │
      ├── types/
      │     └── global.types.ts
      │
      └── styles/
            └── globals.css
```

### 11.4 Mobile App Structure (`college-mobile/`)

```
college-mobile/
├── .env
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
│
├── assets/
│     ├── icon.png
│     ├── splash.png
│     └── illustrations/
│
└── src/
      ├── navigation/
      │     ├── RootNavigator.tsx
      │     ├── AuthNavigator.tsx
      │     ├── PrincipalNavigator.tsx
      │     ├── AdminNavigator.tsx
      │     ├── TeacherNavigator.tsx
      │     ├── ParentNavigator.tsx
      │     └── StudentNavigator.tsx
      │
      ├── screens/
      │     ├── auth/login/
      │     │     ├── LoginScreen.tsx
      │     │     └── LoginScreen.styles.ts
      │     │
      │     ├── principal/
      │     │     ├── dashboard/
      │     │     │     ├── PrincipalDashboard.tsx
      │     │     │     └── components/
      │     │     │           ├── LiveAlertsSection.tsx
      │     │     │           ├── LiveTimetableSection.tsx
      │     │     │           └── StatsSection.tsx
      │     │     ├── students/
      │     │     │     ├── StudentBrowserScreen.tsx
      │     │     │     └── profile/StudentProfileScreen.tsx
      │     │     ├── staff/
      │     │     │     ├── StaffListScreen.tsx
      │     │     │     └── profile/StaffProfileScreen.tsx
      │     │     └── chat/
      │     │           ├── ChatListScreen.tsx
      │     │           └── conversation/ConversationScreen.tsx
      │     │
      │     ├── admin/
      │     │     ├── dashboard/AdminDashboard.tsx
      │     │     ├── staff-attendance/MarkAttendanceScreen.tsx
      │     │     ├── fees/FeeListScreen.tsx
      │     │     └── announcements/CreateAnnouncementScreen.tsx
      │     │
      │     ├── teacher/
      │     │     ├── dashboard/TeacherDashboard.tsx
      │     │     ├── attendance/
      │     │     │     ├── AttendanceScreen.tsx
      │     │     │     └── components/
      │     │     │           ├── StudentAttendanceRow.tsx
      │     │     │           └── OfflineBadge.tsx
      │     │     ├── my-classes/MyClassesScreen.tsx
      │     │     ├── results/EnterMarksScreen.tsx
      │     │     ├── timetable/TimetableScreen.tsx
      │     │     └── chat/
      │     │           ├── ChatListScreen.tsx
      │     │           └── conversation/ConversationScreen.tsx
      │     │
      │     ├── parent/
      │     │     ├── dashboard/ParentDashboard.tsx
      │     │     ├── attendance/AttendanceHistoryScreen.tsx
      │     │     ├── fees/FeeHistoryScreen.tsx
      │     │     ├── results/ResultsScreen.tsx
      │     │     └── announcements/AnnouncementsScreen.tsx
      │     │
      │     └── student/
      │           ├── dashboard/StudentDashboard.tsx
      │           ├── timetable/TimetableScreen.tsx
      │           ├── attendance/AttendanceScreen.tsx
      │           ├── results/ResultsScreen.tsx
      │           └── announcements/AnnouncementsScreen.tsx
      │
      ├── components/
      │     ├── AppButton.tsx
      │     ├── AppCard.tsx
      │     ├── AppBadge.tsx
      │     ├── AppInput.tsx
      │     ├── LoadingSkeleton.tsx
      │     ├── EmptyState.tsx
      │     ├── OfflineBanner.tsx
      │     ├── WhatsAppButton.tsx
      │     └── UpdatePrompt.tsx
      │
      ├── api/
      │     ├── client.ts            ← Axios with JWT interceptors
      │     ├── auth.api.ts
      │     ├── students.api.ts
      │     ├── staff.api.ts
      │     ├── attendance.api.ts
      │     ├── timetable.api.ts
      │     ├── fees.api.ts
      │     ├── exams.api.ts
      │     ├── results.api.ts
      │     ├── announcements.api.ts
      │     ├── chat.api.ts
      │     └── appVersion.api.ts
      │
      ├── offline/
      │     ├── database.ts          ← SQLite setup
      │     ├── syncQueue.ts         ← Pending actions queue
      │     ├── syncManager.ts       ← Processes queue when online
      │     ├── networkDetector.ts   ← Watches connection status
      │     └── cache/
      │           ├── attendance.cache.ts
      │           ├── timetable.cache.ts
      │           └── announcements.cache.ts
      │
      ├── store/
      │     ├── authStore.ts
      │     ├── networkStore.ts
      │     └── notificationStore.ts
      │
      ├── hooks/
      │     ├── useOnline.ts
      │     ├── useAuth.ts
      │     └── useAppVersion.ts
      │
      └── theme/
            ├── colors.ts            ← Navy + Gold palette
            ├── typography.ts
            ├── spacing.ts
            └── shadows.ts
```

---

## 12. Feature Specifications

### 12.1 WhatsApp Click-to-Chat

**Technical Implementation:**

WhatsApp provides a universal deep link that opens a chat directly:
```
https://wa.me/[phone_number_with_country_code]
```

For Pakistan (country code +92):
```
Phone stored in DB: 0300-1234567
WhatsApp link:      https://wa.me/923001234567
```

When this link is tapped on any device with WhatsApp:
- WhatsApp opens automatically
- Chat with that contact opens directly
- No need to save the number first
- Works on both web (opens WhatsApp Web) and mobile (opens WhatsApp app)

**Where This Button Appears:**
- Student profile → WhatsApp Father / WhatsApp Mother
- Teacher profile → WhatsApp Teacher (for principal)
- Absent teacher alert → WhatsApp affected parents
- Parent's contact card on teacher's class view

**No WhatsApp Business API or payment required** — this uses the free universal link system.

### 12.2 Internal Chat System

**Participants:**
- Principal ↔ Any Teacher (both campuses)
- Teacher → Principal only

**Features:**
- Real-time messaging via Socket.io
- Message read receipts (single check sent, double check read)
- Push notification when new message arrives
- Chat history preserved in database
- Available on web and mobile

**Not included:** Parent or Student messaging (WhatsApp handles this)

### 12.3 Timetable Builder — Guided Mode

**Step-by-Step Wizard:**

```
STEP 1: Select Campus + Academic Year
        [Boys Campus] [2024-2025]

STEP 2: Configure Period Structure
        Define working days and period timings
        Period 1: 08:00 - 08:45
        Period 2: 08:45 - 09:30
        Break:    09:30 - 09:45
        ...

STEP 3: Select Section to Build Timetable For
        FSc Pre-Medical → Part 1 → Section A

STEP 4: View Subject-Teacher Assignments
        (Auto-loaded from SECTION_SUBJECT_TEACHER table)
        Physics → Mr. Ahmed (4 periods/week)
        Chemistry → Ms. Nadia (4 periods/week)
        ...

STEP 5: Fill the Grid
        For each day × period slot:
        Select subject from dropdown (auto-filters by section)
        System warns in red if:
          - Same teacher already assigned at this time
          - Same teacher at same time on other campus
          - Same subject already twice today

STEP 6: Review & Save
        Full week view shown
        All conflicts listed if any remain
        [Save Timetable] [Save as Template]
```

**Template System:**
- After saving: "Save as Template" option appears
- Next semester: "Copy from Template" pre-fills entire timetable
- Admin only adjusts what changed — done in minutes

### 12.4 Staff Absence Alert System — Full Flow

```
1. Admin opens Staff Attendance page (morning)
2. Admin marks Mr. Raza as ABSENT
3. System triggers:
   a. Save ABSENT record to DB (staffAttendance.service.ts)
   b. staffAttendance.alerter.ts runs:
      - Query timetable: what does Mr. Raza teach today?
      - Result: Period 3 (FSc PM 1-B Physics), Period 5 (FSc PE 2-A Physics)
      - Query: which teachers are FREE at Period 3?
      - Result: Ms. Sana (no class), Mr. Tariq (prep period)
   c. Emit socket event: teacher:absent
   d. Principal's dashboard receives event instantly

4. Principal sees alert card:
   ⚠️ Mr. Raza is Absent Today
   Affected: Period 3 → FSc PM 1-B (Physics)
             Period 5 → FSc PE 2-A (Physics)
   Available for Period 3: Ms. Sana, Mr. Tariq
   [Assign Ms. Sana] [Assign Mr. Tariq] [Handle Later]

5. Principal clicks [Assign Ms. Sana]:
   - DB: Insert temporary timetable override record
   - Socket: Emit substitute:assigned event
   - Ms. Sana receives notification on her device
   - Live timetable view updates: Period 3 → FSc PM 1-B → Ms. Sana (sub)
   - Alert moves to "Resolved" section

6. Live Timetable Updates:
   Before assignment: FSc PM 1-B Period 3 → 🔴 ABSENT (Physics)
   After assignment:  FSc PM 1-B Period 3 → 🟡 Ms. Sana (sub - Physics)
```

### 12.5 Grade Calculation System

Results module auto-calculates grades using this scale (standard Pakistani college grading):

| Percentage | Grade |
|---|---|
| 90–100% | A+ |
| 80–89% | A |
| 70–79% | B |
| 60–69% | C |
| 50–59% | D |
| Below 50% | F (Fail) |

The `results.gradeCalculator.ts` service handles this — whenever marks are saved, grade is automatically computed and stored.

---

## 13. Development Sprints

### Sprint Overview

| Sprint | Focus | Duration | Deliverable |
|---|---|---|---|
| Sprint 1 | Foundation & Setup | Week 1–2 | Working auth system, project structure |
| Sprint 2 | Core Data Management | Week 3–4 | Student/staff CRUD, campus structure |
| Sprint 3 | Daily Operations | Week 5–6 | Attendance, fees, timetable builder |
| Sprint 4 | Academic Module | Week 7–8 | Exams, results, principal dashboard |
| Sprint 5 | Mobile Application | Week 9–10 | All 4 mobile portals with offline sync |
| Sprint 6 | Polish & Launch | Week 11–12 | WhatsApp, notifications, APK, testing |

---

### 🏗️ Sprint 1 — Foundation & Setup (Week 1–2)

**Goal:** Working development environment, database schema, and authentication API.

#### Tasks

**Backend Setup:**
- [ ] Initialize Node.js + TypeScript project
- [ ] Install and configure all dependencies
- [ ] Set up Express with middleware stack (cors, helmet, rate limiter)
- [ ] Configure Prisma with PostgreSQL connection
- [ ] Write complete `schema.prisma` with all entities
- [ ] Run initial migration to create all tables
- [ ] Create seed script with sample data (2 campuses, programs, test users)
- [ ] Implement standard API response format utility
- [ ] Set up Winston logger
- [ ] Set up error handling middleware

**Authentication Module:**
- [ ] `POST /api/v1/auth/login` — email/password login, returns JWT pair
- [ ] `POST /api/v1/auth/refresh-token` — refresh access token
- [ ] `POST /api/v1/auth/logout` — invalidate refresh token
- [ ] Auth middleware — verify JWT on protected routes
- [ ] Role middleware — check user role permissions
- [ ] Campus middleware — filter data by campus

**Web App Setup:**
- [ ] Initialize Next.js 14 with TypeScript
- [ ] Configure Tailwind CSS and ShadCN UI
- [ ] Set up global color tokens (Navy + Gold palette)
- [ ] Configure Axios client with JWT interceptors (auto-refresh)
- [ ] Set up React Query with query client
- [ ] Set up Zustand auth store
- [ ] Create Login page with form validation
- [ ] Create route protection (redirect if not logged in)
- [ ] Create role-based redirect (each role → own dashboard)
- [ ] Create Sidebar component (role-based menu items)
- [ ] Create TopBar component
- [ ] Create all base UI components:
  - Button (all variants)
  - Input, Select, DatePicker
  - Card, Modal
  - Table with sort/search/pagination
  - Badge/Status chip
  - Toast notification system
  - Skeleton loader
  - EmptyState, ErrorState
  - ConfirmDialog
  - OfflineBanner

**Sprint 1 Definition of Done:**
- Can log in as each role (super_admin, admin, teacher, parent, student)
- JWT refresh works transparently
- All base UI components render correctly with Navy + Gold theme
- Database schema fully created and seeded

---

### 📋 Sprint 2 — Core Data Management (Week 3–4)

**Goal:** Full CRUD for all core entities. Admin can manage students, staff, campus structure.

#### Tasks

**Campus & Academic Structure:**
- [ ] Campus API — CRUD (`/api/v1/campus`)
- [ ] Programs API — CRUD (`/api/v1/programs`)
- [ ] Grades API — CRUD (`/api/v1/grades`)
- [ ] Sections API — CRUD (`/api/v1/sections`)
- [ ] Subjects API — CRUD (`/api/v1/subjects`)
- [ ] Section-Subject-Teacher assignment API

**Student Management:**
- [ ] `GET /api/v1/students` — paginated list with filters (campus, section, status)
- [ ] `POST /api/v1/students` — create student + user account
- [ ] `GET /api/v1/students/:id` — full student profile with all related data
- [ ] `PUT /api/v1/students/:id` — update student
- [ ] `DELETE /api/v1/students/:id` — soft delete (set inactive)
- [ ] Student photo upload endpoint
- [ ] Student list page (web) — table with search, filter by campus/section
- [ ] Add student form (web) — multi-step form with validation
- [ ] Student profile page (web) — all data in tabs
- [ ] Edit student page (web)

**Parent Management:**
- [ ] Parent CRUD API
- [ ] Student-parent linking API
- [ ] Parent profile page

**Staff Management:**
- [ ] `GET /api/v1/staff` — paginated list
- [ ] `POST /api/v1/staff` — create staff + user account
- [ ] `GET /api/v1/staff/:id` — full staff profile
- [ ] `PUT /api/v1/staff/:id` — update
- [ ] Staff campus assignment API (for shared teachers)
- [ ] Staff list page (web)
- [ ] Add staff form (web)
- [ ] Staff profile page (web) with WhatsApp button

**Hierarchy Navigation (Principal/Admin):**
- [ ] Campus → Programs → Grades → Sections → Students drill-down API
- [ ] Hierarchical browser component (web)

**Sprint 2 Definition of Done:**
- Admin can add, view, edit, and deactivate students and staff
- Shared teacher campus assignment works
- Student profile shows all related data (section, campus, parent)
- Hierarchical drill-down navigation works for principal

---

### 📅 Sprint 3 — Daily Operations (Week 5–6)

**Goal:** The three core daily-use modules — attendance, fees, and timetable.

#### Tasks

**Student Attendance:**
- [ ] `POST /api/v1/attendance/students/mark` — mark attendance for a section
- [ ] `GET /api/v1/attendance/students` — attendance history with filters
- [ ] `GET /api/v1/attendance/students/summary` — monthly summary per student
- [ ] Attendance sheet page (web) — all students in a section, mark present/absent
- [ ] Attendance history page (web) — calendar view per student
- [ ] Attendance summary widget for student/parent portal

**Staff Attendance (Advanced):**
- [ ] `POST /api/v1/attendance/staff/mark` — mark daily staff attendance
- [ ] `GET /api/v1/attendance/staff` — history with filters
- [ ] Staff attendance marking page (web/admin) — morning workflow
- [ ] **Absence alert system:**
  - [ ] `staffAttendance.alerter.ts` — triggers on absent mark
  - [ ] Queries affected timetable slots
  - [ ] Queries free teachers at same periods
  - [ ] Emits `teacher:absent` socket event to principal
- [ ] Socket.io server setup and event system
- [ ] Real-time alert delivery to principal dashboard (web + mobile)

**Timetable:**
- [ ] `POST /api/v1/timetable/slots` — save timetable slot
- [ ] `GET /api/v1/timetable/section/:id` — get section's timetable
- [ ] `GET /api/v1/timetable/teacher/:id` — get teacher's timetable
- [ ] `GET /api/v1/timetable/live` — current period status for all sections
- [ ] `GET /api/v1/timetable/free-teachers` — free teachers at given period
- [ ] `POST /api/v1/timetable/override` — temporary substitute assignment
- [ ] `timetable.conflictChecker.ts` — conflict detection logic
- [ ] Timetable period config API
- [ ] **Guided timetable builder (web):**
  - [ ] Step 1: Campus + year selection
  - [ ] Step 2: Period config setup
  - [ ] Step 3: Section selection
  - [ ] Step 4: Subject-teacher assignment view
  - [ ] Step 5: Interactive grid with conflict detection
  - [ ] Step 6: Review and publish
- [ ] Timetable template save/load API
- [ ] Copy from template feature (web)
- [ ] Live timetable view component (for principal dashboard)
- [ ] Teacher availability finder component

**Fee Management:**
- [ ] `POST /api/v1/fees/structure` — create fee structure for program/semester
- [ ] `GET /api/v1/fees/structure` — list fee structures
- [ ] `GET /api/v1/fees/students` — all student fee records with filters
- [ ] `GET /api/v1/fees/students/:studentId` — student's fee history
- [ ] `POST /api/v1/fees/collect` — mark fee as paid (admin action)
- [ ] `GET /api/v1/fees/defaulters` — students with pending/overdue fees
- [ ] Fee overview page (web/admin)
- [ ] Mark as paid modal — enter receipt number and amount
- [ ] Fee defaulters list (web/admin)
- [ ] Fee history view (parent/student portal)
- [ ] Audit log entry on every fee transaction

**Sprint 3 Definition of Done:**
- Teacher can mark attendance for their class on web
- Admin can mark all staff attendance in the morning
- When a teacher is marked absent — principal receives real-time alert
- Alert shows affected classes and available substitute teachers
- Principal can assign substitute from the alert
- Admin can create and publish a timetable using the guided builder
- Conflict detection prevents double-booking
- Admin can mark fees as paid for a student

---

### 🎓 Sprint 4 — Academic Module & Principal Dashboard (Week 7–8)

**Goal:** Complete exam and result system, and the full principal command dashboard.

#### Tasks

**Exam Management:**
- [ ] Exam types CRUD API (Monthly Test, Mid-Term, Final, Practical, Board)
- [ ] `POST /api/v1/exams` — schedule exam
- [ ] `GET /api/v1/exams` — list exams with filters
- [ ] `PUT /api/v1/exams/:id/status` — update exam status
- [ ] Board exam records API (separate tracking)
- [ ] Exam schedule page (web/admin)
- [ ] Exam list page for teachers and students

**Result Management:**
- [ ] `POST /api/v1/results/enter` — enter marks for exam (teacher/admin)
- [ ] `GET /api/v1/results/exam/:examId` — all results for an exam
- [ ] `GET /api/v1/results/student/:studentId` — all results for a student
- [ ] `PUT /api/v1/results/verify/:id` — admin verifies result entry
- [ ] `results.gradeCalculator.ts` — auto-calculate grade from marks
- [ ] Marks entry table (web) — spreadsheet-like grid for bulk entry
- [ ] Student result view (all exams, all subjects)
- [ ] Printable report card component

**Principal Command Dashboard:**
- [ ] `GET /api/v1/dashboard/principal` — all dashboard data in one API call
- [ ] Live alerts section (Socket.io powered)
- [ ] Live timetable section (current period, color-coded)
- [ ] Quick stats cards (students present, staff present, fee today)
- [ ] Both campus overview cards (expandable)
- [ ] Recent activity feed

**Admin Dashboard:**
- [ ] `GET /api/v1/dashboard/admin` — admin dashboard data
- [ ] Stats cards
- [ ] Staff attendance quick-mark widget
- [ ] Pending fee alert widget
- [ ] Quick actions panel

**Teacher Dashboard:**
- [ ] `GET /api/v1/dashboard/teacher` — teacher's day data
- [ ] Today's schedule with current period highlighted
- [ ] Quick attendance access button
- [ ] Pending tasks widget

**Parent & Student Dashboards:**
- [ ] Parent dashboard API + UI (child summary, week attendance)
- [ ] Student dashboard API + UI (timetable, stats)

**Announcements:**
- [ ] Announcements CRUD API with target audience filter
- [ ] Create announcement page (admin/principal)
- [ ] Announcement list (all roles)
- [ ] Pin and expire functionality

**Leave Management:**
- [ ] Staff leave CRUD API
- [ ] Leave application page (for future — currently admin marks directly)
- [ ] Leave history view

**Reports:**
- [ ] Attendance report API (date range, section, student)
- [ ] Fee collection report API
- [ ] Result/marks report API
- [ ] Export to PDF functionality
- [ ] Export to Excel functionality
- [ ] Reports page (web/admin + principal)

**Sprint 4 Definition of Done:**
- Teacher can enter marks for any exam, grade is auto-calculated
- Admin can verify result entries
- Principal dashboard shows live real-time college status
- Principal receives instant alerts for absent teachers
- Principal can drill from campus → section → individual student
- Student and parent see their own results and reports
- Announcements can be targeted to specific audiences
- PDF and Excel export works for main reports

---

### 📱 Sprint 5 — Mobile Application (Week 9–10)

**Goal:** Complete mobile app for all 4 roles, with offline support for critical features.

#### Tasks

**Project Setup:**
- [ ] Initialize React Native project with Expo
- [ ] Configure EAS Build for APK generation
- [ ] Set up navigation structure (role-based navigators)
- [ ] Configure theme (colors, typography, spacing)
- [ ] Build all global components (Button, Card, Badge, Input, Skeleton, etc.)
- [ ] Set up Axios client with JWT interceptors
- [ ] Set up Zustand stores (auth, network)
- [ ] Configure Expo Notifications
- [ ] Configure Expo SecureStore for token storage

**Offline System:**
- [ ] Set up SQLite local database (`database.ts`)
- [ ] Build Sync Queue system (`syncQueue.ts`)
- [ ] Build Sync Manager — processes queue when online (`syncManager.ts`)
- [ ] Build Network Detector — monitors connectivity (`networkDetector.ts`)
- [ ] Implement timetable cache
- [ ] Implement attendance cache
- [ ] Implement announcements cache
- [ ] OfflineBanner component
- [ ] Background sync via Expo Background Fetch (every 15 min)
- [ ] In-app update checker (`useAppVersion.ts` hook)
- [ ] UpdatePrompt component (optional and forced variants)

**Authentication Screens:**
- [ ] Login screen with form validation
- [ ] Auto-login if valid tokens exist in SecureStore
- [ ] Role-based redirect after login
- [ ] Logout with token cleanup

**Principal Mobile Screens:**
- [ ] Principal Dashboard — live alerts + timetable + stats
- [ ] LiveAlertsSection — absent teacher alerts
- [ ] LiveTimetableSection — current period status
- [ ] Student browser (Campus → Program → Grade → Section → Students)
- [ ] Individual student profile screen (all data)
- [ ] Staff list screen with profiles
- [ ] Chat list + conversation screen
- [ ] WhatsApp button on all relevant profiles

**Admin Mobile Screens:**
- [ ] Admin dashboard with stats
- [ ] Staff attendance marking screen (morning workflow)
- [ ] Fee list and mark-paid screen
- [ ] Create announcement screen

**Teacher Mobile Screens:**
- [ ] Teacher dashboard with today's schedule
- [ ] Attendance marking screen (offline-capable):
  - [ ] Load student list for selected section
  - [ ] Mark each student (swipe or toggle)
  - [ ] Submit — goes to sync queue if offline
  - [ ] Shows offline badge when queued
- [ ] My classes screen (all assigned sections)
- [ ] Enter marks screen
- [ ] Timetable screen (cached)
- [ ] Chat list + conversation screen

**Parent Mobile Screens:**
- [ ] Parent dashboard (child summary card)
- [ ] Attendance history screen (cached)
- [ ] Fee history screen (cached)
- [ ] Results screen (cached)
- [ ] Announcements screen (cached)
- [ ] WhatsApp teacher button

**Student Mobile Screens:**
- [ ] Student dashboard (today's timetable)
- [ ] Timetable screen — full week (cached)
- [ ] Attendance history screen (cached)
- [ ] Results screen (cached)
- [ ] Announcements screen (cached)

**Sprint 5 Definition of Done:**
- All 4 roles can log in on mobile and access their portal
- Teacher can mark attendance with or without internet
- Offline attendance syncs automatically when internet restores
- Timetable, results, announcements work offline (cached)
- WhatsApp button opens correct parent's chat
- Push notifications received on device
- In-app update checker works and shows appropriate prompt
- APK can be built using `eas build`

---

### ✨ Sprint 6 — Polish, Testing & Launch (Week 11–12)

**Goal:** Production-ready system. Bug-free, performant, properly secured, distributed.

#### Tasks

**Real-Time Features Polish:**
- [ ] Socket.io reconnection logic (auto-reconnect on disconnect)
- [ ] Presence indicators in chat
- [ ] Mark messages as read in real-time
- [ ] Live timetable auto-updates as periods change throughout the day
- [ ] Push notification delivery testing

**Security Hardening:**
- [ ] Audit all API endpoints for missing auth/role checks
- [ ] Test CORS configuration
- [ ] Verify rate limiting on login endpoint
- [ ] Confirm all file uploads validate file type and size
- [ ] Test JWT expiry and refresh flow edge cases
- [ ] Audit logs writing correctly for all critical actions
- [ ] Ensure no sensitive data in API responses (no password hashes)

**Performance:**
- [ ] Add all database indexes (see Section 6.4)
- [ ] Test query performance with 1000+ student records
- [ ] Add React Query caching headers
- [ ] Lazy-load heavy page components
- [ ] Optimize images (Next.js Image component)
- [ ] Test peak load scenario (500+ simulated concurrent users)

**APK Distribution Setup:**
- [ ] Build production APK with `eas build --platform android --profile production`
- [ ] Create college website download page
- [ ] Write user installation guide (printable PDF)
- [ ] Test installation on multiple Android devices and versions
- [ ] Test in-app update checker end-to-end

**Testing Checklist:**
- [ ] Test all user roles logging in (web + mobile)
- [ ] Test campus isolation (Boys admin cannot see Girls data)
- [ ] Test timetable conflict detection
- [ ] Test absent teacher alert → substitute assignment flow end-to-end
- [ ] Test offline attendance marking → sync on reconnect
- [ ] Test fee marking flow (pending → paid → receipt)
- [ ] Test mark entry → grade calculation
- [ ] Test WhatsApp button on multiple devices
- [ ] Test all report exports (PDF + Excel)
- [ ] Test announcements with different target audiences
- [ ] Test chat between principal and teachers
- [ ] Test push notifications

**Local Server Setup:**
- [ ] Install Ubuntu Server 22.04 on college PC
- [ ] Install Node.js, PostgreSQL, Nginx, PM2, Certbot
- [ ] Configure UFW firewall
- [ ] Deploy backend application with PM2
- [ ] Deploy frontend (or configure Nginx to serve static build)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure automated daily backup script
- [ ] Set up UptimeRobot monitoring
- [ ] Test disaster recovery from backup
- [ ] Document server access credentials securely

**Documentation:**
- [ ] Update this master document with any changes made during development
- [ ] Write server maintenance runbook (step-by-step for common tasks)
- [ ] Write admin user manual (how to use the system)
- [ ] Write teacher quick-start guide
- [ ] Write parent installation + usage guide (printable)

**Launch:**
- [ ] Import real college data (students, staff, sections) from existing records
- [ ] Create all user accounts (admin, teachers, parents, students)
- [ ] Set up fee structures for current semester
- [ ] Import or build current semester timetable
- [ ] Soft launch with admin + 2–3 teachers for 1 week
- [ ] Collect feedback, fix issues
- [ ] Full launch to all parents and students

**Sprint 6 Definition of Done:**
- Zero critical bugs in all core workflows
- System handles peak load without performance issues
- APK successfully installs on Android devices
- Local server running stably with PM2
- Automated backups confirmed working
- Real college data imported and verified
- System handed over to college principal

---

## 14. API Reference

### 14.1 Response Format

All API responses follow this standard format:

```json
// Success
{
  "success": true,
  "message": "Students fetched successfully",
  "data": { ... },
  "pagination": {           // Only on list endpoints
    "page": 1,
    "limit": 25,
    "total": 650,
    "totalPages": 26
  }
}

// Error
{
  "success": false,
  "message": "Student not found",
  "error": "NOT_FOUND",
  "details": []             // Validation errors if applicable
}
```

### 14.2 Authentication Headers

```
Authorization: Bearer <access_token>
```

Every protected route requires this header. Missing or expired token returns 401.

### 14.3 Core Endpoints Reference

#### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login, returns token pair |
| POST | `/api/v1/auth/logout` | Authenticated | Invalidate refresh token |
| POST | `/api/v1/auth/refresh-token` | Public (with refresh token) | Get new access token |

#### Students
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/students` | Admin, Principal | Paginated student list |
| POST | `/api/v1/students` | Admin | Create student |
| GET | `/api/v1/students/:id` | Admin, Principal, Teacher (own class) | Student profile |
| PUT | `/api/v1/students/:id` | Admin | Update student |
| DELETE | `/api/v1/students/:id` | Admin | Deactivate student |

#### Attendance
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/attendance/students/mark` | Teacher | Mark class attendance |
| GET | `/api/v1/attendance/students` | Admin, Teacher, Principal | Attendance records |
| POST | `/api/v1/attendance/staff/mark` | Admin | Mark staff attendance |
| GET | `/api/v1/attendance/staff` | Admin, Principal | Staff attendance records |
| GET | `/api/v1/attendance/staff/free-teachers` | Principal | Free teachers at period |

#### Timetable
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/timetable/section/:id` | All | Section's timetable |
| GET | `/api/v1/timetable/teacher/:id` | Teacher, Admin | Teacher's timetable |
| GET | `/api/v1/timetable/live` | Principal, Admin | Live current period status |
| POST | `/api/v1/timetable/slots` | Admin | Save timetable slot |
| POST | `/api/v1/timetable/override` | Principal | Assign substitute |
| POST | `/api/v1/timetable/templates` | Admin | Save as template |

#### Fees
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/fees/students` | Admin, Principal | All fee records |
| GET | `/api/v1/fees/students/:id` | Admin, Parent, Student | Student's fee history |
| POST | `/api/v1/fees/collect` | Admin | Mark fee as paid |
| GET | `/api/v1/fees/defaulters` | Admin, Principal | Pending fee list |

#### Results
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/results/enter` | Teacher, Admin | Enter exam marks |
| GET | `/api/v1/results/student/:id` | Admin, Teacher, Parent, Student | Student results |
| GET | `/api/v1/results/exam/:id` | Admin, Teacher | All results for exam |
| PUT | `/api/v1/results/verify/:id` | Admin | Verify result entry |

#### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/principal` | Principal | Full principal dashboard data |
| GET | `/api/v1/dashboard/admin` | Admin | Admin dashboard data |
| GET | `/api/v1/dashboard/teacher` | Teacher | Teacher's day data |
| GET | `/api/v1/dashboard/parent` | Parent | Child summary data |
| GET | `/api/v1/dashboard/student` | Student | Student's portal data |

#### App Version
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/app/version` | Public | Latest APK version info |

---

## 15. Security Guidelines

### 15.1 Authentication Security
- Passwords must be minimum 8 characters
- Passwords hashed with bcrypt (cost factor 12)
- JWT secrets minimum 64 characters (random)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh token rotation on every use (old one invalidated)
- Failed login attempts: rate limited to 10/minute per IP

### 15.2 API Security
- All routes except login require valid JWT
- Role check on every route before data access
- Campus filter applied on every data query
- Request body validated with Zod before processing
- SQL injection impossible via Prisma parameterized queries
- File uploads: validate type (images only for photos, PDF for documents) and size (max 5MB)

### 15.3 Data Security
- Never log passwords or tokens
- Never return password_hash in API responses
- Student and staff photos served via authenticated URLs only
- Financial records (fees) write an audit log entry on every change
- Audit logs are append-only (never updated or deleted)

### 15.4 Infrastructure Security
- HTTPS enforced on all endpoints
- CORS: only frontend domain(s) allowed
- Firewall: only ports 80, 443, SSH open
- SSH: key-based only, password disabled
- Database: not accessible from internet (localhost only)
- Environment variables: never committed to git (`.env` in `.gitignore`)

### 15.5 Mobile App Security
- Tokens stored in Expo SecureStore (hardware-encrypted on device)
- No sensitive data stored in AsyncStorage (only cache data)
- No API keys or secrets in mobile app code
- APK signed with keystore (tamper detection)
- Certificate pinning (advanced — can add in Phase 2)

---

## Appendix A — Quick Reference

### Environment Setup Commands

```bash
# Backend
cd college-backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Web App
cd college-web
npm install
npm run dev

# Mobile App
cd college-mobile
npm install
npx expo start

# Build APK
eas build --platform android --profile preview
```

### Key File Locations

| Purpose | File |
|---|---|
| Database schema | `college-backend/prisma/schema.prisma` |
| Environment config | `college-backend/.env` |
| API routes registry | `college-backend/src/routes/index.ts` |
| Color tokens (web) | `college-web/src/styles/globals.css` |
| Color tokens (mobile) | `college-mobile/src/theme/colors.ts` |
| Axios client (web) | `college-web/src/lib/axios.ts` |
| Axios client (mobile) | `college-mobile/src/api/client.ts` |
| Offline sync manager | `college-mobile/src/offline/syncManager.ts` |
| Socket events (backend) | `college-backend/src/modules/chat/chat.socket.ts` |
| Socket client (web) | `college-web/src/lib/socket.ts` |

### Port Reference

| Service | Port |
|---|---|
| Backend API | 3000 |
| PostgreSQL | 5432 (internal only) |
| Next.js Dev | 3001 |
| Expo Dev | 8081 |
| Nginx (production) | 80 / 443 |

---

*This document is the single source of truth for the College Management System project. Update it as decisions change during development.*

*Version: 1.0 | Status: Planning Complete | Next Step: Sprint 1 Development*
