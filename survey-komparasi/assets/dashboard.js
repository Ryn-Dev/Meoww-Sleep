/* ============================================================
   Executive Comparison Dashboard Controller
   Politeknik IDN Bogor
   Parallel Asynchronous Aggregation & Multi-Platform Visualizer
   ============================================================ */

(function () {
  'use strict';

  var THEME_KEY = 'komparasi_theme';
  var PIN_KEY = 'komparasi_pin';
  var MASTER_PIN_KEY = 'master_survey_dash_pin';
  var APP_PIN_KEYS = [
    'pintaruji_survey_dash_pin',
    'portofolio_survey_dash_pin',
    'lms_survey_dash_pin',
    'simta_survey_dash_pin'
  ];

  function loadSavedPin() {
    try {
      var p = localStorage.getItem(MASTER_PIN_KEY) ||
              sessionStorage.getItem(MASTER_PIN_KEY) ||
              localStorage.getItem(PIN_KEY) ||
              sessionStorage.getItem(PIN_KEY);
      if (p) return p;
      for (var i = 0; i < APP_PIN_KEYS.length; i++) {
        var k = APP_PIN_KEYS[i];
        var val = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (val) return val;
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  function savePin(p) {
    try {
      var keys = [PIN_KEY, MASTER_PIN_KEY].concat(APP_PIN_KEYS);
      keys.forEach(function (k) {
        if (p) {
          localStorage.setItem(k, p);
          sessionStorage.setItem(k, p);
        } else {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }

  var state = {
    appsData: {},
    isDemo: false,
    activeRole: 'all',
    pin: loadSavedPin(),
    visiblePolys: {
      pintaruji: true,
      portofolio: true,
      lms: true,
      simta: true
    }
  };

  /* ---------- DOM References ---------- */
  var elMeta = document.getElementById('dashMetaText');
  var elBanner = document.getElementById('dashBanner');
  var elContent = document.getElementById('dashContent');
  var elToolbar = document.getElementById('dashToolbar');
  var elRoleTabs = document.getElementById('roleTabs');
  var elToolbarStatus = document.getElementById('toolbarStatusText');
  var elPinGate = document.getElementById('pinGate');
  var elPinForm = document.getElementById('pinForm');
  var elPinInput = document.getElementById('pinInput');
  var elPinError = document.getElementById('pinError');

  var btnRefresh = document.getElementById('btnRefresh');
  var btnDemo = document.getElementById('btnDemo');
  var btnPrint = document.getElementById('btnPrint');
  var btnLock = document.getElementById('btnLockDash');
  var btnGlossary = document.getElementById('btnGlossary');
  var btnTheme = document.getElementById('btnThemeToggle');
  var modalGlossary = document.getElementById('glossaryModal');
  var btnCloseGlossary = document.getElementById('btnCloseGlossary');

  /* ---------- Helpers ---------- */
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtNum(n, d) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Number(n).toFixed(d !== undefined ? d : 2).replace('.', ',');
  }

  function fmtPct(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Number(n).toFixed(1).replace('.', ',') + '%';
  }

  function categoryBadge(cat) {
    if (!cat) return '';
    var lower = String(cat).toLowerCase();
    var cls = 'pill--neutral';
    if (lower.indexOf('sangat baik') !== -1 || lower.indexOf('sangat puas') !== -1) cls = 'pill--best';
    else if (lower.indexOf('baik') !== -1 || lower.indexOf('puas') !== -1) cls = 'pill--good';
    else if (lower.indexOf('cukup') !== -1) cls = 'pill--mid';
    else if (lower.indexOf('kurang') !== -1 || lower.indexOf('buruk') !== -1) cls = 'pill--low';
    return '<span class="pill ' + cls + '">' + esc(cat) + '</span>';
  }

  /* ---------- Demo Payload Generator ---------- */
  function buildDemoPayloads() {
    return {
      pintaruji: {
        appId: 'pintaruji',
        name: 'PintarUji CBT',
        shortName: 'PintarUji',
        appUrl: 'https://pintaruji.politeknikidn.id',
        count: 118,
        z1Avg: 4.41,
        z1IndexPct: 88.2,
        z1Category: 'Sangat puas',
        nps: 62.5,
        npsCategory: 'Sangat baik',
        npsBreakdown: { promoter: 78, passive: 34, detractor: 6, total: 118 },
        z1Dist: [1, 2, 8, 48, 59],
        eucs: {
          C: { avg: 4.38, indexPct: 87.6, category: 'Sangat puas' },
          A: { avg: 4.48, indexPct: 89.6, category: 'Sangat puas' },
          F: { avg: 4.35, indexPct: 87.0, category: 'Sangat puas' },
          E: { avg: 4.42, indexPct: 88.4, category: 'Sangat puas' },
          T: { avg: 4.46, indexPct: 89.2, category: 'Sangat puas' }
        },
        byProdi: [
          { kode: '58302', nama: 'TRPL', count: 52, z1Avg: 4.44, z1IndexPct: 88.8, nps: 64.0 },
          { kode: '90346', nama: 'TRKJ', count: 38, z1Avg: 4.39, z1IndexPct: 87.8, nps: 60.5 },
          { kode: '90343', nama: 'TRMG', count: 28, z1Avg: 4.38, z1IndexPct: 87.6, nps: 61.0 }
        ],
        topStrength: 'Keandalan timer ujian CBT dan auto-saving jawaban anti-lag',
        priorityFix: 'Optimalisasi preview gambar diagram resolusi tinggi di smartphone'
      },
      portofolio: {
        appId: 'portofolio',
        name: 'Portofolio IDN',
        shortName: 'Portofolio',
        appUrl: 'https://portofolio.politeknikidn.id',
        count: 96,
        z1Avg: 4.38,
        z1IndexPct: 87.6,
        z1Category: 'Sangat puas',
        nps: 58.3,
        npsCategory: 'Sangat baik',
        npsBreakdown: { promoter: 62, passive: 28, detractor: 6, total: 96 },
        z1Dist: [0, 2, 7, 43, 44],
        eucs: {
          C: { avg: 4.40, indexPct: 88.0, category: 'Sangat puas' },
          A: { avg: 4.34, indexPct: 86.8, category: 'Sangat puas' },
          F: { avg: 4.52, indexPct: 90.4, category: 'Sangat puas' },
          E: { avg: 4.36, indexPct: 87.2, category: 'Sangat puas' },
          T: { avg: 4.30, indexPct: 86.0, category: 'Sangat puas' }
        },
        byProdi: [
          { kode: '58302', nama: 'TRPL', count: 42, z1Avg: 4.41, z1IndexPct: 88.2, nps: 61.9 },
          { kode: '90346', nama: 'TRKJ', count: 30, z1Avg: 4.35, z1IndexPct: 87.0, nps: 53.3 },
          { kode: '90343', nama: 'TRMG', count: 24, z1Avg: 4.46, z1IndexPct: 89.2, nps: 62.5 }
        ],
        topStrength: 'Estetika tampilan showcase karya, dark mode, dan link portofolio publik',
        priorityFix: 'Kecepatan kompresi upload video demo proyek berdurasi panjang'
      },
      lms: {
        appId: 'lms',
        name: 'LMS IDN',
        shortName: 'LMS',
        appUrl: 'https://lms.politeknikidn.id',
        count: 142,
        z1Avg: 4.35,
        z1IndexPct: 87.0,
        z1Category: 'Sangat puas',
        nps: 55.0,
        npsCategory: 'Sangat baik',
        npsBreakdown: { promoter: 88, passive: 44, detractor: 10, total: 142 },
        z1Dist: [1, 3, 12, 60, 66],
        eucs: {
          C: { avg: 4.42, indexPct: 88.4, category: 'Sangat puas' },
          A: { avg: 4.36, indexPct: 87.2, category: 'Sangat puas' },
          F: { avg: 4.32, indexPct: 86.4, category: 'Sangat puas' },
          E: { avg: 4.38, indexPct: 87.6, category: 'Sangat puas' },
          T: { avg: 4.28, indexPct: 85.6, category: 'Sangat puas' }
        },
        byProdi: [
          { kode: '58302', nama: 'TRPL', count: 64, z1Avg: 4.38, z1IndexPct: 87.6, nps: 57.8 },
          { kode: '90346', nama: 'TRKJ', count: 44, z1Avg: 4.34, z1IndexPct: 86.8, nps: 52.3 },
          { kode: '90343', nama: 'TRMG', count: 34, z1Avg: 4.32, z1IndexPct: 86.4, nps: 52.9 }
        ],
        topStrength: 'Kelengkapan modul materi kuliah, submit tugas, dan rekap nilai terpadu',
        priorityFix: 'Kecepatan sinkronisasi notifikasi deadline tugas pada jam sibuk malam hari'
      },
      simta: {
        appId: 'simta',
        name: 'SIMTA IDN',
        shortName: 'SIMTA',
        appUrl: 'https://simta.politeknikidn.id',
        count: 72,
        z1Avg: 4.31,
        z1IndexPct: 86.2,
        z1Category: 'Sangat puas',
        nps: 54.2,
        npsCategory: 'Sangat baik',
        npsBreakdown: { promoter: 44, passive: 23, detractor: 5, total: 72 },
        z1Dist: [0, 1, 6, 36, 29],
        eucs: {
          C: { avg: 4.36, indexPct: 87.2, category: 'Sangat puas' },
          A: { avg: 4.40, indexPct: 88.0, category: 'Sangat puas' },
          F: { avg: 4.29, indexPct: 85.8, category: 'Sangat puas' },
          E: { avg: 4.31, indexPct: 86.2, category: 'Sangat puas' },
          T: { avg: 4.22, indexPct: 84.4, category: 'Sangat puas' }
        },
        byProdi: [
          { kode: '58302', nama: 'TRPL', count: 30, z1Avg: 4.32, z1IndexPct: 86.4, nps: 60.0 },
          { kode: '90346', nama: 'TRKJ', count: 24, z1Avg: 4.25, z1IndexPct: 85.0, nps: 54.2 },
          { kode: '90343', nama: 'TRMG', count: 18, z1Avg: 4.22, z1IndexPct: 84.4, nps: 50.0 }
        ],
        topStrength: 'Alur bimbingan skripsi ber-QR code dan rubrik penilaian ujian yang objektif',
        priorityFix: 'Fleksibilitas batas ukuran file lampiran skema perancangan pada proposal'
      }
    };
  }

  /* ---------- Parallel Fetch Controller ---------- */
  function fetchAllApps() {
    if (elPinGate) elPinGate.hidden = true;
    if (elPinError) elPinError.hidden = true;

    elContent.innerHTML = '' +
      '<div class="card" style="text-align:center;padding:48px 20px">' +
        '<div class="dash-spinner" style="width:36px;height:36px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 14px"></div>' +
        '<h3 style="font-size:1.1rem;color:var(--ink)">Mengambil Data dari 4 Web App Apps Script…</h3>' +
        '<p class="small muted" style="margin-top:6px">Menghubungkan secara paralel ke PintarUji, Portofolio, LMS, dan SIMTA.</p>' +
      '</div>';

    var apps = window.CONFIG.APPS || [];
    var promises = apps.map(function (app) {
      var syncEl = document.getElementById('sync' + app.id.charAt(0).toUpperCase() + app.id.slice(1));
      if (syncEl) {
        var stat = syncEl.querySelector('.sync-card__status');
        if (stat) stat.innerHTML = '<span class="dash-spinner" style="width:10px;height:10px;border:2px solid var(--line);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .8s linear infinite"></span> Memuat…';
      }

      var sep = app.apiUrl.indexOf('?') === -1 ? '?' : '&';
      var url = app.apiUrl + sep + 'mode=rekap';
      var appPin = (app.pin || '').trim() ||
                   localStorage.getItem(app.id + '_survey_dash_pin') ||
                   sessionStorage.getItem(app.id + '_survey_dash_pin') ||
                   state.pin;
      if (appPin) url += '&pin=' + encodeURIComponent(appPin);
      if (app.token) url += '&token=' + encodeURIComponent(app.token);

      return fetch(url, { method: 'GET', cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (raw) {
          var out = JSON.parse(String(raw || '').trim());
          if (out && out.error === 'pin_diperlukan') {
            return { id: app.id, success: false, pinRequired: true, error: 'pin_diperlukan' };
          }
          if (out && out.ok && out.slices) {
            if (appPin) {
              try {
                localStorage.setItem(app.id + '_survey_dash_pin', appPin);
                sessionStorage.setItem(app.id + '_survey_dash_pin', appPin);
              } catch (e) {}
            }
            return { id: app.id, success: true, data: out };
          }
          throw new Error(out && out.error ? out.error : 'Format data tidak sesuai');
        })
        .catch(function (err) {
          return { id: app.id, success: false, error: err.message };
        });
    });

    Promise.allSettled(promises).then(function (results) {
      var pinNeededCount = 0;
      var allSuccess = true;
      var liveData = {};
      var demo = buildDemoPayloads();

      results.forEach(function (res) {
        var val = res.value;
        if (!val) return;
        var appConf = apps.find(function (a) { return a.id === val.id; });
        var syncEl = document.getElementById('sync' + val.id.charAt(0).toUpperCase() + val.id.slice(1));
        var stat = syncEl ? syncEl.querySelector('.sync-card__status') : null;

        if (val.pinRequired) {
          pinNeededCount++;
          if (stat) stat.innerHTML = '<span style="color:var(--danger)">🔒 Memerlukan PIN</span>';
        } else if (val.success && val.data) {
          var sl = val.data.slices.all || {};
          liveData[val.id] = {
            appId: val.id,
            name: appConf.name,
            shortName: appConf.shortName,
            appUrl: appConf.appUrl,
            count: sl.count || 0,
            z1Avg: sl.z1Avg || 0,
            z1IndexPct: sl.z1IndexPct || 0,
            z1Category: sl.z1Category || '—',
            nps: sl.nps,
            npsCategory: sl.npsCategory || '—',
            npsBreakdown: sl.npsBreakdown || { promoter: 0, passive: 0, detractor: 0, total: 0 },
            z1Dist: sl.z1Dist || [0, 0, 0, 0, 0],
            eucs: sl.eucs || {},
            byProdi: val.data.byProdi || [],
            topStrength: demo[val.id].topStrength,
            priorityFix: demo[val.id].priorityFix
          };
          if (stat) stat.innerHTML = '<span style="color:var(--success)">✓ Terhubung (' + (sl.count || 0) + ' respons)</span>';
        } else {
          allSuccess = false;
          liveData[val.id] = demo[val.id];
          if (stat) stat.innerHTML = '<span style="color:var(--warning)">Mode simulasi (' + demo[val.id].count + ' respons)</span>';
        }
      });

      // Jika ada spreadsheet yang meminta PIN dan PIN belum dimasukkan / salah
      if (pinNeededCount > 0) {
        if (elPinGate) {
          elPinGate.hidden = false;
          elPinGate.style.display = '';
        }
        if (elToolbar) {
          elToolbar.hidden = true;
          elToolbar.style.display = 'none';
        }
        elContent.innerHTML = '';
        updateHeaderActionsLayout(true);
        renderBanner('', false);

        if (state.pin) {
          if (elPinError) {
            var msg = 'Kode PIN tidak cocok untuk ' + pinNeededCount + ' spreadsheet. ';
            if (pinNeededCount < apps.length) {
              msg += 'Sistem lain memiliki PIN berbeda di spreadsheet-nya. Daftarkan PIN masing-masing di assets/config.js ATAU samakan nilai cell B2 di keempat spreadsheet.';
            } else {
              msg += 'Silakan periksa cell B2 tab Pengaturan di Spreadsheet.';
            }
            elPinError.textContent = msg;
            elPinError.hidden = false;
          }
          savePin('');
          state.pin = '';
        } else {
          elMeta.textContent = 'Akses terproteksi — Masukkan kode PIN akses spreadsheet untuk menampilkan data komparasi riil.';
        }
        if (elPinInput) elPinInput.focus();
        return;
      }

      // PIN cocok atau tidak diproteksi
      if (elPinGate) elPinGate.hidden = true;
      if (elPinError) elPinError.hidden = true;

      state.appsData = liveData;
      state.isDemo = !allSuccess;

      var totalRealResponses = Object.keys(liveData).reduce(function (sum, k) {
        return sum + (liveData[k].count || 0);
      }, 0);

      if (totalRealResponses === 0 && !allSuccess) {
        renderBanner(
          '<span><strong>Informasi Mode Perbandingan:</strong> ' +
          'Kuesioner di Google Spreadsheet masih kosong (belum ada responden yang mengirim jawaban). ' +
          'Di bawah ini ditampilkan data simulasi terpadu agar visualisasi grafik dan peta radar komparasi dapat ditinjau. ' +
          'Begitu responden mengisi form kuesioner, data asli akan langsung muncul di sini.</span>',
          true
        );
      } else if (!allSuccess) {
        renderBanner(
          '<span><strong>Informasi Mode Perbandingan:</strong> ' +
          'Sebagian platform berhasil terhubung dengan data asli, sementara platform lainnya menggunakan data simulasi cadangan. ' +
          'Klik tombol <strong>Muat Ulang</strong> untuk menyinkronkan kembali respon real-time dari Google Spreadsheet.</span>',
          true
        );
      } else {
        renderBanner('', false);
      }

      renderDashboard();
    });
  }

  function renderBanner(html, isWarn) {
    if (!elBanner) return;
    if (!html) {
      elBanner.innerHTML = '';
      elBanner.style.display = 'none';
      return;
    }
    elBanner.className = 'dash-banner ' + (isWarn ? 'dash-banner--warn' : 'dash-banner--info');
    elBanner.innerHTML = html;
    elBanner.style.display = '';
  }

  function updateHeaderActionsLayout(isLocked) {
    var group = document.getElementById('dashActionsGroup');
    var slotLocked = document.getElementById('dashHeaderActionsLocked');
    var slotUnlocked = document.getElementById('dashActionsUnlocked');
    if (!group || !slotLocked || !slotUnlocked) return;

    if (isLocked) {
      if (group.parentElement !== slotLocked) slotLocked.appendChild(group);
      slotLocked.hidden = false;
      slotUnlocked.hidden = true;
      if (btnGlossary) btnGlossary.hidden = true;
      if (btnDemo) btnDemo.hidden = false; // Tetap izinkan demo jika ingin lihat pratinjau
      if (btnRefresh) btnRefresh.hidden = true;
      if (btnPrint) btnPrint.hidden = true;
      if (btnLock) btnLock.hidden = true;
    } else {
      if (group.parentElement !== slotUnlocked) slotUnlocked.appendChild(group);
      slotLocked.hidden = true;
      slotUnlocked.hidden = false;
      if (btnGlossary) btnGlossary.hidden = false;
      if (btnDemo) btnDemo.hidden = false;
      if (btnRefresh) btnRefresh.hidden = false;
      if (btnPrint) btnPrint.hidden = false;
      if (btnLock) btnLock.hidden = false;
    }
  }

  /* ---------- SVG Visualizers ---------- */
  function renderStackedLikertMini(dist, total) {
    if (!total || !dist) return '<div class="app-bar-track"><span style="width:100%;background:var(--line)"></span></div>';
    var colors = ['#ef4444', '#f97316', '#eab308', '#38bdf8', '#10b981'];
    var segs = dist.map(function (c, i) {
      if (!c) return '';
      var pct = ((c / total) * 100).toFixed(1);
      return '<span style="width:' + pct + '%;background:' + colors[i] + '" title="Skala ' + (i + 1) + ': ' + c + ' (' + pct + '%)"></span>';
    }).join('');
    return '<div style="display:flex;height:8px;border-radius:var(--radius);overflow:hidden;background:var(--line)">' + segs + '</div>';
  }

  function renderRadarBenchmarkSVG(appsData) {
    var cx = 190;
    var cy = 160;
    var R = 98;
    var levels = [1, 2, 3, 4, 5];
    var keys = window.CONFIG.EUCS.keys;
    var numAxes = keys.length;

    function pt(axisIdx, val) {
      var angle = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / numAxes;
      var r = (Math.max(0, Math.min(5, val || 0)) / 5) * R;
      return [
        Math.round((cx + r * Math.cos(angle)) * 10) / 10,
        Math.round((cy + r * Math.sin(angle)) * 10) / 10
      ];
    }

    var rings = levels.map(function (lv) {
      var pts = keys.map(function (_, idx) { return pt(idx, lv).join(','); }).join(' ');
      return '<polygon points="' + pts + '" fill="none" stroke="' + (lv === 5 ? 'var(--line-strong, #cbd5e1)' : 'var(--line, #e2e8f0)') + '" stroke-width="1"/>';
    }).join('');

    var axes = keys.map(function (k, idx) {
      var end = pt(idx, 5);
      var lbl = pt(idx, 6.2);
      var anchor = idx === 0 ? 'middle' : (idx === 1 || idx === 2 ? 'start' : 'end');
      var dy = idx === 0 ? -4 : (idx === 2 || idx === 3 ? 7 : 3);
      var name = window.CONFIG.EUCS.namesID[k] || k;
      return '' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + end[0] + '" y2="' + end[1] + '" stroke="var(--line, #e2e8f0)" stroke-width="1"/>' +
        '<text x="' + lbl[0] + '" y="' + (lbl[1] + dy) + '" text-anchor="' + anchor + '" fill="var(--ink, #334155)" font-size="10.5" font-weight="600">' +
          esc(name) + ' (' + k + ')' +
        '</text>';
    }).join('');

    var scaleTicks = [2, 4].map(function (lv) {
      var p = pt(0, lv);
      return '<text x="' + (p[0] + 5) + '" y="' + (p[1] + 3) + '" fill="var(--muted, #94a3b8)" font-size="8.5" font-weight="600">' + lv + '</text>';
    }).join('');

    var appConfigs = window.CONFIG.APPS || [];
    var polygonsHTML = appConfigs.map(function (app) {
      if (!state.visiblePolys[app.id]) return '';
      var d = appsData[app.id];
      if (!d || !d.eucs) return '';

      var coords = keys.map(function (k, idx) {
        var avg = d.eucs[k] && d.eucs[k].avg ? d.eucs[k].avg : 0;
        return pt(idx, avg);
      });
      var polyStr = coords.map(function (c) { return c.join(','); }).join(' ');
      var dots = coords.map(function (c) {
        return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.4" fill="' + app.color + '" stroke="#fff" stroke-width="1.5"/>';
      }).join('');

      return '' +
        '<polygon points="' + polyStr + '" fill="' + app.color + '" fill-opacity="0.14" stroke="' + app.color + '" stroke-width="2.2"/>' +
        dots;
    }).join('');

    var legendHTML = '<div class="chart-legend">' + appConfigs.map(function (app) {
      var active = state.visiblePolys[app.id];
      var op = active ? '1' : '0.4';
      var textDec = active ? 'none' : 'line-through';
      return '' +
        '<span class="chart-legend__item" data-toggle-app="' + app.id + '" style="opacity:' + op + ';text-decoration:' + textDec + '">' +
          '<i class="chart-legend__dot" style="background:' + app.color + '"></i>' +
          '<strong>' + esc(app.shortName) + '</strong>' +
        '</span>';
    }).join('') + '</div>';

    return '' +
      '<div class="radar-wrap">' +
        '<svg class="radar-svg" viewBox="0 0 380 320" role="img" aria-label="Peta Radar Benchmark 4 Platform">' +
          rings + axes + scaleTicks + polygonsHTML +
        '</svg>' +
      '</div>' +
      legendHTML;
  }

  /* ---------- Main Dashboard Renderer ---------- */
  function renderDashboard() {
    var data = state.appsData;
    var apps = window.CONFIG.APPS || [];
    if (!apps.length) return;

    updateHeaderActionsLayout(false);
    if (elToolbar) {
      elToolbar.hidden = false;
      elToolbar.style.display = '';
    }
    if (btnDemo) {
      btnDemo.classList.toggle('btn--active', Boolean(state.isDemo));
      btnDemo.textContent = state.isDemo ? 'Matikan Simulasi' : 'Data Simulasi';
    }

    var totalResponden = apps.reduce(function (sum, a) {
      return sum + ((data[a.id] && data[a.id].count) || 0);
    }, 0);

    elMeta.textContent = (state.isDemo ? '[MODE SIMULASI TERPADU] · ' : '') +
      'Menganalisis ' + totalResponden + ' total responden aktif di 4 platform digital kampus Politeknik IDN.';

    /* 1. Executive Leaderboard */
    var sortedByZ1 = apps.slice().sort(function (a, b) {
      var zA = (data[a.id] && data[a.id].z1Avg) || 0;
      var zB = (data[b.id] && data[b.id].z1Avg) || 0;
      return zB - zA;
    });

    var leaderboardHTML = '<section class="leaderboard-grid">' + apps.map(function (app) {
      var d = data[app.id] || {};
      var rankIdx = sortedByZ1.findIndex(function (item) { return item.id === app.id; });
      var rankLabel = '#' + (rankIdx + 1) + ' Peringkat Mutu';
      var rankPill = rankIdx === 0 ? 'pill--best' : 'pill--neutral';

      return '' +
        '<article class="app-card" style="border-top:3px solid ' + app.color + '">' +
          '<div>' +
            '<div class="app-card__head">' +
              '<div class="app-card__badge-row">' +
                '<span class="app-tag" style="background:' + app.colorBg + ';color:' + app.color + '">' + esc(app.shortName) + '</span>' +
                '<span class="pill ' + rankPill + '">' + rankLabel + '</span>' +
              '</div>' +
              categoryBadge(d.z1Category) +
            '</div>' +
            '<h2 class="app-card__name">' + esc(app.name) + '</h2>' +
            '<p class="app-card__cat">' + esc(app.category) + '</p>' +
          '</div>' +

          '<div class="app-card__scores">' +
            '<div>' +
              '<div class="score-box__val">' + fmtNum(d.z1Avg, 2) + '<small> / 5,00</small></div>' +
              '<div class="score-box__label">Kepuasan Umum (Z1)</div>' +
            '</div>' +
            '<div>' +
              '<div class="score-box__val" style="color:' + app.color + '">' + fmtPct(d.z1IndexPct) + '</div>' +
              '<div class="score-box__label">Indeks Kepuasan</div>' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<div style="font-size:.72rem;font-weight:600;color:var(--muted);margin-bottom:4px;display:flex;justify-content:space-between">' +
              '<span>Distribusi Skala 1–5</span>' +
              '<span>' + d.count + ' respons</span>' +
            '</div>' +
            renderStackedLikertMini(d.z1Dist, d.count) +
          '</div>' +

          '<div class="app-card__foot">' +
            '<span>NPS: <strong style="color:var(--ink)">' + (d.nps > 0 ? '+' : '') + fmtNum(d.nps, 1) + '</strong> (' + esc(d.npsCategory) + ')</span>' +
            '<a href="' + app.dashboardUrl + '" class="small" style="color:var(--accent);text-decoration:none;font-weight:600" title="Buka detail dashboard ' + esc(app.shortName) + '">Detail Dashboard →</a>' +
          '</div>' +
        '</article>';
    }).join('') + '</section>';

    /* 2. Grid-2: Radar Benchmark + Grouped EUCS */
    var radarSectionHTML = '' +
      '<article class="panel">' +
        '<div class="panel__head">' +
          '<div>' +
            '<h2 class="panel__title">Peta Radar Benchmark 4 Platform (EUCS)</h2>' +
            '<p class="panel__sub">Perbandingan bentuk profil mutu 5 dimensi secara visual (klik nama platform di legenda untuk menyaring).</p>' +
          '</div>' +
        '</div>' +
        renderRadarBenchmarkSVG(data) +
      '</article>';

    var groupedEucsHTML = '' +
      '<article class="panel">' +
        '<div class="panel__head">' +
          '<div>' +
            '<h2 class="panel__title">Komparasi 5 Dimensi Mutu Layanan</h2>' +
            '<p class="panel__sub">Skor rata-rata skala 1–5 pada tiap pilar evaluasi End-User Computing Satisfaction.</p>' +
          '</div>' +
        '</div>' +
        '<div class="grouped-eucs">' +
          window.CONFIG.EUCS.keys.map(function (k) {
            var dimName = window.CONFIG.EUCS.namesID[k];
            var dimDesc = window.CONFIG.EUCS.descriptions[k];
            return '' +
              '<div class="eucs-dim-group">' +
                '<div class="eucs-dim-group__head">' +
                  '<span><span class="eucs-dim-group__code">' + k + '</span>' + esc(dimName) + '</span>' +
                  '<span class="small muted" style="font-weight:400">' + esc(dimDesc) + '</span>' +
                '</div>' +
                '<div class="app-bars-row">' +
                  apps.map(function (app) {
                    var appD = data[app.id] || {};
                    var eVal = appD.eucs && appD.eucs[k] ? appD.eucs[k].avg : 0;
                    var pct = Math.max(0, Math.min(100, (eVal / 5) * 100));
                    return '' +
                      '<div class="app-bar-item">' +
                        '<div class="app-bar-item__top">' +
                          '<span>' + esc(app.shortName) + '</span>' +
                          '<strong>' + fmtNum(eVal, 2) + '</strong>' +
                        '</div>' +
                        '<div class="app-bar-track">' +
                          '<div class="app-bar-fill" style="width:' + pct + '%;background:' + app.color + '"></div>' +
                        '</div>' +
                      '</div>';
                  }).join('') +
                '</div>' +
              '</div>';
          }).join('') +
        '</div>' +
      '</article>';

    var row2HTML = '<section class="grid-2">' + radarSectionHTML + groupedEucsHTML + '</section>';

    /* 3. Grid-2: NPS Battle + Cross-Prodi Performance */
    var npsTableRows = apps.map(function (app) {
      var d = data[app.id] || {};
      var b = d.npsBreakdown || { promoter: 0, passive: 0, detractor: 0, total: 0 };
      var tot = b.total || d.count || 1;
      var pProm = ((b.promoter / tot) * 100).toFixed(1);
      var pPass = ((b.passive / tot) * 100).toFixed(1);
      var pDet = ((b.detractor / tot) * 100).toFixed(1);

      return '' +
        '<tr>' +
          '<td>' +
            '<span class="app-tag" style="background:' + app.colorBg + ';color:' + app.color + '">' + esc(app.shortName) + '</span>' +
          '</td>' +
          '<td>' +
            '<div class="stacked-nps-bar">' +
              '<span style="width:' + pProm + '%;background:#10b981" title="Promoter: ' + b.promoter + ' (' + pProm + '%)"></span>' +
              '<span style="width:' + pPass + '%;background:#f59e0b" title="Passive: ' + b.passive + ' (' + pPass + '%)"></span>' +
              '<span style="width:' + pDet + '%;background:#ef4444" title="Detractor: ' + b.detractor + ' (' + pDet + '%)"></span>' +
            '</div>' +
          '</td>' +
          '<td><strong>' + (d.nps > 0 ? '+' : '') + fmtNum(d.nps, 1) + '</strong></td>' +
          '<td>' + categoryBadge(d.npsCategory) + '</td>' +
          '<td class="small muted">' + b.promoter + ' / ' + b.passive + ' / ' + b.detractor + '</td>' +
        '</tr>';
    }).join('');

    var npsPanelHTML = '' +
      '<article class="panel">' +
        '<div class="panel__head">' +
          '<div>' +
            '<h2 class="panel__title">Komposisi Loyalitas &amp; Net Promoter Score</h2>' +
            '<p class="panel__sub">Proporsi civitas: Promoter (9–10 hijau), Passive (7–8 kuning), Detractor (0–6 merah).</p>' +
          '</div>' +
        '</div>' +
        '<div style="overflow-x:auto">' +
          '<table class="nps-battle-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Platform</th>' +
                '<th>Rasio Promoter / Pasif / Detractor</th>' +
                '<th>Skor NPS</th>' +
                '<th>Kategori</th>' +
                '<th>P / N / D</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + npsTableRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</article>';

    /* Cross-Prodi Table */
    var prodiRows = (window.CONFIG.PRODI || []).map(function (pr) {
      var appCols = apps.map(function (app) {
        var d = data[app.id] || {};
        var match = (d.byProdi || []).find(function (p) {
          return String(p.kode) === String(pr.kode) || p.nama.indexOf(pr.short) !== -1;
        });
        if (!match) return '<td><span class="muted">—</span></td>';
        return '' +
          '<td>' +
            '<span class="prodi-score-pill" style="color:' + app.color + '">' + fmtNum(match.z1Avg, 2) + '</span>' +
            '<div class="small muted">' + fmtPct(match.z1IndexPct) + ' (' + match.count + ')</div>' +
          '</td>';
      }).join('');

      return '' +
        '<tr>' +
          '<td><strong>' + esc(pr.nama) + '</strong> <span class="pill pill--neutral" style="margin-left:4px">' + esc(pr.short) + '</span></td>' +
          appCols +
        '</tr>';
    }).join('');

    var prodiPanelHTML = '' +
      '<article class="panel">' +
        '<div class="panel__head">' +
          '<div>' +
            '<h2 class="panel__title">Kepuasan Lintas Program Studi</h2>' +
            '<p class="panel__sub">Tingkat penerimaan mahasiswa &amp; dosen pada 3 prodi Politeknik IDN.</p>' +
          '</div>' +
        '</div>' +
        '<div style="overflow-x:auto">' +
          '<table class="prodi-matrix-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Program Studi</th>' +
                apps.map(function (a) { return '<th>' + esc(a.shortName) + '</th>'; }).join('') +
              '</tr>' +
            '</thead>' +
            '<tbody>' + prodiRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</article>';

    var row3HTML = '<section class="grid-2">' + npsPanelHTML + prodiPanelHTML + '</section>';

    /* 4. Matriks Fitur Unggulan vs Prioritas Evaluasi */
    var evalCardsHTML = apps.map(function (app) {
      var d = data[app.id] || {};
      return '' +
        '<div class="eval-card" style="border-top:3px solid ' + app.color + '">' +
          '<div class="eval-card__title">' +
            '<span class="chart-legend__dot" style="background:' + app.color + '"></span>' +
            '<span>' + esc(app.name) + '</span>' +
          '</div>' +
          '<div class="eval-box">' +
            '<div class="eval-box__label eval-box__label--pos">★ Fitur Paling Diapresiasi</div>' +
            '<div class="eval-item">' +
              '<span>' + esc(d.topStrength || 'Keandalan fitur utama sistem') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="eval-box" style="margin-bottom:0">' +
            '<div class="eval-box__label eval-box__label--neg">⚠ Prioritas Evaluasi &amp; Peningkatan</div>' +
            '<div class="eval-item">' +
              '<span>' + esc(d.priorityFix || 'Peningkatan kecepatan pada jam sibuk') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    var row4HTML = '' +
      '<section class="panel" style="margin-bottom:24px">' +
        '<div class="panel__head">' +
          '<div>' +
            '<h2 class="panel__title">Matriks Keunggulan &amp; Prioritas Penyempurnaan Sistem</h2>' +
            '<p class="panel__sub">Poin evaluasi strategis hasil agregasi kualitatif dan skor butir kuesioner.</p>' +
          '</div>' +
        '</div>' +
        '<div class="matrix-4col">' + evalCardsHTML + '</div>' +
      '</section>';

    elContent.innerHTML = leaderboardHTML + row2HTML + row3HTML + row4HTML;
    bindInteractiveEvents();
  }

  function bindInteractiveEvents() {
    // Toggle radar polygon visibility
    document.querySelectorAll('[data-toggle-app]').forEach(function (el) {
      el.addEventListener('click', function () {
        var appId = el.getAttribute('data-toggle-app');
        state.visiblePolys[appId] = !state.visiblePolys[appId];
        renderDashboard();
      });
    });
  }

  /* ---------- Event Listeners ---------- */
  function toggleDemo() {
    state.isDemo = !state.isDemo;
    if (state.isDemo) {
      state.appsData = buildDemoPayloads();
      if (elPinGate) elPinGate.hidden = true;
      if (elToolbar) {
        elToolbar.hidden = false;
        elToolbar.style.display = '';
      }
      updateHeaderActionsLayout(false);
      renderBanner(
        '<span><strong>Mode Simulasi Aktif:</strong> Menampilkan data komparasi simulasi realistis untuk pengujian visual dan presentasi. Klik kembali <strong>Matikan Simulasi</strong> atau <strong>Muat Ulang</strong> untuk menyinkronkan data riil.</span>',
        true
      );
      renderDashboard();
    } else {
      fetchAllApps();
    }
  }

  if (btnDemo) btnDemo.addEventListener('click', toggleDemo);
  if (btnRefresh) btnRefresh.addEventListener('click', fetchAllApps);
  if (btnPrint) btnPrint.addEventListener('click', function () { window.print(); });

  if (btnLock) {
    btnLock.addEventListener('click', function () {
      savePin('');
      state.pin = '';
      if (elToolbar) {
        elToolbar.hidden = true;
        elToolbar.style.display = 'none';
      }
      fetchAllApps();
    });
  }

  if (elPinForm) {
    elPinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = (elPinInput ? elPinInput.value : '').trim();
      if (!p) return;
      state.pin = p;
      savePin(p);
      fetchAllApps();
    });
  }

  if (btnGlossary) {
    btnGlossary.addEventListener('click', function () {
      if (modalGlossary) modalGlossary.hidden = false;
    });
  }
  if (btnCloseGlossary) {
    btnCloseGlossary.addEventListener('click', function () {
      if (modalGlossary) modalGlossary.hidden = true;
    });
  }
  if (modalGlossary) {
    modalGlossary.addEventListener('click', function (e) {
      if (e.target === modalGlossary) modalGlossary.hidden = true;
    });
  }

  if (btnTheme) {
    btnTheme.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
        localStorage.setItem('simta_theme', next);
        localStorage.setItem('portofolio_theme', next);
        localStorage.setItem('lms_theme', next);
      } catch (e) {}
    });
  }

  // Mulai tarik data
  fetchAllApps();
})();
