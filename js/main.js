(function () {
  document.documentElement.classList.add("js");

  // Cover entrance: split the rail into letters and number the calendar days so CSS can stagger them.
  var rail = document.querySelector(".cover__rail");
  if (rail) {
    var railText = rail.textContent;
    rail.textContent = "";
    var n = 0;
    railText.split("").forEach(function (ch) {
      if (ch === " ") { rail.appendChild(document.createTextNode(" ")); return; }
      var span = document.createElement("span");
      span.className = "ch";
      span.style.setProperty("--i", n++);
      span.textContent = ch;
      rail.appendChild(span);
    });
  }
  var dayIndex = 0;
  document.querySelectorAll(".calendar td").forEach(function (td) {
    if (td.textContent.trim()) td.style.setProperty("--i", dayIndex++);
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  // The dog. Two cameos from the same Lottie: the head pops up over the Q & A list when it
  // scrolls into view, and the whole dog trots into the corner when the heart on the 6th is tapped.
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var peekEl = document.getElementById("dog-peek");
  var cameoEl = document.getElementById("dog-cameo");
  var heartBtn = document.getElementById("heart");

  if (window.lottie && peekEl) {
    var peek = window.lottie.loadAnimation({
      container: peekEl, renderer: "svg", loop: true, autoplay: false, path: "assets/dog/dog-peek.json"
    });
    var peekSeen = false;
    var showPeek = function () {
      if (peekSeen) return;
      peekSeen = true;
      if (calm) peek.goToAndStop(40, true);
      else peek.playSegments([[0, 40], [40, 162]], true); // pop up once, then keep blinking
    };
    if ("IntersectionObserver" in window) {
      var peekIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { showPeek(); peekIo.disconnect(); }
      }, { rootMargin: "0px 0px -25% 0px" });
      peekIo.observe(peekEl.parentNode);
    } else {
      peek.addEventListener("DOMLoaded", showPeek);
    }
  }

  if (window.lottie && cameoEl && heartBtn) {
    var cameo = null;
    var cameoTimer = null;
    var hideCameo = function () {
      clearTimeout(cameoTimer);
      cameoEl.classList.remove("is-in");
      if (cameo) setTimeout(function () { cameo.pause(); }, 900);
    };
    var showCameo = function () {
      if (!cameo) {
        cameo = window.lottie.loadAnimation({
          container: cameoEl, renderer: "svg", loop: true, autoplay: false, path: "assets/dog/dog-full.json"
        });
      }
      if (calm) cameo.goToAndStop(0, true); else cameo.play();
      cameoEl.classList.add("is-in");
      clearTimeout(cameoTimer);
      cameoTimer = setTimeout(hideCameo, 9000);
    };
    heartBtn.addEventListener("click", function () {
      if (cameoEl.classList.contains("is-in")) hideCameo(); else showCameo();
    });
    cameoEl.addEventListener("click", hideCameo);
  }

  // RSVP form
  var form = document.getElementById("rsvp-form");
  if (!form) return;

  var endpoint = (window.RSVP_ENDPOINT || "").trim();
  var previewNote = document.getElementById("preview-note");
  var formError = document.getElementById("form-error");
  var submitBtn = form.querySelector('button[type="submit"]');
  var attendingOnly = form.querySelector("[data-attending-only]");
  var plusOneOnly = form.querySelector("[data-plus-one-only]");
  var plusOneName = form.elements.plusOneName;

  if (!endpoint) previewNote.hidden = false;

  function value(name) {
    var el = form.elements[name];
    return el && el.value ? String(el.value).trim() : "";
  }

  // Declining hides the plus-one and dietary questions; "Yes" to plus-one reveals the name.
  function syncConditionals() {
    var declining = value("attending") === "No";
    attendingOnly.hidden = declining;
    var bringing = !declining && value("plusOne") === "Yes";
    plusOneOnly.hidden = !bringing;
    plusOneName.required = bringing;
  }
  form.addEventListener("change", syncConditionals);
  syncConditionals();

  function setError(name, show) {
    var msg = form.querySelector('[data-error-for="' + name + '"]');
    if (msg) msg.hidden = !show;
    var el = form.elements[name];
    if (el && el.setAttribute) el.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function validate() {
    var checks = {
      attending: value("attending") !== "",
      name: value("name") !== "",
      plusOneName: !plusOneName.required || value("plusOneName") !== "",
      phone: value("phone").replace(/\D/g, "").length >= 7,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))
    };
    var firstBad = null;
    Object.keys(checks).forEach(function (name) {
      setError(name, !checks[name]);
      if (!checks[name] && !firstBad) firstBad = name;
    });
    if (firstBad) {
      var el = form.elements[firstBad];
      (el.length ? el[0] : el).focus();
    }
    return !firstBad;
  }

  var lastRsvp = null;

  function showThanks(attending, payload) {
    lastRsvp = { payload: payload, sentAt: new Date(), saved: !!endpoint };
    var panel = document.getElementById(attending === "Yes" ? "thanks-yes" : "thanks-no");
    form.hidden = true;
    previewNote.hidden = true;
    panel.hidden = false;

    // The RSVP ask is done, so the heading becomes a thank-you and the deadline line goes.
    var title = document.getElementById("rsvp-title");
    var written = title.querySelector(".write") || title;
    document.getElementById("rsvp-intro").hidden = true;
    written.textContent = "Thank you";
    title.classList.remove("is-in");
    void title.offsetWidth; // restart the written-in effect
    title.classList.add("is-in");

    panel.focus({ preventScroll: true });
    document.getElementById("rsvp").scrollIntoView({ behavior: "smooth" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    formError.hidden = true;
    if (!validate()) return;
    if (value("website")) return; // spam trap

    var attending = value("attending");
    var coming = attending === "Yes";
    var bringing = coming && value("plusOne") === "Yes";
    var payload = {
      attending: attending,
      name: value("name"),
      plusOne: coming ? (bringing ? "Yes" : "No") : "",
      plusOneName: bringing ? value("plusOneName") : "",
      dietary: coming ? value("dietary") : "",
      phone: value("phone"),
      email: value("email"),
      message: value("message")
    };

    if (!endpoint) {
      console.info("RSVP preview mode, nothing sent:", payload);
      showThanks(attending, payload);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending";

    // text/plain keeps this a "simple" request, which Apps Script web apps accept cross-origin.
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || data.ok !== true) throw new Error((data && data.error) || "Not saved");
        showThanks(attending, payload);
      })
      .catch(function (err) {
        console.error("RSVP failed:", err);
        formError.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Send RSVP";
      });
  });

  // Shortcut for checking the thank-you state without filling in the form:
  // add ?preview=yes or ?preview=no to the address. Nothing is sent or saved.
  var previewMode = new URLSearchParams(window.location.search).get("preview");
  if (previewMode === "yes" || previewMode === "no") {
    var coming = previewMode === "yes";
    showThanks(coming ? "Yes" : "No", {
      attending: coming ? "Yes" : "No",
      name: "Sample Guest",
      plusOne: coming ? "Yes" : "",
      plusOneName: coming ? "Sample Plus-one" : "",
      dietary: coming ? "No seafood" : "",
      phone: "+60 12 345 6789",
      email: "guest@example.com",
      message: "Sample message for the preview."
    });
    lastRsvp.saved = false;
    // Jump straight there once fonts and layout have settled.
    window.addEventListener("load", function () {
      document.getElementById("rsvp").scrollIntoView({ behavior: "instant" });
    });
  }

  // Downloadable RSVP confirmation: a card image drawn in the browser from the guest's own answers.
  // Nothing is emailed and nothing extra is sent anywhere.
  var NAVY = "#023e7d";
  var NAVY_SOFT = "rgba(2, 62, 125, 0.62)";
  var LINE = "rgba(2, 62, 125, 0.22)";
  var DISPLAY = '"Marcellus", serif';
  var TEXT = '"Marcellus", serif';
  var SCRIPT = '"Qwitcher Grypen", cursive';

  function wrapLines(ctx, text, maxWidth) {
    var lines = [];
    String(text).split(/\n/).forEach(function (para) {
      var line = "";
      para.split(/\s+/).forEach(function (word) {
        var attempt = line ? line + " " + word : word;
        if (line && ctx.measureText(attempt).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = attempt;
        }
      });
      lines.push(line);
    });
    return lines;
  }

  // Draws the card and returns its height. Runs once to measure, once to paint.
  function paintConfirmation(ctx, rsvp, W) {
    var p = rsvp.payload;
    var coming = p.attending === "Yes";
    var inner = W - 240;
    var y = 150;

    function block(text, font, colour, lineHeight, spacing) {
      ctx.font = font;
      ctx.fillStyle = colour;
      if ("letterSpacing" in ctx) ctx.letterSpacing = spacing || "0px";
      wrapLines(ctx, text, inner).forEach(function (line) {
        ctx.fillText(line, W / 2, y);
        y += lineHeight;
      });
    }
    function rule() {
      ctx.fillStyle = LINE;
      ctx.fillRect(120, y - 20, W - 240, 2);
      y += 56;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    block("RSVP CONFIRMATION", "400 26px " + DISPLAY, NAVY, 40, "6px");
    y += 120;
    block("Tin & Michelle", "400 190px " + SCRIPT, NAVY, 150);
    block("SATURDAY, 6 MARCH 2027", "400 30px " + DISPLAY, NAVY, 46, "5px");
    y += 44;
    rule();

    var rows = [
      ["RESPONSE", coming ? "Joyfully accepts" : "Regretfully declines"],
      ["FULL NAME", p.name]
    ];
    if (coming) {
      rows.push(["PLUS-ONE", p.plusOne === "Yes" ? p.plusOneName : "No"]);
      if (p.dietary) rows.push(["DIETARY REQUIREMENTS / ALLERGIES", p.dietary]);
    }
    rows.push(["MOBILE / WHATSAPP", p.phone], ["EMAIL", p.email]);
    if (p.message) rows.push(["MESSAGE FOR TIN & MICHELLE", p.message]);

    rows.forEach(function (row) {
      block(row[0], "400 20px " + DISPLAY, NAVY_SOFT, 44, "4px");
      block(row[1], "400 40px " + TEXT, NAVY, 50);
      y += 34;
    });

    y += 22;
    rule();
    if (coming) {
      block("Dinner starts at 7.00pm at English Tea House by Grand Margherita Hotel, Petra Jaya.", "400 34px " + TEXT, NAVY, 46);
      block("Please arrive latest by 6:15pm.", "400 34px " + TEXT, NAVY, 46);
      y += 40;
    }

    var sent = rsvp.sentAt.toLocaleString("en-GB", {
      day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
    });
    block("Sent on " + sent, "400 30px " + TEXT, NAVY_SOFT, 42);
    if (!rsvp.saved) block("Preview only. This response was not saved.", "400 30px " + TEXT, NAVY_SOFT, 42);

    return y + 70;
  }

  function downloadConfirmation() {
    if (!lastRsvp) return;
    var W = 1080;
    var fonts = document.fonts
      ? Promise.all(['400 190px ' + SCRIPT, '400 26px ' + DISPLAY, '400 40px ' + TEXT].map(function (f) {
          return document.fonts.load(f);
        }))
      : Promise.resolve();

    fonts.catch(function () {}).then(function () {
      var canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = paintConfirmation(canvas.getContext("2d"), lastRsvp, W);

      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, canvas.height);
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, W - 80, canvas.height - 80);
      paintConfirmation(ctx, lastRsvp, W);

      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "Tin-Michelle-RSVP-confirmation.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      }, "image/png");
    });
  }

  document.querySelectorAll("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", downloadConfirmation);
  });
})();
