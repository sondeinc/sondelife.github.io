(function () {
  var control = document.querySelector('[data-scribe-paged-polyfill]');
  if (!control) return;
  var pagedPolyfillPath = control.getAttribute('data-scribe-paged-polyfill');

  // Framed by this site AND asked for, by exact parameter: a visitor's own `?print=1`, a lookalike,
  // or another site's embed must never turn a page load into a print.
  function isPdfPrintFrame() {
    return (function () { try { return window.self !== window.top && window.parent.location.origin === location.origin && new URLSearchParams(location.search).get('print') === '1'; } catch (_error) { return false; } })();
  }

  function applyFiltersNow() {}

  // The locale bundle has APPLIED once the control's own label reads as the bundle says. The global
  // alone is defined a moment before the picker applies it, and the hydration attribute also clears
  // on the picker's own timeout, so neither is enough by itself.
  function localeIsApplied() {
    if (document.documentElement.hasAttribute('data-sonde-locale-hydrating')) return false;
    if (!document.getElementById('sonde-locale-bundle')) return true;
    var dictionary = window.SondeDaylightI18n;
    if (!dictionary) return false;
    var label = control.querySelector('[data-msg-id]');
    var expected = label ? dictionary[label.getAttribute('data-msg-id')] : undefined;
    return !expected || label.innerHTML === expected;
  }

  function pageIsReady() {
    if (document.readyState === 'loading') return false;
    if (document.querySelector('[data-scribe-print-pending]')) return false;
    return localeIsApplied();
  }

  // Armed only once pagination starts, so an unrelated script failing earlier in the page's load does
  // not abandon a frame that would have printed. Paged.js reports layout failures as rejected
  // promises, and a failure inside the polyfill file itself as an error event.
  function reportLayoutFailures() {
    var reported = false;
    function report() {
      if (reported) return;
      reported = true;
      try {
        parent.postMessage({ source: 'sonde-scribe-paged', type: 'content-error' }, '*');
      } catch (_error) {
        // The opener's timeout still ends the attempt.
      }
    }
    window.addEventListener('unhandledrejection', report);
    window.addEventListener('error', function (event) {
      if (event && typeof event.filename === 'string' && event.filename.indexOf('paged.polyfill') !== -1) report();
    });
  }

  function materializeCompleteReportForPrint(done) {
    var startedAt = Date.now();
    function check() {
      if (pageIsReady() || Date.now() - startedAt >= 10000) {
        // A document to print or file: always the light palette, whatever mode the reader browses in.
        document.documentElement.setAttribute('data-mode', 'light');
        reportLayoutFailures();
        done();
        return;
      }
      window.setTimeout(check, 50);
    }
    window.setTimeout(check, 0);
  }

  function bootPdfPrintFrame() {
    document.documentElement.setAttribute('data-scribe-print-frame', 'true');
    var printFrameCancelled = false;
    var pendingPrintTimer = 0;
    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'sonde-scribe-paged' || data.type !== 'cancel') return;
      printFrameCancelled = true;
      if (pendingPrintTimer) window.clearTimeout(pendingPrintTimer);
    });
    function printWithNativeFallback() {
      try {
        parent.postMessage({ source: 'sonde-scribe-paged', type: 'fallback' }, '*');
      } catch (_error) {
        return;
      }
      if (printFrameCancelled) return;
      window.focus();
      if (typeof window.print === 'function') window.print();
    }
    function prepareMaterializedFrame() {
      if (printFrameCancelled) return;
      if (document.body) document.body.setAttribute('data-scribe-printing', 'true');
      document.querySelectorAll('details').forEach(function (details) {
        details.setAttribute('open', '');
      });
      document.querySelectorAll('img[loading="lazy"]').forEach(function (image) {
        image.setAttribute('loading', 'eager');
      });
      // Paged.js fetches linked stylesheets during pagination; Chromium blocks
      // file:// stylesheet XHRs, so direct-file packages use native print after
      // all chunks and snippets have been materialized.
      if (location.protocol === 'file:') {
        printWithNativeFallback();
        return;
      }
      window.PagedConfig = {
        auto: true,
        after: function () {
          if (printFrameCancelled) return;
          try {
            parent.postMessage({ source: 'sonde-scribe-paged', type: 'rendered' }, '*');
          } catch (_error) {
            return;
          }
          pendingPrintTimer = window.setTimeout(function () {
            if (printFrameCancelled) return;
            window.focus();
            if (typeof window.print === 'function') window.print();
          }, 80);
        }
      };
      var pagedScript = document.createElement('script');
      pagedScript.src = pagedPolyfillPath;
      pagedScript.onerror = function () {
        printWithNativeFallback();
      };
      document.head.appendChild(pagedScript);
    }
    function prepareFrame() {
      if (printFrameCancelled) return;
      materializeCompleteReportForPrint(function () {
        applyFiltersNow();
        prepareMaterializedFrame();
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', prepareFrame, { once: true });
    } else {
      prepareFrame();
    }
  }

  if (isPdfPrintFrame()) {
    // Only the page that opened this frame may cancel it. Registered in the capture phase, before the
    // shared boot's own listener, so a message from any other window never reaches it.
    window.addEventListener(
      'message',
      function (event) {
        if (event.source !== window.parent) event.stopImmediatePropagation();
      },
      true,
    );
    bootPdfPrintFrame();
    return;
  }

  // Only a page whose script runs gets the control; see the `hidden` default in the markup.
  control.hidden = false;

  (function () {
  document.querySelectorAll('[data-action="download-menu-toggle"]').forEach(function (trigger) {
    var menu = trigger.closest('.download-menu');
    if (!menu) return;
    var list = menu.querySelector('.download-menu-list');
    if (!list) return;
    function closeMenu() {
      list.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      // Close any open settings dropdown first: its expanded panel can overlap
      // and intercept pointer events on the menu items. The trigger handler
      // below calls stopPropagation(), which suppresses the settings dropdown's
      // own outside-click close, so the download menu closes it explicitly when
      // opening. Skip a dropdown that contains this trigger (never hide our own
      // ancestor).
      document.querySelectorAll('details.settings-dropdown[open]').forEach(function (settings) {
        if (!settings.contains(trigger)) settings.removeAttribute('open');
      });
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (list.hidden) openMenu();
      else closeMenu();
    });
    list.querySelectorAll('.download-menu-item').forEach(function (item) {
      item.addEventListener('click', function () { closeMenu(); });
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !list.hidden) {
        closeMenu();
        trigger.focus();
      }
    });
  });
})();

  var activeFrame = null;
  var activeTimeout = 0;
  var retainedFrame = null;
  var retainedTimer = 0;

  function setBusy(busy) {
    document.querySelectorAll('[data-scribe-paged-polyfill]').forEach(function (each) {
      if (busy) each.setAttribute('aria-busy', 'true');
      else each.removeAttribute('aria-busy');
      // Announce the request in the page's own language: the item's label is already translated.
      var status = each.querySelector('[data-scribe-page-pdf-status]');
      var label = each.querySelector('[data-scribe-download-pdf]');
      if (status) status.textContent = busy && label ? label.textContent.trim() + ' …' : '';
    });
    document.querySelectorAll('[data-scribe-download-pdf]').forEach(function (button) {
      if (busy) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    });
  }

  function releaseRetainedFrame() {
    window.clearTimeout(retainedTimer);
    if (retainedFrame) retainedFrame.remove();
    retainedFrame = null;
  }

  function retainFrame(iframe) {
    releaseRetainedFrame();
    retainedFrame = iframe;
    // Held while its print dialog may be open: released when that dialog closes, when the next
    // download starts, or at the latest after the retention window.
    try {
      if (iframe.contentWindow) iframe.contentWindow.addEventListener('afterprint', releaseRetainedFrame);
    } catch (_error) {
      // A frame we cannot observe is still released by the timer.
    }
    retainedTimer = window.setTimeout(releaseRetainedFrame, 60000);
  }

  function finishPagePdf(iframe, outcome) {
    if (activeFrame !== iframe) return;
    activeFrame = null;
    window.clearTimeout(activeTimeout);
    setBusy(false);
    if (outcome === 'printed') {
      retainFrame(iframe);
      return;
    }
    try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ source: 'sonde-scribe-paged', type: 'cancel' }, '*');
        }
      } catch (_error) {
        // Removing the frame is the actual cancellation path; postMessage is best effort.
      }
      iframe.remove();
    // The generator could not paginate this page; the page's own print styles still give the
    // reader a PDF through the browser's print dialog.
    if (typeof window.print === 'function') window.print();
  }

  function startPagePdfDownload() {
    if (activeFrame) return;
    releaseRetainedFrame();
    var printUrl = new URL(location.href);
    printUrl.searchParams.set('print', '1');
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:8.5in;height:11in;border:0;visibility:hidden';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Scribe PDF print frame');
    iframe.src = printUrl.toString();
    activeFrame = iframe;
    setBusy(true);
    document.body.appendChild(iframe);
    activeTimeout = window.setTimeout(function () {
      finishPagePdf(iframe, 'failed');
    }, 120000);
  }

  window.addEventListener('message', function (event) {
    var data = event.data;
    if (!data || typeof data !== 'object' || data.source !== 'sonde-scribe-paged') return;
    if (!activeFrame || event.source !== activeFrame.contentWindow) return;
    if (data.type === 'rendered' || data.type === 'fallback') finishPagePdf(activeFrame, 'printed');
    else if (data.type === 'content-error') finishPagePdf(activeFrame, 'failed');
  });

  document.querySelectorAll('[data-scribe-download-pdf]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (button.getAttribute('aria-disabled') === 'true') return;
      startPagePdfDownload();
    });
  });
})();
