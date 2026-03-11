let data = {
  inputs: {},
  skills: [],
  entries: { exp: [], edu: [], cert: [] }
};

const entryConfig = {
  exp: {
    fields: [
      { id: 'title', label: 'المسمى الوظيفي (Job Title)', placeholder: 'Full Stack Developer', span: 2 },
      { id: 'company', label: 'الشركة (Company)', placeholder: 'Tech Solutions Inc.' },
      { id: 'location', label: 'الموقع (Location)', placeholder: 'Amman, Jordan' },
      { id: 'from', label: 'من (تاريخ)', placeholder: 'Jan 2021' },
      { id: 'to', label: 'إلى (أو Present)', placeholder: 'Present' },
      { id: 'desc', label: 'الإنجازات والمهام (ابدأ كل سطر بـ • للترتيب المقطعي)', placeholder: '• Developed scalable microservices using Node.js...\n• Improved database query response time by 40%...', type: 'textarea', span: 2 }
    ]
  },
  edu: {
    fields: [
      { id: 'degree', label: 'الدرجة العلمية (Degree)', placeholder: 'BSc. in Software Engineering', span: 2 },
      { id: 'school', label: 'الجامعة (University)', placeholder: 'University of Jordan' },
      { id: 'location', label: 'الموقع', placeholder: 'Amman, Jordan' },
      { id: 'from', label: 'سنة البدء', placeholder: '2016' },
      { id: 'to', label: 'سنة التخرج', placeholder: '2020' }
    ]
  },
  cert: {
    fields: [
      { id: 'name', label: 'اسم الشهادة', placeholder: 'AWS Certified Developer', span: 2 },
      { id: 'org', label: 'الجهة المانحة', placeholder: 'Amazon Web Services' },
      { id: 'date', label: 'تاريخ الإصدار', placeholder: '2023' }
    ]
  }
};

function loadData() {
  const saved = localStorage.getItem('cvBuilderData');
  if (saved) {
    try { data = JSON.parse(saved); } catch (e) { console.error(e); }
  }
  
  ['fname','lname','jobtitle','email','phone','location','linkedin','summary'].forEach(id => {
    if (document.getElementById(id) && data.inputs[id]) {
      document.getElementById(id).value = data.inputs[id];
    }
  });

  ['exp','edu','cert'].forEach(renderEntries);
  renderSkills();
  updateCV();
}

function saveAndUpdate() {
  ['fname','lname','jobtitle','email','phone','location','linkedin','summary'].forEach(id => {
    data.inputs[id] = document.getElementById(id)?.value.trim() || '';
  });

  ['exp','edu','cert'].forEach(type => {
    data.entries[type].forEach(entry => {
      entryConfig[type].fields.forEach(f => {
        const el = document.getElementById(`${type}-${entry.id}-${f.id}`);
        if (el) entry.data[f.id] = el.value; 
      });
    });
  });

  localStorage.setItem('cvBuilderData', JSON.stringify(data));
  updateCV();
}

function clearData() {
  if (!confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) return;
  localStorage.removeItem('cvBuilderData');
  location.reload();
}

function addEntry(type) {
  data.entries[type].push({ id: Date.now(), data: {} });
  renderEntries(type);
  saveAndUpdate();
}

function removeEntry(type, id) {
  data.entries[type] = data.entries[type].filter(e => e.id !== id);
  renderEntries(type);
  saveAndUpdate();
}

function renderEntries(type) {
  const container = document.getElementById(type + '-list');
  container.innerHTML = '';
  
  data.entries[type].forEach(entry => {
    const config = entryConfig[type];
    const block = document.createElement('div');
    block.className = 'entry-block';

    let fieldsHTML = '<div class="form-row" style="margin-bottom:0">';
    config.fields.forEach(f => {
      const spanClass = f.span === 2 ? 'full' : '';
      const val = entry.data[f.id] || '';
      const elem = f.type === 'textarea'
        ? `<textarea id="${type}-${entry.id}-${f.id}" placeholder="${f.placeholder}" dir="ltr" oninput="saveAndUpdate()">${val}</textarea>`
        : `<input type="text" id="${type}-${entry.id}-${f.id}" placeholder="${f.placeholder}" dir="ltr" value="${val}" oninput="saveAndUpdate()">`;
      fieldsHTML += `<div class="form-group ${spanClass}"><label>${f.label}</label>${elem}</div>`;
    });
    fieldsHTML += '</div>';

    block.innerHTML = `<button class="remove-btn" onclick="removeEntry('${type}', ${entry.id})" title="حذف">✕</button>${fieldsHTML}`;
    container.appendChild(block);
  });
}

function addSkill() {
  const input = document.getElementById('skill-input');
  const val = input.value.trim();
  if (!val || data.skills.includes(val)) return;
  data.skills.push(val);
  input.value = '';
  renderSkills();
  saveAndUpdate();
}

function removeSkill(skill) {
  data.skills = data.skills.filter(s => s !== skill);
  renderSkills();
  saveAndUpdate();
}

function renderSkills() {
  const list = document.getElementById('skills-list');
  list.innerHTML = data.skills.map(s => `
    <div class="skill-tag">
      ${s} <span class="del" onclick="removeSkill('${s}')">×</span>
    </div>
  `).join('');
}

function formatDesc(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(l => l.trim() !== '');
  let html = '<ul>';
  lines.forEach(line => {
    let cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    if(cleanLine) html += `<li>${cleanLine}</li>`;
  });
  html += '</ul>';
  return html;
}

function updateCV() {
  const i = data.inputs;
  const name = `${i.fname || ''} ${i.lname || ''}`.trim();
  
  if (!name && !i.jobtitle && !i.summary && data.entries.exp.length === 0) {
    document.getElementById('cv-output').innerHTML = `
      <div class="cv-empty">
        <div class="cv-empty-icon">📄</div>
        <h2>Your CV Preview</h2>
        <p>Start filling the form to see the magic happen.</p>
      </div>`;
    return;
  }

  let html = '';

  html += `<div class="cv-header">`;
  if (name) html += `<div class="cv-name">${name}</div>`;
  if (i.jobtitle) html += `<div class="cv-title">${i.jobtitle}</div>`;
  
  let contacts = [];
  if (i.email) contacts.push(`<span><a href="mailto:${i.email}">${i.email}</a></span>`);
  if (i.phone) contacts.push(`<span><a href="tel:${i.phone.replace(/\s+/g, '')}">${i.phone}</a></span>`);
  if (i.location) contacts.push(`<span>${i.location}</span>`);
  if (i.linkedin) {
    const cleanLink = i.linkedin.replace(/^https?:\/\//, '');
    contacts.push(`<span><a href="https://${cleanLink}" target="_blank">${cleanLink}</a></span>`);
  }
  if (contacts.length) html += `<div class="cv-contact">${contacts.join('')}</div>`;
  html += `</div>`;

  if (i.summary) {
    html += `<div class="cv-section">
      <div class="cv-section-title">Professional Summary</div>
      <div class="cv-summary">${i.summary.replace(/\n/g, '<br>')}</div>
    </div>`;
  }

  const exps = data.entries.exp.filter(e => e.data.title || e.data.company);
  if (exps.length) {
    html += `<div class="cv-section"><div class="cv-section-title">Work Experience</div>`;
    exps.forEach(e => {
      const d = e.data;
      const dateStr = [d.from, d.to].filter(Boolean).join(' – ');
      html += `<div class="cv-item">
        <div class="cv-item-header">
          <span class="cv-item-title">${d.title || 'Untitled Position'}</span>
          <span class="cv-item-date">${dateStr}</span>
        </div>
        ${d.company ? `<div class="cv-item-subtitle"><span>${d.company}</span><span>${d.location || ''}</span></div>` : ''}
        ${d.desc ? `<div class="cv-item-desc">${formatDesc(d.desc)}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  const edus = data.entries.edu.filter(e => e.data.degree || e.data.school);
  if (edus.length) {
    html += `<div class="cv-section"><div class="cv-section-title">Education</div>`;
    edus.forEach(e => {
      const d = e.data;
      const dateStr = [d.from, d.to].filter(Boolean).join(' – ');
      html += `<div class="cv-item" style="margin-bottom:10px">
        <div class="cv-item-header">
          <span class="cv-item-title">${d.school || 'Unknown Institution'}${d.location ? ', ' + d.location : ''}</span>
          <span class="cv-item-date">${dateStr}</span>
        </div>
        <div class="cv-item-subtitle" style="color:#111827; font-weight:normal;">${d.degree || ''}</div>
      </div>`;
    });
    html += `</div>`;
  }

  if (data.skills.length) {
    html += `<div class="cv-section"><div class="cv-section-title">Skills</div>`;
    html += `<div class="cv-skills-container">${data.skills.join(' • ')}</div>`;
    html += `</div>`;
  }

  const certs = data.entries.cert.filter(e => e.data.name);
  if (certs.length) {
    html += `<div class="cv-section"><div class="cv-section-title">Certifications</div>`;
    certs.forEach(e => {
      const d = e.data;
      html += `<div class="cv-item" style="margin-bottom:8px">
        <div class="cv-item-header" style="margin-bottom:0">
          <span class="cv-item-title" style="font-weight:600;">${d.name}</span>
          <span class="cv-item-date">${d.date || ''}</span>
        </div>
        ${d.org ? `<div class="cv-item-subtitle" style="font-weight:normal;">${d.org}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  document.getElementById('cv-output').innerHTML = html;
}

window.onload = loadData;