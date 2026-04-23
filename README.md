# Academic Affairs Portal — Full Stack Project

## 🚀 Quick Start & Installation Guide

Follow these steps to get the project up and running on your local machine.

### 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

---

### 🛠️ Installation

You need to install dependencies for both the **Backend** and the **Frontend**.

#### 1. Backend Setup
```bash
cd backend
npm install
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

---

### ⚙️ Environment Configuration

1.  Navigate to the `backend` directory.
2.  The `.env` file should already exist, but ensure it has the following variables configured:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    NODE_ENV=development
    ```
    *(Note: A default `.env` is already provided in the repository for development purposes.)*

---

### 🏃‍♂️ Running the Project

You will need to run the backend and frontend in separate terminal windows.

#### Start the Backend
```bash
cd backend
npm run dev
```
*The server will start on `http://localhost:5000`*

#### Start the Frontend
```bash
cd frontend
npm run dev
```
*The application will be available at `http://localhost:5173` (or the port shown in your terminal)*

---


> An integrated college management system providing dedicated portals for Students, Faculty, and Administrators. Built with a microservices-inspired architecture, the platform consolidates academic management, hostel & welfare services, document workflows, and institutional administration into a single, unified system.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [System Architecture Overview](#system-architecture-overview)
3. [Database Schemas](#database-schemas)
4. [Module 1 — Identity & Access Management (IAM)](#module-1--identity--access-management-iam)
5. [Module 2 — Student Academic Portal](#module-2--student-academic-portal)
6. [Module 3 — Course Operations & Assessment Engine](#module-3--course-operations--assessment-engine)
7. [Module 4 — Communication & Resource Hub](#module-4--communication--resource-hub)
8. [Module 5 — Curriculum & Institutional Administration](#module-5--curriculum--institutional-administration)
9. [Module 6 — Hostel & Welfare Services](#module-6--hostel--welfare-services)
10. [Module 7 — Data Analytics & Document Workflows](#module-7--data-analytics--document-workflows)
11. [Security Principles](#security-principles)
12. [Project Structure](#project-structure)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (with React Router, Context API / Redux) |
| Backend    | Node.js (Express.js REST API)       |
| Database   | SQL (PostgreSQL / MySQL)            |
| Auth       | JWT (JSON Web Tokens), HTTP-only Cookies |
| Caching    | Redis                               |
| Security   | Bcrypt, AES-256, HTTPS, RBAC middleware |
| File Storage | Secure server-side file storage (validated uploads) |

---

## System Architecture Overview

The platform follows a **modular monolith / microservices-inspired** design where each functional domain is an independently deployable service group. Key patterns used throughout:

- **BFF (Backend-For-Frontend)** — Dashboard services aggregate data from multiple sources in a single request
- **RBAC Middleware** — Every protected route enforces role-based permission evaluation before business logic executes
- **JWT Stateless Sessions** — Signed tokens carry role and identity; Redis blocklist handles revocations
- **Event-driven Audit Logging** — Every sensitive action generates an encrypted, append-only audit trail
- **Parameterized Queries** — All database interactions use prepared statements (no raw string interpolation)
- **Asynchronous Processing** — Heavy operations (PDF generation, email dispatch) are handled non-blocking

**User Roles:** `student` | `faculty` | `admin` | `hmc_member` | `hostel_staff`

---

## Database Schemas

The system uses four primary schema domains, each corresponding to a major portal:

| Schema | Scope |
|--------|-------|
| **Admin Schema** | Users, Departments, Programs, Courses, Admin accounts, Person Profiles |
| **Faculty Schema** | Faculty records, Courses, Enrollments, Attendance, Assignments, Submissions, Grades, Feedback, Messages |
| **Student Schema** | Student records, Course Offerings, Enrollments, Attendance Summaries, Requests, Documents, Feedback |
| **Hostel Schema** | Hostels, Rooms, Facilities, Assets, Complaints, Leave Forms, Transfer Requests, No-Dues, Staff, HMC Members |

---

## Module 1 — Identity & Access Management (IAM)

> **Responsibility:** Security gateway, user verification, session lifecycle, and role enforcement. All other modules depend on this layer.

---

### Service 1 — User Login & Authentication

**Goal:** Verify institute credentials and issue a signed session token that downstream services trust.

**Key Flows:**
- User submits Institute ID + password via the login form
- Backend validates credentials against the Users table (LDAP-compatible integration supported)
- On success, a signed JWT is generated containing `userId`, `role`, and `exp` (expiry)
- Token is delivered via an HTTP-only, Secure, SameSite cookie (not exposed to JavaScript)
- On failure, a rate-limited, generic error is returned (no credential enumeration)

**Actors:** Student, Faculty, Admin, Hostel Staff, HMC Member

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user and issue JWT |
| POST | `/api/auth/logout` | Revoke token, clear cookie |
| GET  | `/api/auth/me` | Return current authenticated user info |

**Security:** Bcrypt password comparison, rate limiting on `/login`, generic error messages to prevent enumeration, HTTPS enforced.

---

### Service 2 — Password Management

**Goal:** Allow users to securely reset forgotten passwords and update existing ones.

**Key Flows:**
- User requests password reset via registered email
- Backend generates a time-limited, single-use reset token (UUID or HMAC) and emails it
- User submits new password with the token; backend validates token freshness and invalidates it post-use
- New password is hashed with Bcrypt before storage
- Existing logged-in users can change password via authenticated endpoint (requires current password confirmation)

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/forgot-password` | Trigger reset email with token |
| POST | `/api/auth/reset-password` | Validate token, update hashed password |
| PUT  | `/api/auth/change-password` | Authenticated in-session password change |

**Security:** Tokens are single-use and expire (15–60 min), stored as hashes in DB, email dispatch is async (no timing leak).

---

### Service 3 — Role-Based Access Control (RBAC)

**Goal:** Ensure every API route grants access only to roles that are explicitly permitted, with fail-secure defaults.

**Key Flows:**
- A middleware layer intercepts every protected request
- Decodes and verifies the JWT signature; rejects expired or tampered tokens
- Extracts the `role` claim and evaluates it against the endpoint's allowed-role list
- Grants or denies access before any business logic runs
- Unauthorized attempts are logged to the audit system

**Permission Matrix (Examples):**

| Action | Student | Faculty | Admin |
|--------|---------|---------|-------|
| View own grades | ✅ | ❌ | ✅ |
| Submit grades | ❌ | ✅ | ✅ |
| Manage departments | ❌ | ❌ | ✅ |
| Upload assignments | ✅ | ❌ | ❌ |
| Configure assignments | ❌ | ✅ | ✅ |

**Security:** Fail-secure (deny by default), no client-side role trust, permission list is server-side only.

---

### Service 4 — User Profile Management

**Goal:** Allow users to view and update their personal information while preventing unauthorized cross-user modifications.

**Key Flows:**
- Authenticated user fetches their profile (name, contact, photo, department)
- User submits updates; backend validates input (no XSS payloads, proper formats)
- IDOR (Insecure Direct Object Reference) prevention: backend always resolves user ID from the JWT, not from request body
- Profile picture uploads are type-checked and sanitized

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/profile` | Fetch own profile |
| PUT  | `/api/profile` | Update profile fields |
| POST | `/api/profile/photo` | Upload profile picture |

**Security:** Input sanitization, IDOR prevention, image type validation.

---

### Service 5 — Activity Logging & Auditing

**Goal:** Maintain a tamper-evident, encrypted record of all sensitive actions across the system for compliance and forensics.

**Key Flows:**
- Every sensitive operation (login, role change, grade submission, document generation) emits a structured log event
- Log records include: `userId`, `action`, `targetResource`, `timestamp`, `ipAddress`, `outcome`
- Logs are stored in an append-only database table (no UPDATE/DELETE permissions on log table)
- Log payloads are encrypted using AES-256 before persistence
- Admins can query logs by user, date range, or action type

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/logs` | Query audit logs (admin only) |
| GET | `/api/admin/logs/:userId` | Logs for a specific user |

**Security:** AES-256 encryption, append-only table, separate KMS for encryption keys, admin-only access.

---

### Service 6 — Session Security

**Goal:** Enforce secure session lifecycle, handle token revocation (logout), and protect against session hijacking.

**Key Flows:**
- JWT is stored in an HTTP-only, Secure, SameSite=Strict cookie
- On logout, the JWT's `jti` (JWT ID) is added to a Redis blocklist
- All subsequent requests check the blocklist before accepting the token
- Tokens have short expiry (e.g., 1 hour); refresh tokens are issued for extended sessions
- Concurrent session limits can be enforced per user role

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | Revoke token, add to blocklist |
| POST | `/api/auth/refresh` | Issue new access token via refresh token |

**Security:** HttpOnly + Secure cookies, Redis blocklist, CSRF mitigation via SameSite, short-lived tokens.

---

## Module 2 — Student Academic Portal

> **Responsibility:** Primary self-service interface for students — enrollment, academic visibility, and course lifecycle management.

---

### Service 7 — Student Dashboard

**Goal:** Provide students with a single, consolidated view of their current academic standing, upcoming tasks, announcements, and alerts on page load.

**Key Flows:**
- Backend aggregates data in parallel from multiple sources: enrolled courses, pending assignments, attendance warnings, recent grades, and announcements
- Uses the BFF (Backend-For-Frontend) pattern — a single API call returns a composed response, avoiding multiple round-trips
- Redis caching for non-volatile data (e.g., course list, program info) with invalidation on updates
- Students see attendance warnings if percentage drops below configured threshold

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Aggregated dashboard payload |

**Data Returned:** Enrolled courses, attendance summary, pending assignments, recent grades, active announcements, CGPA snapshot.

---

### Service 8 — Course Registration

**Goal:** Allow students to enroll in available course offerings for the upcoming semester, subject to prerequisites, capacity, and schedule constraints.

**Key Flows:**
- Student browses available course offerings filtered by program and semester
- System checks: (a) prerequisites satisfied, (b) course not already enrolled, (c) seat capacity not exceeded, (d) no schedule conflicts
- On success, enrollment record is created and seat count decremented (atomic DB transaction)
- Enrollment confirmation is returned; student can view in dashboard

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/courses/available` | List open course offerings |
| POST | `/api/enrollment` | Enroll in a course |
| GET  | `/api/enrollment` | View current enrollments |

**Constraints:** Capacity-check + enrollment in a single atomic transaction to prevent race conditions.

---

### Service 9 — Drop Courses

**Goal:** Allow students to drop enrolled courses within the permitted drop window, with validation of credit minimums.

**Key Flows:**
- Student requests to drop a course (must be within the drop deadline set by admin)
- System checks: (a) enrollment exists, (b) drop deadline not passed, (c) remaining credits ≥ minimum required
- On success, enrollment is marked as dropped and seat count is restored (atomic transaction)
- Dropped courses appear in academic history with a "W" (Withdrawn) status

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/enrollment/:courseId` | Drop an enrolled course |
| GET    | `/api/enrollment/drop-deadline` | Check current drop deadline |

---

### Service 10 — Academic Record Viewer

**Goal:** Give students read-only access to their complete academic transcript — grades, SGPA, and CGPA across all semesters.

**Key Flows:**
- Student requests academic records; backend retrieves all completed enrollment records with grades
- SGPA is computed per semester; CGPA is computed across all graded semesters
- Records are displayed by semester in reverse chronological order
- Students can request an official transcript from this view (triggers Service 14 / 27)

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/academic-record` | Full academic history with GPA calculations |
| GET | `/api/student/academic-record/:semester` | Records for a specific semester |

**GPA Logic:** Weighted average using credit hours × grade points per course.

---

## Module 3 — Course Operations & Assessment Engine

> **Responsibility:** Bridges faculty and student interaction — day-to-day coursework, attendance, submissions, and grading.

---

### Service 11 — Student Attendance Tracking

**Goal:** Allow students to view their attendance status per course and receive alerts when attendance is at risk.

**Key Flows:**
- Student queries attendance for all enrolled courses or a specific course
- Backend retrieves attendance records and computes attendance percentage per course
- If percentage < configured threshold (e.g., 75%), a warning flag is included in the response
- Attendance data feeds into the Student Dashboard (Service 7)

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/attendance` | Attendance summary for all courses |
| GET | `/api/student/attendance/:courseId` | Attendance for a specific course |

---

### Service 12 — Assignment Upload (Student)

**Goal:** Allow students to submit assignment files before the deadline, with file validation and duplicate prevention.

**Key Flows:**
- Student selects an assignment and uploads a file (PDF, DOCX, or ZIP within size limit)
- Backend validates: (a) file type is allowed, (b) file size is within limit, (c) deadline has not passed, (d) no prior submission exists (or resubmission is permitted)
- File is stored securely on server; a submission record is created in the DB
- Confirmation with submission timestamp is returned

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/assignments` | List assignments for enrolled courses |
| POST | `/api/assignments/:assignmentId/submit` | Upload submission file |
| GET  | `/api/assignments/:assignmentId/submission` | View own submission status |

**Validation:** Allowed MIME types, max file size config, deadline enforcement, secure storage path.

---

### Service 17 — Grade Submission (Faculty)

**Goal:** Allow faculty to enter and submit final grades for students enrolled in their courses.

**Key Flows:**
- Faculty selects a course they teach and sees the enrolled student list
- Faculty enters a grade for each student (letter grade or numeric, per configuration)
- Grades can be saved as draft before final submission
- Once submitted, grades are locked and visible to students; amendments require admin approval
- Grade submission triggers audit log entry

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/faculty/courses/:courseId/students` | Student roster for grading |
| POST | `/api/faculty/courses/:courseId/grades` | Submit grades |
| PUT  | `/api/faculty/courses/:courseId/grades` | Update draft grades |

---

### Service 18 — Attendance Marking (Faculty)

**Goal:** Allow faculty to mark student attendance for each class session.

**Key Flows:**
- Faculty selects a course and date; sees the enrolled student list
- Faculty marks each student as Present, Absent, or Late
- Attendance record is saved per session; aggregate percentages are recomputed
- Faculty can edit attendance for past sessions within an amendment window

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/faculty/courses/:courseId/attendance` | View attendance records |
| POST | `/api/faculty/courses/:courseId/attendance` | Mark attendance for a session |
| PUT  | `/api/faculty/courses/:courseId/attendance/:sessionId` | Edit past session attendance |

---

### Service 19 — Assignment Configuration (Faculty)

**Goal:** Allow faculty to create, configure, and manage assignments for their courses.

**Key Flows:**
- Faculty creates an assignment with title, description, deadline, max score, and allowed file types
- Faculty can update or delete assignments before any submissions are received
- Assignment visibility (draft vs. published) is configurable
- Once published, students can see and submit; deadline is enforced server-side

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/faculty/courses/:courseId/assignments` | Create assignment |
| PUT    | `/api/faculty/courses/:courseId/assignments/:id` | Update assignment |
| DELETE | `/api/faculty/courses/:courseId/assignments/:id` | Delete assignment |
| PATCH  | `/api/faculty/courses/:courseId/assignments/:id/publish` | Publish assignment |

---

### Service 20 — Submission Review (Faculty)

**Goal:** Allow faculty to view, download, and grade student submission files for an assignment.

**Key Flows:**
- Faculty selects an assignment and sees a list of all submissions with student names and timestamps
- Faculty can download and review each submitted file
- Faculty enters a score and optional feedback comment per submission
- Graded submissions are marked; students can view their score and feedback

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/faculty/assignments/:assignmentId/submissions` | List all submissions |
| GET  | `/api/faculty/assignments/:assignmentId/submissions/:submissionId/file` | Download submission file |
| POST | `/api/faculty/assignments/:assignmentId/submissions/:submissionId/grade` | Submit grade + feedback |

---

## Module 4 — Communication & Resource Hub

> **Responsibility:** Consolidates broadcasting, file sharing, and academic feedback mechanisms across the platform.

---

### Service 13 — General Announcements

**Goal:** Enable faculty and admins to post announcements to course channels or system-wide, with students receiving relevant notifications.

**Key Flows:**
- Faculty posts an announcement scoped to a specific course; Admin can post institution-wide
- Announcement is stored and pushed to all enrolled students in that course (or all users for system-wide)
- Students see announcements on their dashboard and can browse historical ones
- Announcements support rich text; optional attachment support

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/announcements` | Create announcement (faculty/admin) |
| GET  | `/api/announcements` | List relevant announcements (filtered by role) |
| GET  | `/api/announcements/:id` | View announcement detail |
| DELETE | `/api/announcements/:id` | Delete announcement (author/admin) |

---

### Service 15 — Resource Sharing (Faculty Upload)

**Goal:** Allow faculty to upload and organize course materials (slides, PDFs, references) for student access.

**Key Flows:**
- Faculty uploads a file and associates it with a course, tagging it with a category (Lecture, Lab, Reference)
- File is stored securely; a resource record with metadata is created
- Students enrolled in the course can browse and download resources
- Faculty can update metadata or delete resources

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/faculty/courses/:courseId/resources` | Upload resource file |
| GET  | `/api/courses/:courseId/resources` | List course resources |
| GET  | `/api/resources/:resourceId/download` | Download a resource |
| DELETE | `/api/faculty/resources/:resourceId` | Remove a resource |

---

### Service 16 — Course Feedback Window

**Goal:** Open and close a time-bound window for students to submit anonymous course feedback, ensuring feedback is collected only during the designated period.

**Key Flows:**
- Admin or faculty opens a feedback window for a course with a start and end date
- Students see an active feedback form during the window; form closes automatically after deadline
- Feedback is anonymized before storage (student identity decoupled from response)
- Faculty can view aggregate results after the window closes

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/faculty/courses/:courseId/feedback/window` | Open feedback window |
| GET  | `/api/student/courses/:courseId/feedback` | Fetch feedback form |
| POST | `/api/student/courses/:courseId/feedback` | Submit feedback |
| GET  | `/api/faculty/courses/:courseId/feedback/results` | View aggregate results |

**Privacy:** Feedback submissions strip identifying metadata; responses are linked only to the course, not the student.

---

### Service 22 — Academic Messaging

**Goal:** Provide a structured, role-aware in-platform messaging system for academic communication between students and faculty.

**Key Flows:**
- Students can initiate messages to faculty of their enrolled courses
- Faculty can send messages to individual students or broadcast to an entire course cohort
- Messages are threaded per conversation
- Notifications alert recipients of new messages
- Admin has visibility into message threads for moderation

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send a message |
| GET  | `/api/messages` | List conversations |
| GET  | `/api/messages/:threadId` | View message thread |
| DELETE | `/api/messages/:messageId` | Delete message (sender/admin) |

---

### Service 23 — Resource Sharing (Student View)

**Goal:** Provide students with a searchable, organized interface for accessing all course materials shared by faculty.

**Key Flows:**
- Students browse resources for each enrolled course, filtered by category or keyword
- Resources are displayed with metadata: title, upload date, file type, faculty uploader
- Students can download files; download events may be logged for analytics

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/courses/:courseId/resources` | List resources for a course |
| GET | `/api/resources/:resourceId/download` | Download a resource file |

---

### Service 32 — Course Feedback Evaluation (Admin View)

**Goal:** Allow admins and department heads to view, aggregate, and act on course feedback data across all departments.

**Key Flows:**
- Admin queries feedback summaries across courses, departments, or faculty members
- Aggregated statistics (average ratings, response counts, comment themes) are displayed
- Reports can be exported for institutional review
- Feedback trends inform program reviews and faculty evaluations

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/feedback` | All feedback summaries |
| GET | `/api/admin/feedback/department/:deptId` | Department-level feedback |
| GET | `/api/admin/feedback/faculty/:facultyId` | Faculty-level feedback |
| GET | `/api/admin/feedback/export` | Export report |

---

## Module 5 — Curriculum & Institutional Administration

> **Responsibility:** Backend administrative structures — managing programs, courses, departments, and user accounts that all academic modules depend upon.

---

### Service 24 — Enrollment Oversight

**Goal:** Give administrators visibility and control over all student enrollment records — including manual overrides, capacity management, and enrollment reports.

**Key Flows:**
- Admin views enrollment data across all courses and semesters
- Admin can manually enroll or drop students (bypass deadline restrictions with audit trail)
- Admin can set or modify course capacity and enrollment windows
- Enrollment reports can be exported by course, department, or semester

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/enrollments` | View all enrollments |
| POST | `/api/admin/enrollments` | Manual enrollment (admin override) |
| DELETE | `/api/admin/enrollments/:id` | Remove enrollment |
| GET  | `/api/admin/enrollments/report` | Export enrollment report |

---

### Service 25 — Student Database Management

**Goal:** Allow admins to create, update, deactivate, and manage the full lifecycle of student accounts in the system.

**Key Flows:**
- Admin creates a new student account with program assignment, batch, and initial credentials
- Admin can update student records (program transfer, batch change, academic standing)
- Admin can deactivate accounts for graduated, withdrawn, or suspended students
- Bulk import of student records via structured CSV/Excel upload

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/students` | List all students |
| POST | `/api/admin/students` | Create student account |
| PUT  | `/api/admin/students/:id` | Update student record |
| PATCH | `/api/admin/students/:id/status` | Activate / deactivate account |
| POST | `/api/admin/students/bulk-import` | Bulk import via file |

---

### Service 26 — Faculty Account Administration

**Goal:** Allow admins to manage faculty accounts — creation, course assignment, departmental affiliation, and deactivation.

**Key Flows:**
- Admin creates a faculty account with department, designation, and initial credentials
- Faculty are assigned to teach specific course offerings per semester
- Admin can update faculty details, reassign departments, or deactivate accounts

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/faculty` | List all faculty |
| POST | `/api/admin/faculty` | Create faculty account |
| PUT  | `/api/admin/faculty/:id` | Update faculty record |
| POST | `/api/admin/faculty/:id/courses` | Assign course to faculty |
| PATCH | `/api/admin/faculty/:id/status` | Activate / deactivate |

---

### Service 29 — Program Configuration

**Goal:** Allow admins to define and manage academic programs (degrees/majors) — their structure, credit requirements, and associated departments.

**Key Flows:**
- Admin creates a new program with name, department, duration, and total credit requirement
- Admin configures required and elective course slots per program
- Programs are referenced during student enrollment and transcript generation

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/programs` | List all programs |
| POST | `/api/admin/programs` | Create a program |
| PUT  | `/api/admin/programs/:id` | Update program |
| DELETE | `/api/admin/programs/:id` | Remove program (if no enrolled students) |

---

### Service 30 — Course Catalog Control

**Goal:** Allow admins to manage the master course catalog — adding, updating, and retiring courses, including prerequisite definitions and credit assignments.

**Key Flows:**
- Admin creates a course with code, name, credits, description, and prerequisites
- Course offerings (specific semester sections) are created from the catalog
- Admin can update course details or mark courses as retired (no new offerings)
- Catalog is referenced by registration, transcript, and analytics services

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/courses` | List course catalog |
| POST | `/api/admin/courses` | Add course to catalog |
| PUT  | `/api/admin/courses/:id` | Update course details |
| POST | `/api/admin/courses/:id/offerings` | Create a semester offering |
| PATCH | `/api/admin/courses/:id/retire` | Retire a course |

---

### Service 31 — Department Management

**Goal:** Allow admins to create and manage academic departments — the top-level organizational unit under which programs, faculty, and courses are grouped.

**Key Flows:**
- Admin creates a department with name, code, and head-of-department assignment
- Programs and faculty accounts are linked to departments
- Department data feeds into feedback evaluation, analytics, and reporting

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/departments` | List departments |
| POST | `/api/admin/departments` | Create department |
| PUT  | `/api/admin/departments/:id` | Update department details |
| DELETE | `/api/admin/departments/:id` | Remove department |

---

## Module 6 — Hostel & Welfare Services

> **Responsibility:** Residential logistics, facility management, complaint tracking, and student welfare governance — entirely separate domain from academic services.

---

### Service 33 — Leave Application

**Goal:** Allow resident students to formally apply for leave from the hostel, specifying dates and reason.

**Key Flows:**
- Student submits a leave application with start date, end date, destination, and reason
- Application goes into a pending state and is routed to the hostel warden / HMC for approval (Service 38)
- Student can track the status of their application
- Approved leaves are recorded; attendance/security records may be updated

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hostel/leave` | Submit leave application |
| GET  | `/api/hostel/leave` | List own leave applications |
| GET  | `/api/hostel/leave/:id` | View application status |
| DELETE | `/api/hostel/leave/:id` | Withdraw pending application |

---

### Service 34 — No Dues Clearance

**Goal:** Allow students to initiate a no-dues verification process across departments (library, hostel, finance, lab) before graduation or transfer.

**Key Flows:**
- Student submits a no-dues clearance request
- System fans out verification tasks to each relevant department
- Each department approves or raises a due (with description and amount)
- Overall clearance is granted only when all departments confirm no dues
- Clearance certificate can be downloaded upon full approval

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hostel/no-dues` | Initiate no-dues request |
| GET  | `/api/hostel/no-dues/:id` | View clearance status per department |
| POST | `/api/admin/no-dues/:id/department` | Department approves/raises due |
| GET  | `/api/hostel/no-dues/:id/certificate` | Download clearance certificate |

---

### Service 35 — Hostel Transfer Request

**Goal:** Allow resident students to request a transfer to a different hostel room or block, subject to availability and approval.

**Key Flows:**
- Student submits a transfer request specifying preferred hostel/room and reason
- HMC reviews request and checks availability
- On approval, room assignment is updated; on rejection, reason is communicated
- Transfer history is maintained in the student's hostel record

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hostel/transfer` | Submit transfer request |
| GET  | `/api/hostel/transfer` | List own transfer requests |
| PATCH | `/api/hmc/transfer/:id` | Approve or reject (HMC only) |

---

### Service 36 — Complaint Filing

**Goal:** Allow resident students to lodge formal complaints regarding hostel facilities, roommates, or staff.

**Key Flows:**
- Student submits a complaint with category (facility, conduct, maintenance), description, and optionally a photo
- Complaint is assigned a unique ticket ID and routed to the appropriate authority
- Student receives confirmation with ticket ID for tracking

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hostel/complaints` | File a complaint |
| GET  | `/api/hostel/complaints` | List own complaints |
| GET  | `/api/hostel/complaints/:id` | View complaint detail |

---

### Service 37 — Complaint Status Tracking

**Goal:** Allow students to track the resolution status of filed complaints and receive updates as they progress.

**Key Flows:**
- Student queries complaint by ticket ID or views a list of all personal complaints
- Status progresses through: `Submitted → Under Review → In Progress → Resolved / Closed`
- HMC / hostel staff update the status and optionally add resolution notes
- Students are notified on status changes

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/hostel/complaints/:id/status` | Get current complaint status |
| PATCH | `/api/hmc/complaints/:id/status` | Update status (HMC/staff only) |

---

### Service 38 — Leave Approval Logic

**Goal:** Allow hostel wardens and HMC members to review, approve, or reject student leave applications.

**Key Flows:**
- HMC/warden sees a queue of pending leave applications
- Reviewer can approve (with optional conditions) or reject (with mandatory reason)
- Decision is recorded with reviewer identity and timestamp
- Student is notified of the decision; approved leaves are recorded in system

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/hmc/leave/pending` | List pending applications |
| PATCH | `/api/hmc/leave/:id/approve` | Approve application |
| PATCH | `/api/hmc/leave/:id/reject` | Reject with reason |

---

### Service 39 — HMC Member Management

**Goal:** Allow admins to manage the Hostel Management Committee (HMC) membership — adding, updating roles, and removing members.

**Key Flows:**
- Admin assigns existing user accounts HMC member roles
- HMC members gain access to leave approval, complaint management, and transfer oversight
- Admin can remove or rotate HMC membership at the end of a term

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/hmc/members` | List HMC members |
| POST | `/api/admin/hmc/members` | Add HMC member |
| DELETE | `/api/admin/hmc/members/:id` | Remove member |

---

### Service 40 — Facility & Asset Management

**Goal:** Allow hostel staff to track, log, and manage hostel facilities and physical assets (furniture, appliances, infrastructure).

**Key Flows:**
- Staff creates asset records with asset type, location (hostel, block, room), condition, and acquisition date
- Staff can log maintenance events and update asset condition
- Damaged or missing assets can be flagged; tied to complaints if applicable
- Admins and HMC can view facility/asset status reports

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST  | `/api/hostel/assets` | Add new asset |
| GET   | `/api/hostel/assets` | List all assets |
| PUT   | `/api/hostel/assets/:id` | Update asset record |
| PATCH | `/api/hostel/assets/:id/maintenance` | Log maintenance event |
| DELETE | `/api/hostel/assets/:id` | Remove asset record |

---

## Module 7 — Data Analytics & Document Workflows

> **Responsibility:** System-wide data aggregation, performance analytics, and automated generation of official academic documents.

---

### Service 21 — Performance Analytics

**Goal:** Provide faculty, department heads, and admins with aggregated academic performance metrics at course, cohort, and department levels.

**Key Flows:**
- Faculty views analytics for their course: grade distribution, average score, attendance trends, assignment completion rates
- Admin/department head views program-level or department-level aggregations
- Charts and data tables are served via API for rendering on the frontend
- Analytics run on-demand or can be pre-aggregated on a schedule

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/course/:courseId` | Course-level metrics |
| GET | `/api/analytics/program/:programId` | Program-level metrics |
| GET | `/api/analytics/department/:deptId` | Department-level metrics |
| GET | `/api/analytics/student/:studentId` | Individual student performance |

**Metrics Included:** Grade distribution, average SGPA/CGPA, attendance rate, assignment submission rate, dropout rate.

---

### Service 27 — Automated Transcript Generation

**Goal:** Automatically generate a formatted, official PDF transcript for a student upon request, populated with verified academic records.

**Key Flows:**
- Student or admin triggers transcript generation for a student ID
- Backend fetches all graded enrollment records, computes SGPA/CGPA, and populates a PDF template
- PDF is generated server-side (no client-side rendering) with institute branding and a unique document ID
- Generated document is stored and returned as a download link
- Document ID is logged in the audit trail for authenticity verification

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/transcript/:studentId` | Generate transcript PDF |
| GET  | `/api/documents/transcript/:documentId` | Download generated transcript |
| GET  | `/api/documents/transcript/verify/:documentId` | Verify transcript authenticity |

**Output:** Signed, branded PDF with unique document ID, generation timestamp, and official seal placeholder.

---

### Service 28 — Certificate Approval Workflow

**Goal:** Manage the multi-step approval lifecycle for official certificates (completion, bonafide, character) requested by students.

**Key Flows:**
- Student submits a certificate request specifying type and purpose
- Request routes through an approval chain: department head → registrar → admin (configurable)
- Each approver can approve, reject, or return with comments
- On final approval, a PDF certificate is auto-generated with a unique certificate ID
- Student is notified and can download the certificate

**Lifecycle States:** `Requested → Pending Department → Pending Registrar → Approved → Generated → Issued`

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST  | `/api/certificates` | Submit certificate request |
| GET   | `/api/certificates` | List own certificate requests |
| PATCH | `/api/admin/certificates/:id/approve` | Approve at current stage |
| PATCH | `/api/admin/certificates/:id/reject` | Reject with reason |
| GET   | `/api/certificates/:id/download` | Download approved certificate |

---

### Service 14 — Transcript Request

**Goal:** Allow students to formally request an official transcript, specifying the number of copies and destination (internal or external institution).

**Key Flows:**
- Student submits a request with: purpose (internal/external), number of copies, destination address (if external)
- Request is logged and routed to the admin/registrar for verification
- On approval, Service 27 is invoked to generate the transcript PDF
- Student is notified when the transcript is ready for download or dispatch

**Key API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student/transcript-request` | Submit transcript request |
| GET  | `/api/student/transcript-request` | List own requests and status |
| PATCH | `/api/admin/transcript-request/:id` | Approve or reject request |

---

## Security Principles

The following security controls are applied uniformly across all services:

| Control | Implementation |
|---------|---------------|
| **Authentication** | JWT in HTTP-only, Secure, SameSite=Strict cookies |
| **Authorization** | RBAC middleware on every protected route; fail-secure defaults |
| **Password Storage** | Bcrypt hashing with configurable cost factor |
| **SQL Injection** | Parameterized queries / prepared statements only |
| **XSS Prevention** | Input sanitization on all user-supplied strings |
| **IDOR Prevention** | User identity always resolved from JWT, not request body |
| **CSRF Mitigation** | SameSite cookies; CSRF tokens where necessary |
| **Audit Trail** | AES-256 encrypted, append-only log table; separate KMS |
| **File Uploads** | MIME type validation, size limits, secure storage paths |
| **Rate Limiting** | Applied on auth endpoints and sensitive operations |
| **HTTPS** | Enforced at infrastructure level; no plain HTTP |
| **Session Revocation** | Redis-based JWT blocklist for instant invalidation |

---

## Project Structure

```
college-erp-portal/
├── docker-compose.yml               # Orchestrates frontend, backend, and MySQL
├── README.md
├── .gitignore                       # Ignores node_modules, .env, build artifacts
│
├── /backend                         # Node.js & Express API
│   ├── package.json
│   ├── Dockerfile
│   ├── .env                         # DB credentials, JWT secrets, LDAP config
│   └── /src
│       ├── server.js                # Entry point for the Node server
│       ├── app.js                   # Express initialization & global middleware
│       │
│       ├── /config
│       │   ├── database.js          # MySQL connection pooling & transactions
│       │   └── ldap.js              # OpenLDAP integration setup
│       │
│       ├── /middleware
│       │   ├── authenticate.js      # JWT-based session validation
│       │   ├── authorize.js         # Role-Based Access Control (RBAC)
│       │   ├── auditLogger.js       # Encrypted tracking of sensitive actions
│       │   └── rateLimiter.js       # Rate limiting on auth & sensitive endpoints
│       │
│       ├── /modules                 # Domain-driven business logic
│       │   ├── /iam                 # Module 1 — Identity & Access Management
│       │   │   ├── iam.routes.js
│       │   │   ├── iam.controller.js
│       │   │   └── iam.service.js
│       │   │
│       │   ├── /academic            # Modules 2 & 3 — Student Portal & Assessment Engine
│       │   │   ├── enrollment.service.js    # Course registration & drop logic
│       │   │   ├── grading.service.js       # Faculty grade submissions
│       │   │   └── attendance.service.js    # Marking & tracking attendance
│       │   │
│       │   ├── /admin               # Module 5 — Curriculum & Institutional Admin
│       │   │   ├── catalog.service.js       # Master course catalog management
│       │   │   └── department.service.js    # Departments, programs, faculty accounts
│       │   │
│       │   ├── /hostel              # Module 6 — Hostel & Welfare Services
│       │   │   ├── leave.service.js         # Leave application & approval workflows
│       │   │   ├── complaints.service.js    # Complaint filing & status tracking
│       │   │   └── hmc.service.js           # HMC members, assets, no-dues, transfers
│       │   │
│       │   ├── /communication       # Module 4 — Communication & Resource Hub
│       │   │   ├── messaging.service.js     # Announcements & academic messaging
│       │   │   └── feedback.service.js      # Course feedback windows & evaluation
│       │   │
│       │   └── /documents           # Module 7 — Analytics & Document Workflows
│       │       └── generator.service.js     # PDF transcripts, certificates & analytics
│       │
│       └── /utils
│           ├── hash.js              # Bcrypt password hashing helpers
│           ├── pdfMaker.js          # PDF generation utilities
│           ├── emailService.js      # Async email dispatch (reset links, notifications)
│           └── validators.js        # Server-side input & bulk CSV validation
│
├── /frontend                        # React PWA
│   ├── package.json
│   ├── Dockerfile
│   ├── tailwind.config.js           # CSS Flexbox/Grid utility configuration
│   ├── vite.config.js               # Build tool configuration
│   ├── /public                      # Static assets (manifest.json, logos, favicon)
│   └── /src
│       ├── main.jsx                 # React DOM entry point
│       ├── App.jsx                  # Root router component
│       │
│       ├── /assets                  # Images, global stylesheets
│       │
│       ├── /components
│       │   ├── /common              # Buttons, Inputs, Modals, Navbar, Sidebar
│       │   ├── /student             # Progress trackers, enrollment cards
│       │   ├── /faculty             # Grade tables, drag-and-drop upload zones
│       │   └── /admin               # Data tables, bulk import forms
│       │
│       ├── /context                 # Auth Context, Theme Context (global state)
│       │
│       ├── /hooks                   # Custom hooks: useAuth, useFetch, useRBAC
│       │
│       ├── /pages
│       │   ├── /auth                # Login, Password Reset
│       │   ├── /student             # Dashboard, Registration, Records, Requests
│       │   ├── /faculty             # Grading, Attendance, Assignments, Analytics
│       │   ├── /admin               # Curriculum, Users, Programs, Document Workflows
│       │   └── /hostel              # Leave, Complaints, Assets (student & HMC views)
│       │
│       ├── /services                # Axios API client functions (one per module)
│       │
│       └── /utils                   # Date formatters, local validation helpers
│
├── /database
│   ├── /schemas
│   │   ├── admin_schema.sql
│   │   ├── faculty_schema.sql
│   │   ├── student_schema.sql
│   │   └── hostel_schema.sql
│   └── /migrations                  # Versioned DB migration scripts
│
└── /docs                            # Reference documentation (not shipped to prod)
    ├── FPS_Summary.pdf
    ├── NFR.pdf
    ├── stakeholder_analysis.pdf
    └── user_personas.pdf
```

---

> **Total Services: 40** across 7 functional modules, serving 5 user roles: Student, Faculty, Admin, HMC Member, and Hostel Staff.
