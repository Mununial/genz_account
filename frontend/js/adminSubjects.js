/**
 * Admin Gen-Z Subject Catalog Controller
 * Gen-Z University — Curricula & Syllabus Management
 */

const adminSubjects = {
  subjects: [],
  programs: [],
  departments: [],
  searchTimer: null,

  async init() {
    const user = await auth.checkAuth();
    if (!user) return;
    if (!['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'HOD'].includes(user.role)) {
      ui.showToast('Access restricted to Academic Administrators.', 'error');
      setTimeout(() => window.location.replace('/dashboard.html'), 1200);
      return;
    }
    await this.loadMetadata();
    await this.loadSubjects();
  },

  async loadMetadata() {
    try {
      const res = await api.get('/registration/metadata');
      if (res && res.data) {
        this.programs = res.data.programs || [];
        this.departments = res.data.departments || [];

        // 1. Filter Program dropdown
        const fp = document.getElementById('filterProgram');
        if (fp) {
          fp.innerHTML = '<option value="">All Programs</option>' +
            this.programs.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.code})</option>`).join('');
        }

        // 2. Modal Program dropdown
        const sp = document.getElementById('subProgram');
        if (sp) {
          sp.innerHTML = this.programs.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.code})</option>`).join('');
        }

        this.onProgramFilterChange();
        this.onModalProgramChange();
      }
    } catch (e) {
      console.warn('Metadata load note:', e);
    }
  },

  onProgramFilterChange() {
    const progId = document.getElementById('filterProgram')?.value || '';
    const dSelect = document.getElementById('filterDepartment');
    if (!dSelect) return;

    let filtered = this.departments;
    if (progId) {
      filtered = this.departments.filter(d => String(d.program_id) === String(progId));
    }

    dSelect.innerHTML = '<option value="">All Departments</option>' +
      filtered.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.code})</option>`).join('');

    this.loadSubjects();
  },

  onModalProgramChange() {
    const progId = document.getElementById('subProgram')?.value || '';
    const dSelect = document.getElementById('subDepartment');
    if (!dSelect) return;

    let filtered = this.departments;
    if (progId) {
      filtered = this.departments.filter(d => String(d.program_id) === String(progId));
    }

    dSelect.innerHTML = filtered.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${d.code})</option>`).join('');
  },

  onSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadSubjects();
    }, 300);
  },

  async loadSubjects() {
    const progId = document.getElementById('filterProgram')?.value || '';
    const deptId = document.getElementById('filterDepartment')?.value || '';
    const semester = document.getElementById('filterSemester')?.value || '';
    const type = document.getElementById('filterType')?.value || '';
    const search = document.getElementById('filterSearch')?.value || '';
    const container = document.getElementById('subjectListBody');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#64748B;">Loading syllabus catalog...</td></tr>';

    try {
      const q = new URLSearchParams();
      if (progId) q.append('program_id', progId);
      if (deptId) q.append('department_id', deptId);
      if (semester) q.append('semester', semester);
      if (type) q.append('type', type);
      if (search) q.append('search', search);

      const res = await api.get(`/registration/admin/subjects?${q.toString()}`);
      if (!res || !res.data) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Failed to load subjects.</td></tr>';
        return;
      }

      this.subjects = res.data.subjects || [];
      document.getElementById('totalSubjectsCount').textContent = `${this.subjects.length} Subjects`;

      if (!this.subjects.length) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2.5rem;color:#94A3B8;"><div style="font-size:1.8rem;margin-bottom:0.5rem;">📚</div>No subjects found matching criteria.</td></tr>';
        return;
      }

      container.innerHTML = this.subjects.map(s => `
        <tr style="border-bottom:1px solid #E2E8F0;">
          <td style="padding:10px 12px;font-weight:700;font-family:monospace;color:#0B63C5;">${escapeHtml(s.code)}</td>
          <td style="padding:10px 12px;font-weight:600;color:#0F172A;">${escapeHtml(s.name)}</td>
          <td style="padding:10px 12px;font-size:0.85rem;color:#64748B;">${escapeHtml(s.program_code || 'BTECH')}</td>
          <td style="padding:10px 12px;font-size:0.85rem;">
            <strong style="color:#0F172A;">${escapeHtml(s.department_code || s.branch || 'CSE')}</strong>
            <span style="font-size:0.75rem;color:#64748B;display:block;">${escapeHtml(s.department_name || '')}</span>
          </td>
          <td style="padding:10px 12px;text-align:center;font-size:0.85rem;">Sem ${s.semester}</td>
          <td style="padding:10px 12px;text-align:center;font-weight:700;color:#0B63C5;">${s.credits}</td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="background:${s.type==='CORE'?'#EFF6FF':(s.type==='LAB'?'#F0FDF4':'#FEF3C7')};color:${s.type==='CORE'?'#1D4ED8':(s.type==='LAB'?'#16A34A':'#D97706')};font-weight:700;font-size:0.75rem;padding:0.2rem 0.5rem;border-radius:4px;">
              ${s.type}
            </span>
          </td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="color:${s.is_active ? '#16A34A' : '#DC2626'};font-weight:700;font-size:0.8rem;">
              ${s.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="padding:10px 12px;text-align:right;">
            <div style="display:flex;justify-content:flex-end;gap:0.3rem;">
              <button class="btn btn-sm btn-secondary" onclick="adminSubjects.openEditModal(${s.id})" style="padding:0.25rem 0.6rem;font-size:0.78rem;">
                Edit
              </button>
              ${s.is_active ? `
                <button class="btn btn-sm btn-secondary" onclick="adminSubjects.deactivateSubject(${s.id})" style="color:#DC2626;border-color:#FECACA;padding:0.25rem 0.6rem;font-size:0.78rem;">
                  Deactivate
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
      container.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:#DC2626;">Error loading subjects.</td></tr>';
    }
  },

  openAddModal() {
    document.getElementById('modalSubjectId').value = '';
    document.getElementById('modalSubTitle').textContent = 'Add Gen-Z Subject';
    document.getElementById('subCode').value = '';
    document.getElementById('subName').value = '';
    document.getElementById('subSemester').value = '1';
    document.getElementById('subCredits').value = '3';
    document.getElementById('subType').value = 'CORE';
    document.getElementById('subSequence').value = '1';

    // Set active filters as defaults if selected
    const fProg = document.getElementById('filterProgram')?.value;
    const fDept = document.getElementById('filterDepartment')?.value;
    if (fProg) {
      document.getElementById('subProgram').value = fProg;
      this.onModalProgramChange();
    }
    if (fDept) {
      document.getElementById('subDepartment').value = fDept;
    }

    ui.openModal('subjectModal');
  },

  openEditModal(id) {
    const s = this.subjects.find(x => x.id === id);
    if (!s) return;

    document.getElementById('modalSubjectId').value = s.id;
    document.getElementById('modalSubTitle').textContent = `Edit Subject: ${s.code}`;
    document.getElementById('subCode').value = s.code;
    document.getElementById('subName').value = s.name;
    document.getElementById('subSemester').value = s.semester;
    document.getElementById('subCredits').value = s.credits;
    document.getElementById('subType').value = s.type;
    document.getElementById('subSequence').value = s.sequence || 1;

    if (s.program_id) {
      document.getElementById('subProgram').value = s.program_id;
      this.onModalProgramChange();
    }
    if (s.department_id) {
      document.getElementById('subDepartment').value = s.department_id;
    }

    ui.openModal('subjectModal');
  },

  async saveSubject() {
    const id = document.getElementById('modalSubjectId').value;
    const program_id = parseInt(document.getElementById('subProgram').value, 10);
    const department_id = parseInt(document.getElementById('subDepartment').value, 10);
    const code = document.getElementById('subCode').value.trim();
    const name = document.getElementById('subName').value.trim();
    const semester = parseInt(document.getElementById('subSemester').value, 10);
    const credits = parseInt(document.getElementById('subCredits').value, 10);
    const type = document.getElementById('subType').value;
    const sequence = parseInt(document.getElementById('subSequence').value, 10) || 1;

    if (!code || !name) {
      ui.showToast('Subject Code and Name are required.', 'warning');
      return;
    }

    const payload = {
      program_id,
      department_id,
      code,
      name,
      semester,
      credits,
      type,
      sequence
    };

    try {
      let res;
      if (id) {
        res = await api.put(`/registration/admin/subjects/${id}`, payload);
      } else {
        res = await api.post('/registration/admin/subjects', payload);
      }

      if (res && res.data) {
        ui.showToast(id ? 'Subject updated successfully.' : 'Subject added to catalog.', 'success');
        ui.closeModal('subjectModal');
        await this.loadSubjects();
      } else {
        ui.showToast(res.message || 'Operation failed.', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Operation failed.', 'error');
    }
  },

  async deactivateSubject(id) {
    if (!confirm('Are you sure you want to deactivate this subject from registration?')) return;
    try {
      const res = await api.delete(`/registration/admin/subjects/${id}`);
      if (res && res.data) {
        ui.showToast('Subject deactivated.', 'info');
        await this.loadSubjects();
      }
    } catch (e) {
      ui.showToast(e.message || 'Deactivation failed.', 'error');
    }
  },

  openBulkModal() {
    document.getElementById('bulkCsvTextarea').value = '';
    document.getElementById('csvFileInput').value = '';
    ui.openModal('bulkImportModal');
  },

  insertSampleCsv() {
    const sample = `code,name,program_code,department_code,semester,credits,type,sequence
BPUT-CSD501,Machine Learning Fundamentals,BTECH,CSD,5,4,CORE,1
BPUT-CSD502,Deep Learning Lab,BTECH,CSD,5,2,LAB,2
BPUT-AERO401,Aerodynamics II,BTECH,AERO,4,4,CORE,1
BPUT-CIV501,Structural Analysis II,BTECH,CIVIL,5,4,CORE,1
BPUT-MBA201,Marketing Strategy & Analytics,MBA,MBA,2,4,CORE,1`;

    document.getElementById('bulkCsvTextarea').value = sample.trim();
  },

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('bulkCsvTextarea').value = e.target.result;
    };
    reader.readAsText(file);
  },

  async submitBulkImport() {
    const text = document.getElementById('bulkCsvTextarea')?.value?.trim();
    if (!text) {
      ui.showToast('Please paste or upload CSV data content.', 'warning');
      return;
    }

    // Parse CSV lines into objects
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      ui.showToast('CSV must include a header and at least one data row.', 'warning');
      return;
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const subjects = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 5) continue;

      const obj = {};
      header.forEach((h, idx) => {
        obj[h] = cols[idx] !== undefined ? cols[idx] : '';
      });

      subjects.push({
        code: obj.code || obj['subject code'],
        name: obj.name || obj['subject name'],
        program_code: obj.program_code || obj.program || 'BTECH',
        department_code: obj.department_code || obj.dept || 'CSE',
        semester: parseInt(obj.semester || '1', 10),
        credits: parseInt(obj.credits || '3', 10),
        type: (obj.type || 'CORE').toUpperCase(),
        sequence: parseInt(obj.sequence || '1', 10)
      });
    }

    if (!subjects.length) {
      ui.showToast('No valid subject rows found in CSV.', 'error');
      return;
    }

    try {
      const res = await api.post('/registration/admin/subjects/bulk', { subjects });
      if (res && res.data) {
        ui.showToast(`Bulk Import successful! ${res.data.count} subjects imported/updated.`, 'success');
        ui.closeModal('bulkImportModal');
        await this.loadSubjects();
      } else {
        ui.showToast(res.message || 'Import failed.', 'error');
      }
    } catch (e) {
      ui.showToast(e.message || 'Bulk import failed.', 'error');
    }
  }
};

