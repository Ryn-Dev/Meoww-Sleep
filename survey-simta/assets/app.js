/* ============================================================
   Kuesioner Kepuasan Layanan SIMTA — Logika Form
   Sistem Informasi Manajemen Tugas Akhir · Politeknik IDN Bogor
   Target Evaluasi: https://simta.politeknikidn.id
   Tanpa framework, tanpa build step, vanilla modern JavaScript.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.CONFIG || {};
  var DATA = window.SURVEY || {};
  var VERSION = DATA.version || CFG.VERSION || 'v1';
  var WEB_APP_URL = String(CFG.WEB_APP_URL || '').trim();

  var DRAFT_KEY = 'simta_survey_draft_' + VERSION;
  var QUEUE_KEY = 'simta_survey_queue_' + VERSION;
  var DONE_KEY = 'simta_survey_done_' + VERSION;
  var THEME_KEY = 'simta_theme';

  var stage = document.getElementById('stage');
  var btnBack = document.getElementById('btnBack');
  var btnNext = document.getElementById('btnNext');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var progressLabel = document.getElementById('progressLabel');
  var toastEl = document.getElementById('toast');

  var state = {
    index: 0,
    data: blank(),
    startedAt: Date.now(),
    submissionId: '',
    busy: false
  };

  var saveTimer = null;
  var toastTimer = null;
  var isFlushing = false;

  /* ---------- Util ---------- */
  function blank() {
    return {
      consent: false,
      peran: '',
      nama: '',
      nim: '',
      kode_prodi: '',
      prodi: '',
      pengalaman_ta: '',
      frekuensi_akses: '',
      perangkat: '',
      Z1: '',
      Z2: '',
      Z3: ''
    };
  }

  function isValidInt(val, min, max) {
    if (val === '' || val === null || typeof val === 'undefined' || typeof val === 'boolean') {
      return false;
    }
    var n = Number(val);
    return Number.isInteger(n) && n >= min && n <= max;
  }

  function prodiByKode(kode) {
    var list = CFG.PRODI || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].kode) === String(kode)) return list[i];
    }
    return null;
  }

  function checkWebAppUrl(url) {
    if (!url) {
      return {
        ok: false,
        empty: true,
        message: 'Endpoint belum dikonfigurasi. Isi WEB_APP_URL di assets/config.js dengan URL /exec dari Google Apps Script.'
      };
    }
    if (/docs\.google\.com\/spreadsheets/i.test(url)) {
      return {
        ok: false,
        empty: false,
        message: 'WEB_APP_URL berisi tautan Google Spreadsheet, bukan Web App Apps Script. Salin Web app URL yang berakhiran /exec dari menu Deploy → Manage deployments.'
      };
    }
    if (/script\.google\.com/i.test(url) && !/\/exec(?:[?#].*)?$/i.test(url)) {
      return {
        ok: false,
        empty: false,
        message: 'WEB_APP_URL Apps Script harus berakhiran /exec (bukan /dev atau /edit). Salin Web app URL dari menu Deploy → Manage deployments.'
      };
    }
    if (!/^https?:\/\//i.test(url)) {
      return {
        ok: false,
        empty: false,
        message: 'Format WEB_APP_URL tidak valid. Gunakan URL lengkap yang diawali https:// dan berakhiran /exec.'
      };
    }
    return { ok: true, url: url };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function roleById(id) {
    if (!DATA.roles) return null;
    for (var i = 0; i < DATA.roles.length; i++) {
      if (DATA.roles[i].id === id) return DATA.roles[i];
    }
    return null;
  }

  function allItems(role) {
    var out = [];
    if (!role || !role.sections) return out;
    role.sections.forEach(function (s) {
      s.items.forEach(function (it) { out.push(it); });
    });
    return out;
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = '<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><span class="toast__text">' + esc(message) + '</span>';
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  function newSubmissionId() {
    return 'simta-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* ---------- Steps ---------- */
  function buildSteps() {
    var steps = [
      { type: 'intro' },
      { type: 'role' },
      { type: 'identity' },
      { type: 'profile' }
    ];
    var role = roleById(state.data.peran);
    if (role) {
      role.sections.forEach(function (section) {
        steps.push({ type: 'section', section: section, role: role });
      });
      steps.push({ type: 'open', role: role });
    }
    steps.push({ type: 'closing' });
    return steps;
  }

  function itemOffset(role, section) {
    var offset = 0;
    for (var i = 0; i < role.sections.length; i++) {
      if (role.sections[i] === section) return offset;
      offset += role.sections[i].items.length;
    }
    return offset;
  }

  /* ---------- Icons ---------- */
  var icons = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    student: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
    lecturer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m8 11 3-3 2 2 3-3"/></svg>',
    adminProdi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>',
    adminPusat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
  };

  function roleIcon(id) {
    if (id === 'mahasiswa') return icons.student;
    if (id === 'dosen') return icons.lecturer;
    if (id === 'admin_prodi') return icons.adminProdi;
    return icons.adminPusat;
  }

  /* ---------- Renderers ---------- */
  function renderIntro() {
    var done = false;
    try { done = Boolean(localStorage.getItem(DONE_KEY)); } catch (e) { /* ignore */ }

    return '' +
      '<div class="hero">' +
        '<span class="eyebrow">Evaluasi Layanan SIMTA · Politeknik IDN</span>' +
        '<h1>Bagaimana pengalaman Anda memakai Platform SIMTA?</h1>' +
        '<p class="lead">Kuesioner ini mengukur kemudahan, keandalan, dan efektivitas Sistem Informasi Manajemen Tugas Akhir dalam memfasilitasi pengajuan judul, bimbingan, verifikasi berkas, hingga ujian sidang tugas akhir di Politeknik IDN Bogor.</p>' +
        '<a href="https://simta.politeknikidn.id" target="_blank" rel="noopener noreferrer" class="app-banner">' +
          '<div class="app-banner__main">' +
            '<div class="app-banner__icon">' + icons.adminProdi + '</div>' +
            '<div class="app-banner__info">' +
              '<span class="app-banner__title">Sistem Informasi Manajemen Tugas Akhir (SIMTA)</span>' +
              '<span class="app-banner__url">https://simta.politeknikidn.id</span>' +
            '</div>' +
          '</div>' +
          '<span class="app-banner__cta">Buka SIMTA ' + icons.external + '</span>' +
        '</a>' +
        '<div class="chips">' +
          '<span class="chip">' + icons.clock + ' ± 5–7 menit</span>' +
          '<span class="chip">' + icons.list + ' 12–18 butir evaluasi</span>' +
          '<span class="chip">' + icons.shield + ' Privasi terjaga</span>' +
        '</div>' +
      '</div>' +
      '<div class="facts">' +
        '<div class="fact"><strong>Skala Likert 1–5</strong><span>Menilai fitur secara objektif satu per satu</span></div>' +
        '<div class="fact"><strong>2 pertanyaan terbuka</strong><span>Menyampaikan kendala nyata &amp; ide saran</span></div>' +
        '<div class="fact"><strong>Tersimpan otomatis</strong><span>Draf jawaban dicadangkan di peramban</span></div>' +
      '</div>' +
      '<div class="notice">' +
        '<strong>Informasi Penggunaan Data:</strong> Data dan tanggapan yang Anda masukkan hanya dipergunakan untuk keperluan evaluasi serta peningkatan mutu pelayanan platform SIMTA. Hasil disajikan dalam bentuk agregat rata-rata.' +
      '</div>' +
      '<label class="consent">' +
        '<input type="checkbox" name="consent"' + (state.data.consent ? ' checked' : '') + '>' +
        '<span>Saya sudah membaca keterangan di atas dan bersedia mengisi kuesioner evaluasi ini.</span>' +
      '</label>' +
      (done ? '<p class="small muted" style="margin-top:14px">Terima kasih atas partisipasi Anda sebelumnya. Anda tetap dapat mengisi kembali apabila ingin menyampaikan masukan terbaru mengenai SIMTA.</p>' : '');
  }

  function renderRole() {
    var selected = roleById(state.data.peran);
    var cards = DATA.roles.map(function (r) {
      var isChecked = state.data.peran === r.id;
      return '' +
        '<label class="role' + (isChecked ? ' is-selected' : '') + '">' +
          '<input type="radio" name="peran" value="' + esc(r.id) + '"' + (isChecked ? ' checked' : '') + '>' +
          '<span class="role__body">' +
            '<span class="role__icon">' + roleIcon(r.id) + '</span>' +
            '<span class="role__title">' + esc(r.label) + '</span>' +
            '<span class="role__tag">' + esc(r.tagline) + '</span>' +
            '<span class="role__desc">' + esc(r.description) + '</span>' +
            '<span class="role__meta">' + r.count + ' pernyataan · ' + esc(r.estimate) + '</span>' +
          '</span>' +
        '</label>';
    }).join('');

    return '' +
      '<h1>Pilih peran Anda di SIMTA</h1>' +
      '<p class="lead">Pertanyaan kuesioner disesuaikan dengan alur kerja peran Anda di aplikasi SIMTA. Pilih opsi yang paling menggambarkan aktivitas Anda.</p>' +
      '<div class="roles">' + cards + '</div>' +
      (selected
        ? '<div class="notice" style="margin-top:18px"><strong>' + esc(selected.label) + '</strong> — ' +
          selected.count + ' butir pernyataan, estimasi ' + esc(selected.estimate) + '. Silakan klik tombol <strong>Lanjutkan</strong> di bawah untuk melengkapi identitas Anda.</div>'
        : '');
  }

  function renderIdentity() {
    var role = roleById(state.data.peran);
    var isStudent = role && role.id === 'mahasiswa';
    var isCentralAdmin = role && role.id === 'admin';
    var needsProdi = !isCentralAdmin;

    var options = (CFG.PRODI || []).map(function (p) {
      var isSelected = String(state.data.kode_prodi) === String(p.kode);
      return '<option value="' + esc(p.kode) + '"' + (isSelected ? ' selected' : '') + '>' +
        esc(p.kode + ' · ' + p.nama) + '</option>';
    }).join('');

    var leadText = isStudent
      ? 'Silakan lengkapi nama lengkap, NIM, dan program studi Anda di Politeknik IDN.'
      : (isCentralAdmin
        ? 'Silakan lengkapi nama lengkap Anda (Administrator membidangi seluruh program studi di kampus).'
        : 'Silakan lengkapi nama lengkap dan program studi homebase / binaan Anda.');

    return '' +
      '<h1>Identitas Responden</h1>' +
      '<p class="lead">' + leadText + '</p>' +
      '<div class="field">' +
        '<label class="field__label" for="fieldNama">Nama Lengkap <span class="field__req">*</span></label>' +
        '<input type="text" id="fieldNama" class="input" name="nama" placeholder="Contoh: ' + (isStudent ? 'Fulan bin Fulan' : 'Dr. Fulan, M.Kom.') + '" value="' + esc(state.data.nama) + '" autocomplete="name">' +
      '</div>' +
      (isStudent
        ? '<div class="field">' +
            '<label class="field__label" for="fieldNim">Nomor Induk Mahasiswa (NIM) <span class="field__req">*</span></label>' +
            '<input type="text" id="fieldNim" class="input" name="nim" placeholder="Contoh: 211011400012" value="' + esc(state.data.nim) + '" inputmode="numeric">' +
          '</div>'
        : '') +
      (needsProdi
        ? '<div class="field">' +
            '<label class="field__label" for="fieldProdi">Program Studi <span class="field__req">*</span></label>' +
            '<select id="fieldProdi" class="select" name="kode_prodi">' +
              '<option value="">-- Pilih Program Studi --</option>' +
              options +
            '</select>' +
          '</div>'
        : '<div class="notice" style="margin-top:20px"><strong>Cakupan Institusi:</strong> Sebagai Administrator (Koordinator TA Pusat), data evaluasi Anda mencakup pengawasan lintas seluruh program studi Politeknik IDN.</div>');
  }

  function renderProfile() {
    var role = roleById(state.data.peran);
    var isStudent = role && role.id === 'mahasiswa';
    var isLecturer = role && role.id === 'dosen';

    var expLegend = isStudent
      ? 'Tahap Tugas Akhir yang Sedang / Pernah Anda Jalani di SIMTA'
      : (isLecturer
        ? 'Fase Bimbingan / Pengujian Tugas Akhir Terbanyak Anda'
        : 'Cakupan Pengelolaan Tugas Akhir Anda di SIMTA');

    var listPengalaman = DATA.pengalaman_ta || [];
    var pengalamanChoices = listPengalaman.map(function (item) {
      var isChecked = state.data.pengalaman_ta === item;
      return '<label class="choice"><input type="radio" name="pengalaman_ta" value="' + esc(item) + '"' + (isChecked ? ' checked' : '') + '><span>' + esc(item) + '</span></label>';
    }).join('');

    var frekuensiChoices = (DATA.frekuensi || []).map(function (item) {
      var isChecked = state.data.frekuensi_akses === item;
      return '<label class="choice"><input type="radio" name="frekuensi_akses" value="' + esc(item) + '"' + (isChecked ? ' checked' : '') + '><span>' + esc(item) + '</span></label>';
    }).join('');

    var perangkatChoices = (DATA.perangkat || []).map(function (item) {
      var isChecked = state.data.perangkat === item;
      return '<label class="choice"><input type="radio" name="perangkat" value="' + esc(item) + '"' + (isChecked ? ' checked' : '') + '><span>' + esc(item) + '</span></label>';
    }).join('');

    return '' +
      '<h1>Profil Penggunaan SIMTA</h1>' +
      '<p class="lead">Informasi ini membantu tim pengembang memetakan karakteristik responden dan pengalaman nyata saat berinteraksi dengan SIMTA.</p>' +
      '<div class="field field--boxed">' +
        '<span class="field__label">' + expLegend + ' <span class="field__req">*</span></span>' +
        '<div class="choices">' + pengalamanChoices + '</div>' +
      '</div>' +
      '<div class="field field--boxed">' +
        '<span class="field__label">Frekuensi Mengakses Aplikasi SIMTA <span class="field__req">*</span></span>' +
        '<div class="choices">' + frekuensiChoices + '</div>' +
      '</div>' +
      '<div class="field field--boxed">' +
        '<span class="field__label">Perangkat Utama yang Digunakan untuk SIMTA <span class="field__req">*</span></span>' +
        '<div class="choices">' + perangkatChoices + '</div>' +
      '</div>';
  }

  function renderScaleOptions(name, currentVal, customScale) {
    var scaleList = customScale || DATA.scale || [];
    return scaleList.map(function (opt) {
      var isChecked = String(currentVal) === String(opt.value);
      return '' +
        '<label class="scale__opt">' +
          '<input type="radio" name="' + esc(name) + '" value="' + esc(opt.value) + '"' + (isChecked ? ' checked' : '') + '>' +
          '<span class="scale__btn">' +
            '<span class="scale__num">' + esc(opt.value) + '</span>' +
            '<span class="scale__short">' + esc(opt.short) + '</span>' +
          '</span>' +
        '</label>';
    }).join('');
  }

  function renderSection(step) {
    var section = step.section;
    var role = step.role;
    var offset = itemOffset(role, section);

    var legendHtml = '' +
      '<div class="scale-legend">' +
        '<span><b>1</b>Sangat Tidak Setuju</span>' +
        '<span><b>2</b>Tidak Setuju</span>' +
        '<span><b>3</b>Netral</span>' +
        '<span><b>4</b>Setuju</span>' +
        '<span><b>5</b>Sangat Setuju</span>' +
      '</div>' +
      '<p class="small muted" style="margin-top:6px;margin-bottom:18px">Pilihlah salah satu opsi angka 1 sampai 5 yang paling mewakili pengalaman Anda pada setiap pernyataan.</p>';

    var itemsHtml = section.items.map(function (it, i) {
      var num = offset + i + 1;
      var curVal = state.data[it.id];
      return '' +
        '<fieldset class="q" data-id="' + esc(it.id) + '">' +
          '<legend>' +
            '<span class="q__code">' + esc(it.id) + '</span>' +
            '<span>' + num + '. ' + esc(it.text) + '</span>' +
          '</legend>' +
          '<div class="scale">' + renderScaleOptions(it.id, curVal) + '</div>' +
        '</fieldset>';
    }).join('');

    return '' +
      '<span class="eyebrow">Evaluasi Peran · ' + esc(role.label) + '</span>' +
      '<h2>' + esc(section.title) + '</h2>' +
      (section.desc ? '<p class="lead">' + esc(section.desc) + '</p>' : '') +
      legendHtml +
      '<div class="questions">' + itemsHtml + '</div>';
  }

  function renderOpen(step) {
    var role = step.role;
    var list = role.open || [];
    var fields = list.map(function (q) {
      return '' +
        '<div class="field field--boxed">' +
          '<label class="field__label" for="open_' + esc(q.id) + '">' + esc(q.text) + ' <span class="muted">(opsional)</span></label>' +
          (q.hint ? '<p class="small muted" style="margin-bottom:10px">' + esc(q.hint) + '</p>' : '') +
          '<textarea id="open_' + esc(q.id) + '" class="textarea" name="' + esc(q.id) + '" placeholder="Tuliskan pengalaman, kritik, atau saran Anda di sini...">' + esc(state.data[q.id] || '') + '</textarea>' +
        '</div>';
    }).join('');

    return '' +
      '<span class="eyebrow">Umpan Balik Kualitatif · ' + esc(role.label) + '</span>' +
      '<h2>Masukan Kualitatif Penggunaan SIMTA</h2>' +
      '<p class="lead">Ceritakan hal-hal yang paling berkesan atau kendala yang Anda alami saat menggunakan platform SIMTA. Masukan Anda sangat berharga bagi peningkatan versi berikutnya.</p>' +
      fields;
  }

  function renderClosing() {
    var npsButtons = [];
    for (var i = 0; i <= 10; i++) {
      var isChecked = String(state.data.Z2) === String(i);
      npsButtons.push(
        '<label class="nps__opt">' +
          '<input type="radio" name="Z2" value="' + i + '"' + (isChecked ? ' checked' : '') + '>' +
          '<span class="nps__btn">' + i + '</span>' +
        '</label>'
      );
    }

    return '' +
      '<h1>Evaluasi Akhir &amp; Rekomendasi SIMTA</h1>' +
      '<p class="lead">Dua pertanyaan penutup berikut mengukur kepuasan umum Anda terhadap SIMTA dan kecenderungan merekomendasikan platform ini.</p>' +
      '<fieldset class="q" data-id="Z1">' +
        '<legend>' +
          '<span class="q__code">Z1</span>' +
          '<span>Secara keseluruhan, seberapa puaskah Anda terhadap mutu dan keandalan sistem SIMTA saat ini? <span class="field__req">*</span></span>' +
        '</legend>' +
        '<div class="scale">' + renderScaleOptions('Z1', state.data.Z1, DATA.satisfaction) + '</div>' +
      '</fieldset>' +
      '<fieldset class="q" data-id="Z2">' +
        '<legend>' +
          '<span class="q__code">Z2</span>' +
          '<span>Seberapa besar kemungkinan Anda merekomendasikan platform SIMTA kepada rekan mahasiswa / dosen di Politeknik IDN? (Skala 0 = Sangat Tidak Mungkin, 10 = Sangat Mungkin) <span class="field__req">*</span></span>' +
        '</legend>' +
        '<div class="nps">' + npsButtons.join('') + '</div>' +
        '<div class="nps-legend"><span>0 – Sangat tidak mungkin</span><span>10 – Sangat mungkin</span></div>' +
      '</fieldset>' +
      '<div class="field field--boxed">' +
        '<label class="field__label" for="fieldZ3">Pesan, Kesan, atau Harapan Tambahan untuk Pengembangan SIMTA <span class="muted">(opsional)</span></label>' +
        '<textarea id="fieldZ3" class="textarea" name="Z3" placeholder="Sampaikan saran, harapan fitur baru (misal integrasi WhatsApp otomatis, notifikasi push, kalender sidang interaktif, dll)...">' + esc(state.data.Z3 || '') + '</textarea>' +
      '</div>';
  }

  /* ---------- Validation ---------- */
  function clearErrors() {
    var errors = stage.querySelectorAll('.is-invalid');
    for (var i = 0; i < errors.length; i++) {
      errors[i].classList.remove('is-invalid');
    }
    var alerts = stage.querySelectorAll('.alert');
    for (var j = 0; j < alerts.length; j++) {
      alerts[j].remove();
    }
  }

  function markInvalid(el, message) {
    if (!el) return;
    el.classList.add('is-invalid');
    if (message) {
      var box = document.createElement('div');
      box.className = 'alert';
      box.innerHTML = icons.alert + '<span>' + esc(message) + '</span>';
      el.parentNode.insertBefore(box, el.nextSibling);
    }
  }

  function validateCurrent(step) {
    clearErrors();
    var firstBad = null;

    if (step.type === 'intro') {
      if (!state.data.consent) {
        var consentBox = stage.querySelector('.consent');
        markInvalid(consentBox, 'Centang persetujuan terlebih dahulu untuk melanjutkan pengisian.');
        return false;
      }
      return true;
    }

    if (step.type === 'role') {
      if (!state.data.peran) {
        var rolesWrap = stage.querySelector('.roles');
        markInvalid(rolesWrap, 'Silakan pilih salah satu peran Anda di SIMTA.');
        return false;
      }
      return true;
    }

    if (step.type === 'identity') {
      var role = roleById(state.data.peran);
      var isStudent = role && role.id === 'mahasiswa';
      var isCentralAdmin = role && role.id === 'admin';

      if (!state.data.nama || !state.data.nama.trim()) {
        var fNama = stage.querySelector('[name="nama"]').closest('.field');
        markInvalid(fNama, 'Nama lengkap wajib diisi.');
        firstBad = firstBad || fNama;
      }

      if (isStudent && (!state.data.nim || !state.data.nim.trim())) {
        var fNim = stage.querySelector('[name="nim"]').closest('.field');
        markInvalid(fNim, 'NIM wajib diisi untuk peran Mahasiswa.');
        firstBad = firstBad || fNim;
      }

      if (!isCentralAdmin && !state.data.kode_prodi) {
        var fProdi = stage.querySelector('[name="kode_prodi"]').closest('.field');
        markInvalid(fProdi, 'Program studi wajib dipilih.');
        firstBad = firstBad || fProdi;
      }

      if (firstBad) {
        firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    }

    if (step.type === 'profile') {
      if (!state.data.pengalaman_ta) {
        var fExp = stage.querySelector('[name="pengalaman_ta"]').closest('.field');
        markInvalid(fExp, 'Pilih salah satu tahap tugas akhir yang sedang atau pernah Anda jalani.');
        firstBad = firstBad || fExp;
      }
      if (!state.data.frekuensi_akses) {
        var fFreq = stage.querySelector('[name="frekuensi_akses"]').closest('.field');
        markInvalid(fFreq, 'Pilih seberapa sering Anda mengakses aplikasi SIMTA.');
        firstBad = firstBad || fFreq;
      }
      if (!state.data.perangkat) {
        var fDev = stage.querySelector('[name="perangkat"]').closest('.field');
        markInvalid(fDev, 'Pilih perangkat utama yang Anda gunakan.');
        firstBad = firstBad || fDev;
      }
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    }

    if (step.type === 'section') {
      step.section.items.forEach(function (it) {
        var val = state.data[it.id];
        if (!isValidInt(val, 1, 5)) {
          var qEl = stage.querySelector('.q[data-id="' + it.id + '"]');
          markInvalid(qEl, null);
          firstBad = firstBad || qEl;
        }
      });
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Mohon isi semua pernyataan (skala 1–5) pada halaman ini.');
        return false;
      }
      return true;
    }

    if (step.type === 'open') {
      return true; // opsional
    }

    if (step.type === 'closing') {
      if (!isValidInt(state.data.Z1, 1, 5)) {
        var qZ1 = stage.querySelector('.q[data-id="Z1"]');
        markInvalid(qZ1, 'Silakan beri nilai kepuasan keseluruhan (skala 1–5).');
        firstBad = firstBad || qZ1;
      }
      if (!isValidInt(state.data.Z2, 0, 10)) {
        var qZ2 = stage.querySelector('.q[data-id="Z2"]');
        markInvalid(qZ2, 'Silakan pilih skor rekomendasi (skala 0–10).');
        firstBad = firstBad || qZ2;
      }
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    }

    return true;
  }

  /* ---------- Storage & Draft ---------- */
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          data: state.data,
          index: state.index,
          startedAt: state.startedAt,
          updatedAt: Date.now()
        }));
      } catch (e) { /* ignore quota */ }
    }, 280);
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      var maxAge = (CFG.DRAFT_TTL_DAYS || 14) * 86400000;
      if (Date.now() - (obj.updatedAt || 0) > maxAge) {
        localStorage.removeItem(DRAFT_KEY);
        return false;
      }
      state.data = Object.assign(blank(), obj.data || {});
      state.index = Number(obj.index) || 0;
      state.startedAt = obj.startedAt || Date.now();

      // Guard pemulihan: jika identitas belum terisi tapi index melompat, kembalikan ke layar identitas
      if (state.index >= 1 && !state.data.consent) {
        state.index = 0;
      } else if (state.index >= 2 && !state.data.peran) {
        state.index = 1;
      } else if (state.index >= 3) {
        var needsIdentity = !state.data.nama || (state.data.peran === 'mahasiswa' && !state.data.nim);
        if (needsIdentity) {
          state.index = 2;
        }
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  function clearDraft() {
    state.data = blank();
    state.index = 0;
    state.startedAt = Date.now();
    state.submissionId = '';
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
  }

  /* ---------- Offline Queue ---------- */
  function getQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function pushQueue(payload) {
    var q = getQueue();
    q.push(payload);
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) { /* ignore */ }
  }

  function flushQueue() {
    if (isFlushing || !navigator.onLine) return;
    var chk = checkWebAppUrl(WEB_APP_URL);
    if (!chk.ok) return;

    var q = getQueue();
    if (!q.length) return;

    isFlushing = true;
    var item = q[0];

    fetch(chk.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(item),
      mode: 'cors'
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function () { return { status: 'success' }; });
      })
      .then(function () {
        var cur = getQueue();
        cur.shift();
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ }
        isFlushing = false;
        if (cur.length) setTimeout(flushQueue, 1000);
      })
      .catch(function () {
        isFlushing = false;
      });
  }

  /* ---------- Render & Navigation ---------- */
  function render() {
    var steps = buildSteps();
    if (state.index >= steps.length) state.index = steps.length - 1;
    if (state.index < 0) state.index = 0;

    var step = steps[state.index];
    var html = '';

    if (step.type === 'intro') html = renderIntro();
    else if (step.type === 'role') html = renderRole();
    else if (step.type === 'identity') html = renderIdentity();
    else if (step.type === 'profile') html = renderProfile();
    else if (step.type === 'section') html = renderSection(step);
    else if (step.type === 'open') html = renderOpen(step);
    else if (step.type === 'closing') html = renderClosing();

    stage.innerHTML = html;

    // Tombol Navigasi
    btnBack.hidden = (state.index === 0);
    var isLast = (state.index === steps.length - 1);
    btnNext.innerHTML = isLast
      ? 'Kirim Jawaban <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
      : 'Lanjutkan <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

    // Progress Bar
    if (progressWrap) progressWrap.hidden = (state.index === 0);
    if (progressLabel) progressLabel.hidden = (state.index === 0);
    var pct = Math.round(((state.index + 1) / steps.length) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = 'Langkah ' + (state.index + 1) + ' dari ' + steps.length;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', String(pct));

    // Scroll ke atas dengan halus
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Form Value Collection ---------- */
  function readInput() {
    var steps = buildSteps();
    var step = steps[state.index];
    if (!step) return;

    if (step.type === 'intro') {
      var c = stage.querySelector('input[name="consent"]');
      state.data.consent = c ? c.checked : false;
    } else if (step.type === 'role') {
      var r = stage.querySelector('input[name="peran"]:checked');
      if (r) state.data.peran = r.value;
    } else if (step.type === 'identity') {
      var namaEl = stage.querySelector('input[name="nama"]');
      if (namaEl) state.data.nama = namaEl.value.trim();

      var nimEl = stage.querySelector('input[name="nim"]');
      if (nimEl) state.data.nim = nimEl.value.trim();

      var prodiEl = stage.querySelector('select[name="kode_prodi"]');
      if (prodiEl) {
        state.data.kode_prodi = prodiEl.value;
        var p = prodiByKode(prodiEl.value);
        state.data.prodi = p ? p.nama : '';
      } else if (state.data.peran === 'admin') {
        state.data.kode_prodi = '-';
        state.data.prodi = 'Seluruh Program Studi (Pusat)';
      }
    } else if (step.type === 'profile') {
      var expEl = stage.querySelector('input[name="pengalaman_ta"]:checked');
      if (expEl) state.data.pengalaman_ta = expEl.value;

      var frEl = stage.querySelector('input[name="frekuensi_akses"]:checked');
      if (frEl) state.data.frekuensi_akses = frEl.value;

      var devEl = stage.querySelector('input[name="perangkat"]:checked');
      if (devEl) state.data.perangkat = devEl.value;
    } else if (step.type === 'section') {
      step.section.items.forEach(function (it) {
        var opt = stage.querySelector('input[name="' + it.id + '"]:checked');
        if (opt) state.data[it.id] = Number(opt.value);
      });
    } else if (step.type === 'open') {
      var openList = (step.role && step.role.open) || [];
      openList.forEach(function (q) {
        var txt = stage.querySelector('textarea[name="' + q.id + '"]');
        if (txt) state.data[q.id] = txt.value.trim();
      });
    } else if (step.type === 'closing') {
      var z1 = stage.querySelector('input[name="Z1"]:checked');
      if (z1) state.data.Z1 = Number(z1.value);

      var z2 = stage.querySelector('input[name="Z2"]:checked');
      if (z2) state.data.Z2 = Number(z2.value);

      var z3 = stage.querySelector('textarea[name="Z3"]');
      if (z3) state.data.Z3 = z3.value.trim();
    }

    scheduleSave();
  }

  /* ---------- Submission ---------- */
  function buildPayload() {
    var role = roleById(state.data.peran);
    var answers = {};
    if (role) {
      allItems(role).forEach(function (it) {
        answers[it.id] = state.data[it.id] || '';
      });
      (role.open || []).forEach(function (q) {
        answers[q.id] = state.data[q.id] || '';
      });
    }

    return {
      submission_id: state.submissionId || (state.submissionId = newSubmissionId()),
      timestamp: new Date().toISOString(),
      duration_seconds: Math.max(1, Math.round((Date.now() - state.startedAt) / 1000)),
      user_agent: navigator.userAgent || '',
      token: CFG.TOKEN || '',
      peran: state.data.peran,
      nama: state.data.nama,
      nim: state.data.nim,
      kode_prodi: state.data.kode_prodi,
      prodi: state.data.prodi,
      pengalaman_ta: state.data.pengalaman_ta,
      frekuensi_akses: state.data.frekuensi_akses,
      perangkat: state.data.perangkat,
      answers: answers,
      Z1: state.data.Z1,
      Z2: state.data.Z2,
      Z3: state.data.Z3
    };
  }

  function setBusy(busy) {
    state.busy = busy;
    btnNext.disabled = busy;
    btnBack.disabled = busy;
    if (busy) {
      btnNext.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Mengirim tanggapan...';
    }
  }

  function submit() {
    if (state.busy) return;
    setBusy(true);

    var payload = buildPayload();
    var chk = checkWebAppUrl(WEB_APP_URL);

    // Tandai selesai di lokal
    try {
      localStorage.setItem(DONE_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }

    if (!chk.ok) {
      // Masukkan ke offline queue jika URL belum siap atau sedang offline
      pushQueue(payload);
      clearDraft();
      var reason = chk.empty ? 'endpoint_empty' : 'endpoint_invalid';
      window.location.href = 'hasil.html?status=queued&id=' + encodeURIComponent(payload.submission_id) + '&reason=' + reason;
      return;
    }

    if (!navigator.onLine) {
      pushQueue(payload);
      clearDraft();
      window.location.href = 'hasil.html?status=queued&id=' + encodeURIComponent(payload.submission_id) + '&reason=offline';
      return;
    }

    // Kirim via CORS fetch
    fetch(chk.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'cors'
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function () { return { status: 'success' }; });
      })
      .then(function (json) {
        clearDraft();
        if (json && json.status === 'success') {
          window.location.href = 'hasil.html?status=sent&id=' + encodeURIComponent(payload.submission_id);
        } else {
          // Tetap redirect dengan indikator unverified jika respon valid diterima
          window.location.href = 'hasil.html?status=unverified&id=' + encodeURIComponent(payload.submission_id);
        }
      })
      .catch(function () {
        // Fallback fetch no-cors untuk menangani redirect Google Apps Script
        fetch(chk.url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        })
          .then(function () {
            clearDraft();
            window.location.href = 'hasil.html?status=sent&id=' + encodeURIComponent(payload.submission_id);
          })
          .catch(function () {
            pushQueue(payload);
            clearDraft();
            window.location.href = 'hasil.html?status=queued&id=' + encodeURIComponent(payload.submission_id) + '&reason=network_error';
          });
      });
  }

  /* ---------- Event Handlers ---------- */
  function onNext() {
    readInput();
    var steps = buildSteps();
    var currentStep = steps[state.index];
    if (!validateCurrent(currentStep)) return;

    if (state.index === steps.length - 1) {
      submit();
    } else {
      state.index++;
      render();
    }
  }

  function onBack() {
    readInput();
    if (state.index > 0) {
      state.index--;
      render();
    }
  }

  function pruneForRole() {
    var current = state.data.peran;
    (DATA.roles || []).forEach(function (r) {
      if (r.id === current) return;
      (r.sections || []).forEach(function (s) {
        (s.items || []).forEach(function (it) { delete state.data[it.id]; });
      });
      (r.open || []).forEach(function (o) { delete state.data[o.id]; });
    });
    if (current !== 'mahasiswa') state.data.nim = '';
    if (current === 'admin') {
      state.data.kode_prodi = '-';
      state.data.prodi = 'Seluruh Program Studi (Pusat)';
    } else if (state.data.kode_prodi === '-') {
      state.data.kode_prodi = '';
      state.data.prodi = '';
    }
  }

  function onInput(e) {
    var target = e.target;
    if (!target) return;

    // Hapus status invalid saat pengguna mulai mengetik
    var parentQ = target.closest('.q');
    if (parentQ) parentQ.classList.remove('is-invalid');
    var parentField = target.closest('.field');
    if (parentField) parentField.classList.remove('is-invalid');
    var parentConsent = target.closest('.consent');
    if (parentConsent) parentConsent.classList.remove('is-invalid');

    // Abaikan input event untuk kontrol pemilihan (ditangani oleh onChange)
    if (target.type === 'radio' || target.type === 'checkbox' || target.tagName === 'SELECT') {
      return;
    }

    readInput();
  }

  function onChange(e) {
    var target = e.target;
    if (!target) return;

    // Hapus status invalid saat pengguna mengubah pilihan
    var parentQ = target.closest('.q');
    if (parentQ) parentQ.classList.remove('is-invalid');
    var parentField = target.closest('.field');
    if (parentField) parentField.classList.remove('is-invalid');
    var parentConsent = target.closest('.consent');
    if (parentConsent) parentConsent.classList.remove('is-invalid');
    var parentRoles = target.closest('.roles');
    if (parentRoles) parentRoles.classList.remove('is-invalid');

    // Pemilihan peran: simpan peran & render ulang halaman peran agar kartu aktif terpilih
    // Tanpa auto-advance agar pengguna tidak melompati langkah pengisian identitas
    if (target.name === 'peran' && target.checked) {
      var oldPeran = state.data.peran;
      state.data.peran = target.value;
      if (oldPeran !== target.value) {
        pruneForRole();
      }
      scheduleSave();
      render();
      return;
    }

    readInput();
  }

  /* ---------- Theme Toggle ---------- */
  function initTheme() {
    var btn = document.getElementById('btnThemeToggle') || document.getElementById('themeToggle');
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }

    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', saved);

    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'light';
        var next = (current === 'dark') ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------- Initializer ---------- */
  function init() {
    initTheme();

    var params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') {
      clearDraft();
      params.delete('reset');
      var qs = params.toString();
      try {
        history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
      } catch (e) { /* ignore */ }
    } else if (loadDraft()) {
      showToast('Draf pengisian sebelumnya berhasil dipulihkan.');
    }

    render();

    btnNext.addEventListener('click', onNext);
    btnBack.addEventListener('click', onBack);
    stage.addEventListener('input', onInput);
    stage.addEventListener('change', onChange);

    // Coba kirim antrean tertunda jika koneksi aktif
    window.addEventListener('online', flushQueue);
    setTimeout(flushQueue, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
