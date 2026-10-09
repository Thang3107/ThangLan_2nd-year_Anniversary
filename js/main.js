/* =====================================================================
   CHAPTER TWO · main.js
   Toàn bộ logic của web. Nội dung (chữ, ảnh, ngày…) nằm ở content.js.
   ---------------------------------------------------------------------
   Mục lục:
   01. Tiện ích chung (DOM, lưu trữ, ảnh, toast)
   02. Trái tim bay (canvas nền + chùm tim khi chạm)
   03. Nhạc nền + đĩa than
   04. Modal (giữ focus, Esc, bấm ra ngoài)
   05. Intro: thiệp 3D + mật khẩu
   06. Render các mục
   07. Bộ đếm thời gian + đồng hồ chung
   08. Số chạy, hiện dần khi cuộn, thanh tiến độ
   09. Lightbox ảnh + thanh so sánh
   10. Thẻ lý do, thư, quiz, mục tiêu, hộp thư tương lai
   11. Easter egg: 5 mảnh tim → video
   12. Khởi động
   ===================================================================== */
(function () {
  "use strict";

  var C = window.CONTENT;
  if (!C) { console.warn("Thiếu js/content.js"); return; }

  /* =================================================================
     01. TIỆN ÍCH CHUNG
     ================================================================= */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqCoarse = window.matchMedia("(pointer: coarse)");
  var reduced = mqReduce.matches;
  var isTouch = mqCoarse.matches;
  var isSmall = function () { return window.innerWidth < 640; };

  var HEART_D = "M50 88C20 66 4 50 4 28 4 14 15 4 28 4c10 0 18 6 22 14 4-8 12-14 22-14 13 0 24 10 24 24 0 22-16 38-46 60z";

  // Thoát ký tự đặc biệt khi chèn chữ vào HTML
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmt(n) {
    try { return Math.round(n).toLocaleString("vi-VN"); }
    catch (e) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  // localStorage bọc try/catch (chế độ ẩn danh / chặn cookie vẫn chạy)
  var store = {
    get: function (k, fallback) {
      try { var v = window.localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ }
    }
  };
  var KEY = { auth: "ch2_auth", pieces: "ch2_pieces", secret: "ch2_secret_done", goals: "ch2_goals" };

  // Ngày giờ
  var START = new Date(C.dates.start).getTime();
  var NEXT = new Date(C.dates.nextAnniversary).getTime();
  var DAY = 864e5;

  // Ảnh có placeholder hồng khi thiếu file
  function phImg(src, alt, opts) {
    opts = opts || {};
    var cls = "ph" + (opts.cls ? " " + opts.cls : "");
    var text = esc(opts.ph || C.placeholderText || "Ảnh của mình ở đây");
    if (!src) return '<div class="' + cls + ' is-missing" data-ph="' + text + '" role="img" aria-label="' + esc(alt || "") + '"></div>';
    var lazy = opts.eager ? "" : ' loading="lazy"';
    return '<div class="' + cls + '" data-ph="' + text + '"><img src="' + esc(src) + '" alt="' + esc(alt || "") + '"' + lazy + ' decoding="async"></div>';
  }
  function bindImages(root) {
    $$(".ph img", root).forEach(function (img) {
      if (img.dataset.bound) return;
      img.dataset.bound = "1";
      var box = img.parentNode;
      var ok = function () { box.classList.add("is-loaded"); };
      var bad = function () { box.classList.add("is-missing"); };
      if (img.complete) {
        if (img.naturalWidth > 0) ok(); else if (img.getAttribute("src")) bad();
      }
      img.addEventListener("load", ok);
      img.addEventListener("error", bad);
    });
  }

  // Thông báo nhỏ
  var toastEl = $("#toast"), toastTimer = 0;
  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, ms || 3400);
  }

  // Tiêu đề mỗi mục: số trang + tiếng Anh + dòng phụ tiếng Việt
  var pageNo = 0;
  function head(title, sub, lead, no) {
    if (no == null) { pageNo += 1; no = pageNo; }
    return '<header class="page-head reveal">' +
      '<p class="page-no">Chapter 2 · p.' + pad(no) + '</p>' +
      '<h2 class="title">' + esc(title) + '</h2>' +
      '<p class="sub">' + esc(sub) + '</p>' +
      (lead ? '<p class="lead">' + esc(lead) + '</p>' : "") +
      '</header>';
  }

  var heartSVG = function (cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 100 92" aria-hidden="true"><path d="' + HEART_D + '" fill="currentColor"/></svg>';
  };

  /* =================================================================
     02. TRÁI TIM BAY
     ================================================================= */
  var Hearts = (function () {
    var bg = $("#heartsBg"), fx = $("#heartsFx");
    var bctx = bg.getContext("2d"), fctx = fx.getContext("2d");
    // màu tim (đậm hơn bản đầu một chút)
    var COLORS = ["#E8869F", "#EE9AB3", "#E07A9A", "#D9668A", "#C99BE0", "#F59E85", "#EC6F95"];
    var sprites = [];
    var dpr = 1, W = 0, H = 0;
    var floaters = [], bursts = [];
    var running = false, last = 0, raf = 0;

    // Vẽ sẵn tim từng màu để vẽ nhanh hơn
    function makeSprites() {
      var path = window.Path2D ? new Path2D(HEART_D) : null;
      COLORS.forEach(function (c) {
        var cv = document.createElement("canvas");
        cv.width = 64; cv.height = 60;
        var x = cv.getContext("2d");
        x.scale(0.64, 0.64);
        x.fillStyle = c;
        if (path) x.fill(path);
        else { x.beginPath(); x.arc(30, 30, 26, 0, 7); x.arc(70, 30, 26, 0, 7); x.moveTo(6, 40); x.lineTo(50, 90); x.lineTo(94, 40); x.fill(); }
        sprites.push(cv);
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      [bg, fx].forEach(function (cv) {
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = reduced ? 5 : (isSmall() ? 13 : 26);
      while (floaters.length < target) floaters.push(newFloater(true));
      if (floaters.length > target) floaters.length = target;
    }

    function newFloater(anywhere) {
      var s = 8 + Math.random() * (isSmall() ? 14 : 20);
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 30,
        s: s,
        v: (reduced ? 0.08 : 0.22) + Math.random() * (reduced ? 0.06 : 0.38),
        a: 0.22 + Math.random() * 0.26,
        sw: 6 + Math.random() * 18,
        ph: Math.random() * Math.PI * 2,
        f: 0.004 + Math.random() * 0.008,
        r: (Math.random() - 0.5) * 0.5,
        img: sprites[(Math.random() * sprites.length) | 0]
      };
    }

    function burst(x, y, n, big) {
      n = n || (reduced ? 3 : (isSmall() ? 7 : 10));
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2;
        var sp = (big ? 2.4 : 1.4) + Math.random() * (big ? 4.5 : 2.6);
        bursts.push({
          x: x, y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - (big ? 2.4 : 1.6),
          s: (big ? 12 : 9) + Math.random() * (big ? 18 : 10),
          life: 0,
          max: (reduced ? 30 : 60) + Math.random() * 40,
          rot: (Math.random() - 0.5) * 0.8,
          vr: (Math.random() - 0.5) * 0.08,
          img: sprites[(Math.random() * sprites.length) | 0]
        });
      }
      start();
    }

    function draw(ctx, p, alpha) {
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || p.r || 0);
      ctx.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s * 0.94);
      ctx.restore();
    }

    function frame(t) {
      if (!running) return;
      var dt = clamp((t - last) / 16.67, 0.2, 3);
      last = t;

      // tim nền
      bctx.clearRect(0, 0, W, H);
      for (var i = 0; i < floaters.length; i++) {
        var p = floaters[i];
        p.y -= p.v * dt;
        p.ph += p.f * dt;
        var x = p.x + Math.sin(p.ph) * p.sw;
        if (p.y < -30) { floaters[i] = newFloater(false); continue; }
        var keep = p.x; p.x = x; draw(bctx, p, p.a); p.x = keep;
      }

      // chùm tim khi chạm
      fctx.clearRect(0, 0, W, H);
      for (var j = bursts.length - 1; j >= 0; j--) {
        var b = bursts[j];
        b.life += dt;
        b.vx *= Math.pow(0.97, dt);
        b.vy += 0.07 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.rot += b.vr * dt;
        var k = b.life / b.max;
        if (k >= 1) { bursts.splice(j, 1); continue; }
        draw(fctx, b, (1 - k) * 0.95);
      }
      fctx.globalAlpha = 1; bctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function init() {
      makeSprites();
      resize();
      var rt = 0, lastW = window.innerWidth;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          // bỏ qua thay đổi chiều cao nhỏ do thanh địa chỉ điện thoại
          if (window.innerWidth !== lastW || Math.abs(window.innerHeight - H) > 120) { lastW = window.innerWidth; resize(); }
        }, 150);
      });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });
      // chạm/click bất kỳ đâu → bung chùm tim
      document.addEventListener("pointerdown", function (e) {
        if (e.button && e.button !== 0) return;
        burst(e.clientX, e.clientY);
      }, { passive: true });
      start();
    }

    return { init: init, burst: burst };
  })();

  /* =================================================================
     03. NHẠC NỀN + ĐĨA THAN
     ================================================================= */
  var Music = (function () {
    var audio = null, on = false, broken = false, fadeRaf = 0, resumeOnShow = false, held = false;
    var btn = $("#vinyl");
    var VOL = clamp(+((C.music && C.music.volume) || 0.5), 0, 1);

    function ui() {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Tắt nhạc" : "Bật nhạc");
    }
    function ensure() {
      if (audio || broken) return audio;
      try {
        audio = new Audio();
        audio.src = (C.music && C.music.src) || "music/background.mp3";
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0;
        audio.addEventListener("error", function () {
          // thiếu file nhạc: im lặng cho qua, ẩn nút
          broken = true; on = false; ui(); btn.hidden = true;
        });
      } catch (e) { broken = true; audio = null; }
      return audio;
    }
    function fade(to, ms, done) {
      cancelAnimationFrame(fadeRaf);
      if (!audio) return;
      var from = audio.volume, t0 = performance.now();
      if (reduced) ms = Math.min(ms, 200);
      (function step(t) {
        var k = clamp((t - t0) / ms, 0, 1);
        try { audio.volume = clamp(from + (to - from) * k, 0, 1); } catch (e) { /* iOS: volume chỉ đọc */ }
        if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
      })(t0);
    }
    function play() {
      if (!ensure()) return;
      on = true; ui();
      var p;
      try { p = audio.play(); } catch (e) { p = null; }
      if (p && p.then) {
        p.then(function () { fade(VOL, 2200); }).catch(function () { on = false; ui(); });
      } else { fade(VOL, 2200); }
    }
    function pause(instant) {
      on = false; ui();
      if (!audio) return;
      if (instant) { audio.pause(); return; }
      fade(0, 700, function () { if (!on) audio.pause(); });
    }
    // Tạm dừng khi có video (hold) và phát lại khi xong
    function hold() { if (on) { held = true; pause(); } }
    function release() { if (held) { held = false; play(); } }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (on) { pause(); held = false; } else play();
    });
    document.addEventListener("visibilitychange", function () {
      if (!audio) return;
      if (document.hidden) { if (on) { resumeOnShow = true; audio.pause(); } }
      else if (resumeOnShow) { resumeOnShow = false; if (on) audio.play().catch(function () {}); }
    });

    return {
      start: function () { btn.hidden = false; play(); },
      hold: hold, release: release,
      isOn: function () { return on; }
    };
  })();

  /* =================================================================
     04. MODAL
     ================================================================= */
  var Modal = (function () {
    var stack = [];
    var FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), iframe, video[controls], [tabindex]:not([tabindex="-1"])';

    function open(el, opts) {
      opts = opts || {};
      var entry = { el: el, opts: opts, back: document.activeElement };
      stack.push(entry);
      el.hidden = false;
      document.body.classList.add("is-modal");
      var first = opts.focus || $(".modal__close", el);
      setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, 30);
    }
    function close(el) {
      var i = -1;
      stack.forEach(function (s, k) { if (s.el === el) i = k; });
      if (i < 0) return;
      var entry = stack.splice(i, 1)[0];
      el.hidden = true;
      if (!stack.length) document.body.classList.remove("is-modal");
      if (entry.opts.onClose) entry.opts.onClose();
      if (entry.back && entry.back.focus) entry.back.focus({ preventScroll: true });
    }
    function top() { return stack[stack.length - 1]; }

    document.addEventListener("keydown", function (e) {
      var t = top();
      if (!t) return;
      if (e.key === "Escape") { e.preventDefault(); close(t.el); return; }
      if (t.opts.onKey) t.opts.onKey(e);
      if (e.key === "Tab") {
        var f = $$(FOCUSABLE, t.el).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === a || !t.el.contains(document.activeElement))) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && (document.activeElement === z || !t.el.contains(document.activeElement))) { e.preventDefault(); a.focus(); }
      }
    });
    document.addEventListener("click", function (e) {
      var t = top();
      if (t && e.target.closest && e.target.closest("[data-close]") && t.el.contains(e.target)) close(t.el);
    });

    return { open: open, close: close, isOpen: function (el) { return stack.some(function (s) { return s.el === el; }); } };
  })();

  /* =================================================================
     05. INTRO: THIỆP 3D + MẬT KHẨU
     ================================================================= */
  var Intro = (function () {
    var I = C.intro || {};
    var intro = $("#intro"), stage = $("#introStage"), book = $("#book"), tilt = $("#bookTilt");
    var form = $("#lockForm"), input = $("#lockInput"), msg = $("#lockMsg"), hintEl = $("#lockHint");
    var tapBtn = $("#coverTap");
    var wrong = 0, opened = false, tiltOn = true;

    // Chuẩn hoá: chữ thường → bỏ dấu → bỏ ký tự không phải chữ/số
    function normalize(s) {
      return String(s || "").toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "");
    }
    function isRight(v) {
      var n = normalize(v);
      if (!n) return false;
      return arr(I.answers).some(function (a) { return normalize(a) === n; });
    }

    function fill() {
      $("#introBrand").textContent = I.brand || "";
      $("#coverKicker").textContent = I.coverKicker || "";
      $("#coverTitle").textContent = I.coverTitle || "Chapter Two";
      $("#coverSub").textContent = I.coverSub || "";
      $("#sealText").textContent = (C.couple && C.couple.seal) || "T♥L";
      $("#tapHint").textContent = "♡ " + (I.tapHint || "Chạm để mở");
      $("#lockQ").textContent = I.question || "";
      input.placeholder = I.placeholder || "";
      $("#lockBtn").textContent = I.submitLabel || "Mở thiệp";
      hintEl.innerHTML = "<b>" + esc(I.hintLabel || "Gợi ý:") + "</b> " + esc(I.hint || "");

      var L = I.leftPage || {}, R = I.rightPage || {};
      $("#leftPage").innerHTML =
        '<div class="inside-photo">' + phImg(L.photo, L.photoAlt, { eager: true }) + "</div>" +
        '<p class="inside-quote">“' + esc(L.quote) + '”</p>' +
        '<p class="inside-by">' + esc(L.by) + "</p>";
      $("#rightPage").innerHTML =
        '<p class="inside-kicker">' + esc(R.kicker) + "</p>" +
        '<p class="inside-mini-quote">“' + esc(L.quote) + '”</p>' +
        '<p class="inside-greet">' + esc(R.greeting) + "</p>" +
        '<p class="inside-text">' + esc(R.text) + "</p>" +
        '<p class="inside-sign">' + esc(R.sign) + "</p>" +
        '<button type="button" class="btn btn--rose inside-btn" id="enterBtn">' + esc(R.button) + "</button>";
      bindImages(intro);
    }

    // Nghiêng thiệp theo chuột / con quay hồi chuyển
    function setTilt(rx, ry) {
      tilt.style.setProperty("--tx", rx.toFixed(2) + "deg");
      tilt.style.setProperty("--ty", ry.toFixed(2) + "deg");
    }
    function onMouse(e) {
      if (!tiltOn || opened) return;
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      setTilt(-y * 12, x * 16);
    }
    function onOrient(e) {
      if (!tiltOn || opened || e.gamma == null) return;
      setTilt(clamp(((e.beta || 45) - 45) / 4, -8, 8) * -1, clamp(e.gamma / 3, -10, 10));
    }
    var gyroAsked = false;
    function askGyro() {
      if (gyroAsked || reduced) return;
      gyroAsked = true;
      var D = window.DeviceOrientationEvent;
      if (D && typeof D.requestPermission === "function") {
        D.requestPermission().then(function (s) {
          if (s === "granted") window.addEventListener("deviceorientation", onOrient);
        }).catch(function () {});
      }
    }

    function checkNarrow() {
      // màn hẹp: không đủ chỗ cho 2 trang → chỉ giữ trang phải ở giữa
      var w = book.offsetWidth;
      book.classList.toggle("is-narrow", w * 2 + 24 > window.innerWidth);
    }

    function showLock() {
      tapBtn.hidden = true;
      form.hidden = false;
      form.parentNode.classList.add("is-locking");
      input.focus();
    }

    function openBook() {
      if (opened) return;
      opened = true;
      tiltOn = false;
      setTilt(0, 0);
      checkNarrow();
      book.classList.add("is-open");
      Hearts.burst(window.innerWidth / 2, window.innerHeight / 2, reduced ? 4 : 14, true);
      var enter = $("#enterBtn");
      enter.addEventListener("click", enterSite);
      setTimeout(function () { enter.focus({ preventScroll: true }); }, reduced ? 50 : 1600);
    }

    function onSubmit(e) {
      e.preventDefault();
      var v = input.value;
      if (isRight(v)) {
        store.set(KEY.auth, true);
        msg.textContent = I.rightMessage || "";
        msg.classList.remove("is-pop"); void msg.offsetWidth; msg.classList.add("is-pop");
        input.blur();
        setTimeout(openBook, 650);
        return;
      }
      wrong += 1;
      var list = arr(I.wrongMessages);
      msg.textContent = list.length ? list[(wrong - 1) % list.length] : "Chưa đúng rồi 🥺";
      msg.classList.remove("is-pop"); void msg.offsetWidth; msg.classList.add("is-pop");
      stage.classList.remove("is-shake"); void stage.offsetWidth; stage.classList.add("is-shake");
      if (navigator.vibrate && isTouch) { try { navigator.vibrate(60); } catch (er) { /* bỏ qua */ } }
      if (wrong >= 3) hintEl.hidden = false;
      input.select();
    }

    function enterSite(e) {
      var b = e.currentTarget.getBoundingClientRect();
      Music.start();
      Hearts.burst(b.left + b.width / 2, b.top + b.height / 2, reduced ? 5 : 26, true);
      document.body.classList.remove("is-intro");
      intro.classList.add("is-leaving");
      $("#introBg").classList.add("is-leaving");
      var main = $("#main");
      main.inert = false;
      main.removeAttribute("inert");
      window.scrollTo(0, 0);
      setTimeout(function () {
        $("#hero").classList.add("is-in");
      }, reduced ? 0 : 500);
      setTimeout(function () {
        intro.parentNode && intro.parentNode.removeChild(intro);
        var bg = $("#introBg"); bg && bg.parentNode.removeChild(bg);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("deviceorientation", onOrient);
        var h = $("#heroTitle"); if (h) h.focus({ preventScroll: true });
      }, reduced ? 100 : 1500);
    }

    function init() {
      fill();
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("deviceorientation", onOrient);
      window.addEventListener("resize", function () { if (opened) checkNarrow(); });
      tapBtn.addEventListener("click", function () {
        askGyro();
        if (store.get(KEY.auth, false)) openBook();
        else showLock();
      });
      form.addEventListener("submit", onSubmit);
    }
    return { init: init };
  })();

  /* =================================================================
     06. RENDER CÁC MỤC
     ================================================================= */
  var SECRET = C.secret || {};
  var SPOTS = SECRET.spots || {};

  // SVG một mảnh tim (n = 1..5)
  var PIECE_VB = ["0 0 52 42", "48 0 52 42", "2 30 50 62", "36 16 28 76", "48 30 50 62"];
  function pieceSVG(n) {
    return '<svg viewBox="' + PIECE_VB[n - 1] + '" aria-hidden="true"><g clip-path="url(#hp' + n + ')"><path d="' + HEART_D + '" fill="url(#pieceGrad)" stroke="#fff" stroke-width="1.5"/></g></svg>';
  }
  function pieceBtn(n, cls) {
    var taken = arr(store.get(KEY.pieces, [])).indexOf(n) > -1;
    return '<button type="button" class="piece ' + cls + (taken ? " is-taken" : "") + '" data-piece="' + n + '" aria-label="Một mảnh tim lấp lánh" style="--tw:' + (n * 0.7).toFixed(1) + 's">' + pieceSVG(n) + "</button>";
  }
  function seeded(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

  function renderHero() {
    var H = C.hero || {}, cp = C.couple || {}, W = H.womensDay || {};
    var words = String(H.title || "Chapter Two").split(/\s+/).map(function (w) {
      return '<span class="w">' + esc(w) + "</span>";
    }).join("");
    pageNo += 1;
    $("#hero").innerHTML =
      '<div class="hero__text">' +
        '<p class="hero__kicker">Chapter 2 · p.' + pad(pageNo) + " · " + esc(H.kicker) + "</p>" +
        '<span class="sticker sticker--1" aria-hidden="true">' + heartSVG() + "</span>" +
        '<span class="sticker sticker--2" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="currentColor"/></svg></span>' +
        '<span class="sticker sticker--3" aria-hidden="true"><svg viewBox="0 0 100 92"><path d="' + HEART_D + '" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-dasharray="14 9"/></svg></span>' +
        '<span class="sticker sticker--4" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill="currentColor"/></svg></span>' +
        '<h1 class="hero__title" id="heroTitle" tabindex="-1" aria-label="' + esc(H.title) + '">' + words + "</h1>" +
        '<svg class="hero__underline" viewBox="0 0 320 24" aria-hidden="true"><path d="M6 16 C 60 4, 120 22, 170 12 S 270 4, 314 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' +
        '<p class="hero__sub hero__fade f1">' + esc(H.subtitle) + "</p>" +
        '<p class="hero__names hero__fade f2">' + esc(cp.him) + " &amp; " + esc(cp.her) + "</p>" +
        '<span class="hero__dates hero__fade f3">' + esc(H.dateRange) + "</span>" +
        '<p class="hero__lead hero__fade f4">' + esc(H.lead) + "</p>" +
      "</div>" +
      '<div class="hero__visual hero__fade f5">' +
        '<figure class="polaroid hero__photo"><span class="tape tape--tc"></span>' +
          phImg(H.photo, H.photoAlt, { eager: true }) +
          '<figcaption class="polaroid__cap">' + esc(H.photoCaption) + "</figcaption></figure>" +
        '<aside class="note-2010" aria-label="Lời chúc 20/10"><span class="tape tape--lav tape--tl"></span>' +
          '<svg class="note-2010__flower" viewBox="0 0 48 48" aria-hidden="true"><g fill="currentColor" opacity=".9"><circle cx="24" cy="13" r="8"/><circle cx="34.5" cy="20.6" r="8"/><circle cx="30.5" cy="33" r="8"/><circle cx="17.5" cy="33" r="8"/><circle cx="13.5" cy="20.6" r="8"/></g><circle cx="24" cy="24" r="6" fill="#FFE3D3"/></svg>' +
          '<p class="note-2010__title">' + esc(W.title) + "</p>" +
          '<p class="note-2010__text">' + esc(W.text) + "</p>" +
          '<p class="note-2010__sign">' + esc(W.sign) + "</p>" +
        "</aside>" +
      "</div>" +
      '<button type="button" class="scroll-cue hero__fade f6" id="scrollCue">' + esc(H.scrollLabel || "") +
        '<span class="scroll-cue__arrow" aria-hidden="true">↓</span></button>';
    $("#scrollCue").addEventListener("click", function () {
      $("#together").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  }

  function renderTogether() {
    var T = C.together || {}, u = arr(T.units);
    var units = ["d", "h", "m", "s"].map(function (k, i) {
      return '<div class="unit"><span class="unit__num" id="u_' + k + '">0</span><span class="unit__lbl">' + esc(u[i] || "") + "</span></div>";
    }).join("");
    $("#together").innerHTML =
      head(T.title, T.sub) +
      '<div class="card counter reveal">' +
        pieceBtn(1, "piece--counter") +
        '<div class="counter__grid" aria-live="off">' + units + "</div>" +
        '<p class="counter__today" id="todayLine"></p>' +
        '<p class="counter__since">' + esc(T.since) + "</p>" +
      "</div>" +
      '<div class="countdown reveal" style="--d:.1s" id="countdown">' +
        '<p class="countdown__lbl">' + esc(T.countdownTitle) + "<small>" + esc(T.countdownDate) + "</small></p>" +
        '<div class="countdown__time" id="cdTime"></div>' +
      "</div>";
  }

  function renderChapterOne() {
    var O = C.chapterOne || {};
    var rots = [-1.2, 0.9, -0.6, 1.1, -1, 0.7];
    var cards = arr(O.moments).map(function (m, i) {
      return '<article class="ch1-card reveal" style="--r:' + rots[i % rots.length] + "deg;--d:" + ((i % 3) * 0.08) + 's">' +
        (i % 2 === 0 ? '<span class="tape tape--tr' + (i % 4 === 0 ? " tape--peach" : "") + '"></span>' : "") +
        '<div class="ch1-card__top"><span class="ch1-card__emoji" aria-hidden="true">' + esc(m.emoji) + "</span>" +
        '<span class="stamp">' + esc(m.date) + "</span></div>" +
        '<h3 class="ch1-card__title">' + esc(m.title) + "</h3>" +
        '<p class="ch1-card__text">' + esc(m.text) + "</p></article>";
    }).join("");
    $("#chapterOne").innerHTML = head(O.title, O.sub, O.intro) +
      '<div class="ch1">' + cards + "</div>" +
      '<p class="ch1-cta reveal"><a class="btn btn--ghost" href="' + esc(O.url) + '" target="_blank" rel="noopener">' + esc(O.button) + "</a></p>";
  }

  function renderJourney() {
    var J = C.journey || {}, items = arr(J.items);
    var spot = clamp(SPOTS.journey || 4, 1, items.length || 1);
    var html = items.map(function (it, i) {
      var final = i === items.length - 1;
      return '<li class="tl-item reveal' + (final ? " tl-item--final" : "") + '">' +
        '<span class="tl-dot" aria-hidden="true">' + esc(it.emoji) + "</span>" +
        '<article class="tl-card">' +
          (i + 1 === spot ? pieceBtn(2, "piece--tl") : "") +
          '<p class="tl-date">' + esc(it.date) + "</p>" +
          '<h3 class="tl-title">' + esc(it.title) + "</h3>" +
          '<p class="tl-text">' + esc(it.text) + "</p>" +
          (it.photo ? '<div class="tl-photo" style="--r:' + (i % 2 ? 1.4 : -1.4) + 'deg">' + phImg(it.photo, it.title) + '<span class="polaroid__cap"></span></div>' : "") +
        "</article></li>";
    }).join("");
    $("#journey").innerHTML = head(J.title, J.sub) + '<ol class="tl">' + html + "</ol>";
  }

  function renderNumbers() {
    var N = C.numbers || {};
    var days = Math.max(0, Math.floor((Date.now() - START) / DAY));
    // tách "Hơn 1000" → "Hơn " + 1000, "300+" → 300 + "+"
    function parseStat(v) {
      if (typeof v === "number") return { pre: "", num: v, post: "" };
      var m = String(v == null ? "" : v).match(/^(.*?)(\d[\d.,]*)(.*)$/);
      if (!m) return { pre: String(v == null ? "" : v), num: null, post: "" };
      return { pre: m[1], num: +m[2].replace(/[.,]/g, ""), post: m[3] };
    }
    var html = arr(N.items).map(function (it, i) {
      var v = it.auto === "days" ? { pre: "", num: days, post: "" } : parseStat(it.value);
      var numHTML = v.num === null ? esc(v.pre)
        : (v.pre ? "<small>" + esc(v.pre) + "</small>" : "") +
          '<span class="count" data-to="' + v.num + '">0</span>' + esc(v.post);
      return '<div class="stat reveal" style="--d:' + ((i % 3) * 0.08) + 's">' +
        '<div class="stat__emoji" aria-hidden="true">' + esc(it.emoji) + "</div>" +
        '<span class="stat__num">' + numHTML + (it.suffix ? "<small>" + esc(it.suffix) + "</small>" : "") + "</span>" +
        '<p class="stat__lbl">' + esc(it.label) + "</p>" +
        (it.note ? '<p class="stat__note">' + esc(it.note) + "</p>" : "") +
      "</div>";
    }).join("");
    $("#numbers").innerHTML = head(N.title, N.sub) + '<div class="stats">' + html + "</div>";
  }

  function renderMemories() {
    var G = C.gallery || {}, P = arr(G.photos), K = C.compare || {};
    var tapes = ["tape--tc", "tape--tl tape--lav", "tape--tr tape--peach", "tape--tc tape--lav"];
    var html = P.map(function (p, i) {
      var r = ((seeded(i) - 0.5) * 6).toFixed(2);
      return '<div class="pol reveal" style="--r:' + r + "deg;--d:" + ((i % 4) * 0.06) + 's">' +
        (i % 2 === 0 ? '<span class="tape ' + tapes[(i / 2) % tapes.length] + '"></span>' : "") +
        '<button type="button" class="pol__btn" data-lb="' + i + '" aria-label="Xem ảnh: ' + esc(p.caption) + '">' +
          phImg(p.src, p.caption) +
          '<span class="polaroid__cap">' + esc(p.caption) + "</span>" +
        "</button>" +
      "</div>";
    }).join("");

    var b = K.before || {}, a = K.after || {};
    var compare =
      '<div class="compare-wrap reveal">' +
        '<div class="compare-head"><h3 class="title">' + esc(K.title) + '</h3><p class="sub">' + esc(K.sub) + "</p></div>" +
        '<figure class="compare"><span class="tape tape--tl"></span><span class="tape tape--tr tape--lav"></span>' +
          '<div class="compare__stage" id="cmpStage">' +
            phImg(b.src, b.alt, { cls: "compare__before" }) +
            phImg(a.src, a.alt, { cls: "compare__after" }) +
            '<span class="compare__tag compare__tag--l">' + esc(b.label) + "</span>" +
            '<span class="compare__tag compare__tag--r">' + esc(a.label) + "</span>" +
            '<span class="compare__line" aria-hidden="true"></span>' +
            '<button type="button" class="compare__handle" id="cmpHandle" role="slider" aria-label="Kéo để so sánh hai năm" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">⟷</button>' +
          "</div>" +
          '<figcaption class="polaroid__cap">' + esc(K.caption) + "</figcaption>" +
        "</figure>" +
        '<p class="compare-hint">' + esc(K.hint) + "</p>" +
      "</div>";

    $("#memories").innerHTML = head(G.title, G.sub) + '<div class="gallery">' + html + "</div>" + compare;
  }

  function renderReasons() {
    var R = C.reasons || {}, L = arr(R.list);
    var spot = clamp(SPOTS.reason || 13, 1, L.length || 1);
    var html = L.map(function (txt, i) {
      var n = pad(i + 1);
      return '<div class="flip reveal" style="--d:' + ((i % 5) * 0.05) + 's">' +
        '<button type="button" class="flip__btn" aria-pressed="false">' +
          '<span class="flip__inner">' +
            '<span class="flip__face flip__front"><span class="flip__no">' + n + '</span><span class="flip__lbl">' + esc(R.label || "Lý do") + "</span>" + heartSVG("flip__heart") + "</span>" +
            '<span class="flip__face flip__back"><span class="flip__mini">#' + n + '</span><span class="flip__text">' + esc(txt) + "</span></span>" +
          "</span>" +
        "</button>" +
        (i + 1 === spot ? pieceBtn(4, "piece--reason") : "") +
      "</div>";
    }).join("");
    $("#reasons").innerHTML = head(R.title, R.sub) + '<p class="reasons-hint reveal">' + esc(R.hint) + "</p>" + '<div class="reasons">' + html + "</div>";
  }

  function paperHTML(L, id) {
    var paras = arr(L.paragraphs);
    var ps = paras.map(function (p, i) {
      return '<p class="para" style="transition-delay:' + (0.5 + i * 0.35).toFixed(2) + 's">' + esc(p) + "</p>";
    }).join("");
    return '<div class="paper-wrap" id="' + id + '"><div class="paper-clip"><article class="paper">' +
      '<p class="paper__greet">' + esc(L.greeting) + "</p>" + ps +
      '<p class="paper__sign" style="--sd:' + (0.6 + paras.length * 0.35).toFixed(2) + 's"><span>' + esc(L.sign) + "</span></p>" +
      "</article></div></div>";
  }

  function renderLetters() {
    var T = C.letters || {};
    var html = arr(T.items).map(function (L, i) {
      return '<div class="letter reveal" style="--d:' + (i * 0.1) + 's">' +
        '<button type="button" class="env" aria-expanded="false" aria-controls="paper' + i + '">' +
          '<span class="env__body"></span>' +
          '<span class="env__paper" aria-hidden="true">' + esc(L.to) + "</span>" +
          '<span class="env__flap" aria-hidden="true"></span>' +
          '<span class="env__front" aria-hidden="true"></span>' +
          '<span class="env__seal" aria-hidden="true">♥</span>' +
          '<span class="env__label">' + esc(L.label) + "</span>" +
          '<span class="env__tap" aria-hidden="true">' + esc(T.hint) + "</span>" +
        "</button>" +
        paperHTML(L, "paper" + i) +
      "</div>";
    }).join("");
    $("#letters").innerHTML = head(T.title, T.sub) + '<div class="letters">' + html + "</div>";
  }

  function renderQuizShell() {
    var Q = C.quiz || {};
    $("#quiz").innerHTML = head(Q.title, Q.sub) +
      '<div class="card quiz reveal" id="quizCard" aria-live="polite"></div>';
  }

  function renderDreams() {
    var D = C.dreams || {}, S = D.statusLabels || {}, N = D.next || {};
    var done = arr(store.get(KEY.goals, []));
    var html = arr(D.items).map(function (d, i) {
      var st = S[d.status] ? d.status : "next";
      return '<article class="dream reveal" style="--d:' + ((i % 3) * 0.08) + 's">' +
        '<span class="dream__emoji" aria-hidden="true">' + esc(d.emoji) + "</span>" +
        '<h3 class="dream__title">' + esc(d.title) + "</h3>" +
        '<p class="dream__text">' + esc(d.text) + "</p>" +
        '<span class="chip chip--' + st + '">' + esc(S[st]) + "</span></article>";
    }).join("");
    var goals = arr(N.goals).map(function (g, i) {
      var on = done.indexOf(i) > -1;
      return '<li><button type="button" class="goal" data-goal="' + i + '" aria-pressed="' + on + '">' +
        '<span class="goal__box" aria-hidden="true"><svg viewBox="0 0 34 32"><path d="M6 17 L14 25 L30 5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '<span class="goal__txt">' + esc(g) + "</span></button></li>";
    }).join("");
    $("#dreams").innerHTML = head(D.title, D.sub) +
      '<div class="dreams">' + html + "</div>" +
      '<div class="next reveal"><span class="tape tape--tc tape--peach"></span>' +
        pieceBtn(3, "piece--next") +
        '<div class="next__head"><h3 class="title">' + esc(N.title) + '</h3><p class="sub">' + esc(N.sub) + "</p></div>" +
        '<ul class="goals">' + goals + "</ul>" +
        (N.foot ? '<p class="next__foot">' + esc(N.foot) + "</p>" : "") +
      "</div>";
  }

  var capsuleUnlocked = null, capsuleNo = null;
  function isCapsuleOpen() {
    return Date.now() >= NEXT || /[?&]preview=capsule\b/.test(window.location.search);
  }
  function renderCapsule() {
    var K = C.capsule || {}, L = K.letter || {};
    var open = isCapsuleOpen();
    capsuleUnlocked = open;
    var lock = '<svg class="capsule__lock" viewBox="0 0 84 84" aria-hidden="true">' +
      '<path class="shackle" d="M26 38 V26 a16 16 0 0 1 32 0 V38" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="16" y="36" width="52" height="40" rx="10" fill="#EDE4FA" stroke="currentColor" stroke-width="4"/>' +
      '<path d="M42 62c-6-4-10-7-10-11 0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 4-4 7-10 11z" fill="#E07A9A"/></svg>';
    var body = open
      ? '<p class="capsule__text">' + esc(K.unlockedText) + "</p>" +
        '<button type="button" class="btn btn--rose" id="capsuleBtn" aria-expanded="false" aria-controls="capsulePaper">' + esc(K.openButton) + "</button>" +
        paperHTML(L, "capsulePaper")
      : '<p class="capsule__text">' + esc(K.lockedText) + "</p>" +
        '<div class="capsule__cd" id="capCd"></div>' +
        '<button type="button" class="btn btn--ghost btn--locked" id="capsuleBtn">' + esc(K.lockedButton) + "</button>";
    if (capsuleNo == null) capsuleNo = ++pageNo;
    $("#capsule").innerHTML = head(K.title, K.sub, "", capsuleNo) +
      '<div class="card capsule reveal' + (open ? " is-unlocked" : "") + '" id="capsuleCard">' +
        lock + '<span class="capsule__date">' + esc(K.dateLabel) + "</span>" + body +
      "</div>";
  }

  function renderFooter() {
    var F = C.footer || {};
    var done = store.get(KEY.secret, false);
    $("#footer").innerHTML =
      '<div class="footer__card reveal">' +
        pieceBtn(5, "piece--footer") +
        '<p class="page-no">' + esc(F.pageLabel) + "</p>" +
        '<p class="footer__close">' + esc(F.closing) + "</p>" +
        '<p class="footer__sign">' + esc(F.sign) + "</p>" +
        '<p class="footer__made">' + esc(F.madeWith) + "</p>" +
        '<p class="footer__egg">' + esc(F.eggHint) + "</p>" +
        '<div class="footer__btns">' +
          '<button type="button" class="btn btn--rose" id="replayBtn"' + (done ? "" : " hidden") + ">" + esc(F.replayLabel) + "</button>" +
          '<button type="button" class="btn btn--ghost" id="topBtn">' + esc(F.toTopLabel) + "</button>" +
        "</div>" +
      "</div>";
    $("#topBtn").addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      var h = $("#heroTitle"); if (h) setTimeout(function () { h.focus({ preventScroll: true }); }, reduced ? 0 : 700);
    });
  }

  /* =================================================================
     07. BỘ ĐẾM + ĐỒNG HỒ CHUNG (mỗi giây)
     ================================================================= */
  function splitTime(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }
  function cdHTML(t) {
    return "<span>" + t.d + "<small>ngày</small></span><span>" + pad(t.h) + "<small>giờ</small></span><span>" +
      pad(t.m) + "<small>phút</small></span><span>" + pad(t.s) + "<small>giây</small></span>";
  }
  var lastToday = -1;
  function tick() {
    var now = Date.now(), T = C.together || {};
    var up = splitTime(now - START);
    var ud = $("#u_d");
    if (ud) {
      ud.textContent = fmt(up.d);
      $("#u_h").textContent = pad(up.h);
      $("#u_m").textContent = pad(up.m);
      var us = $("#u_s");
      us.textContent = pad(up.s);
      if (!reduced) { us.classList.remove("is-tick"); void us.offsetWidth; us.classList.add("is-tick"); }
      if (up.d !== lastToday) {
        lastToday = up.d;
        $("#todayLine").textContent = String(T.todayLine || "").replace("{n}", fmt(up.d + 1));
      }
    }
    var cd = $("#cdTime");
    if (cd) {
      if (now >= NEXT) { cd.innerHTML = "<span>" + esc(T.countdownDone) + "</span>"; }
      else cd.innerHTML = cdHTML(splitTime(NEXT - now));
    }
    // hộp thư tương lai
    if (capsuleUnlocked === false && isCapsuleOpen()) { renderCapsule(); bindCapsule(); revealNow($("#capsule")); }
    var cc = $("#capCd");
    if (cc) cc.innerHTML = cdHTML(splitTime(NEXT - now));
  }

  /* =================================================================
     08. SỐ CHẠY, HIỆN DẦN, THANH TIẾN ĐỘ
     ================================================================= */
  function countUp(el) {
    var to = +el.dataset.to || 0;
    if (reduced || to === 0) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 1600 + Math.min(1200, to / 4);
    (function step(t) {
      var k = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  var io = null;
  function setupReveal() {
    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.add("no-io");
      $$(".count").forEach(countUp);
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("is-in");
        $$(".count", el).forEach(function (c) { if (!c.dataset.done) { c.dataset.done = 1; countUp(c); } });
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  }
  function revealNow(root) {
    $$(".reveal", root).forEach(function (el) { if (io) io.observe(el); else el.classList.add("is-in"); });
  }

  function setupProgress() {
    var bar = $("#progressBar"), ticking = false;
    function upd() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0) + ")";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* =================================================================
     09. LIGHTBOX + SO SÁNH
     ================================================================= */
  var Lightbox = (function () {
    var box = $("#lightbox"), frame = $("#lbFrame"), cap = $("#lbCaption"), cnt = $("#lbCount");
    var list = [], idx = 0, sx = 0, sy = 0, down = false;

    function show(i, dir) {
      idx = (i + list.length) % list.length;
      var p = list[idx];
      var paint = function () {
        frame.innerHTML = phImg(p.src, p.caption, { eager: true });
        bindImages(frame);
        cap.textContent = p.caption || "";
        cnt.textContent = (idx + 1) + " / " + list.length;
        frame.classList.remove("is-swiping-l", "is-swiping-r");
      };
      if (dir && !reduced) {
        frame.classList.add(dir > 0 ? "is-swiping-l" : "is-swiping-r");
        setTimeout(paint, 180);
      } else paint();
    }
    function open(i) {
      list = arr((C.gallery || {}).photos);
      if (!list.length) return;
      show(i);
      var single = list.length < 2;
      $("#lbPrev").hidden = single; $("#lbNext").hidden = single;
      Modal.open(box, {
        onKey: function (e) {
          if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1, 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1, -1); }
        },
        onClose: function () { frame.innerHTML = ""; }
      });
    }
    function init() {
      $("#lbPrev").addEventListener("click", function () { show(idx - 1, -1); });
      $("#lbNext").addEventListener("click", function () { show(idx + 1, 1); });
      $("#lbClose").addEventListener("click", function () { Modal.close(box); });
      // vuốt trên điện thoại
      var fig = $(".lightbox__figure", box);
      fig.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; sy = e.clientY; });
      fig.addEventListener("pointerup", function (e) {
        if (!down) return; down = false;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2 && list.length > 1) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      });
      fig.addEventListener("pointercancel", function () { down = false; });
      // bấm vào ảnh nhỏ
      $("#memories").addEventListener("click", function (e) {
        var b = e.target.closest("[data-lb]");
        if (b) open(+b.dataset.lb);
      });
    }
    return { init: init };
  })();

  function setupCompare() {
    var stage = $("#cmpStage"), handle = $("#cmpHandle");
    if (!stage) return;
    var pos = 50, drag = false;
    function set(p) {
      pos = clamp(p, 0, 100);
      stage.style.setProperty("--pos", pos + "%");
      handle.setAttribute("aria-valuenow", Math.round(pos));
    }
    function fromEvent(e) {
      var r = stage.getBoundingClientRect();
      set((e.clientX - r.left) / r.width * 100);
    }
    stage.addEventListener("pointerdown", function (e) {
      drag = true;
      try { stage.setPointerCapture(e.pointerId); } catch (er) { /* bỏ qua */ }
      fromEvent(e);
    });
    stage.addEventListener("pointermove", function (e) { if (drag) fromEvent(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) {
      stage.addEventListener(t, function () { drag = false; });
    });
    handle.addEventListener("keydown", function (e) {
      var k = e.key, step = e.shiftKey ? 15 : 5;
      if (k === "ArrowLeft" || k === "ArrowDown") { e.preventDefault(); set(pos - step); }
      if (k === "ArrowRight" || k === "ArrowUp") { e.preventDefault(); set(pos + step); }
      if (k === "Home") { e.preventDefault(); set(0); }
      if (k === "End") { e.preventDefault(); set(100); }
    });
    set(50);
  }

  /* =================================================================
     10. THẺ LÝ DO, THƯ, QUIZ, MỤC TIÊU, HỘP THƯ
     ================================================================= */
  function setupReasons() {
    $("#reasons").addEventListener("click", function (e) {
      var b = e.target.closest(".flip__btn");
      if (!b) return;
      var card = b.parentNode;
      var on = !card.classList.contains("is-flipped");
      card.classList.toggle("is-flipped", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function toggleLetter(wrap, btn, force) {
    var on = typeof force === "boolean" ? force : !wrap.classList.contains("is-open");
    wrap.classList.toggle("is-open", on);
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    if (on && !reduced) {
      var paper = $(".paper", wrap);
      setTimeout(function () {
        var r = paper.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.6) paper.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 700);
    }
  }
  function setupLetters() {
    $$("#letters .letter").forEach(function (wrap) {
      var btn = $(".env", wrap);
      btn.addEventListener("click", function () { toggleLetter(wrap, btn); });
    });
  }

  var Quiz = (function () {
    var Q = C.quiz || {}, qs = arr(Q.questions), idx = 0, score = 0, results = [];
    var card;
    var KEYS = ["A", "B", "C", "D", "E", "F"];

    function bar() {
      return '<div class="quiz__bar" aria-hidden="true">' + qs.map(function (_, i) {
        var c = i < idx ? (results[i] ? "is-right" : "is-done") : (i === idx ? "is-now" : "");
        return '<span class="' + c + '"></span>';
      }).join("") + "</div>";
    }
    function renderQ(focus) {
      var q = qs[idx];
      card.innerHTML =
        (idx === 0 ? '<p class="quiz__intro">' + esc(Q.intro) + "</p>" : "") +
        bar() +
        '<p class="quiz__count">' + esc(Q.questionLabel || "Câu") + " " + (idx + 1) + " / " + qs.length + "</p>" +
        '<h3 class="quiz__q" id="quizQ" tabindex="-1">' + esc(q.q) + "</h3>" +
        '<div class="quiz__opts">' + arr(q.options).map(function (o, i) {
          return '<button type="button" class="opt" data-i="' + i + '"><span class="opt__key" aria-hidden="true">' + KEYS[i] + "</span><span>" + esc(o) + "</span></button>";
        }).join("") + "</div>" +
        '<div id="quizAfter"></div>';
      if (focus) $("#quizQ").focus({ preventScroll: true });
    }
    function choose(i) {
      var q = qs[idx], right = i === q.answer;
      results[idx] = right;
      if (right) score++;
      $$(".opt", card).forEach(function (b, k) {
        b.disabled = true;
        if (k === q.answer) b.classList.add("is-right");
        else if (k === i) b.classList.add("is-wrong");
        else b.classList.add("is-dim");
      });
      var last = idx === qs.length - 1;
      $("#quizAfter").innerHTML =
        '<p class="quiz__fb' + (right ? " is-right" : "") + '">' + (right ? "✅ " : "🙈 ") + esc(right ? q.right : q.wrong) + "</p>" +
        '<div class="quiz__next"><button type="button" class="btn btn--rose" id="quizNext">' + esc(last ? Q.resultLabel : Q.nextLabel) + "</button></div>";
      $("#quizNext").focus({ preventScroll: true });
      if (right) {
        var r = $$(".opt", card)[i].getBoundingClientRect();
        Hearts.burst(r.left + r.width / 2, r.top + r.height / 2, reduced ? 3 : 8);
      }
    }
    function renderResult() {
      var res = arr(Q.results).slice().sort(function (a, b) { return b.min - a.min; })
        .filter(function (r) { return score >= r.min; })[0] || {};
      var C2 = 2 * Math.PI * 64, k = qs.length ? score / qs.length : 0;
      card.innerHTML =
        '<div class="quiz__result">' +
          '<div class="score-ring"><svg viewBox="0 0 150 150" aria-hidden="true">' +
            '<circle cx="75" cy="75" r="64" fill="none" stroke="#FDE7EE" stroke-width="12"/>' +
            '<circle id="ring" cx="75" cy="75" r="64" fill="none" stroke="#E07A9A" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + C2.toFixed(1) + '" stroke-dashoffset="' + C2.toFixed(1) + '" style="transition:stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)"/>' +
          '</svg><div class="score-ring__val">' + score + "/" + qs.length + "<small>" + esc(Q.scoreLabel) + "</small></div></div>" +
          '<h3 class="quiz__rtitle" id="quizQ" tabindex="-1">' + esc(res.title) + "</h3>" +
          '<p class="quiz__rtext">' + esc(res.text) + "</p>" +
          '<button type="button" class="btn btn--ghost" id="quizRetry">' + esc(Q.retryLabel) + "</button>" +
        "</div>";
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        var ring = $("#ring"); if (ring) ring.style.strokeDashoffset = (C2 * (1 - k)).toFixed(1);
      }); });
      $("#quizQ").focus({ preventScroll: true });
      if (k >= 0.66) {
        var r = card.getBoundingClientRect();
        Hearts.burst(r.left + r.width / 2, r.top + 90, reduced ? 4 : 20, true);
      }
    }
    function init() {
      card = $("#quizCard");
      if (!qs.length) { card.hidden = true; return; }
      renderQ(false);
      card.addEventListener("click", function (e) {
        var o = e.target.closest(".opt");
        if (o && !o.disabled) { choose(+o.dataset.i); return; }
        if (e.target.closest("#quizNext")) {
          idx++;
          if (idx >= qs.length) renderResult(); else renderQ(true);
          return;
        }
        if (e.target.closest("#quizRetry")) { idx = 0; score = 0; results = []; renderQ(true); }
      });
    }
    return { init: init };
  })();

  function setupGoals() {
    $("#dreams").addEventListener("click", function (e) {
      var g = e.target.closest(".goal");
      if (!g) return;
      var i = +g.dataset.goal, list = arr(store.get(KEY.goals, []));
      var on = g.getAttribute("aria-pressed") !== "true";
      g.setAttribute("aria-pressed", on ? "true" : "false");
      list = list.filter(function (x) { return x !== i; });
      if (on) list.push(i);
      store.set(KEY.goals, list);
    });
  }

  function bindCapsule() {
    var btn = $("#capsuleBtn"), card = $("#capsuleCard"), K = C.capsule || {};
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!capsuleUnlocked) { toast(K.lockedToast || "Chưa tới ngày nha 🤭"); return; }
      var on = !card.classList.contains("is-open");
      card.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  /* =================================================================
     11. EASTER EGG: 5 MẢNH TIM → VIDEO
     ================================================================= */
  var Secret = (function () {
    var badge = $("#badge"), heart = $("#badgeHeart"), count = $("#badgeCount");
    var found = arr(store.get(KEY.pieces, [])).filter(function (n) { return n >= 1 && n <= 5; });
    var busy = false;

    function slotsHTML(cls) {
      var s = "";
      for (var n = 1; n <= 5; n++) {
        s += '<g clip-path="url(#hp' + n + ')"><path class="' + cls + '" data-slot="' + n + '" d="' + HEART_D + '"/></g>';
      }
      return s;
    }
    function updateBadge(bump) {
      if (!found.length) { badge.hidden = true; return; }
      badge.hidden = false;
      $$(".piece-slot", heart).forEach(function (p) {
        p.classList.toggle("is-on", found.indexOf(+p.dataset.slot) > -1);
      });
      count.textContent = found.length + "/5";
      badge.classList.toggle("is-complete", found.length >= 5);
      badge.setAttribute("aria-label", "Đã tìm " + found.length + " trên 5 mảnh tim" + (found.length >= 5 ? ". Bấm để xem video" : ""));
      if (bump) { badge.classList.remove("is-bump"); void badge.offsetWidth; badge.classList.add("is-bump"); }
    }

    function flyTo(btn, n, done) {
      var a = btn.getBoundingClientRect();
      var b = heart.getBoundingClientRect();
      if (reduced || !b.width) { done(); return; }
      var ghost = document.createElement("div");
      ghost.className = "fly-piece";
      ghost.innerHTML = pieceSVG(n);
      ghost.style.left = (a.left + a.width / 2 - 11) + "px";
      ghost.style.top = (a.top + a.height / 2 - 11) + "px";
      document.body.appendChild(ghost);
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      ghost.getBoundingClientRect();
      ghost.style.transform = "translate(" + dx + "px," + dy + "px) scale(1.5) rotate(-20deg)";
      ghost.style.opacity = "0";
      setTimeout(function () { ghost.remove(); done(); }, 950);
    }

    function collect(btn) {
      var n = +btn.dataset.piece;
      if (found.indexOf(n) > -1 || busy) return;
      found.push(n);
      store.set(KEY.pieces, found);
      var r = btn.getBoundingClientRect();
      Hearts.burst(r.left + r.width / 2, r.top + r.height / 2, reduced ? 4 : 12, true);
      // hiện huy hiệu trước (để biết chỗ bay tới) rồi mới tô mảnh
      if (badge.hidden) { badge.hidden = false; $$(".piece-slot", heart).forEach(function (p) { p.classList.toggle("is-on", found.indexOf(+p.dataset.slot) > -1 && +p.dataset.slot !== n); }); count.textContent = (found.length - 1) + "/5"; }
      btn.classList.add("is-taken");
      var left = 5 - found.length;
      flyTo(btn, n, function () {
        updateBadge(true);
        if (left > 0) toast(String(SECRET.foundToast || "").replace("{left}", left));
        else {
          toast(SECRET.lastToast || "Đủ 5 mảnh rồi!");
          setTimeout(assemble, 700);
        }
      });
    }

    function assemble() {
      busy = true;
      var ov = $("#assemble"), svg = $("#assembleHeart");
      var offs = [[-46, -38, -24], [46, -40, 22], [-50, 34, 18], [0, 58, -14], [52, 36, -20]];
      svg.innerHTML = '<path class="whole" d="' + HEART_D + '"/>' +
        offs.map(function (o, i) {
          return '<g class="ap" clip-path="url(#hp' + (i + 1) + ')" style="transform:translate(' + o[0] + "px," + o[1] + "px) rotate(" + o[2] + 'deg)"><path d="' + HEART_D + '"/></g>';
        }).join("");
      $("#assembleText").textContent = SECRET.assembleText || "";
      ov.hidden = false;
      ov.classList.remove("is-whole");
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        setTimeout(function () {
          ov.classList.add("is-whole");
          Hearts.burst(window.innerWidth / 2, window.innerHeight / 2, reduced ? 6 : 34, true);
        }, reduced ? 0 : 450);
      }); });
      store.set(KEY.secret, true);
      var rb = $("#replayBtn"); if (rb) rb.hidden = false;
      setTimeout(function () {
        ov.hidden = true;
        busy = false;
        Video.open();
      }, reduced ? 1200 : 3300);
    }

    function init() {
      heart.innerHTML = slotsHTML("piece-slot");
      updateBadge(false);
      document.addEventListener("click", function (e) {
        var p = e.target.closest && e.target.closest(".piece");
        if (p) { e.preventDefault(); collect(p); }
      });
      badge.addEventListener("click", function () {
        if (found.length >= 5) Video.open();
        else {
          var areas = SECRET.areas || {}, left = [];
          for (var k = 1; k <= 5; k++) if (found.indexOf(k) < 0) left.push(areas[k] || ("#" + k));
          toast(String(SECRET.badgeToast || "").replace("{n}", found.length).replace("{where}", left.join(", ")), 5200);
        }
      });
      document.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("#replayBtn")) Video.open();
      });
    }
    return { init: init };
  })();

  var Video = (function () {
    var modal = $("#videoModal"), frame = $("#videoFrame");
    function open() {
      var V = SECRET.video || {};
      $("#videoTitle").textContent = SECRET.title || "";
      $("#videoSub").textContent = SECRET.sub || "";
      $("#videoNote").textContent = SECRET.note || "";
      var missing = phImg("", "", { ph: C.videoPlaceholderText || "Video của mình ở đây" });

      if (V.type === "youtube" && V.id) {
        // chỉ gắn iframe khi mở modal
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(V.id) + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
        f.title = SECRET.title || "Video";
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        f.setAttribute("allowfullscreen", "");
        f.referrerPolicy = "strict-origin-when-cross-origin";
        frame.innerHTML = "";
        frame.appendChild(f);
        Music.hold();
      } else if (V.src) {
        var v = document.createElement("video");
        v.controls = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        v.preload = "none";
        if (V.poster) v.poster = V.poster;
        v.src = V.src;
        v.addEventListener("play", function () { Music.hold(); });
        v.addEventListener("error", function () { frame.innerHTML = missing; });
        frame.innerHTML = "";
        frame.appendChild(v);
      } else {
        frame.innerHTML = missing;
      }
      Modal.open(modal, {
        onClose: function () {
          var v2 = $("video", frame);
          if (v2) { try { v2.pause(); v2.removeAttribute("src"); v2.load(); } catch (e) { /* bỏ qua */ } }
          frame.innerHTML = "";        // gỡ iframe/video để dừng hẳn
          Music.release();
        }
      });
    }
    function init() {
      $("#videoClose").addEventListener("click", function () { Modal.close(modal); });
    }
    return { open: open, init: init };
  })();

  /* =================================================================
     12. KHỞI ĐỘNG
     ================================================================= */
  function boot() {
    document.documentElement.classList.remove("no-js");

    renderHero();
    renderTogether();
    renderChapterOne();
    renderJourney();
    renderNumbers();
    renderMemories();
    renderReasons();
    renderLetters();
    renderQuizShell();
    renderDreams();
    renderCapsule();
    renderFooter();
    bindImages(document);

    Hearts.init();
    Intro.init();
    tick();
    setInterval(tick, 1000);
    setupReveal();
    setupProgress();
    Lightbox.init();
    setupCompare();
    setupReasons();
    setupLetters();
    Quiz.init();
    setupGoals();
    bindCapsule();
    Video.init();
    Secret.init();

    if (reduced) document.documentElement.classList.add("reduced");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
