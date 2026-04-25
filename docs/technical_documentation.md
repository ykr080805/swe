# Technical Documentation

This document outlines the technical architecture and codebase mapping of the IITG Affairs Portal. The portal is designed as a modular monolith, divided into 7 core modules.

## Module 1: Identity & Access Management

### 1. User Login
- **Description**: Handles user authentication, credential validation, and JWT generation.
- **Key Functions**: `login()` in `authController.js`
- **Models Used**: `User`
- **Relevant Code**: `POST /api/auth/login`, `Login.jsx`, `authService.js`

### 2. Password Management
- **Description**: Handles forgot password workflows, OTP token verification, and password updates.
- **Key Functions**: `forgotPassword()`, `resetPassword()`, `changePassword()` in `authController.js`
- **Models Used**: `User` (utilizes `resetToken`, `resetTokenExpiry` fields)
- **Relevant Code**: `POST /forgot-password`, `ChangePassword.jsx`, `ResetPassword.jsx`

### 3. Role-Based Access Control
- **Description**: Middleware to protect routes based on 4 defined roles (`student`, `faculty`, `admin`, `hmc_member`).
- **Key Functions**: `authenticate()`, `authorizeRoles()` in `auth.js` middleware
- **Models Used**: `User` (specifically the `role` enum)
- **Relevant Code**: `AuthContext.jsx`, `App.jsx` (ProtectedRoute wrapper)

### 4. User Profile Management
- **Description**: Manages user profiles, including retrieving user details and uploading avatars.
- **Key Functions**: `updateAvatar()`, `getMe()` in `authController.js` & `profileController.js`
- **Models Used**: `User`, `StudentProfile`
- **Relevant Code**: `PATCH /me/avatar`, `multerAvatarConfig.js`, `ProfileSettings.jsx`

### 5. Activity Logging
- **Description**: Append-only system for logging sensitive operations.
- **Key Functions**: `auditLogger()` middleware
- **Models Used**: `AuditLog`
- **Relevant Code**: Applied selectively on login, password changes, etc.

### 6. Session Security
- **Description**: JWT lifecycle management and active session termination.
- **Key Functions**: `logout()` in `authController.js`, `generateToken()`, `verifyToken()` in `jwt.js`
- **Models Used**: None directly for session (stateless JWT), uses `User` for payload.
- **Relevant Code**: `authService.js` (client-side token removal)

## Module 2: Student Academic Portal

### 7. Student Dashboard
- **Description**: Aggregates and displays upcoming assignments, enrollments, and status updates. Optimized to show "pending" assignments dynamically.
- **Key Functions**: Handled by `studentDashboardController.js`
- **Models Used**: `Enrollment`, `Assignment`
- **Relevant Code**: `GET /api/student/dashboard`, `StudentDashboard.jsx`

### 8. Course Registration
- **Description**: Handles student enrollment into course offerings with capacity validation.
- **Key Functions**: `enroll()`, `getMyEnrollments()` in `enrollmentController.js`
- **Models Used**: `Enrollment`, `CourseOffering`
- **Relevant Code**: `POST /api/enrollment`, `CourseRegistration.jsx`

### 9. Drop Courses
- **Description**: Allows students to drop courses before deadlines.
- **Key Functions**: `dropCourse()` in `enrollmentController.js`
- **Models Used**: `Enrollment`
- **Relevant Code**: `DELETE /api/enrollment/:id`

### 10. Academic Record Viewer
- **Description**: Fetches the student's grading history and computes SGPA/CGPA.
- **Key Functions**: Logic within `academicRecordController.js`
- **Models Used**: `Enrollment` (`grade`, `gradePoints` fields)
- **Relevant Code**: `AcademicHistory.jsx`

### 11. Student Attendance Tracking
- **Description**: Displays attendance percentage and session-wise attendance for a student.
- **Key Functions**: `getMyAttendance()` in `studentAssignmentController.js`
- **Models Used**: `AttendanceSession`
- **Relevant Code**: `StudentAttendance.jsx`

### 12. Assignment Upload (Student)
- **Description**: Allows students to securely submit assignment documents based on faculty guidelines.
- **Key Functions**: `getMyAssignments()`, `submitAssignment()`
- **Models Used**: `Assignment`, `Submission`
- **Relevant Code**: `multerSubmissionConfig.js`, `AssignmentUpload.jsx`

## Module 3: Course Operations & Assessment

### 17. Grade Submission
- **Description**: Faculty capability to submit final grades for enrolled students.
- **Key Functions**: `submitGrades()` in `facultyCourseController.js`
- **Models Used**: `Enrollment` (updates `grade`, `gradePoints`, `isLocked`)
- **Relevant Code**: `GradeSubmission.jsx`

### 18. Attendance Marking (Faculty)
- **Description**: Faculty portal to record daily attendance for courses.
- **Key Functions**: `markAttendance()`, `getAttendanceSessions()`
- **Models Used**: `AttendanceSession`
- **Relevant Code**: `POST/GET /api/faculty/courses/:id/attendance`, `AttendanceTracking.jsx`

### 19. Assignment Configuration (Faculty)
- **Description**: Faculty setup for assignments, deadlines, and file restrictions.
- **Key Functions**: `createAssignment()`, `updateAssignment()`, `deleteAssignment()`
- **Models Used**: `Assignment`
- **Relevant Code**: `AssignmentConfiguration.jsx`

### 20. Submission Review (Faculty)
- **Description**: Faculty interface to review student submissions and assign marks.
- **Key Functions**: `getSubmissions()`, `gradeSubmission()`
- **Models Used**: `Submission`
- **Relevant Code**: `SubmissionReview.jsx`

## Module 4: Communication & Resource Hub

### 13. General Announcement
- **Description**: System-wide or course-specific announcements broadcast.
- **Key Functions**: Standard CRUD in `announcementController.js`
- **Models Used**: `Announcement`

### 15 & 23. Resource Sharing
- **Description**: Upload and sharing of lecture notes, syllabus, and study materials.
- **Key Functions**: Upload handling in `resourceController.js`
- **Models Used**: `Resource`

### 16 & 32. Course Feedback Evaluation
- **Description**: Anonymous student feedback collection and faculty/admin evaluation.
- **Key Functions**: `getActiveWindow()`, `submitFeedback()`, `openWindow()`, `closeWindow()`, `getResults()`
- **Models Used**: `FeedbackWindow`, `FeedbackResponse`

### 22. Academic Messaging
- **Description**: Direct messaging between faculty and students within course scopes.
- **Key Functions**: Message handlers in `messageController.js`
- **Models Used**: `Message`

## Module 5: Curriculum & Institutional Administration

### 24. Enrollment Oversight (Admin)
- **Description**: Administrative oversight of all student course enrollments.
- **Key Functions**: Defined in `enrollmentAdminController.js`
- **Models Used**: `Enrollment`, `CourseOffering`

### 25. Student Database Management
- **Description**: Centralized student registry, including single creation and bulk CSV import. *Note: Bulk import was optimized to use memory buffer and map human-readable headers to DB ObjectIds seamlessly.*
- **Key Functions**: `getAllStudents()`, `addStudent()`, `bulkImportStudents()` in `studentAdminController.js`
- **Models Used**: `User`, `StudentProfile`, `Program`

### 26, 29, 30, 31. Administration Overviews
- **Description**: CRUD operations for Faculty, Programs, Courses, and Departments.
- **Key Functions**: Defined in respective admin controllers (`facultyAdminController`, `programController`, etc.)
- **Models Used**: `User`, `Program`, `Course`, `CourseOffering`, `Department`

## Module 6: Hostel & Welfare (HMC) Services

### 33 & 38. Leave Application & Approval
- **Description**: Students apply for hostel leaves; HMC members review and approve/reject.
- **Key Functions**: `applyLeave()`, `getMyLeaves()`, `approveLeave()`, `rejectLeave()`
- **Models Used**: `LeaveApplication`

### 34. No Dues Clearance
- **Description**: Automated clearance of departmental/hostel dues upon graduation.
- **Key Functions**: Logic in `noDuesController.js`
- **Models Used**: `NoDues`

### 36 & 37. Complaint Management
- **Description**: Students file hostel complaints; tracking of complaint status.
- **Key Functions**: `fileComplaint()`, `getComplaints()`, `updateComplaint()`
- **Models Used**: `Complaint`

### 35, 39, 40. Facility & HMC Administration
- **Description**: Hostel transfers, member assignment, and maintenance asset logging.
- **Models Used**: `HostelTransfer`, `HMCMember`, `Asset`

## Module 7: Documents & Analytics

### 14 & 27. Transcript Request & Generation
- **Description**: Students request transcripts; system generates dynamic PDFs using `PDFKit`.
- **Key Functions**: `generateTranscript()` in `documentsController.js`
- **Models Used**: `TranscriptRequest`, `Enrollment`, `StudentProfile`

### 21. Performance Analytics
- **Description**: Aggregates academic and system-wide data for admin visualization.
- **Key Functions**: Data aggregation in `analyticsController.js`
- **Models Used**: `Enrollment`, `AttendanceSession`

### 28. Certificate Approval Workflow
- **Description**: Approval chain for issuing official Bonafide certificates.
- **Models Used**: `CertificateRequest`
