/**
 * High-Fidelity In-Memory Fallback Database Engine
 * Used strictly for local developer preview when no local MySQL server is installed.
 * Seamlessly yields to Hostinger MySQL (mysql2) whenever a live database is configured.
 * Gen-Z University Accounts System
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { parseReportingExcel } = require('../../database/import_students');

class MockDatabase {
  constructor() {
    this.initialized = false;
    this.users = [];
    this.roles = [
      { id: 1, name: 'STUDENT', description: 'Enrolled college student' },
      { id: 2, name: 'ACCOUNTS_STAFF', description: 'Accounts operations staff' },
      { id: 3, name: 'ACCOUNTS_HEAD', description: 'Accounts executive' },
      { id: 4, name: 'ADMIN', description: 'System Administrator' },
      { id: 5, name: 'AUDITOR_READ_ONLY', description: 'Financial auditor' },
      { id: 6, name: 'HOD', description: 'Head of Department' },
      { id: 7, name: 'DIRECTOR', description: 'College Director' },
      { id: 8, name: 'EXAM_CELL', description: 'College Examination Section' }
    ];
    this.academicSessions = [
      { id: 1, name: '2026-27', is_current: 1 },
      { id: 2, name: '2025-26', is_current: 0 },
      { id: 3, name: '2024-25', is_current: 0 },
      { id: 4, name: '2023-24', is_current: 0 }
    ];
    this.courses = [
      { id: 1, code: 'B.TECH', name: 'Bachelor of Technology', duration_years: 4 },
      { id: 2, code: 'DIPLOMA', name: 'Diploma in Engineering', duration_years: 3 },
      { id: 3, code: 'MBA', name: 'Master of Business Administration', duration_years: 2 }
    ];
    this.branches = [
      { id: 1, course_id: 1, code: 'CSE', name: 'Computer Science & Engineering' },
      { id: 2, course_id: 1, code: 'CSE_DS', name: 'CSE (Data Science)' },
      { id: 3, course_id: 1, code: 'AGRI', name: 'Agricultural Engineering' },
      { id: 4, course_id: 1, code: 'EE', name: 'Electrical Engineering' },
      { id: 5, course_id: 1, code: 'MECH', name: 'Mechanical Engineering' },
      { id: 6, course_id: 1, code: 'AERO', name: 'Aeronautical Engineering' },
      { id: 7, course_id: 1, code: 'CIVIL', name: 'Civil Engineering' },
      { id: 8, course_id: 1, code: 'ECE', name: 'Electrical and Computer Engineering' },
      { id: 9, course_id: 1, code: 'FOOD', name: 'Food Engineering' },
      { id: 10, course_id: 1, code: 'MECHA', name: 'Mechanical Mechatronics Engineering' },
      { id: 11, course_id: 1, code: 'AME', name: 'Aircraft Maintenance Engineering' },
      { id: 12, course_id: 3, code: 'MBA_FIN', name: 'Finance (MBA)' },
      { id: 13, course_id: 3, code: 'MBA_MKT', name: 'Marketing (MBA)' },
      { id: 14, course_id: 3, code: 'MBA_HR', name: 'Human Resource (MBA)' },
      { id: 15, course_id: 3, code: 'MBA_AGRI', name: 'Agri-Business (MBA)' },
      { id: 16, course_id: 2, code: 'DIP_CIVIL', name: 'Civil Engineering (Diploma)' },
      { id: 17, course_id: 2, code: 'DIP_MECH', name: 'Mechanical Engineering (Diploma)' },
      { id: 18, course_id: 2, code: 'DIP_EE', name: 'Electrical Engineering (Diploma)' }
    ];
    this.semesters = [
      { id: 1, semester_number: 1, label: '1st Semester' },
      { id: 2, semester_number: 2, label: '2nd Semester' },
      { id: 3, semester_number: 3, label: '3rd Semester' },
      { id: 4, semester_number: 4, label: '4th Semester' },
      { id: 5, semester_number: 5, label: '5th Semester' },
      { id: 6, semester_number: 6, label: '6th Semester' },
      { id: 7, semester_number: 7, label: '7th Semester' },
      { id: 8, semester_number: 8, label: '8th Semester' }
    ];
    this.feeCategories = [
      { id: 1, name: 'Tuition Fee', code: 'TUI', is_refundable: 0 },
      { id: 2, name: 'Development Fee', code: 'DEV', is_refundable: 0 },
      { id: 3, name: 'Examination Fee', code: 'EXAM', is_refundable: 0 },
      { id: 4, name: 'Library Fee', code: 'LIB', is_refundable: 0 },
      { id: 5, name: 'Laboratory Fee', code: 'LAB', is_refundable: 0 },
      { id: 6, name: 'Hostel Fee', code: 'HOSTEL', is_refundable: 0 },
      { id: 7, name: 'Mess Fee', code: 'MESS', is_refundable: 0 },
      { id: 8, name: 'Transport Fee', code: 'TRANS', is_refundable: 0 },
      { id: 9, name: 'Registration Fee', code: 'REG', is_refundable: 0 },
      { id: 10, name: 'Caution Deposit', code: 'CAUTION', is_refundable: 1 },
      { id: 11, name: 'Fine / Late Fee', code: 'FINE', is_refundable: 0 },
      { id: 12, name: 'Other Charges', code: 'OTHER', is_refundable: 0 }
    ];
    this.feeStructures = [
      { id: 1, academic_session_id: 1, course_id: 1, branch_id: 1, semester_id: 1, title: 'B.Tech CSE - 1st Semester Fee Structure 2026-27', total_amount: 68500.00, is_active: 1 }
    ];
    this.feeStructureItems = [
      { id: 1, fee_structure_id: 1, fee_category_id: 1, amount: 45000.00, due_date: '2026-10-31', grace_period_days: 15 },
      { id: 2, fee_structure_id: 1, fee_category_id: 2, amount: 8000.00, due_date: '2026-10-31', grace_period_days: 15 },
      { id: 3, fee_structure_id: 1, fee_category_id: 3, amount: 2500.00, due_date: '2026-10-31', grace_period_days: 15 },
      { id: 4, fee_structure_id: 1, fee_category_id: 4, amount: 3000.00, due_date: '2026-10-31', grace_period_days: 15 },
      { id: 5, fee_structure_id: 1, fee_category_id: 5, amount: 5000.00, due_date: '2026-10-31', grace_period_days: 15 },
      { id: 6, fee_structure_id: 1, fee_category_id: 9, amount: 5000.00, due_date: '2026-10-31', grace_period_days: 15 }
    ];
    this.students = [];
    this.staff = [];
    this.invoices = [];
    this.invoiceItems = [];
    this.ledgers = [];
    this.payments = [];
    this.receipts = [];
    this.refunds = [];
    this.adjustments = [];
    this.fineRules = [
      { id: 1, fee_category_id: 1, grace_period_days: 15, fine_type: 'FIXED', fine_value: 500.00, max_fine_limit: 5000.00, is_active: 1 },
      { id: 2, fee_category_id: 6, grace_period_days: 10, fine_type: 'DAILY', fine_value: 50.00, max_fine_limit: 3000.00, is_active: 1 }
    ];
    this.reconciliations = [
      { id: 1, payment_id: 1, transaction_ref: 'COUNTER-RCP-001', gateway_amount: 20000.00, system_amount: 20000.00, difference: 0.00, gateway_status: 'SUCCESS', internal_status: 'SUCCESS', status: 'MATCHED', remarks: 'Auto-reconciled', reconciled_by: 2, reconciled_at: '2026-09-21 10:00:00', created_at: '2026-09-21 10:00:00' }
    ];
    this.notifications = [];
    this.auditLogs = [];
    this.registrationWindows = [
      { id: 1, academic_year: '2026-27', semester: 1, is_open: 1, status: 'OPEN', label: '1st Semester (Admission Auto-Enrolled)', auto_enrolled: 1 },
      { id: 2, academic_year: '2026-27', semester: 2, is_open: 1, status: 'OPEN', label: '2nd Semester (Active Regular Window)', auto_enrolled: 0 },
      { id: 3, academic_year: '2026-27', semester: 3, is_open: 0, status: 'LOCKED', label: '3rd Semester (Upcoming Cycle)', auto_enrolled: 0 },
      { id: 4, academic_year: '2026-27', semester: 4, is_open: 0, status: 'LOCKED', label: '4th Semester (Upcoming Cycle)', auto_enrolled: 0 },
      { id: 5, academic_year: '2026-27', semester: 5, is_open: 0, status: 'LOCKED', label: '5th Semester (Upcoming Cycle)', auto_enrolled: 0 },
      { id: 6, academic_year: '2026-27', semester: 6, is_open: 0, status: 'LOCKED', label: '6th Semester (Upcoming Cycle)', auto_enrolled: 0 },
      { id: 7, academic_year: '2026-27', semester: 7, is_open: 0, status: 'LOCKED', label: '7th Semester (Upcoming Cycle)', auto_enrolled: 0 },
      { id: 8, academic_year: '2026-27', semester: 8, is_open: 0, status: 'LOCKED', label: '8th Semester (Upcoming Cycle)', auto_enrolled: 0 }
    ];
    this.pickupPoints = [
      { id: 1, route_name: 'Route 1 - BBSR Central', location_name: 'Master Canteen', annual_fee: 18000.00, semester_fee: 9000.00 },
      { id: 2, route_name: 'Route 2 - NH16 South', location_name: 'Khandagiri Square', annual_fee: 16000.00, semester_fee: 8000.00 },
      { id: 3, route_name: 'Route 1 - BBSR Central', location_name: 'Rasulgarh Square', annual_fee: 18000.00, semester_fee: 9000.00 },
      { id: 4, route_name: 'Route 2 - NH16 South', location_name: 'Baramunda Bus Stand', annual_fee: 16000.00, semester_fee: 8000.00 },
      { id: 5, route_name: 'Route 3 - Janpath Express', location_name: 'Vani Vihar Square', annual_fee: 18000.00, semester_fee: 9000.00 },
      { id: 6, route_name: 'Route 4 - Cuttack Shuttle', location_name: 'Cuttack Badambadi', annual_fee: 24000.00, semester_fee: 12000.00 },
      { id: 7, route_name: 'Route 5 - Khordha Link', location_name: 'Khordha Bypass', annual_fee: 15000.00, semester_fee: 7500.00 },
      { id: 8, route_name: 'Route 2 - NH16 South', location_name: 'Fire Station Square', annual_fee: 16000.00, semester_fee: 8000.00 },
      { id: 9, route_name: 'Route 3 - Janpath Express', location_name: 'Nayapalli / CRP Square', annual_fee: 17000.00, semester_fee: 8500.00 },
      { id: 10, route_name: 'Route 6 - Infocity Link', location_name: 'Patia / KIIT Square', annual_fee: 20000.00, semester_fee: 10000.00 },
      { id: 11, route_name: 'Route 7 - Kalinga Nagar', location_name: 'Tamando Square', annual_fee: 12000.00, semester_fee: 6000.00 },
      { id: 12, route_name: 'Route 8 - Jatni Shuttle', location_name: 'Jatni Gate', annual_fee: 14000.00, semester_fee: 7000.00 }
    ];
    this.studentTransports = [];
    this.expenseCategories = [
      { id: 1, name: 'Electricity & Power Utilities', code: 'EXP-ELEC', type: 'EXPENSE', description: 'TPCODL monthly HT power supply and substation maintenance' },
      { id: 2, name: 'Bus Fuel & Fleet Maintenance', code: 'EXP-BUS', type: 'EXPENSE', description: 'Diesel, tyre replacement, RTO fitness & regular bus servicing' },
      { id: 3, name: 'Lab Consumables & Equipment', code: 'EXP-LAB', type: 'EXPENSE', description: 'Engineering laboratory chemicals, testing kits & machinery spares' },
      { id: 4, name: 'Campus Civil & Garden Maintenance', code: 'EXP-MAINT', type: 'EXPENSE', description: 'Civil repairs, painting, sanitation & landscaping upkeep' },
      { id: 5, name: 'Staff Salary & Guest Faculty Remuneration', code: 'EXP-SAL', type: 'EXPENSE', description: 'Monthly faculty compensation & technical staff honorarium' },
      { id: 6, name: 'Examination, Printing & Stationery', code: 'EXP-PRINT', type: 'EXPENSE', description: 'Answer scripts, college prospectus, receipts & office paper' },
      { id: 7, name: 'Internet Leased Line & Cloud ERP', code: 'EXP-IT', type: 'EXPENSE', description: 'Fiber-optic bandwidth, server hosting & institutional software' },
      { id: 8, name: 'Digital Library Books & Journals', code: 'EXP-LIB', type: 'EXPENSE', description: 'IEEE subscriptions, technical engineering volumes & e-resources' },
      { id: 9, name: 'Student Tech Fest & Sports Activities', code: 'EXP-EVENTS', type: 'EXPENSE', description: 'Annual cultural festival, athletic meets & technical conclaves' },
      { id: 10, name: 'Gen-Z Affiliation & Regulatory Fees', code: 'EXP-BPUT', type: 'EXPENSE', description: 'University affiliation dues, AICTE approvals & audit certifications' },
      { id: 11, name: 'Miscellaneous Administrative Contingency', code: 'EXP-MISC', type: 'EXPENSE', description: 'General administrative refreshments, courier & emergency office costs' },
      { id: 12, name: 'Student Academic Fee Collections', code: 'INC-FEES', type: 'INCOME', description: 'Tuition, development and lab fees collected from students' },
      { id: 13, name: 'Student Transport Fee Collections', code: 'INC-TRANS', type: 'INCOME', description: 'Bus pass and route charges collected from student commuters' },
      { id: 14, name: 'Hostel Accommodation & Mess Revenue', code: 'INC-HOSTEL', type: 'INCOME', description: 'Boarding charges and hostel maintenance fees' }
    ];
    this.parties = [
      { id: 1, party_name: 'Indian Oil Fleet Services (Patia)', party_type: 'VENDOR', contact_person: 'Subrat Patnaik', phone: '+91-9437100011', email: 'patia.fleet@iocl.in', gstin: '21AAACI1681G1Z5', address: 'Plot 12, Chandrasekharpur, Bhubaneswar' },
      { id: 2, party_name: 'TP Central Odisha Distribution Ltd (TPCODL)', party_type: 'UTILITY', contact_person: 'Executive Engineer - Jatni', phone: '+91-674-2971100', email: 'billing@tpcodl.com', gstin: '21AACCT4387E1ZQ', address: 'Jatni Electrical Division, Khordha' },
      { id: 3, party_name: 'Utkal Paper, Offset & Stationery Mart', party_type: 'SUPPLIER', contact_person: 'Dhiren Mohanty', phone: '+91-9861200022', email: 'utkal.printers@gmail.com', gstin: '21AABPU2345F1ZY', address: 'Station Square, Master Canteen, Bhubaneswar' },
      { id: 4, party_name: 'Jagannath Motor Works (Bus Fleet Garage)', party_type: 'CONTRACTOR', contact_person: 'Purna Chandra Rout', phone: '+91-9437300033', email: 'jagannath.motors@yahoo.co.in', gstin: '21AAMPJ8765D1Z2', address: 'NH16 Pitapally Toll Gate, Bhubaneswar' },
      { id: 5, party_name: 'Hi-Tech Scientific Instruments & Lab Supplies', party_type: 'SUPPLIER', contact_person: 'Sujata Mishra', phone: '+91-9777400044', email: 'sales@hitechscientific.co.in', gstin: '21AABCH9912K1ZW', address: 'Saheed Nagar Commercial Complex, Bhubaneswar' },
      { id: 6, party_name: 'Bharti Airtel Enterprise Business Solutions', party_type: 'SERVICE_PROVIDER', contact_person: 'A. K. Sengupta', phone: '+91-9861500055', email: 'odisha.enterprise@airtel.com', gstin: '21AAACB2894G1Z8', address: 'Fortune Towers, Maitree Vihar, Bhubaneswar' },
      { id: 7, party_name: 'S. Chand & Co. Book Publishers', party_type: 'SUPPLIER', contact_person: 'Rabi Narayan Dash', phone: '+91-9437600066', email: 'bbsr@schandpublishing.com', gstin: '21AAACS0012L1ZV', address: 'Bapuji Nagar, Janpath, Bhubaneswar' }
    ];
    this.expenses = [
      { id: 1, voucher_no: 'EXP-2026-0001', voucher_date: '2026-09-02', party_id: 1, category_id: 2, payment_mode: 'BANK_TRANSFER', party_reference: 'IOCL/SEP/0192', amount: 48500.00, narration: 'Diesel refill for GENZ College Buses (Fleet Route 1 to 5)', paid_by: 3, created_at: '2026-09-02 10:30:00' },
      { id: 2, voucher_no: 'EXP-2026-0002', voucher_date: '2026-09-05', party_id: 2, category_id: 1, payment_mode: 'BANK_TRANSFER', party_reference: 'TPCODL/AUG-BILL/772', amount: 92400.00, narration: 'High-Tension substation electricity bill for Main Campus & Labs', paid_by: 3, created_at: '2026-09-05 14:15:00' },
      { id: 3, voucher_no: 'EXP-2026-0003', voucher_date: '2026-09-08', party_id: 3, category_id: 6, payment_mode: 'CHEQUE', party_reference: 'UTK/2026/881', amount: 24600.00, narration: 'Printing of Mid-Term Semester Answer Booklets and Official Receipts', paid_by: 3, created_at: '2026-09-08 11:00:00' },
      { id: 4, voucher_no: 'EXP-2026-0004', voucher_date: '2026-09-12', party_id: 4, category_id: 2, payment_mode: 'BANK_TRANSFER', party_reference: 'JMW/REP/441', amount: 35000.00, narration: 'Annual RTO fitness inspection and brake overhaul for Bus OD-02-X-9901', paid_by: 3, created_at: '2026-09-12 16:45:00' },
      { id: 5, voucher_no: 'EXP-2026-0005', voucher_date: '2026-09-15', party_id: 5, category_id: 3, payment_mode: 'BANK_TRANSFER', party_reference: 'HTS/EQUIP/2026-19', amount: 56000.00, narration: 'Digital Multimeters, Breadboards and IC chips for ECE & Electrical Labs', paid_by: 3, created_at: '2026-09-15 15:20:00' },
      { id: 6, voucher_no: 'EXP-2026-0006', voucher_date: '2026-09-18', party_id: 6, category_id: 7, payment_mode: 'BANK_TRANSFER', party_reference: 'AIRTEL/LL/SEP26', amount: 28500.00, narration: '1 Gbps dedicated high-speed optical fiber internet lease line for campus', paid_by: 3, created_at: '2026-09-18 09:30:00' },
      { id: 7, voucher_no: 'EXP-2026-0007', voucher_date: '2026-09-21', party_id: 3, category_id: 11, payment_mode: 'CASH', party_reference: 'CASH-VOUCHER-012', amount: 4500.00, narration: 'Emergency courier charges and official department dispatch stamps', paid_by: 3, created_at: '2026-09-21 12:10:00' }
    ];
    this.systemSettings = {
      college_name: 'Gen-Z University',
      college_code: 'GENZ',
      college_address: 'Gen-Z Knowledge City Campus, Bhubaneswar, Odisha 752054',
      college_affiliation: 'Autonomous Private University & Approved by UGC / AICTE',
      college_email: 'accounts@genz.edu.in',
      college_phone: '+91-674-2970000',
      currency: 'INR',
      currency_symbol: '₹',
      payment_gateway_provider: 'MOCK',
      academic_session_active: '2026-27'
    };
    this.cashClosings = [
      { id: 1, closing_date: '2026-09-23', opening_cash: 25000.00, cash_collected: 45000.00, cash_paid: 4500.00, bank_deposited: 50000.00, expected_closing: 15500.00, actual_closing: 15500.00, difference: 0.00, explanation: 'Exact match verified with denominations', closed_by: 3, closed_by_name: 'Sujit Kumar Das', status: 'MATCHED', created_at: '2026-09-23 18:00:00' }
    ];
    this.bankAccounts = [
      { id: 1, account_name: 'State Bank of India (Main Fee Collection)', account_number: '31098456123', ifsc_code: 'SBIN0001023', branch: 'Paniora Campus Branch', balance: 4852000.00, account_type: 'CURRENT' },
      { id: 2, account_name: 'HDFC Bank (Operating & Expenses)', account_number: '50200034891102', ifsc_code: 'HDFC0000456', branch: 'Khandagiri Branch', balance: 1425600.00, account_type: 'CURRENT' },
      { id: 3, account_name: 'ICICI Bank (Salary & Escrow Reserve)', account_number: '018905008922', ifsc_code: 'ICIC0000189', branch: 'Master Canteen Square', balance: 2980000.00, account_type: 'ESCROW' }
    ];
    this.examRegistrations = [];

    // =========================================================================
    // DEPARTMENT-WISE ACADEMIC STRUCTURE (Gen-Z Real Standard)
    // =========================================================================
    this.programs = [
      { id: 1, name: 'B.Tech', code: 'BTECH', duration_years: 4, total_semesters: 8 },
      { id: 2, name: 'Diploma', code: 'DIP', duration_years: 3, total_semesters: 6 },
      { id: 3, name: 'MBA', code: 'MBA', duration_years: 2, total_semesters: 4 }
    ];

    this.departments = [
      // B.Tech
      { id: 1, program_id: 1, code: 'CSE', name: 'Computer Science & Engineering', short_name: 'CSE', is_active: 1 },
      { id: 2, program_id: 1, code: 'CSD', name: 'Computer Science & Data Science', short_name: 'CSD', is_active: 1 },
      { id: 3, program_id: 1, code: 'MECH', name: 'Mechanical Engineering', short_name: 'MECH', is_active: 1 },
      { id: 4, program_id: 1, code: 'AERO', name: 'Aeronautical Engineering', short_name: 'AERO', is_active: 1 },
      { id: 5, program_id: 1, code: 'CIVIL', name: 'Civil Engineering', short_name: 'CIVIL', is_active: 1 },
      { id: 6, program_id: 1, code: 'EEE', name: 'Electrical & Electronics Engineering', short_name: 'EEE', is_active: 1 },
      { id: 7, program_id: 1, code: 'AGRI', name: 'Agriculture Engineering', short_name: 'AGRI', is_active: 1 },
      // Diploma
      { id: 8, program_id: 2, code: 'DIP-MECH', name: 'Diploma Mechanical Engineering', short_name: 'DIP-MECH', is_active: 1 },
      { id: 9, program_id: 2, code: 'DIP-EEE', name: 'Diploma Electrical Engineering', short_name: 'DIP-EEE', is_active: 1 },
      { id: 10, program_id: 2, code: 'DIP-CIVIL', name: 'Diploma Civil Engineering', short_name: 'DIP-CIVIL', is_active: 1 },
      // MBA
      { id: 11, program_id: 3, code: 'MBA', name: 'Master of Business Administration', short_name: 'MBA', is_active: 1 }
    ];

    this.departmentHods = [
      { id: 1, department_id: 1, hod_user_id: 5, semester_range: '1-8' },
      { id: 2, department_id: 2, hod_user_id: 6, semester_range: '1-8' },
      { id: 3, department_id: 3, hod_user_id: 7, semester_range: '1-8' },
      { id: 4, department_id: 4, hod_user_id: 8, semester_range: '1-8' },
      { id: 5, department_id: 5, hod_user_id: 9, semester_range: '1-8' },
      { id: 6, department_id: 6, hod_user_id: 10, semester_range: '1-8' },
      { id: 7, department_id: 7, hod_user_id: 11, semester_range: '1-8' },
      { id: 8, department_id: 8, hod_user_id: 12, semester_range: '1-6' },
      { id: 9, department_id: 9, hod_user_id: 12, semester_range: '1-6' },
      { id: 10, department_id: 10, hod_user_id: 12, semester_range: '1-6' },
      { id: 11, department_id: 11, hod_user_id: 13, semester_range: '1-4' }
    ];

    // Subject Registration Module tables
    this.subjects = [
      // B.Tech CSE (Sem 1 & 5)
      { id: 1, code: 'BPUT-M101', name: 'Engineering Mathematics - I', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 2, code: 'BPUT-PH101', name: 'Engineering Physics', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 3, code: 'BPUT-CH101', name: 'Engineering Chemistry', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 4, code: 'BPUT-EG101', name: 'Engineering Graphics', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 5, code: 'BPUT-CS101', name: 'Fundamentals of Computing', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 6, code: 'BPUT-EE101', name: 'Basic Electrical Engineering', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6, is_active: 1 },
      { id: 7, code: 'BPUT-PH191', name: 'Engineering Physics Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      { id: 8, code: 'BPUT-CH191', name: 'Engineering Chemistry Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 8, is_active: 1 },
      { id: 9, code: 'BPUT-CS191', name: 'Computing Fundamentals Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 9, is_active: 1 },
      { id: 10, code: 'BPUT-EG191', name: 'Engineering Graphics Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 10, is_active: 1 },
      { id: 11, code: 'BPUT-CS501E1', name: 'Machine Learning', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 3, type: 'ELECTIVE', sequence: 11, is_active: 1 },
      { id: 12, code: 'BPUT-CS501E2', name: 'Cloud Computing', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 3, type: 'ELECTIVE', sequence: 12, is_active: 1 },
      { id: 13, code: 'BPUT-CS501', name: 'Database Management Systems', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 14, code: 'BPUT-CS502', name: 'Operating Systems Architecture', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 15, code: 'BPUT-CS503', name: 'Computer Networks & Protocols', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 16, code: 'BPUT-CS591', name: 'DBMS Practice Laboratory', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 2, type: 'LAB', sequence: 4, is_active: 1 },
      { id: 17, code: 'BPUT-CS592', name: 'OS & Linux Kernel Lab', program_id: 1, department_id: 1, semester: 5, year: 3, credits: 2, type: 'LAB', sequence: 5, is_active: 1 },
      // B.Tech CSE (Sem 2)
      { id: 101, code: 'BPUT-M201', name: 'Engineering Mathematics - II', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 102, code: 'BPUT-DS201', name: 'Data Structures & Algorithms', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 103, code: 'BPUT-BE201', name: 'Basic Electronics Engineering', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 104, code: 'BPUT-ENG201', name: 'Communicative English', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 105, code: 'BPUT-EVS201', name: 'Environmental Studies & Green Tech', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 106, code: 'BPUT-DS291', name: 'Data Structures Practice Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 6, is_active: 1 },
      { id: 107, code: 'BPUT-BE291', name: 'Basic Electronics Laboratory', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      { id: 108, code: 'BPUT-ENG291', name: 'English Communication Skills Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 8, is_active: 1 },
      { id: 109, code: 'BPUT-WS291', name: 'Manufacturing & Workshop Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 9, is_active: 1 },
      // B.Tech MECH (Sem 1)
      { id: 21, code: 'BPUT-ME101', name: 'Thermodynamics & Heat Engines', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 22, code: 'BPUT-ME102', name: 'Engineering Mechanics (Statics & Dynamics)', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 23, code: 'BPUT-ME191', name: 'Central Workshop Practice Lab', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3, is_active: 1 },
      { id: 24, code: 'BPUT-M101M', name: 'Engineering Mathematics - I', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 25, code: 'BPUT-PH101M', name: 'Engineering Physics', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 26, code: 'BPUT-EG101M', name: 'Engineering Graphics & CAD', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6, is_active: 1 },
      { id: 27, code: 'BPUT-PH191M', name: 'Physics Laboratory', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      // B.Tech MECH (Sem 2 - Tushar Mhato)
      { id: 201, code: 'BPUT-ME201', name: 'Material Science & Metallurgy', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 202, code: 'BPUT-ME202', name: 'Fluid Mechanics & Hydraulic Machines', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 203, code: 'BPUT-ME203', name: 'Basic Electronics & Sensors', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 204, code: 'BPUT-M201M', name: 'Engineering Mathematics - II', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 205, code: 'BPUT-ENG201M', name: 'Communicative English', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 206, code: 'BPUT-ME291', name: 'Material Testing & Metallurgy Lab', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 6, is_active: 1 },
      { id: 207, code: 'BPUT-ME292', name: 'Fluid Mechanics Laboratory', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      { id: 208, code: 'BPUT-ENG291M', name: 'English Communication Skills Lab', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 8, is_active: 1 },
      // B.Tech CIVIL (Sem 1)
      { id: 31, code: 'BPUT-CE101', name: 'Surveying & Geomatics', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 32, code: 'BPUT-CE102', name: 'Building Materials & Construction', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 33, code: 'BPUT-CE191', name: 'Surveying Field Practice Lab', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3, is_active: 1 },
      // Diploma (Sem 1)
      { id: 41, code: 'DIP-M101', name: 'Applied Mathematics - I', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 42, code: 'DIP-SC101', name: 'Applied Science (Physics & Chemistry)', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 43, code: 'DIP-ME191', name: 'Workshop Technology Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3, is_active: 1 },
      { id: 441, code: 'DIP-ENG101', name: 'Communication English & Grammar', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 442, code: 'DIP-EG101', name: 'Engineering Drawing & Drafting', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 443, code: 'DIP-CS101', name: 'Computer Application Fundamentals', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6, is_active: 1 },
      { id: 444, code: 'DIP-SC191', name: 'Applied Science Practical Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      { id: 445, code: 'DIP-CS191', name: 'Computer Application Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 8, is_active: 1 },
      // Diploma MECH (Sem 5 - Tushar Mhato)
      { id: 44, code: 'DIP-ME501', name: 'Advanced Manufacturing Technology', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 45, code: 'DIP-ME502', name: 'Power Plant Engineering', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 46, code: 'DIP-ME503', name: 'Design of Machine Elements', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 47, code: 'DIP-ME504', name: 'Automobile Engineering', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 4, type: 'CORE', sequence: 4, is_active: 1 },
      { id: 48, code: 'DIP-ME505', name: 'Industrial Engineering & Operations', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 3, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 49, code: 'DIP-ME591', name: 'Manufacturing Technology Lab', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 2, type: 'LAB', sequence: 6, is_active: 1 },
      { id: 50, code: 'DIP-ME592', name: 'Machine Design CAD Practice Lab', program_id: 2, department_id: 8, semester: 5, year: 3, credits: 2, type: 'LAB', sequence: 7, is_active: 1 },
      // MBA (Sem 1)
      { id: 51, code: 'MBA-101', name: 'Organizational Behavior & Principles', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1, is_active: 1 },
      { id: 52, code: 'MBA-102', name: 'Managerial Economics', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2, is_active: 1 },
      { id: 53, code: 'MBA-103', name: 'Accounting for Financial Decision Making', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 3, is_active: 1 },
      { id: 54, code: 'MBA-104', name: 'Business Communication Lab', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 4, is_active: 1 },
      { id: 55, code: 'MBA-105', name: 'Marketing Management Essentials', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 5, is_active: 1 },
      { id: 56, code: 'MBA-106', name: 'Quantitative Techniques for Managers', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 6, is_active: 1 }
    ];
    this.studentFees = [];
    this.subjectRegistrations = [];
    this.registrationSubjects = [];
  }

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // Clear dynamically loaded arrays to guarantee exact 355 counts
      this.users = [];
      this.staff = [];
      this.students = [];
      this.invoices = [];
      this.invoiceItems = [];
      this.ledgers = [];
      this.receipts = [];
      this.payments = [];
      this.studentTransports = [];
      this.notifications = [];
      this.examRegistrations = [];
      this.subjectRegistrations = [];
      this.registrationSubjects = [];
      this.studentFees = [];
    const commonHash = await bcrypt.hash('Ayush#@26', 10);

    this.users.push(
      { id: 1, email: 'admin@genz', password_hash: commonHash, role_id: 4, is_active: 1, must_change_password: 0 },
      { id: 2, email: 'account@genz', password_hash: commonHash, role_id: 3, is_active: 1, must_change_password: 0 },
      { id: 3, email: 'staff@genz', password_hash: commonHash, role_id: 2, is_active: 1, must_change_password: 0 },
      { id: 4, email: 'auditor@genz', password_hash: commonHash, role_id: 5, is_active: 1, must_change_password: 0 },
      { id: 5, email: 'student@genz', password_hash: commonHash, role_id: 1, is_active: 1, must_change_password: 0 },
      // Department HODs
      { id: 10, email: 'hod.cse@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 11, email: 'hod.csd@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 12, email: 'hod.mech@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 13, email: 'hod.aero@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 14, email: 'hod.civil@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 15, email: 'hod.eee@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 16, email: 'hod.agri@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 17, email: 'hod.diploma@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      { id: 18, email: 'hod.mba@genz', password_hash: commonHash, role_id: 6, is_active: 1, must_change_password: 0 },
      // Director
      { id: 19, email: 'director@genz', password_hash: commonHash, role_id: 7, is_active: 1, must_change_password: 0 },
      // Exam Section Officer
      { id: 20, email: 'exam@genz', password_hash: commonHash, role_id: 8, is_active: 1, must_change_password: 0 }
    );

    this.staff.push(
      { id: 1, user_id: 1, staff_code: 'GENZ-ADM-001', full_name: 'System Administrator', designation: 'Senior IT Administrator', department: 'IT' },
      { id: 2, user_id: 2, staff_code: 'GENZ-ACC-001', full_name: 'Prof. B. K. Mohapatra', designation: 'Accounts Head & CFO', department: 'Accounts' },
      { id: 3, user_id: 3, staff_code: 'GENZ-ACC-002', full_name: 'Sujit Kumar Das', designation: 'Senior Accounts Officer', department: 'Accounts' },
      { id: 4, user_id: 4, staff_code: 'GENZ-AUD-001', full_name: 'K. R. Panda & Associates', designation: 'Statutory Auditor', department: 'Audit' },
      { id: 5, user_id: 5, staff_code: 'GENZ-HOD-CSE-001', full_name: 'Dr. Rajesh Kumar Mohanty', designation: 'Head of Department', department: 'Computer Science & Engineering' },
      { id: 6, user_id: 6, staff_code: 'GENZ-HOD-CSD-001', full_name: 'Dr. Priyadarshi Biswal', designation: 'Head of Department', department: 'Computer Science & Data Science' },
      { id: 7, user_id: 7, staff_code: 'GENZ-HOD-MEC-001', full_name: 'Prof. Manoranjan Pradhan', designation: 'Head of Department', department: 'Mechanical Engineering' },
      { id: 8, user_id: 8, staff_code: 'GENZ-HOD-AER-001', full_name: 'Wing Cdr. (Retd) K. N. Das', designation: 'Head of Department', department: 'Aeronautical Engineering' },
      { id: 9, user_id: 9, staff_code: 'GENZ-HOD-CIV-001', full_name: 'Dr. Subhashree Senapati', designation: 'Head of Department', department: 'Civil Engineering' },
      { id: 10, user_id: 10, staff_code: 'GENZ-HOD-EEE-001', full_name: 'Prof. Ashis Kumar Panda', designation: 'Head of Department', department: 'Electrical & Electronics Engineering' },
      { id: 11, user_id: 11, staff_code: 'GENZ-HOD-AGR-001', full_name: 'Dr. Bijay Ketan Nayak', designation: 'Head of Department', department: 'Agriculture Engineering' },
      { id: 12, user_id: 12, staff_code: 'GENZ-HOD-DIP-001', full_name: 'Er. Chandan Kumar Rout', designation: 'Head of Department', department: 'Diploma Engineering Wing' },
      { id: 13, user_id: 13, staff_code: 'GENZ-HOD-MBA-001', full_name: 'Dr. Smruti Rekha Jena', designation: 'Head of Department', department: 'Master of Business Administration' },
      { id: 14, user_id: 14, staff_code: 'GENZ-DIR-001', full_name: 'Prof. S. K. Rath', designation: 'Director', department: 'Administration' },
      { id: 15, user_id: 20, staff_code: 'GENZ-EXM-001', full_name: 'Dr. Ramesh Chandra Sahoo', designation: 'Controller of Examinations', department: 'Examination Section' }
    );

    // 2. Import REAL Cohort from Excel Spreadsheet (Prioritize BEC_Complete_Student_Report_2026-09-24.xlsx)
    let excelPath = path.join(__dirname, '..', '..', 'BEC_Complete_Student_Report_2026-09-24.xlsx');
    if (!fs.existsSync(excelPath)) {
      excelPath = path.join(__dirname, '..', '..', 'final 1st Year database from reporting.xlsx');
    }

    if (fs.existsSync(excelPath)) {
      try {
        const students = await parseReportingExcel(excelPath);
        let userCounter = 20;
        let studentCounter = 1;

        for (const st of students) {
          const isBarsha = st.fullName.toLowerCase().includes('barsha priyadarshini');
          this.users.push({
            id: userCounter,
            email: st.email, // fullname@genz.edu.in
            dotted_email: st.dottedEmail, // fullname.dots@genz.edu.in
            alt_email: isBarsha ? 'barsha.priyadarshini@genz.edu.in' : null,
            dob_password: st.dobPassword, // DDMMYYYY digits e.g. "12052005"
            password_hash: st.passwordHash,
            role_id: 1,
            is_active: 1,
            must_change_password: 0
          });

          this.students.push({
            id: studentCounter,
            user_id: userCounter,
            student_uid: st.studentUid,
            reg_no: st.regNo,
            roll_no: st.rollNo,
            serial_no: st.serialNo,
            full_name: st.fullName,
            first_name: st.firstName,
            middle_name: st.middleName,
            last_name: st.lastName,
            title: st.title,
            gender: st.gender,
            dob: st.dob,
            dob_password: st.dobPassword,
            category: st.category,
            bloodgroup: st.bloodgroup,
            course_id: st.courseId,
            course_name: st.courseName,
            branch_id: st.branchId,
            branch_code: st.branchCode,
            branch_name: st.branchName,
            current_semester_id: 1,
            semester_label: '1st Semester',
            academic_year: '1st Year',
            academic_session_id: 1,
            session_name: '2026-27',
            admission_year: 2026,
            section: st.section,
            mentor: st.mentor,
            batch: st.batch,
            domain_email: st.email,
            personal_email: st.personalEmail,
            email: st.email,
            phone: st.phone,
            whatsapp: st.whatsapp,
            aadhaar_no: st.aadhaarNo,
            pan_no: st.panNo,
            abc_id: st.abcId,
            ration_card_no: st.rationCardNo,
            cm_kisan: st.cmKisan,
            father_name: st.fatherName,
            mother_name: st.motherName,
            father_mobile: st.fatherMobile,
            mother_mobile: st.motherMobile,
            guardian_phone: st.guardianPhone,
            permanent_address: st.permanentAddress,
            district: st.district,
            state: st.state,
            pin_code: st.pinCode,
            address: st.address,
            admission_type: st.admissionType,
            admission_reference: st.admissionReference,
            referrer_name: st.referrerName,
            reporting_date: st.reportingDate,
            hostel: st.hostel,
            hostel_required: st.hostelRequired,
            hostel_no: st.hostelNo,
            room_no: st.roomNo,
            transport: st.transport,
            transport_required: st.transportRequired,
            rider_pass_no: st.riderPassNo,
            pickup_stoppage: st.pickupStoppage,
            tuition_fee_paid: (st.regNo === '2026GENZ03001' || studentCounter === 1) ? 81500 : st.tuitionFeePaid,
            hostel_fee_paid: st.hostelFeePaid,
            transport_fee_paid: st.transportFeePaid,
            lunch: st.lunch,
            nss: st.nss,
            languages_known: st.languagesKnown,
            photo_url: st.photoUrl,
            signature_url: st.signatureUrl,
            marksheet_10th_url: st.marksheet10thUrl,
            certificate_12th_url: st.certificate12thUrl,
            tc_clc_url: st.tcClcUrl,
            conduct_url: st.conductUrl,
            migration_url: st.migrationUrl,
            rank_card_url: st.rankCardUrl,
            allotment_letter_url: st.allotmentLetterUrl,
            aadhaar_doc_url: st.aadhaarDocUrl,
            caste_cert_url: st.casteCertUrl,
            residence_cert_url: st.residenceCertUrl,
            fee_receipt_url: st.feeReceiptUrl,
            parent_signature_url: st.parentSignatureUrl,
            total_billed: st.totalBilled,
            total_paid: (st.regNo === '2026GENZ03001' || studentCounter === 1) ? 81500 : st.totalPaid,
            total_outstanding: (st.regNo === '2026GENZ03001' || studentCounter === 1) ? Math.max(0, st.totalBilled - 81500) : st.totalOutstanding,
            exam_fee_paid: st.tuitionFeePaid > 50000 ? 5000.00 : 0.00,
            exam_status: st.tuitionFeePaid > 50000 ? 'PAID' : 'UNPAID'
          });

          // Seed Student Transport Record if opted
          if (st.transportRequired === 'Yes' || (st.transport && st.transport.includes('Yes'))) {
            const pp = this.pickupPoints[studentCounter % this.pickupPoints.length];
            this.studentTransports.push({
              id: this.studentTransports.length + 1,
              student_id: studentCounter,
              student_name: st.fullName,
              pickup_point_id: pp.id,
              pickup_point: st.pickupStoppage && st.pickupStoppage !== 'N/A' ? st.pickupStoppage : pp.location_name,
              route_name: pp.route_name,
              session: '2026-27',
              course: st.courseName,
              department_id: st.branchId,
              academic_year: '1st Year',
              semester: '1st Semester',
              section: st.section,
              father_name: st.fatherName,
              fee_period: 'Annual',
              total_transport_fees: pp.annual_fee,
              fees_paid: st.transportFeePaid,
              balance: Math.max(0, pp.annual_fee - st.transportFeePaid),
              status: st.transportFeePaid >= pp.annual_fee ? 'PAID' : (st.transportFeePaid > 0 ? 'PARTIAL' : 'UNPAID'),
              created_at: new Date().toISOString()
            });
          }

          // Generate Fee Invoice matching Excel Billed / Paid / Outstanding
          const invId = this.invoices.length + 1;
          const invNo = `INV-2026-${String(studentCounter).padStart(4, '0')}`;
          const totalAmt = st.totalBilled;
          const paidAmt = st.totalPaid;
          const outAmt = st.totalOutstanding;

          this.invoices.push({
            id: invId,
            invoice_no: invNo,
            student_id: studentCounter,
            academic_session_id: 1,
            semester_id: 1,
            subtotal: totalAmt,
            discount_amount: 0.00,
            fine_amount: 0.00,
            total_payable: totalAmt,
            paid_amount: paidAmt,
            outstanding_amount: outAmt,
            due_date: '2026-10-31',
            status: outAmt === 0 ? 'PAID' : (paidAmt > 0 ? 'PARTIALLY_PAID' : 'ISSUED'),
            notes: `${st.courseName} - ${st.branchName} 1st Year Annual Tuition & Institutional Fee Structure`,
            created_by: 2,
            created_at: new Date().toISOString()
          });

          // Seed Historical Payments & Receipts from Spreadsheet
          if (st.tuitionFeePaid > 0) {
            const payId = this.payments.length + 1;
            const recNo = st.tuitionReceiptNo || `GENZ-REC-2026-${String(50000 + studentCounter)}`;
            const payDate = st.tuitionReceiptDate || '2026-09-18';
            this.payments.push({
              id: payId,
              payment_no: `PAY-2026-${String(studentCounter).padStart(5, '0')}`,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.tuitionFeePaid,
              payment_method: 'CASH / COUNTER DESK',
              transaction_id: `REPORTING-REC-${recNo}`,
              status: 'SUCCESS',
              idempotency_key: `init_tui_${studentCounter}`,
              created_at: payDate
            });

            this.receipts.push({
              id: this.receipts.length + 1,
              receipt_no: recNo,
              payment_id: payId,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.tuitionFeePaid,
              discount: 0.00,
              payment_mode: 'CASH',
              payment_method: 'Counter Cashier',
              semester: '1st Semester',
              receipt_date: payDate,
              created_at: payDate,
              remarks: 'Tuition Fee paid during admission reporting',
              created_by: 2
            });
          }

          if (st.hostelFeePaid > 0) {
            const payId = this.payments.length + 1;
            const recNo = st.hostelReceiptNo || `HST-REC-${studentCounter}`;
            this.payments.push({
              id: payId,
              payment_no: `PAY-HST-${String(studentCounter).padStart(5, '0')}`,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.hostelFeePaid,
              payment_method: 'CASH / COUNTER DESK',
              transaction_id: `REPORTING-HST-${recNo}`,
              status: 'SUCCESS',
              idempotency_key: `init_hst_${studentCounter}`,
              created_at: '2026-09-18'
            });

            this.receipts.push({
              id: this.receipts.length + 1,
              receipt_no: recNo,
              payment_id: payId,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.hostelFeePaid,
              discount: 0.00,
              payment_mode: 'CASH',
              payment_method: 'Counter Cashier',
              semester: '1st Semester',
              receipt_date: '2026-09-18',
              created_at: '2026-09-18',
              remarks: 'Hostel accommodation fee paid during admission',
              created_by: 2
            });
          }

          if (st.transportFeePaid > 0) {
            const payId = this.payments.length + 1;
            const recNo = st.transportReceiptNo || `TRN-REC-${studentCounter}`;
            this.payments.push({
              id: payId,
              payment_no: `PAY-TRN-${String(studentCounter).padStart(5, '0')}`,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.transportFeePaid,
              payment_method: 'CASH / COUNTER DESK',
              transaction_id: `REPORTING-TRN-${recNo}`,
              status: 'SUCCESS',
              idempotency_key: `init_trn_${studentCounter}`,
              created_at: '2026-09-18'
            });

            this.receipts.push({
              id: this.receipts.length + 1,
              receipt_no: recNo,
              payment_id: payId,
              invoice_id: invId,
              student_id: studentCounter,
              amount: st.transportFeePaid,
              discount: 0.00,
              payment_mode: 'CASH',
              payment_method: 'Counter Cashier',
              semester: '1st Semester',
              receipt_date: '2026-09-18',
              created_at: '2026-09-18',
              remarks: 'Transport bus fee paid during admission',
              created_by: 2
            });
          }

          // Itemized Fee Components for Ledger
          const tuiShare = Math.round(totalAmt * 0.70);
          const devShare = Math.round(totalAmt * 0.15);
          const examShare = 5000;
          const labShare = Math.max(0, totalAmt - tuiShare - devShare - examShare);

          const feeBreakdown = [
            { catId: 1, name: 'Tuition Fee (Annual Academic Instruction)', amount: tuiShare },
            { catId: 2, name: 'Institutional Development & Infrastructure Fee', amount: devShare },
            { catId: 3, name: 'Gen-Z University Examination & Board Fee', amount: examShare },
            { catId: 5, name: 'Technical Laboratory, Workshop & Computing Fee', amount: labShare }
          ];

          for (const item of feeBreakdown) {
            const itemPaid = paidAmt >= totalAmt ? item.amount : Math.min(item.amount, Math.max(0, Math.round(paidAmt * (item.amount / totalAmt))));
            const itemOut = Math.max(0, item.amount - itemPaid);

            this.invoiceItems.push({
              id: this.invoiceItems.length + 1,
              invoice_id: invId,
              fee_category_id: item.catId,
              description: item.name,
              amount: item.amount,
              paid_amount: itemPaid
            });

            this.ledgers.push({
              id: this.ledgers.length + 1,
              student_id: studentCounter,
              academic_session_id: 1,
              semester_id: 1,
              fee_category_id: item.catId,
              invoice_id: invId,
              description: item.name,
              amount_charged: item.amount,
              scholarship_amount: 0.00,
              discount_amount: 0.00,
              fine_amount: 0.00,
              adjustment_amount: 0.00,
              amount_paid: itemPaid,
              outstanding_amount: itemOut,
              due_date: '2026-10-31',
              status: itemOut === 0 ? 'PAID' : (itemPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID')
            });
          }

          // Initial Welcome Notification
          this.notifications.push({
            id: this.notifications.length + 1,
            user_id: userCounter,
            title: 'Welcome to Gen-Z University',
            message: `Enrollment confirmed for ${st.fullName}. Annual Fee Invoice ${invNo} for ₹${totalAmt.toLocaleString('en-IN')} is generated with due date 31-Oct-2026.`,
            category: 'INVOICE',
            is_read: 0,
            created_at: new Date().toISOString()
          });

          // Seed Exam Registration Record
          this.examRegistrations.push({
            id: studentCounter,
            student_id: studentCounter,
            student_name: st.fullName,
            reg_no: st.regNo,
            roll_no: st.rollNo,
            phone: st.phone,
            course_name: st.courseName,
            branch_name: st.branchName,
            branch_code: st.branchCode,
            exam_name: 'Gen-Z 1st Semester Regular Examination 2026',
            semester_id: 1,
            semester_label: '1st Semester',
            academic_year: '1st Year',
            session: '2026-27',
            session_name: '2026-27',
            fee_amount: 5000.00,
            fee_paid: paidAmt > 50000 ? 5000.00 : 0.00,
            payment_status: paidAmt > 50000 ? 'PAID' : 'UNPAID',
            registration_status: paidAmt > 50000 ? 'APPROVED' : 'PAYMENT_PENDING',
            receipt_no: paidAmt > 50000 ? (st.tuitionReceiptNo || `EXAM-REC-${studentCounter}`) : null,
            admit_card_eligible: paidAmt > 50000 ? 1 : 0,
            created_at: new Date().toISOString()
          });

          userCounter++;
          studentCounter++;
        }

        // Seed Tushar Mhato (user ID 1644, student ID 1644, admission 2644)
        const tusharHash = await bcrypt.hash('Tushar', 10);
        this.users.push({
          id: 1644,
          email: 'tushar.mhato@genz.edu.in',
          username: 'tushar2644',
          password_hash: tusharHash,
          role_id: 1,
          is_active: 1,
          must_change_password: 0
        });

        this.students.push({
          id: 1644,
          user_id: 1644,
          reg_no: '2644',
          roll_no: 'F24094004061',
          serial_no: '2644',
          full_name: 'Tushar Mhato',
          first_name: 'Tushar',
          middle_name: '',
          last_name: 'Mhato',
          title: 'Mr.',
          gender: 'MALE',
          dob: '2004-02-27',
          category: 'GENERAL',
          course_id: 1,
          course_name: 'Diploma',
          branch_id: 5,
          branch_name: 'Mechanical Engineering',
          current_semester_id: 2,
          semester_label: '2nd Semester',
          academic_year: '2nd Year',
          academic_session_id: 1,
          session_name: '2024-2027',
          admission_year: 2024,
          section: 'Section A',
          mentor: 'Prof. S. R. Jena',
          batch: '2024-2027',
          email: 'tushar.mhato@genz.edu.in',
          personal_email: 'tushar2644@gmail.com',
          phone: '5555555555',
          whatsapp: '5555555555',
          father_name: 'Sanjeev Kumar Mahato',
          mother_name: 'Mrs. Mahato',
          address: 'Bhubaneswar, Odisha',
          permanent_address: 'Bhubaneswar, Odisha',
          total_billed: 200000.00,
          total_paid: 14000.00,
          total_outstanding: 186000.00,
          exam_fee_paid: 5000.00,
          exam_status: 'PAID'
        });

        // Seed Invoices for Tushar Mhato (5th & 6th Semesters)
        const tusharInv1 = this.invoices.length + 1;
        this.invoices.push({
          id: tusharInv1,
          invoice_no: 'INV-2026-DIP-5001',
          student_id: 1644,
          academic_session_id: 1,
          semester_id: 5,
          subtotal: 100000.00,
          discount_amount: 2000.00,
          fine_amount: 0.00,
          total_payable: 98000.00,
          paid_amount: 12000.00,
          outstanding_amount: 86000.00,
          due_date: '2026-10-31',
          status: 'PARTIALLY_PAID',
          notes: '5th Semester Diploma (Mechanical Engineering) - Outstanding Balance',
          created_by: 2,
          created_at: new Date().toISOString()
        });

        const tusharInv2 = this.invoices.length + 1;
        this.invoices.push({
          id: tusharInv2,
          invoice_no: 'INV-2026-DIP-5002',
          student_id: 1644,
          academic_session_id: 1,
          semester_id: 6,
          subtotal: 100000.00,
          discount_amount: 0.00,
          fine_amount: 0.00,
          total_payable: 100000.00,
          paid_amount: 0.00,
          outstanding_amount: 100000.00,
          due_date: '2026-11-30',
          status: 'ISSUED',
          notes: '6th Semester Diploma (Mechanical Engineering) - Pending Dues',
          created_by: 2,
          created_at: new Date().toISOString()
        });

        // Seed Receipts & corresponding Payments for Tushar Mhato (Exact Receipts #1, #2, #3, #4, #6 from live portal)
        const tusharReceipts = [
          { id: 1, receipt_no: '1', invoice_id: tusharInv1, student_id: 1644, amount: 100000.00, discount: 0.00, payment_mode: 'CASH', payment_method: 'Cash', semester: '1st Semester', receipt_date: '2026-04-06 10:00:00', created_at: '2026-04-06 10:00:00', remarks: 'Amount', created_by: 2 },
          { id: 9, receipt_no: '2', invoice_id: tusharInv1, student_id: 1644, amount: 99000.00, discount: -1000.00, payment_mode: 'CASH', payment_method: 'Cash', semester: '2nd Semester', receipt_date: '2026-04-07 11:30:00', created_at: '2026-04-07 11:30:00', remarks: 'Fee Payment', created_by: 2 },
          { id: 15, receipt_no: '3', invoice_id: tusharInv1, student_id: 1644, amount: 100000.00, discount: 0.00, payment_mode: 'CASH', payment_method: 'Cash', semester: '3rd Semester', receipt_date: '2026-04-28 14:00:00', created_at: '2026-04-28 14:00:00', remarks: 'Abc', created_by: 2 },
          { id: 16, receipt_no: '4', invoice_id: tusharInv1, student_id: 1644, amount: 99000.00, discount: -1000.00, payment_mode: 'CASH', payment_method: 'Cash', semester: '4th Semester', receipt_date: '2026-04-28 15:30:00', created_at: '2026-04-28 15:30:00', remarks: 'Amount', created_by: 2 },
          { id: 18, receipt_no: '6', invoice_id: tusharInv1, student_id: 1644, amount: 90000.00, discount: -10000.00, payment_mode: 'CASH', payment_method: 'Cash', semester: '3rd Semester', receipt_date: '2026-04-29 12:00:00', created_at: '2026-04-29 12:00:00', remarks: 'Receipt', created_by: 2 }
        ];

        tusharReceipts.forEach(r => {
          r.payment_id = r.id;
          this.receipts.push(r);
          this.payments.push({
            id: r.id,
            payment_no: `PAY-REC-${r.receipt_no}`,
            invoice_id: r.invoice_id,
            student_id: r.student_id,
            amount: r.amount,
            payment_method: r.payment_mode || 'CASH',
            transaction_id: `CTR-RCP-${r.receipt_no}`,
            status: 'SUCCESS',
            idempotency_key: `rcp_init_${r.id}`,
            created_at: r.created_at || '2026-04-06 10:00:00'
          });
        });

        // Seed Exam Registration for Tushar Mhato
        this.examRegistrations.push({
          id: 1644,
          student_id: 1644,
          student_name: 'Tushar Mhato',
          reg_no: '2644',
          roll_no: 'F24094004061',
          phone: '5555555555',
          course_name: 'Diploma',
          branch_name: 'Mechanical Engineering',
          branch_code: 'DIP_MECH',
          exam_name: 'Gen-Z 2nd Semester Regular Examination 2026',
          semester_id: 2,
          semester_label: '2nd Semester',
          academic_year: '2nd Year',
          session: '2024-2027',
          session_name: '2024-2027',
          fee_amount: 5000.00,
          fee_paid: 5000.00,
          payment_status: 'PAID',
          registration_status: 'APPROVED',
          receipt_no: 'EXAM-REC-1644',
          admit_card_eligible: 1,
          created_at: '2026-04-06 10:00:00'
        });

        // Seed Confirmed Subject Registration for Tushar Mhato (Semester 1 Gen-Z Regular)
        this.subjectRegistrations.push({
          id: 1,
          reference_number: 'REG-2026-MECH-00001',
          student_id: 1644,
          department_id: 3,
          program_id: 1,
          semester: 1,
          academic_year: '2026-27',
          registration_type: 'REGULAR',
          status: 'CONFIRMED',
          hod_id: 7,
          hod_approved_at: '2026-10-01 11:30:00',
          hod_remarks: 'Verified credits and prerequisites. Recommended for Directorate clearance.',
          director_id: 14,
          director_approved_at: '2026-10-01 11:45:00',
          director_remarks: 'Academics clearance sanctioned under Gen-Z guidelines.',
          exam_fee_amount: 1550.00,
          exam_fee_status: 'PAID',
          exam_receipt_no: 'EXAM-REC-2026-001644',
          exam_fee_paid_at: '2026-10-01 12:15:00',
          exam_section_id: 15,
          exam_section_approved_at: '2026-10-01 12:30:00',
          exam_section_remarks: 'Gen-Z University form fillup verified. Application Marked Received & Confirmed.',
          accounts_id: 15,
          accounts_approved_at: '2026-10-01 12:30:00',
          accounts_remarks: 'Verified by Examination Section. Locked & Confirmed.',
          submitted_at: '2026-10-01 10:00:00'
        });

        const tusharSubjectIds = [21, 22, 23, 24, 25, 26, 27];
        tusharSubjectIds.forEach(subId => {
          this.registrationSubjects.push({
            id: this.registrationSubjects.length + 1,
            registration_id: 1,
            subject_id: subId
          });
        });

        // Seed Realistic GENZ Alumni Cohorts (Batches 2023, 2024, 2025)
        const alumniSeedData = [
          {
            id: 5001,
            user_id: 5001,
            reg_no: '2001287012',
            roll_no: 'F20094001012',
            serial_no: 'ALU-01',
            full_name: 'Subhasish Panda',
            first_name: 'Subhasish',
            last_name: 'Panda',
            gender: 'MALE',
            dob: '2002-05-14',
            category: 'GENERAL',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 1,
            branch_code: 'CSE',
            branch_name: 'Computer Science & Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2020-2024',
            admission_year: 2020,
            batch: '2020-2024',
            email: 'subhasish.panda@alumni.genz.edu.in',
            personal_email: 'subhasish.panda.dev@gmail.com',
            phone: '9861012345',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2020-2024',
            degree_awarded: 'B.Tech in Computer Science & Engineering (1st Class Honours)',
            final_cgpa: 8.85,
            placement_status: 'PLACED',
            company_name: 'Tata Consultancy Services (TCS)',
            designation: 'Systems Engineer',
            work_location: 'Bhubaneswar / Bengaluru',
            linkedin_url: 'https://linkedin.com/in/subhasish-panda-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 360000.00,
            total_paid: 360000.00,
            total_outstanding: 0.00
          },
          {
            id: 5002,
            user_id: 5002,
            reg_no: '2001287045',
            roll_no: 'F20094001045',
            serial_no: 'ALU-02',
            full_name: 'Priyanka Mohapatra',
            first_name: 'Priyanka',
            last_name: 'Mohapatra',
            gender: 'FEMALE',
            dob: '2002-09-22',
            category: 'GENERAL',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 1,
            branch_code: 'CSE',
            branch_name: 'Computer Science & Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2020-2024',
            admission_year: 2020,
            batch: '2020-2024',
            email: 'priyanka.mohapatra@alumni.genz.edu.in',
            personal_email: 'priyanka.m.tech@gmail.com',
            phone: '9437123456',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2020-2024',
            degree_awarded: 'B.Tech in Computer Science & Engineering (1st Class Distinction)',
            final_cgpa: 9.15,
            placement_status: 'PLACED',
            company_name: 'Infosys Ltd',
            designation: 'Specialist Programmer',
            work_location: 'Bengaluru, Karnataka',
            linkedin_url: 'https://linkedin.com/in/priyanka-mohapatra-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 360000.00,
            total_paid: 360000.00,
            total_outstanding: 0.00
          },
          {
            id: 5003,
            user_id: 5003,
            reg_no: '1901287088',
            roll_no: 'F19094005088',
            serial_no: 'ALU-03',
            full_name: 'Soumya Ranjan Dash',
            first_name: 'Soumya',
            last_name: 'Dash',
            gender: 'MALE',
            dob: '2001-03-18',
            category: 'GENERAL',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 5,
            branch_code: 'MECH',
            branch_name: 'Mechanical Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2019-2023',
            admission_year: 2019,
            batch: '2019-2023',
            email: 'soumya.dash@alumni.genz.edu.in',
            personal_email: 'soumya.dash.me@gmail.com',
            phone: '9777234567',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2023,
            passout_batch: '2019-2023',
            degree_awarded: 'B.Tech in Mechanical Engineering (1st Class Honours)',
            final_cgpa: 8.35,
            placement_status: 'PLACED',
            company_name: 'Tata Steel Ltd',
            designation: 'Assistant Manager (Operations)',
            work_location: 'Jamshedpur / Kalinganagar',
            linkedin_url: 'https://linkedin.com/in/soumya-dash-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 340000.00,
            total_paid: 340000.00,
            total_outstanding: 0.00
          },
          {
            id: 5004,
            user_id: 5004,
            reg_no: '2001287103',
            roll_no: 'F20094008103',
            serial_no: 'ALU-04',
            full_name: 'Ananya Priyadarshini',
            first_name: 'Ananya',
            last_name: 'Priyadarshini',
            gender: 'FEMALE',
            dob: '2002-11-05',
            category: 'OBC',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 8,
            branch_code: 'ECE',
            branch_name: 'Electrical and Computer Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2020-2024',
            admission_year: 2020,
            batch: '2020-2024',
            email: 'ananya.p@alumni.genz.edu.in',
            personal_email: 'ananya.priyadarshini@gmail.com',
            phone: '9861345678',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2020-2024',
            degree_awarded: 'B.Tech in ECE (1st Class Honours)',
            final_cgpa: 8.70,
            placement_status: 'PLACED',
            company_name: 'Wipro Technologies',
            designation: 'Project Engineer',
            work_location: 'Hyderabad, Telangana',
            linkedin_url: 'https://linkedin.com/in/ananya-p-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 360000.00,
            total_paid: 360000.00,
            total_outstanding: 0.00
          },
          {
            id: 5005,
            user_id: 5005,
            reg_no: '1901287150',
            roll_no: 'F19094007150',
            serial_no: 'ALU-05',
            full_name: 'Bikash Chandra Rout',
            first_name: 'Bikash',
            last_name: 'Rout',
            gender: 'MALE',
            dob: '2001-08-12',
            category: 'GENERAL',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 7,
            branch_code: 'CIVIL',
            branch_name: 'Civil Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2019-2023',
            admission_year: 2019,
            batch: '2019-2023',
            email: 'bikash.rout@alumni.genz.edu.in',
            personal_email: 'bikash.rout.civil@gmail.com',
            phone: '9437456789',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2023,
            passout_batch: '2019-2023',
            degree_awarded: 'B.Tech in Civil Engineering (1st Class)',
            final_cgpa: 8.12,
            placement_status: 'PLACED',
            company_name: 'L&T Construction',
            designation: 'Site Civil Engineer',
            work_location: 'Bhubaneswar / Cuttack',
            linkedin_url: 'https://linkedin.com/in/bikash-rout-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 340000.00,
            total_paid: 340000.00,
            total_outstanding: 0.00
          },
          {
            id: 5006,
            user_id: 5006,
            reg_no: '2101287201',
            roll_no: 'D21094017201',
            serial_no: 'ALU-06',
            full_name: 'Debabrata Nayak',
            first_name: 'Debabrata',
            last_name: 'Nayak',
            gender: 'MALE',
            dob: '2003-04-10',
            category: 'OBC',
            course_id: 2,
            course_name: 'Diploma',
            branch_id: 17,
            branch_code: 'DIP_MECH',
            branch_name: 'Mechanical Engineering (Diploma)',
            current_semester_id: 6,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2021-2024',
            admission_year: 2021,
            batch: '2021-2024',
            email: 'debabrata.nayak@alumni.genz.edu.in',
            personal_email: 'debabrata.nayak@gmail.com',
            phone: '9777567890',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2021-2024',
            degree_awarded: 'Diploma in Mechanical Engineering (1st Division with Distinction)',
            final_cgpa: 8.90,
            placement_status: 'PLACED',
            company_name: 'Jindal Steel & Power Ltd (JSPL)',
            designation: 'Diploma Engineer Trainee (DET)',
            work_location: 'Angul, Odisha',
            linkedin_url: 'https://linkedin.com/in/debabrata-nayak-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 3000.00,
            total_billed: 135000.00,
            total_paid: 135000.00,
            total_outstanding: 0.00
          },
          {
            id: 5007,
            user_id: 5007,
            reg_no: '2201287305',
            roll_no: 'M22094012305',
            serial_no: 'ALU-07',
            full_name: 'Rashmita Sahoo',
            first_name: 'Rashmita',
            last_name: 'Sahoo',
            gender: 'FEMALE',
            dob: '2000-12-01',
            category: 'GENERAL',
            course_id: 3,
            course_name: 'MBA',
            branch_id: 12,
            branch_code: 'MBA_FIN',
            branch_name: 'Finance (MBA)',
            current_semester_id: 4,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2022-2024',
            admission_year: 2022,
            batch: '2022-2024',
            email: 'rashmita.sahoo@alumni.genz.edu.in',
            personal_email: 'rashmita.mba@gmail.com',
            phone: '9861678901',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2022-2024',
            degree_awarded: 'Master of Business Administration - Finance (1st Class)',
            final_cgpa: 8.65,
            placement_status: 'PLACED',
            company_name: 'HDFC Bank Ltd',
            designation: 'Senior Financial Analyst',
            work_location: 'Bhubaneswar, Odisha',
            linkedin_url: 'https://linkedin.com/in/rashmita-sahoo-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 170000.00,
            total_paid: 170000.00,
            total_outstanding: 0.00
          },
          {
            id: 5008,
            user_id: 5008,
            reg_no: '2001287077',
            roll_no: 'F20094004077',
            serial_no: 'ALU-08',
            full_name: 'Alok Kumar Sethi',
            first_name: 'Alok',
            last_name: 'Sethi',
            gender: 'MALE',
            dob: '2002-02-15',
            category: 'SC',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 4,
            branch_code: 'EE',
            branch_name: 'Electrical Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2020-2024',
            admission_year: 2020,
            batch: '2020-2024',
            email: 'alok.sethi@alumni.genz.edu.in',
            personal_email: 'alok.sethi.ee@gmail.com',
            phone: '9437789012',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2024,
            passout_batch: '2020-2024',
            degree_awarded: 'B.Tech in Electrical Engineering (1st Class)',
            final_cgpa: 8.05,
            placement_status: 'PLACED',
            company_name: 'Tech Mahindra',
            designation: 'Associate Software Engineer',
            work_location: 'Pune, Maharashtra',
            linkedin_url: 'https://linkedin.com/in/alok-sethi-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 360000.00,
            total_paid: 360000.00,
            total_outstanding: 0.00
          },
          {
            id: 5009,
            user_id: 5009,
            reg_no: '2301287410',
            roll_no: 'M23094013410',
            serial_no: 'ALU-09',
            full_name: 'Monalisa Pradhan',
            first_name: 'Monalisa',
            last_name: 'Pradhan',
            gender: 'FEMALE',
            dob: '2001-07-30',
            category: 'OBC',
            course_id: 3,
            course_name: 'MBA',
            branch_id: 13,
            branch_code: 'MBA_MKT',
            branch_name: 'Marketing (MBA)',
            current_semester_id: 4,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2023-2025',
            admission_year: 2023,
            batch: '2023-2025',
            email: 'monalisa.pradhan@alumni.genz.edu.in',
            personal_email: 'monalisa.p.mkt@gmail.com',
            phone: '9777890123',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2025,
            passout_batch: '2023-2025',
            degree_awarded: 'Master of Business Administration - Marketing (1st Class Honours)',
            final_cgpa: 8.80,
            placement_status: 'PLACED',
            company_name: 'Asian Paints Ltd',
            designation: 'Territory Sales Executive',
            work_location: 'Cuttack / Bhubaneswar',
            linkedin_url: 'https://linkedin.com/in/monalisa-pradhan-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 170000.00,
            total_paid: 170000.00,
            total_outstanding: 0.00
          },
          {
            id: 5010,
            user_id: 5010,
            reg_no: '1901287033',
            roll_no: 'F19094003033',
            serial_no: 'ALU-10',
            full_name: 'Chandan Kumar Barik',
            first_name: 'Chandan',
            last_name: 'Barik',
            gender: 'MALE',
            dob: '2001-10-14',
            category: 'OBC',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 3,
            branch_code: 'AGRI',
            branch_name: 'Agricultural Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2019-2023',
            admission_year: 2019,
            batch: '2019-2023',
            email: 'chandan.barik@alumni.genz.edu.in',
            personal_email: 'chandan.agri.ouat@gmail.com',
            phone: '9861901234',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2023,
            passout_batch: '2019-2023',
            degree_awarded: 'B.Tech in Agricultural Engineering (1st Class Honours)',
            final_cgpa: 8.45,
            placement_status: 'HIGHER_STUDIES',
            company_name: 'OUAT Bhubaneswar (M.Tech Agricultural Engg)',
            designation: 'Research Scholar',
            work_location: 'Bhubaneswar, Odisha',
            linkedin_url: 'https://linkedin.com/in/chandan-barik-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 340000.00,
            total_paid: 340000.00,
            total_outstanding: 0.00
          },
          {
            id: 5011,
            user_id: 5011,
            reg_no: '2001287230',
            roll_no: 'D20094016230',
            serial_no: 'ALU-11',
            full_name: 'Rakesh Senapati',
            first_name: 'Rakesh',
            last_name: 'Senapati',
            gender: 'MALE',
            dob: '2002-06-25',
            category: 'GENERAL',
            course_id: 2,
            course_name: 'Diploma',
            branch_id: 16,
            branch_code: 'DIP_CIVIL',
            branch_name: 'Civil Engineering (Diploma)',
            current_semester_id: 6,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2020-2023',
            admission_year: 2020,
            batch: '2020-2023',
            email: 'rakesh.senapati@alumni.genz.edu.in',
            personal_email: 'rakesh.senapati.civil@gmail.com',
            phone: '9437012345',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2023,
            passout_batch: '2020-2023',
            degree_awarded: 'Diploma in Civil Engineering (1st Class)',
            final_cgpa: 8.35,
            placement_status: 'PLACED',
            company_name: 'Shapoorji Pallonji Real Estate',
            designation: 'Junior Site Engineer',
            work_location: 'Bhubaneswar, Odisha',
            linkedin_url: 'https://linkedin.com/in/rakesh-senapati-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 3000.00,
            total_billed: 135000.00,
            total_paid: 135000.00,
            total_outstanding: 0.00
          },
          {
            id: 5012,
            user_id: 5012,
            reg_no: '2101287019',
            roll_no: 'F21094001019',
            serial_no: 'ALU-12',
            full_name: 'Madhusmita Behera',
            first_name: 'Madhusmita',
            last_name: 'Behera',
            gender: 'FEMALE',
            dob: '2003-01-08',
            category: 'SC',
            course_id: 1,
            course_name: 'B.Tech',
            branch_id: 1,
            branch_code: 'CSE',
            branch_name: 'Computer Science & Engineering',
            current_semester_id: 8,
            semester_label: 'Pass Out / Graduated',
            academic_year: 'Alumni',
            session_name: '2021-2025',
            admission_year: 2021,
            batch: '2021-2025',
            email: 'madhusmita.behera@alumni.genz.edu.in',
            personal_email: 'madhusmita.behera.cse@gmail.com',
            phone: '9777123789',
            is_alumni: 1,
            student_status: 'ALUMNI',
            passout_year: 2025,
            passout_batch: '2021-2025',
            degree_awarded: 'B.Tech in Computer Science & Engineering (1st Class Distinction)',
            final_cgpa: 9.30,
            placement_status: 'PLACED',
            company_name: 'Cognizant Technology Solutions',
            designation: 'GenC Next Developer',
            work_location: 'Chennai / Bengaluru',
            linkedin_url: 'https://linkedin.com/in/madhusmita-behera-genz',
            no_dues_status: 'CLEARED',
            caution_deposit_status: 'REFUNDED',
            caution_deposit_refund_amount: 5000.00,
            total_billed: 360000.00,
            total_paid: 360000.00,
            total_outstanding: 0.00
          }
        ];

        alumniSeedData.forEach(al => {
          this.users.push({
            id: al.user_id,
            email: al.email,
            personal_email: al.personal_email,
            role_id: 1,
            is_active: 1,
            must_change_password: 0
          });
          this.students.push(al);
        });

        console.log(`[MockDb] Successfully loaded ${students.length} real students from reporting spreadsheet, plus Tushar Mhato and ${alumniSeedData.length} Alumni.`);
      } catch (err) {
        console.error('[MockDb] Error reading reporting excel:', err.message);
      }
    }

      this.initialized = true;
    })();

    return this.initPromise;
  }

  getPromotionStats() {
    const totalStudents = this.students.length;
    const alumniCount = this.students.filter(s => s.is_alumni === 1 || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni').length;
    const totalEnrolled = totalStudents - alumniCount;

    const bySemester = {};
    const byYear = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0, 'Alumni': alumniCount };
    const byCourse = {};
    const byBranch = {};

    this.semesters.forEach(sm => {
      bySemester[sm.id] = { id: sm.id, label: sm.label, count: 0 };
    });

    this.students.forEach(s => {
      if (s.is_alumni === 1 || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni') {
        return; // Handled separately
      }

      // Semester
      const semId = s.current_semester_id || 1;
      if (bySemester[semId]) {
        bySemester[semId].count++;
      } else {
        bySemester[semId] = { id: semId, label: `${semId}th Semester`, count: 1 };
      }

      // Year
      const y = s.academic_year || (semId <= 2 ? '1st Year' : (semId <= 4 ? '2nd Year' : (semId <= 6 ? '3rd Year' : '4th Year')));
      byYear[y] = (byYear[y] || 0) + 1;

      // Course
      const c = s.course_name || 'Bachelor of Technology';
      byCourse[c] = (byCourse[c] || 0) + 1;

      // Branch
      const b = s.branch_name || s.branch_code || 'General';
      byBranch[b] = (byBranch[b] || 0) + 1;
    });

    return {
      totalStudents: totalEnrolled,
      totalEnrolled,
      alumniCount,
      bySemester,
      byYear,
      byCourse,
      byBranch,
      eligibleFor2ndSem: bySemester[1] ? bySemester[1].count : 0,
      eligibleFor2ndYear: (byYear['1st Year'] || 0)
    };
  }

  promoteStudentsSemester({ fromSemesterId = 1, toSemesterId = 2, branchId, courseId, studentIds }) {
    let affected = 0;
    const semMap = {
      1: '1st Semester',
      2: '2nd Semester',
      3: '3rd Semester',
      4: '4th Semester',
      5: '5th Semester',
      6: '6th Semester',
      7: '7th Semester',
      8: '8th Semester'
    };

    const targetLabel = semMap[toSemesterId] || `${toSemesterId}th Semester`;

    this.students.forEach(s => {
      if (studentIds && studentIds.length > 0) {
        if (!studentIds.includes(s.id)) return;
      } else {
        if (fromSemesterId && s.current_semester_id !== parseInt(fromSemesterId, 10)) return;
        if (branchId && s.branch_id !== parseInt(branchId, 10)) return;
        if (courseId && s.course_id !== parseInt(courseId, 10)) return;
      }

      s.current_semester_id = parseInt(toSemesterId, 10);
      s.semester_label = targetLabel;
      affected++;
    });

    return affected;
  }

  promoteStudentsYear({ fromYear = 1, toYear = 2, targetSemesterId = 3, branchId, courseId, studentIds, generateInvoice = true }) {
    let affected = 0;
    let invCount = 0;
    const targetSem = parseInt(targetSemesterId || 3, 10);
    const semMap = {
      1: '1st Semester',
      2: '2nd Semester',
      3: '3rd Semester',
      4: '4th Semester',
      5: '5th Semester',
      6: '6th Semester',
      7: '7th Semester',
      8: '8th Semester'
    };

    const targetYearLabel = `${toYear}nd Year`;
    const targetSessionId = 2; // 2027-28
    const targetSessionName = '2027-28';

    this.students.forEach(s => {
      if (studentIds && studentIds.length > 0) {
        if (!studentIds.includes(s.id)) return;
      } else {
        if (branchId && s.branch_id !== parseInt(branchId, 10)) return;
        if (courseId && s.course_id !== parseInt(courseId, 10)) return;
      }

      s.academic_year = targetYearLabel;
      s.current_semester_id = targetSem;
      s.semester_label = semMap[targetSem] || `${targetSem}th Semester`;
      s.academic_session_id = targetSessionId;
      s.session_name = targetSessionName;
      affected++;

      if (generateInvoice) {
        const invId = this.invoices.length + 1;
        const invNo = `INV-2027-${s.course_id === 2 ? 'DIP' : (s.course_id === 3 ? 'MBA' : 'BTECH')}-${String(7000 + s.id)}`;
        
        let annualFee = 115000.00;
        if (s.course_id === 2) annualFee = 45000.00;
        else if (s.course_id === 3) annualFee = 85000.00;

        this.invoices.push({
          id: invId,
          invoice_no: invNo,
          student_id: s.id,
          academic_session_id: targetSessionId,
          semester_id: targetSem,
          subtotal: annualFee,
          discount_amount: 0.00,
          fine_amount: 0.00,
          total_payable: annualFee,
          paid_amount: 0.00,
          outstanding_amount: annualFee,
          due_date: '2027-10-31',
          status: 'ISSUED',
          notes: `${s.course_name || 'Degree'} - ${s.branch_name || ''} 2nd Year Annual Tuition & Institutional Fee Structure`,
          created_by: 2,
          created_at: new Date().toISOString()
        });

        const ledgerId = this.ledgers.length + 1;
        this.ledgers.push({
          id: ledgerId,
          student_id: s.id,
          fee_category_id: 1, // Tuition Fee
          invoice_id: invId,
          amount_charged: annualFee,
          scholarship_amount: 0.00,
          discount_amount: 0.00,
          fine_amount: 0.00,
          adjustment_amount: 0.00,
          amount_paid: 0.00,
          outstanding_amount: annualFee,
          due_date: '2027-10-31',
          status: 'ISSUED',
          created_at: new Date().toISOString()
        });

        s.total_billed = (s.total_billed || 0) + annualFee;
        s.total_outstanding = (s.total_outstanding || 0) + annualFee;
        invCount++;
      }
    });

    return { affected, invCount };
  }

  graduateStudentToAlumni({ studentId, passoutYear, finalCgpa, degreeAwarded, companyName, designation, workLocation, placementStatus, cautionDepositAction, remarks }) {
    const student = this.students.find(s => s.id === parseInt(studentId, 10));
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    const yr = parseInt(passoutYear, 10) || new Date().getFullYear();
    const course = student.course_name || 'B.Tech';
    const branch = student.branch_name || student.branch_code || 'Engineering';

    student.is_alumni = 1;
    student.student_status = 'ALUMNI';
    student.academic_year = 'Alumni';
    student.semester_label = 'Pass Out / Graduated';
    student.passout_year = yr;
    student.passout_batch = `${student.admission_year || (yr - 4)}-${yr}`;
    student.degree_awarded = degreeAwarded || `${course} in ${branch} (Graduated)`;
    student.final_cgpa = parseFloat(finalCgpa) || 8.00;
    student.placement_status = placementStatus || (companyName ? 'PLACED' : 'SEEKING');
    student.company_name = companyName || 'Not Disclosed / Independent';
    student.designation = designation || (companyName ? 'Graduate Trainee' : 'Alumni Member');
    student.work_location = workLocation || 'Bhubaneswar';
    student.no_dues_status = 'CLEARED';
    student.caution_deposit_status = cautionDepositAction === 'DONATED' ? 'DONATED_TO_ALUMNI_FUND' : 'REFUNDED';
    student.caution_deposit_refund_amount = 5000.00;
    student.graduated_at = new Date().toISOString();
    student.graduation_remarks = remarks || 'Institutional No Dues verified & Caution Deposit settled.';

    // Clear any outstanding balances since No Dues requires clearance
    student.total_outstanding = 0.00;

    return student;
  }

  batchGraduateToAlumni({ studentIds, courseId, branchId, passoutYear = 2026, defaultPlacement = 'PLACED' }) {
    let affected = 0;
    const yr = parseInt(passoutYear, 10) || 2026;

    this.students.forEach(s => {
      if (studentIds && studentIds.length > 0) {
        if (!studentIds.includes(s.id)) return;
      } else {
        if (courseId && s.course_id !== parseInt(courseId, 10)) return;
        if (branchId && s.branch_id !== parseInt(branchId, 10)) return;
      }

      s.is_alumni = 1;
      s.student_status = 'ALUMNI';
      s.academic_year = 'Alumni';
      s.semester_label = 'Pass Out / Graduated';
      s.passout_year = yr;
      s.passout_batch = `${s.admission_year || (yr - 4)}-${yr}`;
      s.degree_awarded = `${s.course_name || 'B.Tech'} in ${s.branch_name || 'Engineering'} (Graduated)`;
      s.final_cgpa = s.final_cgpa || 8.25;
      s.placement_status = defaultPlacement;
      s.company_name = s.company_name || 'Campus Placed / Corporate Track';
      s.designation = s.designation || 'Graduate Engineer Trainee (GET)';
      s.work_location = s.work_location || 'Bhubaneswar / National Network';
      s.no_dues_status = 'CLEARED';
      s.caution_deposit_status = 'REFUNDED';
      s.caution_deposit_refund_amount = 5000.00;
      s.total_outstanding = 0.00;
      s.graduated_at = new Date().toISOString();
      affected++;
    });

    return { affected, passoutYear: yr };
  }

  getAlumniList({ passoutYear, courseId, branchId, search }) {
    let list = this.students.filter(s => s.is_alumni === 1 || s.student_status === 'ALUMNI' || s.academic_year === 'Alumni');

    if (passoutYear) {
      list = list.filter(s => String(s.passout_year) === String(passoutYear));
    }
    if (courseId) {
      list = list.filter(s => s.course_id === parseInt(courseId, 10) || (s.course_name && s.course_name.toLowerCase().includes(courseId.toLowerCase())));
    }
    if (branchId) {
      list = list.filter(s => s.branch_id === parseInt(branchId, 10) || s.branch_code === branchId);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(s =>
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.reg_no && s.reg_no.toLowerCase().includes(q)) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
        (s.company_name && s.company_name.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q))
      );
    }
    return list;
  }
}

const mockDb = new MockDatabase();

module.exports = mockDb;
