/* ============================================================
   Kuesioner Kepuasan Platform Portofolio IDN — Logika Form
   Politeknik IDN Bogor
   Tanpa framework, tanpa build step.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.CONFIG || {};
  var DATA = window.SURVEY || {};
  var VERSION = DATA.version || CFG.VERSION || 'v1';
  var WEB_APP_URL = String(CFG.WEB_APP_URL || '').trim();

  var DRAFT_KEY = 'portofolio_survey_draft_' + VERSION;
  var QUEUE_KEY = 'portofolio_survey_queue_' + VERSION;
  var DONE_KEY = 'portofolio_survey_done_' + VERSION;
  var THEME_KEY = 'portofolio_theme';

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
      pengalaman_portofolio: '',
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
    for (var i = 0; i < DATA.roles.length; i++) {
      if (DATA.roles[i].id === id) return DATA.roles[i];
    }
    return null;
  }

  function allItems(role) {
    var out = [];
    role.sections.forEach(function (s) { s.items.forEach(function (it) { out.push(it); }); });
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
    return 'porto-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
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
      role.sections.forEach(function (section) { steps.push({ type: 'section', section: section, role: role }); });
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
    mentor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m8 11 3-3 2 2 3-3"/></svg>',
    leader: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
  };

  function roleIcon(id) {
    if (id === 'mahasiswa') return icons.student;
    if (id === 'dosen') return icons.mentor;
    return icons.leader;
  }

  /* ---------- Renderers ---------- */
  function renderIntro() {
    var done = false;
    try { done = Boolean(localStorage.getItem(DONE_KEY)); } catch (e) { /* ignore */ }

    return '' +
      '<div class="hero">' +
        '<span class="eyebrow">Evaluasi Layanan Portofolio · Politeknik IDN</span>' +
        '<h1>Bagaimana pengalaman Anda memakai Platform Portofolio IDN?</h1>' +
        '<p class="lead">Kuesioner ini mengevaluasi kemudahan, keandalan, dan efektivitas platform pameran portofolio karya mahasiswa di lingkungan Politeknik IDN Bogor.</p>' +
        '<a href="https://portofolio.politeknikidn.id" target="_blank" rel="noopener noreferrer" class="app-banner">' +
          '<div class="app-banner__main">' +
            '<div class="app-banner__icon">' + icons.leader + '</div>' +
            '<div class="app-banner__info">' +
              '<span class="app-banner__title">Platform Portofolio Karya Mahasiswa IDN</span>' +
              '<span class="app-banner__url">https://portofolio.politeknikidn.id</span>' +
            '</div>' +
          '</div>' +
          '<span class="app-banner__cta">Buka Portofolio ' + icons.external + '</span>' +
        '</a>' +
        '<div class="chips">' +
          '<span class="chip">' + icons.clock + ' ± 5–7 menit</span>' +
          '<span class="chip">' + icons.list + ' 13–18 pernyataan</span>' +
          '<span class="chip">' + icons.shield + ' Privasi terjaga</span>' +
        '</div>' +
      '</div>' +
      '<div class="facts">' +
        '<div class="fact"><strong>Skala Likert 1–5</strong><span>Menilai fitur secara objektif satu per satu</span></div>' +
        '<div class="fact"><strong>2 pertanyaan terbuka</strong><span>Menyampaikan kendala nyata &amp; ide saran</span></div>' +
        '<div class="fact"><strong>Tersimpan otomatis</strong><span>Draf jawaban dicadangkan di peramban</span></div>' +
      '</div>' +
      '<div class="notice">' +
        '<strong>Informasi Penggunaan Data:</strong> Data dan tanggapan yang Anda masukkan hanya dipergunakan untuk keperluan evaluasi serta peningkatan mutu layanan platform Portofolio IDN. Hasil disajikan dalam bentuk agregat rata-rata.' +
      '</div>' +
      '<label class="consent">' +
        '<input type="checkbox" name="consent"' + (state.data.consent ? ' checked' : '') + '>' +
        '<span>Saya sudah membaca keterangan di atas dan bersedia mengisi kuesioner evaluasi ini.</span>' +
      '</label>' +
      (done ? '<p class="small muted" style="margin-top:14px">Terima kasih atas partisipasi Anda sebelumnya. Anda tetap dapat mengisi kembali apabila ingin menyampaikan masukan terbaru mengenai platform portofolio.</p>' : '');
  }

  function renderRole() {
    var selected = roleById(state.data.peran);
    var cards = DATA.roles.map(function (r) {
      return '' +
        '<label class="role">' +
          '<input type="radio" name="peran" value="' + esc(r.id) + '"' + (state.data.peran === r.id ? ' checked' : '') + '>' +
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
      '<h1>Pilih peran Anda</h1>' +
      '<p class="lead">Jenis pertanyaan disesuaikan dengan peran. Pilih opsi yang paling menggambarkan aktivitas Anda di platform Portofolio IDN.</p>' +
      '<div class="roles">' + cards + '</div>' +
      (selected
        ? '<div class="notice" style="margin-top:18px"><strong>' + esc(selected.label) + '</strong> — ' +
          selected.count + ' butir pernyataan, estimasi ' + esc(selected.estimate) + '.</div>'
        : '');
  }

  function renderIdentity() {
    var role = roleById(state.data.peran);
    var isStudent = role && role.id === 'mahasiswa';
    var isLeader = role && role.id === 'admin';
    var needsProdi = !isLeader;
    var options = (CFG.PRODI || []).map(function (p) {
      var isSelected = String(state.data.kode_prodi) === String(p.kode);
      return '<option value="' + esc(p.kode) + '"' + (isSelected ? ' selected' : '') + '>' +
        esc(p.kode + ' · ' + p.nama) + '</option>';
    }).join('');

    var leadText = isStudent
      ? 'Silakan lengkapi nama, NIM, dan program studi Anda di Politeknik IDN.'
      : (isLeader
        ? 'Silakan isi nama lengkap Anda.'
        : 'Silakan lengkapi nama dan program studi Anda di Politeknik IDN.');

    return '' +
      '<h1>Identitas Responden</h1>' +
      '<p class="lead">' + leadText + '</p>' +
      '<div class="notice" style="margin-top:16px">' +
        'Data identitas hanya dipergunakan untuk pengelompokan analisis dan evaluasi mutu layanan portofolio kampus.' +
      '</div>' +
      '<div class="field">' +
        '<label class="field__label" for="f-nama">Nama lengkap<span class="field__req">*</span></label>' +
        '<input class="input" id="f-nama" name="nama" type="text" autocomplete="name" placeholder="Nama lengkap sesuai akun kampus" value="' + esc(state.data.nama) + '">' +
      '</div>' +
      (isStudent
        ? '<div class="field">' +
            '<label class="field__label" for="f-nim">NIM (Nomor Induk Mahasiswa)<span class="field__req">*</span></label>' +
            '<input class="input" id="f-nim" name="nim" type="text" inputmode="numeric" autocomplete="off" placeholder="Contoh: 202401001" value="' + esc(state.data.nim) + '">' +
            '<p class="field__hint">Pastikan NIM ditulis lengkap sesuai akun portofolio Anda.</p>' +
          '</div>'
        : '') +
      (needsProdi
        ? '<div class="field">' +
            '<label class="field__label" for="f-prodi">Program Studi / Jurusan<span class="field__req">*</span></label>' +
            '<select class="select" id="f-prodi" name="prodi">' +
              '<option value="">Pilih Program Studi Politeknik IDN</option>' + options +
            '</select>' +
          '</div>'
        : '');
  }

  function choicesHTML(name, options, current) {
    return '<div class="choices">' + options.map(function (opt) {
      return '' +
        '<label class="choice">' +
          '<input type="radio" name="' + name + '" value="' + esc(opt) + '"' + (current === opt ? ' checked' : '') + '>' +
          '<span>' + esc(opt) + '</span>' +
        '</label>';
    }).join('') + '</div>';
  }

  function renderProfile() {
    return '' +
      '<h1>Pengalaman &amp; Kebiasaan Akses</h1>' +
      '<p class="lead">Tiga pertanyaan pengantar untuk memahami konteks penggunaan platform Portofolio IDN Anda.</p>' +
      '<div class="field">' +
        '<span class="field__label">Berapa banyak portofolio yang telah Anda unggah / tinjau?<span class="field__req">*</span></span>' +
        choicesHTML('pengalaman_portofolio', DATA.pengalaman_portofolio, state.data.pengalaman_portofolio) +
      '</div>' +
      '<div class="field">' +
        '<span class="field__label">Berapa rata-rata frekuensi mengakses platform Portofolio IDN?<span class="field__req">*</span></span>' +
        choicesHTML('frekuensi_akses', DATA.frekuensi, state.data.frekuensi_akses) +
      '</div>' +
      '<div class="field">' +
        '<span class="field__label">Perangkat utama yang Anda gunakan saat mengakses platform<span class="field__req">*</span></span>' +
        choicesHTML('perangkat', DATA.perangkat, state.data.perangkat) +
      '</div>';
  }

  function renderScaleLegend() {
    return '<div class="scale-legend">' + DATA.scale.map(function (s) {
      return '<span><b>' + s.value + '</b>' + esc(s.label) + '</span>';
    }).join('') + '</div>';
  }

  function renderItems(items) {
    return items.map(function (item) {
      var checkedVal = isValidInt(state.data[item.id], 1, 5) ? Number(state.data[item.id]) : -1;
      var options = DATA.scale.map(function (s) {
        return '' +
          '<label class="scale__opt">' +
            '<input type="radio" name="' + esc(item.id) + '" value="' + s.value + '"' +
              (checkedVal === s.value ? ' checked' : '') +
              ' aria-label="' + s.value + ' — ' + esc(s.label) + '">' +
            '<span class="scale__btn">' +
              '<span class="scale__num">' + s.value + '</span>' +
              '<span class="scale__short">' + esc(s.short) + '</span>' +
            '</span>' +
          '</label>';
      }).join('');

      return '' +
        '<fieldset class="q" data-q="' + esc(item.id) + '">' +
          '<legend>' +
            '<span class="q__code">' + esc(item.id) + '</span>' +
            '<span>' + esc(item.text) + '</span>' +
          '</legend>' +
          '<div class="scale">' + options + '</div>' +
        '</fieldset>';
    }).join('');
  }

  function renderSection(step) {
    var role = step.role;
    var offset = itemOffset(role, step.section);
    var total = allItems(role).length;
    var from = offset + 1;
    var to = offset + step.section.items.length;

    return '' +
      '<span class="eyebrow">Pernyataan ' + from + '–' + to + ' dari ' + total + '</span>' +
      '<h1>' + esc(step.section.title) + '</h1>' +
      '<p class="lead">' + esc(step.section.desc) + '</p>' +
      renderScaleLegend() +
      '<p class="small muted scale-hint">Belum pernah mencoba fiturnya? Pilih Netral (3).</p>' +
      renderItems(step.section.items);
  }

  function renderOpen(step) {
    var role = step.role;
    return '' +
      '<span class="eyebrow">Pertanyaan Terbuka</span>' +
      '<h1>Ceritakan Pengalaman Anda</h1>' +
      '<p class="lead">Bagian ini opsional, namun sangat membantu tim pengembang dalam memahami alasan di balik angka penilaian. Kosongkan jika tidak ada.</p>' +
      role.open.map(function (o) {
        return '<div class="field">' +
          '<label class="field__label" for="f-' + esc(o.id) + '">' + esc(o.text) + '</label>' +
          '<textarea class="textarea" id="f-' + esc(o.id) + '" name="' + esc(o.id) + '" placeholder="' + esc(o.hint || '') + '">' + esc(state.data[o.id] || '') + '</textarea>' +
        '</div>';
      }).join('');
  }

  function renderClosing() {
    var z1 = DATA.closing.Z1;
    var z2 = DATA.closing.Z2;
    var z3 = DATA.closing.Z3;

    var checkedZ1 = isValidInt(state.data.Z1, 1, 5) ? Number(state.data.Z1) : -1;
    var satisfaction = DATA.satisfaction.map(function (s) {
      return '' +
        '<label class="scale__opt">' +
          '<input type="radio" name="Z1" value="' + s.value + '"' + (checkedZ1 === s.value ? ' checked' : '') +
            ' aria-label="' + s.value + ' — ' + esc(s.label) + '">' +
          '<span class="scale__btn">' +
            '<span class="scale__num">' + s.value + '</span>' +
            '<span class="scale__short">' + esc(s.short) + '</span>' +
          '</span>' +
        '</label>';
    }).join('');

    var checkedZ2 = isValidInt(state.data.Z2, 0, 10) ? Number(state.data.Z2) : -1;
    var nps = '';
    for (var n = 0; n <= 10; n++) {
      nps += '' +
        '<label class="nps__opt">' +
          '<input type="radio" name="Z2" value="' + n + '"' + (checkedZ2 === n ? ' checked' : '') +
            ' aria-label="Skor ' + n + ' dari 10">' +
          '<span class="nps__btn">' + n + '</span>' +
        '</label>';
    }

    return '' +
      '<span class="eyebrow">Penutup</span>' +
      '<h1>Evaluasi Keseluruhan</h1>' +
      '<p class="lead">Dua pertanyaan terakhir, lalu tanggapan Anda dapat langsung dikirim ke sistem.</p>' +
      '<fieldset class="q" data-q="Z1">' +
        '<legend><span class="q__code">Z1</span><span>' + esc(z1.text) + '</span></legend>' +
        '<div class="scale-legend">' + DATA.satisfaction.map(function (s) {
          return '<span><b>' + s.value + '</b>' + esc(s.label) + '</span>';
        }).join('') + '</div>' +
        '<div class="scale">' + satisfaction + '</div>' +
      '</fieldset>' +
      '<fieldset class="q" data-q="Z2">' +
        '<legend><span class="q__code">Z2</span><span>' + esc(z2.text) + '</span></legend>' +
        '<p class="field__hint" style="margin-top:6px">' + esc(z2.hint) + '</p>' +
        '<div class="nps">' + nps + '</div>' +
        '<div class="nps-scale"><span>Sangat tidak mungkin (0)</span><span>Sangat mungkin (10)</span></div>' +
      '</fieldset>' +
      '<div class="field">' +
        '<label class="field__label" for="f-Z3">' + esc(z3.text) + '</label>' +
        '<textarea class="textarea" id="f-Z3" name="Z3" placeholder="' + esc(z3.hint) + '">' + esc(state.data.Z3) + '</textarea>' +
      '</div>';
  }

  function renderStep(step) {
    if (step.type === 'intro') return renderIntro();
    if (step.type === 'role') return renderRole();
    if (step.type === 'identity') return renderIdentity();
    if (step.type === 'profile') return renderProfile();
    if (step.type === 'section') return renderSection(step);
    if (step.type === 'open') return renderOpen(step);
    if (step.type === 'closing') return renderClosing();
    return '';
  }

  /* ---------- Chrome ---------- */
  function render(opts) {
    opts = opts || {};
    var steps = buildSteps();
    if (state.index >= steps.length) state.index = steps.length - 1;
    if (state.index < 0) state.index = 0;

    var step = steps[state.index];
    stage.innerHTML = renderStep(step);

    var isIntro = step.type === 'intro';
    progressWrap.hidden = isIntro;
    progressLabel.hidden = isIntro;

    if (!isIntro) {
      var contentSteps = steps.length - 1;
      var current = state.index;
      progressLabel.textContent = 'Langkah ' + current + ' dari ' + contentSteps;
      var pct = Math.round((current / contentSteps) * 100);
      progressBar.style.width = pct + '%';
    }

    btnBack.hidden = state.index === 0;
    setNextLabel(state.index === steps.length - 1, step.type === 'intro');

    if (opts.focus !== false) {
      stage.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }

  function setNextLabel(isLast, isIntro) {
    if (isIntro) {
      btnNext.textContent = 'Mulai Mengisi';
    } else if (isLast) {
      btnNext.textContent = 'Kirim Tanggapan';
    } else {
      btnNext.textContent = 'Lanjut';
    }
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- Validation ---------- */
  function validate(step) {
    var d = state.data;
    function fail(msg, selector) {
      return { ok: false, message: msg, target: selector };
    }

    if (step.type === 'intro') {
      if (!d.consent) return fail('Centang persetujuan di atas untuk melanjutkan pengisian kuesioner.', 'input[name="consent"]');
      return { ok: true };
    }

    if (step.type === 'role') {
      if (!d.peran || !roleById(d.peran)) return fail('Pilih peran Anda di platform Portofolio IDN.', 'input[name="peran"]');
      return { ok: true };
    }

    if (step.type === 'identity') {
      var role = roleById(d.peran);
      if (!String(d.nama || '').trim()) return fail('Nama lengkap wajib diisi.', 'input[name="nama"]');

      if (role && role.id === 'mahasiswa') {
        var cleanNim = String(d.nim || '').trim();
        if (!cleanNim) return fail('NIM wajib diisi untuk mahasiswa.', 'input[name="nim"]');
        if (!/^[0-9A-Za-z.\-_/]{3,30}$/.test(cleanNim)) {
          return fail('Format NIM tidak valid. Gunakan huruf atau angka (3–30 karakter).', 'input[name="nim"]');
        }
      }

      if (role && role.id !== 'admin') {
        if (!d.kode_prodi) return fail('Pilih Program Studi Anda.', 'select[name="prodi"]');
        var foundProdi = prodiByKode(d.kode_prodi);
        if (!foundProdi) return fail('Pilih Program Studi Anda.', 'select[name="prodi"]');
        d.prodi = foundProdi.nama;
      } else {
        d.kode_prodi = '';
        d.prodi = '';
      }
      return { ok: true };
    }

    if (step.type === 'profile') {
      if (!d.pengalaman_portofolio) return fail('Pilih pengalaman portofolio Anda.', 'input[name="pengalaman_portofolio"]');
      if (!d.frekuensi_akses) return fail('Pilih frekuensi akses platform Portofolio IDN.', 'input[name="frekuensi_akses"]');
      if (!d.perangkat) return fail('Pilih perangkat utama yang digunakan.', 'input[name="perangkat"]');
      return { ok: true };
    }

    if (step.type === 'section') {
      var missing = step.section.items.filter(function (it) {
        return !isValidInt(d[it.id], 1, 5);
      });
      if (missing.length) {
        return fail(
          'Masih ada ' + missing.length + ' pernyataan yang belum dinilai. Silakan lengkapi bagian ini.',
          '[data-q="' + missing[0].id + '"] input'
        );
      }
      return { ok: true };
    }

    if (step.type === 'closing') {
      if (!isValidInt(d.Z1, 1, 5)) return fail('Pilih tingkat kepuasan umum (Z1).', '[data-q="Z1"] input');
      if (!isValidInt(d.Z2, 0, 10)) {
        return fail('Pilih skor rekomendasi 0–10 (Z2).', '[data-q="Z2"] input');
      }
      return { ok: true };
    }

    return { ok: true };
  }

  function showError(message, target) {
    clearError();
    var box = document.createElement('div');
    box.className = 'alert';
    box.id = 'formError';
    box.setAttribute('role', 'alert');
    box.innerHTML = icons.alert + '<span>' + esc(message) + '</span>';

    var anchor = null;
    if (target) {
      var input = stage.querySelector(target);
      if (input) {
        var q = input.closest('.q');
        if (q) q.classList.add('is-missing');
        var field = input.closest('.field');
        if (field) field.classList.add('is-invalid');
        var consent = input.closest('.consent');
        if (consent) consent.classList.add('is-invalid');
        var roles = input.closest('.roles');
        if (roles) roles.classList.add('is-invalid');
        anchor = q || field || consent || roles || null;
        input.focus({ preventScroll: true });
      }
    }

    var hero = stage.querySelector('.hero');
    var fallback = hero ? hero.nextSibling : stage.firstChild;
    stage.insertBefore(box, anchor || fallback);
    box.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  function clearError() {
    var box = document.getElementById('formError');
    if (box) box.remove();
    stage.querySelectorAll('.is-missing').forEach(function (n) { n.classList.remove('is-missing'); });
    stage.querySelectorAll('.is-invalid').forEach(function (n) { n.classList.remove('is-invalid'); });
  }

  /* ---------- Field handling ---------- */
  function pruneForRole() {
    var current = state.data.peran;
    DATA.roles.forEach(function (r) {
      if (r.id === current) return;
      r.sections.forEach(function (s) {
        s.items.forEach(function (it) { delete state.data[it.id]; });
      });
      r.open.forEach(function (o) { delete state.data[o.id]; });
    });
    if (current !== 'mahasiswa') state.data.nim = '';
    if (current === 'admin') {
      state.data.kode_prodi = '';
      state.data.prodi = '';
    }
  }

  function setValue(name, value) {
    if (name === 'peran') {
      state.data.peran = value;
      pruneForRole();
      return true;
    }
    if (name === 'prodi') {
      var found = prodiByKode(String(value).split('|')[0]);
      state.data.kode_prodi = found ? found.kode : '';
      state.data.prodi = found ? found.nama : '';
      return false;
    }
    if (name === 'consent') {
      state.data.consent = Boolean(value);
      return false;
    }
    if (/^(M|D|P)\d+$/.test(name) || name === 'Z1' || name === 'Z2') {
      state.data[name] = Number(value);
      return false;
    }
    state.data[name] = value;
    return false;
  }

  function onFieldChange(event) {
    var el = event.target;
    if (!el.name) return;

    var needsRerender = false;
    if (el.type === 'checkbox') needsRerender = setValue(el.name, el.checked);
    else if (el.type === 'radio') {
      if (!el.checked) return;
      needsRerender = setValue(el.name, el.value);
    } else {
      needsRerender = setValue(el.name, el.value);
    }

    clearError();
    saveDraft();
    if (needsRerender) render({ focus: false });
  }

  function onFieldInput(event) {
    var el = event.target;
    if (!el.name || el.tagName === 'SELECT' || el.type === 'radio' || el.type === 'checkbox') return;
    setValue(el.name, el.value);
    clearError();
    scheduleSave();
  }

  /* ---------- Draft ---------- */
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 350);
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data: state.data,
        index: state.index,
        startedAt: state.startedAt,
        submissionId: state.submissionId || '',
        savedAt: Date.now()
      }));
    } catch (e) { /* storage penuh */ }
  }

  function loadDraft() {
    var raw = '';
    try { raw = localStorage.getItem(DRAFT_KEY) || ''; } catch (e) { return false; }
    if (!raw) return false;
    try {
      var draft = JSON.parse(raw);
      if (!draft || !draft.data) return false;
      var ttl = (CFG.DRAFT_TTL_DAYS || 14) * 86400000;
      if (draft.savedAt && Date.now() - draft.savedAt > ttl) {
        localStorage.removeItem(DRAFT_KEY);
        return false;
      }
      Object.assign(state.data, blank(), draft.data);
      if (state.data.peran === 'admin') {
        state.data.kode_prodi = '';
        state.data.prodi = '';
      } else {
        var syncedProdi = prodiByKode(state.data.kode_prodi);
        state.data.kode_prodi = syncedProdi ? syncedProdi.kode : '';
        state.data.prodi = syncedProdi ? syncedProdi.nama : '';
      }
      state.index = Number(draft.index) || 0;
      state.startedAt = draft.startedAt || Date.now();
      state.submissionId = String(draft.submissionId || '');
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

  /* ---------- Submit ---------- */
  function buildPayload() {
    var role = roleById(state.data.peran);
    if (!role) throw new Error('Peran belum dipilih');

    var d = state.data;
    var payload = {
      id_respon: state.submissionId,
      versi_form: VERSION,
      token: CFG.TOKEN || '',
      peran: role.id,
      nama: String(d.nama || '').trim(),
      nim: role.id === 'mahasiswa' ? String(d.nim || '').trim() : '',
      kode_prodi: role.id === 'admin' ? '' : d.kode_prodi,
      prodi: role.id === 'admin' ? '' : d.prodi,
      pengalaman_portofolio: d.pengalaman_portofolio,
      frekuensi_akses: d.frekuensi_akses,
      perangkat: d.perangkat,
      durasi_detik: Math.max(1, Math.round((Date.now() - state.startedAt) / 1000)),
      user_agent: navigator.userAgent
    };

    allItems(role).forEach(function (it) { payload[it.id] = Number(d[it.id]); });
    role.open.forEach(function (o) { payload[o.id] = String(d[o.id] || '').trim(); });
    payload.Z1 = Number(d.Z1);
    payload.Z2 = Number(d.Z2);
    payload.Z3 = String(d.Z3 || '').trim();

    return payload;
  }

  function serverError(message) {
    var err = new Error(message || 'server_error');
    err.server = true;
    return err;
  }

  function friendlyServerError(code) {
    var map = {
      token: 'Token formulir tidak cocok. Periksa konfigurasi TOKEN di assets/config.js dan cell B3 sheet Pengaturan di Spreadsheet.',
      peran_tidak_valid: 'Peran yang dikirimkan tidak dikenali oleh sistem.',
      nama_kosong: 'Nama lengkap belum terisi.',
      nim_kosong: 'NIM belum terisi.',
      json_tidak_valid: 'Data yang dikirim tidak terbaca oleh server.',
      kosong: 'Data yang dikirim kosong.',
      sibuk: 'Server Google sedang sibuk. Silakan coba kirim kembali dalam beberapa saat.',
      server_error: 'Server gagal menyimpan jawaban ke spreadsheet. Coba kirim ulang.',
      'respons kosong': 'Server tidak mengirim balasan. Silakan coba lagi.',
      'respons server tidak dikenali': 'Balasan server tidak dikenali. Pastikan URL berakhiran /exec dan hak akses Web App diset ke "Anyone".'
    };
    if (/^skor_/.test(code)) {
      return 'Ada butir pertanyaan yang nilainya belum valid (' + code.replace('skor_', '') + ').';
    }
    return map[code] || 'Server menolak jawaban (kode error: ' + code + ').';
  }

  function postJSON(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.text().then(function (text) {
        var raw = String(text || '').trim();
        if (!raw) throw serverError('respons kosong');

        var out;
        try {
          out = JSON.parse(raw);
        } catch (e) {
          throw serverError('respons server tidak dikenali');
        }
        if (!out || typeof out !== 'object') {
          throw serverError('respons server tidak dikenali');
        }
        return out;
      });
    });
  }

  function postNoCors(url, body) {
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
  }

  function enqueue(payload) {
    try {
      var q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!Array.isArray(q)) q = [];
      if (payload && payload.id_respon) {
        q = q.filter(function (it) {
          return !it || !it.data || it.data.id_respon !== payload.id_respon;
        });
      }
      q.push({ data: payload, at: Date.now() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-30)));
    } catch (e) { /* ignore */ }
  }

  function flushQueue() {
    var urlCheck = checkWebAppUrl(WEB_APP_URL);
    if (isFlushing || !navigator.onLine || !urlCheck.ok) return;
    var q = [];
    try { q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return; }
    if (!Array.isArray(q) || !q.length) return;

    isFlushing = true;
    var rest = [];
    var sent = 0;
    q.reduce(function (chain, item) {
      return chain.then(function () {
        if (!item || !item.data) return;
        var dataToSend = Object.assign({}, item.data);
        if (CFG.TOKEN !== undefined) dataToSend.token = CFG.TOKEN || '';
        return postJSON(urlCheck.url, dataToSend).then(function (out) {
          if (!out || out.ok !== true) throw new Error('rejected');
          if (!out.duplikat_id) sent++;
        }).catch(function () { rest.push(item); });
      });
    }, Promise.resolve()).then(function () {
      isFlushing = false;
      try {
        if (rest.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(rest));
        else localStorage.removeItem(QUEUE_KEY);
      } catch (e) { /* ignore */ }
      if (sent) showToast(sent + ' jawaban tertunda berhasil dikirim ke server.');
    });
  }

  function setBusy(busy) {
    state.busy = busy;
    btnBack.disabled = busy;
    btnNext.disabled = busy;
    if (busy) {
      btnNext.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Mengirim…';
    } else {
      var steps = buildSteps();
      setNextLabel(state.index === steps.length - 1);
    }
  }

  function finish(status) {
    try {
      localStorage.setItem(DONE_KEY, String(Date.now()));
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) { /* ignore */ }
    window.location.href = 'hasil.html?status=' + encodeURIComponent(status);
  }

  function submit() {
    var steps = buildSteps();

    for (var i = 0; i < steps.length; i++) {
      var v = validate(steps[i]);
      if (!v.ok) {
        state.index = i;
        render({ focus: false });
        showError(v.message, v.target);
        return;
      }
    }

    var urlCheck = checkWebAppUrl(WEB_APP_URL);
    if (!urlCheck.ok) {
      showError(urlCheck.message, null);
      return;
    }

    var payload;
    try {
      state.submissionId = state.submissionId || newSubmissionId();
      saveDraft();
      payload = buildPayload();
    } catch (err) {
      showError('Data belum lengkap. Periksa kembali jawaban Anda.', null);
      return;
    }

    setBusy(true);

    postJSON(urlCheck.url, payload)
      .then(function (out) {
        if (out && out.ok === true) {
          finish('sent');
          return;
        }
        throw serverError(out && out.error ? out.error : 'server_error');
      })
      .catch(function (err) {
        if (err && err.server) {
          setBusy(false);
          showError('Jawaban belum terkirim. ' + friendlyServerError(err.message), null);
          return;
        }

        if (!navigator.onLine) {
          enqueue(payload);
          finish('queued');
          return;
        }

        return postNoCors(urlCheck.url, payload)
          .then(function () {
            enqueue(payload);
            finish('unverified');
          })
          .catch(function () {
            enqueue(payload);
            finish('queued');
          });
      });
  }

  /* ---------- Navigation ---------- */
  function goNext() {
    if (state.busy) return;
    var steps = buildSteps();
    var step = steps[state.index];
    var v = validate(step);

    if (!v.ok) {
      showError(v.message, v.target);
      return;
    }

    clearError();

    if (state.index === steps.length - 1) {
      submit();
      return;
    }

    state.index++;
    saveDraft();
    render();
  }

  function goBack() {
    if (state.busy || state.index === 0) return;
    clearError();
    state.index--;
    saveDraft();
    render();
  }

  /* ---------- Boot ---------- */
  function init() {
    if (!DATA.roles || !DATA.roles.length) {
      stage.innerHTML = '<h1>Data soal tidak ditemukan</h1><p class="lead">Periksa berkas assets/questions.js.</p>';
      return;
    }

    var urlCheck = checkWebAppUrl(WEB_APP_URL);
    if (!urlCheck.ok) {
      var banner = document.createElement('div');
      banner.className = 'notice notice--warn env-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML = urlCheck.empty
        ? icons.alert + '<span><strong>Mode Uji Coba:</strong> <code>WEB_APP_URL</code> belum diisi di <code>assets/config.js</code>. Anda tetap dapat mencoba seluruh alur formulir secara lokal, namun jawaban belum dikirimkan ke Spreadsheet.</span>'
        : icons.alert + '<span><strong>Konfigurasi URL belum tepat:</strong> ' + esc(urlCheck.message) + '</span>';
      stage.parentNode.insertBefore(banner, stage);
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') {
      clearDraft();
      params.delete('reset');
      var qs = params.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    } else if (loadDraft()) {
      showToast('Draf pengisian sebelumnya berhasil dipulihkan.');
    }

    render();

    flushQueue();
    window.addEventListener('online', flushQueue);

    btnNext.addEventListener('click', goNext);
    btnBack.addEventListener('click', goBack);
    stage.addEventListener('change', onFieldChange);
    stage.addEventListener('input', onFieldInput);

    var btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem(THEME_KEY, next);
          localStorage.setItem('lms_theme', next);
        } catch (e) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

