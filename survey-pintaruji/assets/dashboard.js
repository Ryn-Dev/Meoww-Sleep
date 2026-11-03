/* ============================================================
   Dashboard Visualisasi Kuesioner Kepuasan PintarUji (CBT)
   Politeknik IDN Bogor
   Mengambil ringkasan data agregat (?mode=rekap) tanpa Nama/NIM.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.CONFIG || {};
  var SURVEY = window.SURVEY || {};
  var WEB_APP_URL = String(CFG.WEB_APP_URL || '').trim();
  var PIN_STORAGE_KEY = 'pintaruji_survey_dash_pin';

  var EUCS_KEYS = ['C', 'A', 'F', 'E', 'T'];
  var EUCS_NAMES = {
    C: 'Content',
    A: 'Accuracy',
    F: 'Format',
    E: 'Ease of Use',
    T: 'Timeliness'
  };
  var EUCS_NAMES_ID = {
    C: 'Isi Informasi',
    A: 'Keakuratan & Keandalan',
    F: 'Tampilan & Tata Letak',
    E: 'Kemudahan Penggunaan',
    T: 'Kecepatan & Waktu'
  };
  var EUCS_RADAR_LABELS = {
    C: 'Isi Info (C)',
    A: 'Akurasi (A)',
    F: 'Tampilan (F)',
    E: 'Kemudahan (E)',
    T: 'Kecepatan (T)'
  };
  var EUCS_DESC = {
    C: 'Kelengkapan jadwal, petunjuk tata tertib, rincian soal, skor instan, dan dokumen resmi ujian',
    A: 'Keandalan autosave, akurasi koreksi PG, keamanan token, pencegahan kecurangan, dan sistem bebas error',
    F: 'Kerapian antarmuka, kenyamanan ukuran font/fullscreen, palet nomor soal, dan format dokumen resmi',
    E: 'Kemudahan login NIM, input token & TTD digital, navigasi soal, import excel, dan pembukaan kunci ujian',
    T: 'Kecepatan buka halaman, akurasi timer hitung mundur ujian, live monitoring ujian realtime, dan rekap nilai'
  };
  var ROLE_COLORS = {
    mahasiswa: '#4f46e5',
    dosen: '#0ea5e9',
    admin: '#0f766e',
    all: '#2563eb'
  };
  var LIKERT_COLORS = ['#ef4444', '#fb923c', '#eab308', '#38bdf8', '#4f46e5'];

  var elMeta = document.getElementById('dashMetaText');
  var elBanner = document.getElementById('dashBanner');
  var elToolbar = document.getElementById('dashToolbar');
  var elRoleTabs = document.getElementById('roleTabs');
  var elContent = document.getElementById('dashContent');
  var elPinGate = document.getElementById('pinGate');
  var elPinForm = document.getElementById('pinForm');
  var elPinInput = document.getElementById('pinInput');
  var elPinError = document.getElementById('pinError');
  var elDateForm = document.getElementById('dateFilterForm');
  var elFrom = document.getElementById('filterFrom');
  var elTo = document.getElementById('filterTo');
  var elResetDate = document.getElementById('btnResetDate');
  var btnDemo = document.getElementById('btnDemo');
  var btnRefresh = document.getElementById('btnRefresh');
  var btnPrint = document.getElementById('btnPrint');
  var btnTheme = document.getElementById('btnThemeToggle');
  var btnLock = document.getElementById('btnLockDash');
  var btnGlossary = document.getElementById('btnGlossary');
  var elGlossaryModal = document.getElementById('glossaryModal');
  var elGlossaryTabs = document.getElementById('glossaryTabs');
  var elGlossaryBody = document.getElementById('glossaryBody');
  var btnCloseGlossary = document.getElementById('btnCloseGlossary');
  var btnDoneGlossary = document.getElementById('btnDoneGlossary');

  var state = {
    payload: null,
    livePayload: null,
    isDemo: false,
    role: 'all',
    from: '',
    to: '',
    itemEucs: 'all',
    itemSort: 'default',
    itemQuery: '',
    fbRole: 'all',
    pin: loadSavedPin()
  };

  function loadSavedPin() {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) ||
             sessionStorage.getItem(PIN_STORAGE_KEY) ||
             '';
    } catch (e) { return ''; }
  }

  function savePin(val) {
    state.pin = val;
    try {
      if (val) {
        localStorage.setItem(PIN_STORAGE_KEY, val);
        sessionStorage.setItem(PIN_STORAGE_KEY, val);
      } else {
        localStorage.removeItem(PIN_STORAGE_KEY);
        sessionStorage.removeItem(PIN_STORAGE_KEY);
      }
    } catch (e) { /* ignore */ }
  }

  function esc(val) {
    return String(val == null ? '' : val).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtNum(val, digits) {
    if (val === null || val === undefined || !isFinite(Number(val))) return '—';
    return Number(val).toFixed(digits).replace('.', ',');
  }

  function fmtPct(val) {
    if (val === null || val === undefined || !isFinite(Number(val))) return '—';
    return Number(val).toFixed(1).replace('.', ',') + '%';
  }

  function fmtDuration(sec) {
    if (!sec || !isFinite(sec)) return '—';
    var m = Math.floor(sec / 60);
    var s = Math.round(sec % 60);
    if (!m) return s + ' dtk';
    return m + ' mnt ' + s + ' dtk';
  }

  function roleBadgeClass(peran) {
    if (peran === 'mahasiswa') return 'pill pill--mhs';
    if (peran === 'dosen') return 'pill pill--dsn';
    if (peran === 'admin') return 'pill pill--adm';
    return 'pill pill--neutral';
  }

  function categoryBadge(cat) {
    if (!cat) return '<span class="pill pill--neutral">Belum ada data</span>';
    var cls = 'pill--neutral';
    if (cat === 'Sangat puas' || cat === 'Sangat baik') cls = 'pill--best';
    else if (cat === 'Puas' || cat === 'Baik') cls = 'pill--good';
    else if (cat === 'Cukup') cls = 'pill--mid';
    else cls = 'pill--low';
    return '<span class="pill ' + cls + '">' + esc(cat) + '</span>';
  }

  /* ---------- Generator Data Simulasi PintarUji ---------- */
  function buildDemoPayload() {
    var itemsOut = [];
    var eucsAcc = {
      all: { C: [], A: [], F: [], E: [], T: [] },
      mahasiswa: { C: [], A: [], F: [], E: [], T: [] },
      dosen: { C: [], A: [], F: [], E: [], T: [] },
      admin: { C: [], A: [], F: [], E: [], T: [] }
    };
    var countsByRole = { mahasiswa: 54, dosen: 12, admin: 3 };

    (SURVEY.roles || []).forEach(function (r, rIdx) {
      var n = countsByRole[r.id] || 10;
      (r.sections || []).forEach(function (sec, sIdx) {
        (sec.items || []).forEach(function (it, iIdx) {
          var seed = (rIdx * 7 + sIdx * 5 + iIdx * 3) % 9;
          var baseAvg = 3.65 + (seed * 0.1);
          if (it.id === 'M10') baseAvg = 4.65; // Autosave sangat tinggi
          if (it.id === 'M11') baseAvg = 4.58; // Timer akurat
          if (it.id === 'M12') baseAvg = 4.15; // Anti-cheat
          if (it.id === 'D11') baseAvg = 4.62; // Koreksi otomatis PG
          if (it.id === 'D4')  baseAvg = 4.45; // Import Excel
          if (it.id === 'P6')  baseAvg = 4.55; // Live monitoring
          var avg = Math.min(4.88, Math.round(baseAvg * 100) / 100);
          var c5 = Math.round(n * (avg > 4.2 ? 0.58 : 0.36));
          var c4 = Math.round(n * 0.32);
          var c3 = Math.max(0, Math.round(n * 0.12));
          var c2 = Math.max(0, n - c5 - c4 - c3);
          var c1 = 0;
          var dist = [c1, c2, c3, c4, c5];

          eucsAcc.all[it.eucs].push(avg);
          eucsAcc[r.id][it.eucs].push(avg);

          itemsOut.push({
            id: it.id,
            peran: r.id,
            peranLabel: r.label,
            fitur: it.fitur,
            eucs: it.eucs,
            eucsLabel: EUCS_NAMES[it.eucs],
            teks: it.text,
            count: n,
            avg: avg,
            indexPct: Math.round((avg / 5) * 1000) / 10,
            category: avg >= 4.2 ? 'Sangat puas' : (avg >= 3.4 ? 'Puas' : 'Cukup'),
            dist: dist
          });
        });
      });
    });

    function buildEucsObj(bucket, mult) {
      var out = {};
      EUCS_KEYS.forEach(function (k) {
        var arr = bucket[k] || [];
        var mean = arr.length
          ? Math.round((arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) * 100) / 100
          : null;
        out[k] = {
          kode: k,
          label: EUCS_NAMES[k],
          avg: mean,
          indexPct: mean !== null ? Math.round((mean / 5) * 1000) / 10 : null,
          category: mean >= 4.2 ? 'Sangat puas' : 'Puas',
          count: arr.length * mult
        };
      });
      return out;
    }

    function demoSlice(count, z1Avg, dist15, prom, pass, detr, dur, eucs, exp, frek, dev, tl) {
      var nps = Math.round(((prom - detr) / count) * 1000) / 10;
      return {
        count: count,
        avgDurationSec: dur,
        z1Avg: z1Avg,
        z1IndexPct: Math.round((z1Avg / 5) * 1000) / 10,
        z1Category: z1Avg >= 4.2 ? 'Sangat puas' : 'Puas',
        z1Dist: dist15,
        nps: nps,
        npsCategory: nps >= 50 ? 'Sangat baik' : 'Baik',
        npsBreakdown: { promoter: prom, passive: pass, detractor: detr, total: count },
        npsDist: [0, 0, 0, 1, 1, 1, detr - 3 > 0 ? detr - 3 : 0, Math.floor(pass / 2), Math.ceil(pass / 2), Math.floor(prom / 2), Math.ceil(prom / 2)],
        eucs: eucs,
        profiles: {
          pengalaman_cbt: [
            { label: '1 kali (Ujian pertama kali)', count: exp[0] },
            { label: '2–3 kali mengikuti/mengelola', count: exp[1] },
            { label: '4–6 kali mengikuti/mengelola', count: exp[2] },
            { label: 'Lebih dari 6 kali', count: exp[3] }
          ],
          frekuensi: [
            { label: 'Setiap hari saat masa ujian', count: frek[0] },
            { label: 'Beberapa kali seminggu', count: frek[1] },
            { label: 'Saat UTS & UAS saja', count: frek[2] },
            { label: 'Jarang', count: frek[3] }
          ],
          perangkat: [
            { label: 'Laptop / PC', count: dev[0] },
            { label: 'HP (Smartphone)', count: dev[1] },
            { label: 'Tablet', count: dev[2] }
          ]
        },
        timeline: tl
      };
    }

    var tlAll = [
      { date: '2026-10-27', count: 9 },
      { date: '2026-10-28', count: 18 },
      { date: '2026-10-29', count: 15 },
      { date: '2026-10-30', count: 16 },
      { date: '2026-10-31', count: 7 },
      { date: '2026-11-01', count: 4 }
    ];

    return {
      ok: true,
      isDemo: true,
      generatedAt: new Date().toISOString(),
      filter: { from: '', to: '' },
      range: { firstDate: '2026-10-27', lastDate: '2026-11-01' },
      meta: {
        version: 'v1',
        roles: { mahasiswa: 'Mahasiswa', dosen: 'Dosen / Pengawas', admin: 'Pimpinan / Admin' },
        eucs: EUCS_NAMES,
        prodi: CFG.PRODI || []
      },
      slices: {
        all: demoSlice(69, 4.31, [0, 2, 6, 30, 31], 46, 18, 5, 252, buildEucsObj(eucsAcc.all, 15), [8, 16, 25, 20], [32, 26, 9, 2], [52, 15, 2], tlAll),
        mahasiswa: demoSlice(54, 4.28, [0, 2, 5, 24, 23], 35, 14, 5, 268, buildEucsObj(eucsAcc.mahasiswa, 54), [8, 14, 18, 14], [25, 21, 6, 2], [41, 12, 1], tlAll.map(function (t) { return { date: t.date, count: Math.max(1, Math.round(t.count * 0.78)) }; })),
        dosen: demoSlice(12, 4.42, [0, 0, 1, 5, 6], 9, 3, 0, 215, buildEucsObj(eucsAcc.dosen, 12), [0, 2, 6, 4], [6, 4, 2, 0], [10, 2, 0], tlAll.slice(0, 4).map(function (t) { return { date: t.date, count: Math.max(1, Math.round(t.count * 0.18)) }; })),
        admin: demoSlice(3, 4.45, [0, 0, 0, 1, 2], 2, 1, 0, 180, buildEucsObj(eucsAcc.admin, 3), [0, 0, 1, 2], [1, 1, 1, 0], [1, 1, 1], [{ date: '2026-10-30', count: 2 }, { date: '2026-11-01', count: 1 }])
      },
      items: itemsOut,
      byProdi: [
        { kode: '58302', nama: 'Teknik Rekayasa Perangkat Lunak (TRPL)', count: 28, byRole: { mahasiswa: 23, dosen: 5 }, z1Avg: 4.38, z1IndexPct: 87.6, z1Category: 'Sangat puas', nps: 64.3, npsCategory: 'Sangat baik' },
        { kode: '90346', nama: 'Teknik Rekayasa Komputer Jaringan (TRKJ)', count: 21, byRole: { mahasiswa: 17, dosen: 4 }, z1Avg: 4.26, z1IndexPct: 85.2, z1Category: 'Sangat puas', nps: 52.4, npsCategory: 'Sangat baik' },
        { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis (TRMG)', count: 17, byRole: { mahasiswa: 14, dosen: 3 }, z1Avg: 4.24, z1IndexPct: 84.8, z1Category: 'Sangat puas', nps: 50.0, npsCategory: 'Sangat baik' }
      ],
      feedback: [
        { peran: 'mahasiswa', peranLabel: 'Mahasiswa', kode: 'M_OPEN_1', pertanyaan: 'Fitur apa pada ruang ujian PintarUji yang paling membantu kelancaran Anda saat mengerjakan soal?', teks: 'Fitur autosave dan palet nomor ragu-ragu sangat menenangkan saat ujian karena tidak khawatir jawaban terhapus tiba-tiba.', tanggal: '2026-11-01' },
        { peran: 'mahasiswa', peranLabel: 'Mahasiswa', kode: 'M_OPEN_2', pertanyaan: 'Kendala teknis apa yang pernah atau paling sering Anda alami saat pelaksanaan ujian?', teks: 'Pernah sesi terkunci karena tanpa sengaja kursor mouse keluar jendela saat geser scroll, tapi langsung dibantu pengawas untuk unlock.', tanggal: '2026-10-31' },
        { peran: 'dosen', peranLabel: 'Dosen / Pengawas', kode: 'D_OPEN_1', pertanyaan: 'Proses apa yang masih terasa memakan waktu atau memerlukan penyederhanaan dalam pengelolaan ujian di PintarUji?', teks: 'Format template import soal Excel sudah bagus, mungkin bisa ditambahkan contoh preview gambar soal sebelum di-publish.', tanggal: '2026-10-30' },
        { peran: 'dosen', peranLabel: 'Dosen / Pengawas', kode: 'D_OPEN_2', pertanyaan: 'Fitur tambahan apa yang paling Anda butuhkan untuk membantu proses evaluasi pembelajaran?', teks: 'Akan sangat bermanfaat bila koreksi esai bisa langsung diberi nilai per nomor dengan keyboard shortcut enter.', tanggal: '2026-10-30' },
        { peran: 'admin', peranLabel: 'Pimpinan / Admin', kode: 'P_OPEN_1', pertanyaan: 'Informasi atau indikator evaluasi apa yang belum tersedia pada sistem dan penting untuk pengambilan keputusan akademik?', teks: 'Grafik ringkasan tingkat kesulitan soal dan statistik waktu pengerjaan rata-rata per mata kuliah.', tanggal: '2026-10-29' },
        { peran: 'mahasiswa', peranLabel: 'Mahasiswa', kode: 'Z3', pertanyaan: 'Kritik, saran, atau masukan untuk peningkatan kualitas sistem ujian PintarUji Politeknik IDN', teks: 'Sistem ujian online PintarUji sudah sangat tertib dan adil. Tampilan dark modenya juga enak di mata saat ujian malam hari.', tanggal: '2026-10-28' }
      ]
    };
  }

  /* ---------- SVG Generators ---------- */
  function renderRadarSVG(payload, activeRole) {
    var cx = 175;
    var cy = 150;
    var R = 92;
    var levels = [1, 2, 3, 4, 5];

    function pt(axisIdx, val) {
      var angle = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / 5;
      var r = (Math.max(0, Math.min(5, val || 0)) / 5) * R;
      return [
        Math.round((cx + r * Math.cos(angle)) * 10) / 10,
        Math.round((cy + r * Math.sin(angle)) * 10) / 10
      ];
    }

    var rings = levels.map(function (lv) {
      var pts = EUCS_KEYS.map(function (_, idx) { return pt(idx, lv).join(','); }).join(' ');
      return '<polygon points="' + pts + '" fill="none" stroke="' + (lv === 5 ? 'var(--line-strong, #cbd5e1)' : 'var(--line, #e2e8f0)') + '" stroke-width="1"/>';
    }).join('');

    var axes = EUCS_KEYS.map(function (k, idx) {
      var end = pt(idx, 5);
      var lbl = pt(idx, 6.2);
      var anchor = idx === 0 ? 'middle' : (idx === 1 || idx === 2 ? 'start' : 'end');
      var dy = idx === 0 ? -4 : (idx === 2 || idx === 3 ? 7 : 3);
      return '' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + end[0] + '" y2="' + end[1] + '" stroke="var(--line, #e2e8f0)" stroke-width="1"/>' +
        '<text x="' + lbl[0] + '" y="' + (lbl[1] + dy) + '" text-anchor="' + anchor + '" fill="var(--ink, #334155)" font-size="10.5" font-weight="600">' +
          esc(EUCS_RADAR_LABELS[k] || (EUCS_NAMES[k] + ' (' + k + ')')) +
        '</text>';
    }).join('');

    var scaleTicks = [2, 4].map(function (lv) {
      var p = pt(0, lv);
      return '<text x="' + (p[0] + 5) + '" y="' + (p[1] + 3) + '" fill="var(--muted, #94a3b8)" font-size="8.5" font-weight="600">' + lv + '</text>';
    }).join('');

    var seriesList = [];
    if (activeRole === 'all') {
      ['mahasiswa', 'dosen', 'admin'].forEach(function (rk) {
        var sl = payload.slices[rk];
        if (sl && sl.count > 0) {
          seriesList.push({ key: rk, label: payload.meta.roles[rk], color: ROLE_COLORS[rk], eucs: sl.eucs, fillOp: 0.14, dashed: false });
        }
      });
    } else {
      var allSl = payload.slices.all;
      if (allSl && allSl.count > 0) {
        seriesList.push({ key: 'all', label: 'Rata-rata Semua', color: '#94a3b8', eucs: allSl.eucs, fillOp: 0.06, dashed: true });
      }
      var curSl = payload.slices[activeRole];
      if (curSl && curSl.count > 0) {
        seriesList.push({ key: activeRole, label: payload.meta.roles[activeRole], color: ROLE_COLORS[activeRole], eucs: curSl.eucs, fillOp: 0.22, dashed: false });
      }
    }

    var polygons = seriesList.map(function (s) {
      var coords = EUCS_KEYS.map(function (k, idx) {
        var avg = s.eucs && s.eucs[k] && s.eucs[k].avg ? s.eucs[k].avg : 0;
        return pt(idx, avg);
      });
      var polyStr = coords.map(function (c) { return c.join(','); }).join(' ');
      var dots = s.dashed ? '' : coords.map(function (c) {
        return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.4" fill="' + s.color + '" stroke="#fff" stroke-width="1.5"/>';
      }).join('');
      return '' +
        '<polygon points="' + polyStr + '" fill="' + s.color + '" fill-opacity="' + s.fillOp + '" stroke="' + s.color + '" stroke-width="2.2"' +
          (s.dashed ? ' stroke-dasharray="4 3"' : '') + '/>' +
        dots;
    }).join('');

    var legend = seriesList.length
      ? '<div class="chart-legend">' + seriesList.map(function (s) {
          return '<span><i class="chart-legend__dot" style="background:' + s.color + '"></i>' + esc(s.label) + '</span>';
        }).join('') + '</div>'
      : '<p class="small muted" style="text-align:center;margin-top:8px">Belum ada skor dimensi EUCS.</p>';

    return '' +
      '<div class="radar-wrap">' +
        '<svg class="radar-svg" viewBox="0 0 350 300" role="img" aria-label="Grafik radar 5 dimensi EUCS">' +
          rings + axes + scaleTicks + polygons +
        '</svg>' +
      '</div>' +
      legend;
  }

  function renderDonutSVG(segments, total, centerLabel) {
    var r = 48;
    var C = 2 * Math.PI * r;
    var offset = 0;
    var circles = '';

    if (!total) {
      circles = '<circle cx="74" cy="74" r="' + r + '" fill="none" stroke="var(--line, #e2e8f0)" stroke-width="20"/>';
    } else {
      segments.forEach(function (seg) {
        if (!seg.count) return;
        var len = (seg.count / total) * C;
        circles += '<circle cx="74" cy="74" r="' + r + '" fill="none" stroke="' + seg.color + '" stroke-width="20" ' +
          'stroke-dasharray="' + len.toFixed(2) + ' ' + Math.max(0, C - len).toFixed(2) + '" ' +
          'stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 74 74)"/>';
        offset += len;
      });
    }

    return '' +
      '<svg class="donut-svg" viewBox="0 0 148 148" role="img" aria-label="Diagram donat komposisi">' +
        circles +
        '<text x="74" y="71" text-anchor="middle" fill="var(--ink, #0f172a)" font-size="20" font-weight="800">' + total + '</text>' +
        '<text x="74" y="88" text-anchor="middle" fill="var(--muted, #64748b)" font-size="10" font-weight="600">' + esc(centerLabel) + '</text>' +
        '</svg>';
  }

  function renderStackedLikert(dist, total) {
    if (!total || !dist) return '<span class="small muted">—</span>';
    var spans = dist.map(function (cnt, idx) {
      if (!cnt) return '';
      var pct = ((cnt / total) * 100).toFixed(1);
      return '<span style="width:' + pct + '%;background:' + LIKERT_COLORS[idx] + '" title="Skor ' + (idx + 1) + ': ' + cnt + ' (' + pct + '%)"></span>';
    }).join('');
    var posCount = (dist[3] || 0) + (dist[4] || 0);
    var posPct = Math.round((posCount / total) * 100);
    return '' +
      '<div class="likert-mini">' +
        '<div class="stacked-bar">' + spans + '</div>' +
        '<div class="likert-mini__legend"><span>1–3</span><span>' + posPct + '% (4–5)</span></div>' +
      '</div>';
  }

  /* ---------- Render Sections ---------- */
  function renderBanner(html, isWarn) {
    if (!html) {
      elBanner.innerHTML = '';
      return;
    }
    elBanner.innerHTML = '<div class="notice' + (isWarn ? ' notice--warn' : '') + ' env-banner" style="margin-top:14px">' + html + '</div>';
  }

  function renderRoleTabs(payload) {
    var tabs = [
      { id: 'all', label: 'Semua Peran', count: payload.slices.all.count },
      { id: 'mahasiswa', label: 'Mahasiswa', count: payload.slices.mahasiswa.count },
      { id: 'dosen', label: 'Dosen / Pengawas', count: payload.slices.dosen.count },
      { id: 'admin', label: 'Pimpinan / Admin', count: payload.slices.admin.count }
    ];
    elRoleTabs.innerHTML = tabs.map(function (t) {
      var active = state.role === t.id;
      return '<button type="button" role="tab" aria-selected="' + active + '" data-role="' + t.id + '" class="role-tab' + (active ? ' is-active' : '') + '">' +
        '<span>' + esc(t.label) + '</span>' +
        '<span class="role-tab__count">' + t.count + '</span>' +
      '</button>';
    }).join('');
  }

  function updateHeaderActionsLayout(isLocked) {
    var group = document.getElementById('dashActionsGroup');
    var slotLocked = document.getElementById('dashHeaderActionsLocked');
    var slotUnlocked = document.getElementById('dashActionsUnlocked');
    if (!group || !slotLocked || !slotUnlocked) return;

    if (isLocked) {
      if (group.parentElement !== slotLocked) {
        slotLocked.appendChild(group);
      }
      slotLocked.hidden = false;
      slotUnlocked.hidden = true;
      if (btnGlossary) btnGlossary.hidden = true;
      if (btnDemo) btnDemo.hidden = true;
      if (btnRefresh) btnRefresh.hidden = true;
      if (btnPrint) btnPrint.hidden = true;
      if (btnLock) btnLock.hidden = true;
    } else {
      if (group.parentElement !== slotUnlocked) {
        slotUnlocked.appendChild(group);
      }
      slotLocked.hidden = true;
      slotUnlocked.hidden = false;
      if (btnGlossary) btnGlossary.hidden = false;
      if (btnDemo) btnDemo.hidden = false;
      if (btnRefresh) btnRefresh.hidden = false;
      if (btnPrint) btnPrint.hidden = false;
      var canLock = Boolean(state.pin || (state.payload && state.payload.pin_required));
      if (btnLock) btnLock.hidden = !canLock;
    }
  }

  function renderDashboard() {
    var payload = state.payload;
    if (!payload || !payload.slices) return;

    if (elPinGate && !elPinGate.hidden) {
      if (elToolbar) elToolbar.hidden = true;
      updateHeaderActionsLayout(true);
      return;
    }

    updateHeaderActionsLayout(false);
    elToolbar.hidden = false;
    renderRoleTabs(payload);
    btnDemo.classList.toggle('btn--active', Boolean(state.isDemo));
    btnDemo.textContent = state.isDemo ? 'Matikan Simulasi' : 'Data Simulasi';

    var sl = payload.slices[state.role] || payload.slices.all;
    var allSl = payload.slices.all;
    var roleTitle = state.role === 'all' ? 'Semua Peran' : (payload.meta.roles[state.role] || state.role);

    var rangeInfo = payload.range && payload.range.firstDate
      ? ('Periode data: ' + payload.range.firstDate + (payload.range.lastDate !== payload.range.firstDate ? ' s.d. ' + payload.range.lastDate : ''))
      : 'Belum ada rentang tanggal respons';
    elMeta.textContent = (state.isDemo ? '[MODE SIMULASI] · ' : '') + rangeInfo + ' · Menampilkan: ' + roleTitle;

    if (allSl.count === 0 && !state.isDemo) {
      elContent.innerHTML = '' +
        '<section class="card dash-empty">' +
          '<span class="eyebrow">Sheet Respon Masih Kosong</span>' +
          '<h2>Belum ada jawaban survei yang masuk</h2>' +
          '<p class="lead" style="max-width:52ch;margin:10px auto 20px">Setelah responden mengirim kuesioner, grafik kepuasan, radar EUCS, skor NPS, dan masukan anonim akan otomatis tampil di halaman ini.</p>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
            '<button type="button" class="btn btn--primary" id="btnTryDemoEmpty" style="margin-left:0">Lihat Contoh Visualisasi (Data Simulasi)</button>' +
            '<a class="btn btn--ghost" href="./index.html">Buka Formulir Kuesioner</a>' +
          '</div>' +
        '</section>';
      var btnTry = document.getElementById('btnTryDemoEmpty');
      if (btnTry) btnTry.addEventListener('click', toggleDemo);
      return;
    }

    /* 1. KPI Cards */
    var npsB = sl.npsBreakdown || { promoter: 0, passive: 0, detractor: 0, total: 0 };
    var npsBar = npsB.total
      ? '<div class="stacked-bar" style="margin-top:8px">' +
          (npsB.promoter ? '<span style="width:' + ((npsB.promoter / npsB.total) * 100).toFixed(1) + '%;background:#10b981" title="Promoter (9-10): ' + npsB.promoter + '"></span>' : '') +
          (npsB.passive ? '<span style="width:' + ((npsB.passive / npsB.total) * 100).toFixed(1) + '%;background:#f59e0b" title="Passive (7-8): ' + npsB.passive + '"></span>' : '') +
          (npsB.detractor ? '<span style="width:' + ((npsB.detractor / npsB.total) * 100).toFixed(1) + '%;background:#ef4444" title="Detractor (0-6): ' + npsB.detractor + '"></span>' : '') +
        '</div>'
      : '';

    var npsSign = sl.nps !== null && sl.nps > 0 ? '+' : '';
    var kpiHTML = '' +
      '<section class="kpi-grid">' +
        '<article class="kpi-card">' +
          '<div>' +
            '<div class="kpi-card__top"><span class="kpi-card__label">Total Respons</span><span class="pill pill--neutral">' + esc(roleTitle) + '</span></div>' +
            '<div class="kpi-card__value">' + sl.count + ' <small>respons</small></div>' +
          '</div>' +
          '<div class="kpi-card__foot">Rata-rata durasi isi: <strong>' + fmtDuration(sl.avgDurationSec) + '</strong></div>' +
        '</article>' +

        '<article class="kpi-card">' +
          '<div>' +
            '<div class="kpi-card__top">' +
              '<span class="kpi-label-wrap"><span class="kpi-card__label">Kepuasan Umum (Z1)</span><button type="button" class="help-icon-btn no-print" data-glossary="likert" title="Penjelasan Kepuasan Umum (Z1) &amp; Skala 1–5">?</button></span>' +
              categoryBadge(sl.z1Category) +
            '</div>' +
            '<div class="kpi-card__value">' + fmtNum(sl.z1Avg, 2) + ' <small>/ 5,00</small></div>' +
          '</div>' +
          '<div class="kpi-card__foot">' + renderStackedLikert(sl.z1Dist, sl.count) + '</div>' +
        '</article>' +

        '<article class="kpi-card">' +
          '<div>' +
            '<div class="kpi-card__top">' +
              '<span class="kpi-label-wrap"><span class="kpi-card__label">Indeks Kepuasan</span><button type="button" class="help-icon-btn no-print" data-glossary="indeks" title="Penjelasan Indeks Kepuasan (%)">?</button></span>' +
              '<span class="pill pill--good">Skala 100%</span>' +
            '</div>' +
            '<div class="kpi-card__value">' + fmtPct(sl.z1IndexPct) + '</div>' +
            '<div class="eucs-row__track" style="margin-top:10px"><span class="eucs-row__fill" style="width:' + Math.max(0, Math.min(100, sl.z1IndexPct || 0)) + '%"></span></div>' +
          '</div>' +
          '<div class="kpi-card__foot">Dihitung dari rata-rata Z1 ÷ 5 × 100%</div>' +
        '</article>' +

        '<article class="kpi-card">' +
          '<div>' +
            '<div class="kpi-card__top">' +
              '<span class="kpi-label-wrap"><span class="kpi-card__label">Net Promoter Score</span><button type="button" class="help-icon-btn no-print" data-glossary="nps" title="Penjelasan NPS, Promoter, Passive, &amp; Detractor">?</button></span>' +
              categoryBadge(sl.npsCategory) +
            '</div>' +
            '<div class="kpi-card__value">' + (sl.nps === null ? '—' : npsSign + fmtNum(sl.nps, 1)) + '</div>' +
            npsBar +
          '</div>' +
          '<div class="kpi-card__foot">Promoter: <strong>' + npsB.promoter + '</strong> · Passive: <strong>' + npsB.passive + '</strong> · Detractor: <strong>' + npsB.detractor + '</strong></div>' +
        '</article>' +
      '</section>';

    /* 2. EUCS 5-Dimension Analysis */
    var eucsRowsHTML = EUCS_KEYS.map(function (k) {
      var e = sl.eucs[k] || {};
      var pct = e.indexPct || 0;
      var roleCompare = state.role === 'all'
        ? '<div class="eucs-row__roles">' +
            '<span>Mahasiswa: <strong>' + fmtNum(payload.slices.mahasiswa.eucs[k].avg, 2) + '</strong></span>' +
            '<span>· Dosen: <strong>' + fmtNum(payload.slices.dosen.eucs[k].avg, 2) + '</strong></span>' +
            '<span>· Pimpinan: <strong>' + fmtNum(payload.slices.admin.eucs[k].avg, 2) + '</strong></span>' +
          '</div>'
        : '';
      return '' +
        '<div class="eucs-row">' +
          '<div class="eucs-row__top">' +
            '<span class="eucs-row__name"><span class="eucs-row__code">' + k + '</span>' + esc(EUCS_NAMES_ID[k]) + '<span class="eucs-row__sub">(' + esc(EUCS_NAMES[k]) + ')</span></span>' +
            '<span><strong>' + fmtNum(e.avg, 2) + '</strong> <span class="muted">(' + fmtPct(e.indexPct) + ')</span> ' + categoryBadge(e.category) + '</span>' +
          '</div>' +
          '<div class="eucs-row__desc">' + esc(EUCS_DESC[k]) + '</div>' +
          '<div class="eucs-row__track"><span class="eucs-row__fill" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></div>' +
          roleCompare +
        '</div>';
    }).join('');

    var eucsPanelHTML = '' +
      '<section class="grid-2">' +
        '<article class="panel">' +
          '<div class="panel__head">' +
            '<div><h2 class="panel__title">Peta Radar 5 Aspek Mutu CBT (EUCS)</h2><p class="panel__sub">Keseimbangan mutu sistem ujian PintarUji pada skala 1–5.</p></div>' +
            '<button type="button" class="help-chip no-print" data-glossary="eucs">? Cara Baca</button>' +
          '</div>' +
          renderRadarSVG(payload, state.role) +
        '</article>' +

        '<article class="panel">' +
          '<div class="panel__head">' +
            '<div><h2 class="panel__title">Skor per Dimensi EUCS</h2><p class="panel__sub">Kepuasan pengguna pada 5 pilar layanan sistem (' + esc(roleTitle) + ').</p></div>' +
            '<button type="button" class="help-chip no-print" data-glossary="eucs">? Apa itu EUCS?</button>' +
          '</div>' +
          '<div class="eucs-list">' + eucsRowsHTML + '</div>' +
        '</article>' +
      '</section>';

    /* 3. Role Composition & Prodi Comparison */
    var roleSegments = [
      { label: 'Mahasiswa', count: allSl.count ? payload.slices.mahasiswa.count : 0, color: ROLE_COLORS.mahasiswa },
      { label: 'Dosen / Pengawas', count: allSl.count ? payload.slices.dosen.count : 0, color: ROLE_COLORS.dosen },
      { label: 'Pimpinan / Admin', count: allSl.count ? payload.slices.admin.count : 0, color: ROLE_COLORS.admin }
    ];
    var donutLegendHTML = roleSegments.map(function (seg) {
      var pct = allSl.count ? Math.round((seg.count / allSl.count) * 100) : 0;
      return '' +
        '<div class="donut-item">' +
          '<span><i class="chart-legend__dot" style="background:' + seg.color + '"></i><strong>' + esc(seg.label) + '</strong></span>' +
          '<span><strong>' + seg.count + '</strong> <span class="muted">(' + pct + '%)</span></span>' +
        '</div>';
    }).join('');

    var prodiHTML = (payload.byProdi || []).map(function (p) {
      var npsText = p.nps === null ? '—' : ((p.nps > 0 ? '+' : '') + fmtNum(p.nps, 1));
      return '' +
        '<div class="prodi-card">' +
          '<div class="prodi-card__top">' +
            '<div><span class="pill pill--neutral" style="margin-right:6px">' + esc(p.kode) + '</span><span class="prodi-card__title">' + esc(p.nama) + '</span></div>' +
            categoryBadge(p.z1Category) +
          '</div>' +
          '<div class="eucs-row__track" style="margin-top:8px"><span class="eucs-row__fill" style="width:' + Math.max(0, Math.min(100, p.z1IndexPct || 0)) + '%"></span></div>' +
          '<div class="prodi-card__meta">' +
            '<span>Respons: <strong>' + p.count + '</strong> (Mhs ' + (p.byRole ? p.byRole.mahasiswa : 0) + ' · Dosen ' + (p.byRole ? p.byRole.dosen : 0) + ')</span>' +
            '<span>Rata-rata Z1: <strong>' + fmtNum(p.z1Avg, 2) + '</strong> (' + fmtPct(p.z1IndexPct) + ')</span>' +
            '<span>NPS: <strong>' + npsText + '</strong></span>' +
          '</div>' +
        '</div>';
    }).join('');

    var compProdiHTML = '' +
      '<section class="grid-2">' +
        '<article class="panel">' +
          '<div class="panel__head">' +
            '<div><h2 class="panel__title">Komposisi Responden &amp; Tren Harian</h2><p class="panel__sub">Proporsi peran responden dan aktivitas pengisian.</p></div>' +
          '</div>' +
          '<div class="donut-layout">' +
            renderDonutSVG(roleSegments, allSl.count, 'Total') +
            '<div class="donut-items">' + donutLegendHTML + '</div>' +
          '</div>' +
          renderTimelineHTML(sl.timeline) +
        '</article>' +

        '<article class="panel">' +
          '<div class="panel__head">' +
            '<div><h2 class="panel__title">Kepuasan per Program Studi</h2><p class="panel__sub">Mencakup Mahasiswa &amp; Dosen Politeknik IDN.</p></div>' +
          '</div>' +
          '<div class="prodi-list">' + prodiHTML + '</div>' +
        '</article>' +
      '</section>';

    /* 4. Top 3 & Bottom 3 Items */
    var roleItems = (payload.items || []).filter(function (it) {
      return (state.role === 'all' || it.peran === state.role) && it.count > 0 && it.avg !== null;
    });
    var sortedDesc = roleItems.slice().sort(function (a, b) { return b.avg - a.avg; });
    var sortedAsc = roleItems.slice().sort(function (a, b) { return a.avg - b.avg; });
    var top3 = sortedDesc.slice(0, 3);
    var low3 = sortedAsc.slice(0, 3);

    function rankCards(arr, cls) {
      if (!arr.length) return '<p class="small muted">Belum ada skor butir untuk peran ini.</p>';
      return '<div class="rank-list">' + arr.map(function (it) {
        return '' +
          '<div class="rank-item ' + cls + '">' +
            '<div>' +
              '<div class="rank-item__text"><span class="eucs-row__code">' + esc(it.id) + '</span>' + esc(it.teks) + '</div>' +
              '<div class="rank-item__sub">' + esc(it.peranLabel) + ' · Fitur: <strong>' + esc(it.fitur) + '</strong> · Dimensi: ' + esc(EUCS_NAMES_ID[it.eucs] || it.eucsLabel) + ' (' + it.count + ' jawaban)</div>' +
            '</div>' +
            '<div class="rank-item__score">' +
              '<strong>' + fmtNum(it.avg, 2) + '</strong>' +
              '<span class="small muted">' + fmtPct(it.indexPct) + '</span>' +
            '</div>' +
          '</div>';
      }).join('') + '</div>';
    }

    var highlightsHTML = '' +
      '<section class="grid-2">' +
        '<article class="panel">' +
          '<div class="panel__head"><div><h2 class="panel__title">3 Fitur dengan Kepuasan Tertinggi</h2><p class="panel__sub">Layanan dan fitur PintarUji yang paling diapresiasi pengguna.</p></div></div>' +
          rankCards(top3, 'rank-item--top') +
        '</article>' +
        '<article class="panel">' +
          '<div class="panel__head"><div><h2 class="panel__title">3 Prioritas Evaluasi &amp; Peningkatan</h2><p class="panel__sub">Butir pernyataan dengan rata-rata paling rendah.</p></div></div>' +
          rankCards(low3, 'rank-item--low') +
        '</article>' +
      '</section>';

    /* 5. Full Items Table */
    var itemsTableSection = '' +
      '<section class="panel">' +
        '<div class="panel__head">' +
          '<div><h2 class="panel__title">Rincian Skor per Butir Evaluasi</h2><p class="panel__sub">Distribusi lengkap skala 1–5 beserta indeks kepuasan tiap fitur sistem.</p></div>' +
          '<button type="button" class="help-chip no-print" data-glossary="kode">? Arti Kode &amp; Kolom</button>' +
        '</div>' +
        '<div class="table-controls no-print">' +
          '<input type="search" class="input input--sm input--search" id="itemSearch" placeholder="Cari kode (M1), fitur, atau teks pernyataan…" value="' + esc(state.itemQuery) + '">' +
          '<select class="select select--sm" id="itemEucsFilter">' +
            '<option value="all"' + (state.itemEucs === 'all' ? ' selected' : '') + '>Semua Dimensi EUCS</option>' +
            EUCS_KEYS.map(function (k) {
              return '<option value="' + k + '"' + (state.itemEucs === k ? ' selected' : '') + '>' + k + ' · ' + esc(EUCS_NAMES_ID[k]) + ' (' + esc(EUCS_NAMES[k]) + ')</option>';
            }).join('') +
          '</select>' +
          '<select class="select select--sm" id="itemSortSelect">' +
            '<option value="default"' + (state.itemSort === 'default' ? ' selected' : '') + '>Urutan Kuesioner</option>' +
            '<option value="high"' + (state.itemSort === 'high' ? ' selected' : '') + '>Skor Tertinggi → Terendah</option>' +
            '<option value="low"' + (state.itemSort === 'low' ? ' selected' : '') + '>Skor Terendah → Tertinggi</option>' +
          '</select>' +
        '</div>' +
        '<div class="table-wrap" id="itemsTableWrap">' + buildItemsTableHTML(payload) + '</div>' +
      '</section>';

    /* 6. Respondent Profiles */
    function renderProfileBox(title, list, color) {
      var sum = (list || []).reduce(function (acc, it) { return acc + (it.count || 0); }, 0);
      return '' +
        '<article class="panel">' +
          '<div class="panel__head"><div><h2 class="panel__title">' + esc(title) + '</h2></div></div>' +
          '<div class="bar-list">' + (list || []).map(function (it) {
            var pct = sum ? Math.round((it.count / sum) * 100) : 0;
            return '' +
              '<div>' +
                '<div class="bar-item__head"><span>' + esc(it.label) + '</span><span><strong>' + it.count + '</strong> <span class="muted">(' + pct + '%)</span></span></div>' +
                '<div class="bar-item__track"><span class="bar-item__fill" style="width:' + pct + '%;background:' + color + '"></span></div>' +
              '</div>';
          }).join('') + '</div>' +
        '</article>';
    }

    var profilesHTML = '' +
      '<section class="grid-3">' +
        renderProfileBox('Pengalaman CBT', sl.profiles.pengalaman_cbt, '#4f46e5') +
        renderProfileBox('Frekuensi Akses', sl.profiles.frekuensi, '#0ea5e9') +
        renderProfileBox('Perangkat Utama', sl.profiles.perangkat, '#0f766e') +
      '</section>';

    /* 7. Anonymous Open-Ended Feedback */
    var feedbackList = (payload.feedback || []).filter(function (f) {
      return state.role === 'all' || f.peran === state.role;
    });

    var feedbackHTML = '' +
      '<section class="panel">' +
        '<div class="panel__head">' +
          '<div><h2 class="panel__title">Masukan &amp; Saran Terbuka (Anonim)</h2><p class="panel__sub">Menampilkan masukan evaluasi tanpa nama dan tanpa NIM responden.</p></div>' +
          '<span class="pill pill--neutral">' + feedbackList.length + ' masukan</span>' +
        '</div>' +
        (feedbackList.length
          ? '<div class="feedback-grid">' + feedbackList.map(function (f) {
              return '' +
                '<div class="fb-card">' +
                  '<div class="fb-card__head">' +
                    '<span class="' + roleBadgeClass(f.peran) + '">' + esc(f.peranLabel) + '</span>' +
                    '<span class="small muted">' + esc(f.tanggal || '') + '</span>' +
                  '</div>' +
                  '<div class="fb-card__q">' + esc(f.pertanyaan) + '</div>' +
                  '<div class="fb-card__body">' + esc(f.teks) + '</div>' +
                '</div>';
            }).join('') + '</div>'
          : '<p class="small muted">Belum ada jawaban terbuka untuk filter ini.</p>') +
      '</section>';

    elContent.innerHTML = kpiHTML + eucsPanelHTML + compProdiHTML + highlightsHTML + itemsTableSection + profilesHTML + feedbackHTML;
    bindDynamicControls();
  }

  function renderTimelineHTML(timeline) {
    if (!timeline || !timeline.length) return '';
    var recent = timeline.slice(-14);
    var maxVal = Math.max.apply(null, recent.map(function (t) { return t.count; })) || 1;
    return '' +
      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<span class="small" style="font-weight:700">Tren Pengisian Harian</span>' +
          '<span class="small muted">' + recent.length + ' hari aktif</span>' +
        '</div>' +
        '<div class="timeline-bars">' +
          recent.map(function (t) {
            var h = Math.max(8, Math.round((t.count / maxVal) * 76));
            var shortDate = t.date.slice(5).replace('-', '/');
            return '' +
              '<div class="tbar" title="' + esc(t.date) + ': ' + t.count + ' respons">' +
                '<span class="tbar__val">' + t.count + '</span>' +
                '<span class="tbar__col" style="height:' + h + 'px"></span>' +
                '<span class="tbar__date">' + esc(shortDate) + '</span>' +
              '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function buildItemsTableHTML(payload) {
    var q = state.itemQuery.trim().toLowerCase();
    var filtered = (payload.items || []).filter(function (it) {
      if (state.role !== 'all' && it.peran !== state.role) return false;
      if (state.itemEucs !== 'all' && it.eucs !== state.itemEucs) return false;
      if (q) {
        var hay = (it.id + ' ' + it.fitur + ' ' + it.teks + ' ' + it.peranLabel).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (state.itemSort === 'high') {
      filtered.sort(function (a, b) { return (b.avg || -1) - (a.avg || -1); });
    } else if (state.itemSort === 'low') {
      filtered.sort(function (a, b) { return (a.avg === null ? 99 : a.avg) - (b.avg === null ? 99 : b.avg); });
    }

    if (!filtered.length) {
      return '<p class="small muted" style="padding:18px">Tidak ada butir pernyataan yang cocok dengan pencarian/filter.</p>';
    }

    return '' +
      '<table class="items-table">' +
        '<thead>' +
          '<tr>' +
            '<th>Kode</th>' +
            '<th>Peran</th>' +
            '<th>Pernyataan &amp; Fitur</th>' +
            '<th>EUCS</th>' +
            '<th>Sebaran 1–5</th>' +
            '<th>Rata-rata</th>' +
            '<th>Indeks</th>' +
            '<th>Kategori</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          filtered.map(function (it) {
            return '' +
              '<tr>' +
                '<td><span class="eucs-row__code">' + esc(it.id) + '</span></td>' +
                '<td><span class="' + roleBadgeClass(it.peran) + '">' + esc(it.peranLabel) + '</span></td>' +
                '<td><div style="font-weight:500">' + esc(it.teks) + '</div><div class="small muted">Fitur: ' + esc(it.fitur) + ' · ' + it.count + ' jawaban (N=' + it.count + ')</div></td>' +
                '<td><span class="pill pill--neutral" title="' + esc((EUCS_NAMES_ID[it.eucs] || it.eucsLabel) + ' (' + it.eucsLabel + ')') + '">' + esc(it.eucs + ' · ' + (EUCS_NAMES_ID[it.eucs] || it.eucs)) + '</span></td>' +
                '<td>' + renderStackedLikert(it.dist, it.count) + '</td>' +
                '<td><strong>' + fmtNum(it.avg, 2) + '</strong></td>' +
                '<td>' + fmtPct(it.indexPct) + '</td>' +
                '<td>' + categoryBadge(it.category) + '</td>' +
              '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>';
  }

  function bindDynamicControls() {
    var searchEl = document.getElementById('itemSearch');
    var eucsEl = document.getElementById('itemEucsFilter');
    var sortEl = document.getElementById('itemSortSelect');
    var wrapEl = document.getElementById('itemsTableWrap');

    function refreshTableOnly() {
      if (wrapEl && state.payload) wrapEl.innerHTML = buildItemsTableHTML(state.payload);
    }

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        state.itemQuery = searchEl.value;
        refreshTableOnly();
      });
    }
    if (eucsEl) {
      eucsEl.addEventListener('change', function () {
        state.itemEucs = eucsEl.value;
        refreshTableOnly();
      });
    }
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        state.itemSort = sortEl.value;
        refreshTableOnly();
      });
    }
  }

  /* ---------- Fetch Data dari Apps Script ---------- */
  function fetchLive() {
    elPinGate.hidden = true;
    elPinError.hidden = true;
    elToolbar.hidden = true;

    if (!WEB_APP_URL) {
      state.isDemo = true;
      state.payload = buildDemoPayload();
      renderBanner(
        '<span><strong>WEB_APP_URL belum diisi</strong> di <code>assets/config.js</code>. Menampilkan <strong>data simulasi</strong> sebagai pratinjau visualisasi hasil survei.</span>',
        true
      );
      renderDashboard();
      return;
    }

    elContent.innerHTML = '' +
      '<div class="card dash-loading">' +
        '<span class="dash-spinner" aria-hidden="true"></span>' +
        '<p>Mengambil data agregat dari Google Spreadsheet…</p>' +
      '</div>';

    var sep = WEB_APP_URL.indexOf('?') === -1 ? '?' : '&';
    var url = WEB_APP_URL + sep + 'mode=rekap';
    if (state.from) url += '&from=' + encodeURIComponent(state.from);
    if (state.to) url += '&to=' + encodeURIComponent(state.to);
    if (state.pin) url += '&pin=' + encodeURIComponent(state.pin);

    fetch(url, { method: 'GET' })
      .then(function (res) { return res.text(); })
      .then(function (raw) {
        var out = JSON.parse(String(raw || '').trim());

        if (out && out.error === 'pin_diperlukan') {
          elToolbar.hidden = true;
          elContent.innerHTML = '';
          elPinGate.hidden = false;
          updateHeaderActionsLayout(true);
          renderBanner('', false);
          elMeta.textContent = 'Akses terproteksi — Masukkan kode PIN untuk melihat ringkasan hasil survei.';
          if (state.pin) {
            elPinError.textContent = 'Kode akses / PIN tidak cocok. Silakan periksa tab Pengaturan di Spreadsheet.';
            elPinError.hidden = false;
            savePin('');
          }
          elPinInput.focus();
          return;
        }

        if (out && out.ok === true && !out.slices) {
          state.isDemo = true;
          state.payload = buildDemoPayload();
          renderBanner(
            '<span><strong>Perbarui Deployment Apps Script untuk melihat data asli:</strong> ' +
            'Salin isi terbaru <code>apps-script/Code.gs</code> ke editor Apps Script → klik <strong>Deploy → Manage deployments → Edit → Version: New version → Deploy</strong>. ' +
            'Di bawah ini adalah pratinjau simulasi dashboard:</span>',
            true
          );
          renderDashboard();
          return;
        }

        if (!out || out.ok !== true || !out.slices) {
          throw new Error(out && out.error ? out.error : 'format_tidak_dikenali');
        }

        state.livePayload = out;
        state.isDemo = false;
        state.payload = out;
        elPinGate.hidden = true;
        elToolbar.hidden = false;
        if (btnLock) btnLock.hidden = !out.pin_required && !state.pin;
        if (btnDemo) btnDemo.hidden = false;
        if (btnPrint) btnPrint.hidden = false;
        renderBanner('', false);
        renderDashboard();
      })
      .catch(function () {
        state.isDemo = true;
        state.payload = buildDemoPayload();
        renderBanner(
          '<span><strong>Gagal memuat data langsung dari server</strong> (periksa koneksi internet atau pastikan akses Web App diset ke <strong>Anyone</strong>). Menampilkan <strong>data simulasi</strong>:</span>',
          true
        );
        renderDashboard();
      });
  }

  function toggleDemo() {
    if (elPinGate && !elPinGate.hidden) {
      return;
    }
    if (state.isDemo && state.livePayload) {
      state.isDemo = false;
      state.payload = state.livePayload;
      renderBanner('', false);
      renderDashboard();
      return;
    }
    if (!state.isDemo) {
      state.isDemo = true;
      state.payload = buildDemoPayload();
      renderBanner(
        '<span><strong>Mode Simulasi Aktif:</strong> Angka di bawah ini adalah contoh data ilustratif (69 responden) untuk pratinjau grafik. Klik <strong>Matikan Simulasi</strong> atau <strong>Muat Ulang</strong> untuk kembali ke data Spreadsheet asli.</span>',
        true
      );
      renderDashboard();
    } else {
      fetchLive();
    }
  }

  /* ---------- Modal Panduan Istilah ---------- */
  function setGlossaryTopic(topic) {
    var active = topic || 'all';
    if (elGlossaryTabs && elGlossaryTabs.querySelectorAll) {
      elGlossaryTabs.querySelectorAll('[data-gfilter]').forEach(function (tab) {
        var isMatch = tab.getAttribute('data-gfilter') === active;
        tab.classList.toggle('is-active', isMatch);
        tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }
    if (elGlossaryBody && elGlossaryBody.querySelectorAll) {
      elGlossaryBody.querySelectorAll('[data-gtopic]').forEach(function (card) {
        var cardTopic = card.getAttribute('data-gtopic');
        card.hidden = !(active === 'all' || cardTopic === active);
      });
      elGlossaryBody.scrollTop = 0;
    }
  }

  function openGlossary(topic) {
    if (!elGlossaryModal) return;
    setGlossaryTopic(topic || 'all');
    elGlossaryModal.hidden = false;
    if (btnCloseGlossary && btnCloseGlossary.focus) btnCloseGlossary.focus();
  }

  function closeGlossary() {
    if (!elGlossaryModal) return;
    elGlossaryModal.hidden = true;
  }

  /* ---------- Event Listeners ---------- */
  if (btnGlossary) {
    btnGlossary.addEventListener('click', function () { openGlossary('all'); });
  }
  if (btnCloseGlossary) {
    btnCloseGlossary.addEventListener('click', closeGlossary);
  }
  if (btnDoneGlossary) {
    btnDoneGlossary.addEventListener('click', closeGlossary);
  }
  if (elGlossaryModal) {
    elGlossaryModal.addEventListener('click', function (ev) {
      if (ev.target === elGlossaryModal) closeGlossary();
    });
  }
  if (elGlossaryTabs) {
    elGlossaryTabs.addEventListener('click', function (ev) {
      var tab = ev.target && ev.target.closest ? ev.target.closest('[data-gfilter]') : null;
      if (!tab) return;
      setGlossaryTopic(tab.getAttribute('data-gfilter') || 'all');
    });
  }
  if (document.addEventListener) {
    document.addEventListener('click', function (ev) {
      var trigger = ev.target && ev.target.closest ? ev.target.closest('[data-glossary]') : null;
      if (!trigger) return;
      openGlossary(trigger.getAttribute('data-glossary') || 'all');
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && elGlossaryModal && !elGlossaryModal.hidden) {
        closeGlossary();
      }
    });
  }

  elRoleTabs.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-role]');
    if (!btn || !state.payload) return;
    state.role = btn.getAttribute('data-role') || 'all';
    renderDashboard();
  });

  elDateForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    state.from = elFrom.value || '';
    state.to = elTo.value || '';
    elResetDate.hidden = !(state.from || state.to);
    fetchLive();
  });

  elResetDate.addEventListener('click', function () {
    elFrom.value = '';
    elTo.value = '';
    state.from = '';
    state.to = '';
    elResetDate.hidden = true;
    fetchLive();
  });

  elPinForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var val = String(elPinInput.value || '').trim();
    if (!val) return;
    savePin(val);
    elPinInput.value = '';
    fetchLive();
  });

  btnDemo.addEventListener('click', toggleDemo);
  btnRefresh.addEventListener('click', fetchLive);
  btnPrint.addEventListener('click', function () { window.print(); });

  if (btnTheme) {
    btnTheme.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('lms_theme', next); } catch (e) {}
    });
  }

  if (btnLock) {
    btnLock.addEventListener('click', function () {
      savePin('');
      state.pin = '';
      elToolbar.hidden = true;
      elPinGate.hidden = true;
      updateHeaderActionsLayout(true);
      elContent.innerHTML = '' +
        '<div class="card dash-loading">' +
          '<span class="dash-spinner" aria-hidden="true"></span>' +
          '<p>Mengunci dashboard…</p>' +
        '</div>';
      fetchLive();
    });
  }

  fetchLive();
})();

