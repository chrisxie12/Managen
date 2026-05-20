const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/db');

/**
 * CSV Import Service
 * Handles bulk student imports from CSV files with validation, deduplication, and transaction safety
 */
class CSVImportService {
  constructor() {
    this.REQUIRED_COLUMNS = [
      'student_id', 'first_name', 'last_name', 'date_of_birth',
      'gender', 'class_name', 'parent_name', 'parent_phone'
    ];

    this.OPTIONAL_COLUMNS = [
      'other_names', 'enrollment_date', 'parent_whatsapp', 'parent_email',
      'address', 'previous_school', 'boarding_status'
    ];
  }

  /**
   * Parse CSV string into array of objects
   * Handles headers and returns normalized column names
   */
  parseCSV(csvString) {
    const lines = csvString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('EMPTY_CSV');
    }

    // Parse header
    const header = this.parseCSVLine(lines[0]);
    const normalizedHeader = header.map(col => 
      col.trim().toLowerCase().replace(/\s+/g, '_')
    );

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.some(v => v.trim())) { // Skip completely empty rows
        const row = {};
        normalizedHeader.forEach((col, idx) => {
          row[col] = values[idx] || '';
        });
        data.push(row);
      }
    }

    return { headers: normalizedHeader, data };
  }

  /**
   * Parse a single CSV line, handling quoted values with commas
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Main import function
   */
  async importStudents(schoolId, csvBuffer, validateOnly = false) {
    const importId = uuidv4();
    const startTime = Date.now();

    try {
      // Parse CSV
      const { headers, data } = this.parseCSV(csvBuffer.toString());

      if (data.length === 0) {
        throw new Error('EMPTY_CSV');
      }

      // Validate headers
      const missingColumns = this.REQUIRED_COLUMNS.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`MISSING_COLUMNS: ${missingColumns.join(', ')}`);
      }

      // Fetch school context (classes)
      const { data: classes, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId);

      if (classError) {
        throw new Error(`Failed to fetch classes: ${classError.message}`);
      }

      const classMap = new Map(
        (classes || []).map(c => [c.name.toLowerCase().trim(), c.id])
      );

      // Fetch existing student IDs to check for duplicates
      const { data: existingStudents, error: existError } = await supabase
        .from('students')
        .select('student_id')
        .eq('school_id', schoolId);

      if (existError) {
        throw new Error(`Failed to check existing students: ${existError.message}`);
      }

      const existingIds = new Set((existingStudents || []).map(s => s.student_id.trim()));

      // Process rows
      const results = {
        total_rows: data.length,
        valid_rows: 0,
        invalid_rows: 0,
        errors: [],
        warnings: [],
        studentsToInsert: [],
        parentsToInsert: [],
        linksToInsert: []
      };

      const seenInFile = new Set();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; // +2 because header is row 1, 0-indexed

        const validation = this.validateRow(
          row,
          rowNum,
          classMap,
          existingIds,
          seenInFile
        );

        if (validation.errors.length > 0) {
          results.invalid_rows++;
          results.errors.push(...validation.errors);
          continue;
        }

        results.valid_rows++;
        results.warnings.push(...validation.warnings);
        seenInFile.add(row.student_id.trim());

        if (!validateOnly) {
          this.prepareInserts(row, schoolId, validation, results);
        }
      }

      // Execute batch insert if not validate-only and there are valid rows
      if (!validateOnly && results.studentsToInsert.length > 0) {
        await this.executeBatchInsert(schoolId, results, importId);
      }

      // Log import
      await this.logImport(importId, schoolId, results, validateOnly, Date.now() - startTime);

      return {
        import_id: importId,
        status: 'success',
        summary: {
          total_rows: results.total_rows,
          valid_rows: results.valid_rows,
          invalid_rows: results.invalid_rows,
          created_students: results.studentsToInsert.length,
          created_parents: results.parentsToInsert.length,
          linked_parents: results.linksToInsert.length,
          duration_seconds: ((Date.now() - startTime) / 1000).toFixed(1)
        },
        errors: results.errors.slice(0, 100),
        warnings: results.warnings.slice(0, 50),
        download_url: results.errors.length > 0 ? `/api/schools/${schoolId}/imports/${importId}/errors` : null
      };
    } catch (error) {
      // Log failed import
      await this.logImport(importId, schoolId, { errors: [error.message] }, validateOnly, Date.now() - startTime, 'failed');
      
      throw error;
    }
  }

  /**
   * Validate a single row
   */
  validateRow(row, rowNum, classMap, existingIds, seenInFile) {
    const errors = [];
    const warnings = [];
    const normalized = {};

    // student_id
    const sid = row.student_id?.trim();
    if (!sid) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'student_id',
        value: sid,
        message: 'Student ID is required'
      });
      return { errors, warnings, normalized }; // Can't continue without student_id
    }

    if (sid.length > 20) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'student_id',
        value: sid,
        message: 'Student ID must be max 20 characters'
      });
    } else if (existingIds.has(sid)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'student_id',
        value: sid,
        message: 'Student ID already exists in this school'
      });
    } else if (seenInFile.has(sid)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'student_id',
        value: sid,
        message: 'Duplicate student ID in this CSV file'
      });
    }
    normalized.student_id = sid;

    // first_name and last_name
    ['first_name', 'last_name'].forEach(field => {
      const val = row[field]?.trim();
      if (!val) {
        errors.push({
          row: rowNum,
          student_id: sid,
          field,
          value: val,
          message: `${field.replace('_', ' ')} is required`
        });
      } else if (val.length > 50) {
        errors.push({
          row: rowNum,
          student_id: sid,
          field,
          value: val,
          message: `${field.replace('_', ' ')} must be max 50 characters`
        });
      } else if (!/^[a-zA-Z\s'-]+$/.test(val)) {
        errors.push({
          row: rowNum,
          student_id: sid,
          field,
          value: val,
          message: `${field.replace('_', ' ')} must contain only letters, spaces, hyphens, and apostrophes`
        });
      }
      normalized[field] = val;
    });

    normalized.other_names = row.other_names?.trim() || null;

    // date_of_birth
    const dob = this.parseDate(row.date_of_birth);
    if (!dob) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'date_of_birth',
        value: row.date_of_birth,
        message: 'Date of birth must be in DD/MM/YYYY format (e.g., 15/03/2010)'
      });
    } else {
      const age = this.calculateAge(dob);
      if (age < 3 || age > 25) {
        errors.push({
          row: rowNum,
          student_id: sid,
          field: 'date_of_birth',
          value: row.date_of_birth,
          message: `Student age (${age}) must be between 3 and 25 years`
        });
      }
      normalized.date_of_birth = dob;
    }

    // gender
    const gender = row.gender?.trim().toUpperCase();
    if (!gender) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'gender',
        value: row.gender,
        message: 'Gender is required (must be M, F, or O)'
      });
    } else if (!['M', 'F', 'O'].includes(gender)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'gender',
        value: row.gender,
        message: 'Gender must be M (Male), F (Female), or O (Other)'
      });
    }
    normalized.gender = gender;

    // class_name
    const className = row.class_name?.trim();
    if (!className) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'class_name',
        value: className,
        message: 'Class name is required'
      });
    } else {
      const classId = classMap.get(className.toLowerCase());
      if (!classId) {
        const available = Array.from(classMap.keys()).join(', ');
        errors.push({
          row: rowNum,
          student_id: sid,
          field: 'class_name',
          value: className,
          message: `Class "${className}" does not exist. Available: ${available}`
        });
      }
      normalized.class_id = classId;
    }

    // parent_name
    const parentName = row.parent_name?.trim();
    if (!parentName) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_name',
        value: parentName,
        message: 'Parent name is required'
      });
    } else if (parentName.length > 100) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_name',
        value: parentName,
        message: 'Parent name must be max 100 characters'
      });
    }
    normalized.parent_name = parentName;

    // parent_phone (Ghana format: 10 digits, starts with 0)
    const phone = row.parent_phone?.trim().replace(/\s+/g, '');
    if (!phone) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_phone',
        value: phone,
        message: 'Parent phone number is required'
      });
    } else if (!/^0[0-9]{9}$/.test(phone)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_phone',
        value: row.parent_phone,
        message: 'Parent phone must be 10 digits starting with 0 (e.g., 0244123456)'
      });
    }
    normalized.parent_phone = phone;

    // parent_whatsapp
    let whatsapp = row.parent_whatsapp?.trim().replace(/\s+/g, '');
    if (!whatsapp) {
      whatsapp = phone;
      if (phone) {
        warnings.push({
          row: rowNum,
          student_id: sid,
          field: 'parent_whatsapp',
          message: 'WhatsApp number not provided — using phone number'
        });
      }
    } else if (!/^0[0-9]{9}$/.test(whatsapp)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_whatsapp',
        value: row.parent_whatsapp,
        message: 'WhatsApp number must be 10 digits starting with 0 (e.g., 0244123456)'
      });
    }
    normalized.parent_whatsapp = whatsapp;

    // parent_email
    const email = row.parent_email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        row: rowNum,
        student_id: sid,
        field: 'parent_email',
        value: email,
        message: 'Invalid email format'
      });
    }
    normalized.parent_email = email || null;

    // Optional fields
    normalized.enrollment_date = row.enrollment_date ? this.parseDate(row.enrollment_date) : new Date();
    normalized.address = row.address?.trim() || null;
    normalized.previous_school = row.previous_school?.trim() || null;
    normalized.boarding_status = ['Day', 'Boarding'].includes(row.boarding_status?.trim())
      ? row.boarding_status.trim()
      : 'Day';

    return { errors, warnings, normalized };
  }

  /**
   * Parse date string in DD/MM/YYYY format
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(Number);

    // Validate month and day ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    // Verify the date was valid (JS may adjust invalid dates)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }

    // Must be in the past
    if (date > new Date()) {
      return null;
    }

    return date;
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dob) {
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  /**
   * Prepare student, parent, and link data for insertion
   */
  prepareInserts(row, schoolId, validation, results) {
    const n = validation.normalized;
    const studentUuid = uuidv4();
    const parentUuid = uuidv4();

    results.studentsToInsert.push({
      id: studentUuid,
      school_id: schoolId,
      tenant_id: schoolId, // For backward compatibility
      student_id: n.student_id,
      first_name: n.first_name,
      last_name: n.last_name,
      other_names: n.other_names,
      date_of_birth: n.date_of_birth.toISOString().split('T')[0],
      gender: n.gender,
      class_id: n.class_id,
      class_name: row.class_name.trim(), // Keep original class name for reference
      enrollment_date: n.enrollment_date.toISOString().split('T')[0],
      address: n.address,
      previous_school: n.previous_school,
      boarding_status: n.boarding_status,
      is_active: true,
      created_at: new Date().toISOString()
    });

    results.parentsToInsert.push({
      id: parentUuid,
      school_id: schoolId,
      tenant_id: schoolId, // For backward compatibility
      name: n.parent_name,
      phone: n.parent_phone,
      whatsapp: n.parent_whatsapp,
      email: n.parent_email,
      created_at: new Date().toISOString()
    });

    results.linksToInsert.push({
      student_id: studentUuid,
      parent_id: parentUuid,
      relationship: 'guardian',
      is_primary: true,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Execute batch insert using RPC function for transaction safety
   */
  async executeBatchInsert(schoolId, results, importId) {
    try {
      const { error } = await supabase.rpc('bulk_import_students', {
        p_school_id: schoolId,
        p_import_id: importId,
        p_students: results.studentsToInsert,
        p_parents: results.parentsToInsert,
        p_links: results.linksToInsert
      });

      if (error) {
        throw new Error(`Batch insert failed: ${error.message}`);
      }
    } catch (error) {
      // Rollback is automatic in Supabase RPC on error
      throw error;
    }
  }

  /**
   * Log import operation for audit trail
   */
  async logImport(importId, schoolId, results, validateOnly, durationMs, status = 'completed') {
    try {
      await supabase.from('import_logs').insert({
        id: importId,
        school_id: schoolId,
        tenant_id: schoolId,
        type: 'student_csv',
        mode: validateOnly ? 'validate' : 'import',
        status,
        total_rows: results.total_rows,
        valid_rows: results.valid_rows,
        invalid_rows: results.invalid_rows,
        error_details: results.errors.slice(0, 50),
        warning_details: results.warnings.slice(0, 20),
        duration_ms: durationMs,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to log import:', err);
      // Don't throw - logging failure shouldn't fail the import
    }
  }

  /**
   * Generate CSV template for download
   */
  generateTemplate(schoolName, classes = []) {
    const className = classes.map(c => c.name).join(', ') || 'JHS 1, JHS 2, SHS 1';

    const header = [
      'student_id',
      'first_name',
      'last_name',
      'other_names',
      'date_of_birth',
      'gender',
      'class_name',
      'enrollment_date',
      'parent_name',
      'parent_phone',
      'parent_whatsapp',
      'parent_email',
      'address',
      'previous_school',
      'boarding_status'
    ];

    const examples = [
      [
        'SUN-2026-001',
        'Kofi',
        'Mensah',
        'Kwame',
        '15/03/2010',
        'M',
        'JHS 2A',
        '10/01/2026',
        'Mr. Mensah',
        '0244123456',
        '0244123456',
        'mensah@email.com',
        'Accra, East Legon',
        'Sunshine Primary',
        'Day'
      ],
      [
        'SUN-2026-002',
        'Ama',
        'Osei',
        '',
        '22/07/2011',
        'F',
        'JHS 1B',
        '10/01/2026',
        'Mrs. Osei',
        '0244234567',
        '',
        'osei@email.com',
        'Kumasi',
        'St. Johns Primary',
        'Boarding'
      ],
      [
        'SUN-2026-003',
        'Yaw',
        'Boateng',
        'Emmanuel',
        '05/11/2009',
        'M',
        'SHS 1C',
        '10/01/2026',
        'Mr. Boateng',
        '0244345678',
        '',
        '',
        'Cape Coast',
        'Foso Primary',
        'Day'
      ]
    ];

    const rows = [
      header,
      ...examples
    ];

    return rows.map(row => row.map(cell => {
      // Escape quotes in cell
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')).join('\n');
  }
}

module.exports = CSVImportService;
