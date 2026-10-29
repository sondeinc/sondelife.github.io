window.__SCRIBE_FILE_DIRECT_RUNTIME__ = {
  profile: 'file-direct',
  relativePathsOnly: true,
  requiresServer: false
};


  var canonicalPermalinkTemplate = document.createElement('template');
  canonicalPermalinkTemplate.innerHTML = "<a href=\"#section-sonde-runtime-anchor\" title=\"Permalink\" aria-label=\"Permalink\" data-sonde-permalink=\"#section-sonde-runtime-anchor\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\" data-sonde-icon=\"link\" data-sonde-icon-provider=\"material\"><g><path d=\"M17 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c1.65 0 3 1.35 3 3s-1.35 3-3 3h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c2.76 0 5-2.24 5-5s-2.24-5-5-5m-9 5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1m2 3H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h3c.55 0 1-.45 1-1s-.45-1-1-1H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h3c.55 0 1-.45 1-1s-.45-1-1-1\"></path></g></svg></a>";
  function configureCanonicalPermalinkAnchor(link, anchorId, options) {
    var fragment = '#' + anchorId;
    link.setAttribute('href', fragment);
    link.setAttribute('data-sonde-permalink', fragment);
    if (options && options.share) link.setAttribute('data-share-anchor', anchorId);
    if (options && options.messageId) link.setAttribute('data-scribe-label-msgid', options.messageId);
    if (options && options.label) {
      link.setAttribute('title', options.label);
      link.setAttribute('aria-label', options.label);
    }
  }
  function createCanonicalPermalinkAnchor(anchorId, options) {
    var templateLink = canonicalPermalinkTemplate.content.firstElementChild;
    if (!templateLink) throw new Error('Canonical permalink template did not create an anchor.');
    var link = templateLink.cloneNode(true);
    configureCanonicalPermalinkAnchor(link, anchorId, options || {});
    return link;
  }
  function attachCanonicalPermalinkBehavior(options) {
    document.querySelectorAll('[data-sonde-permalink]:not([data-sonde-permalink-bound])').forEach(function (link) {
      link.setAttribute('data-sonde-permalink-bound', 'true');
      link.addEventListener('click', function (event) {
        var fragment = link.getAttribute('data-sonde-permalink') || link.getAttribute('href') || '';
        if (!fragment) return;
        if (options && options.beforeActivate) options.beforeActivate(event, link, fragment);
        if (options && options.activate && !options.activate(fragment, link)) return;
        if (options && options.copyText) {
          var copiedValue = options.copyValue
            ? options.copyValue(fragment, link)
            : window.location.href.split('#')[0] + fragment;
          options.copyText(copiedValue);
        }
        if (options && options.onShare && link.hasAttribute('data-share-anchor')) {
          options.onShare(fragment, link);
        }
        link.classList.add('is-copied');
        window.setTimeout(function () {
          link.classList.remove('is-copied');
        }, 1600);
      });
    });
  }


function createReportContentCache(capacityBytes, load) {
  var entries = new Map();
  var pending = new Map();
  var observers = new Map();
  var residentBytes = 0;
  function discard(key) {
    var entry = entries.get(key);
    if (!entry) return;
    entries.delete(key);
    residentBytes -= entry.bytes;
    var listeners = observers.get(key);
    observers.delete(key);
    if (listeners) listeners.forEach(function (listener) { listener.evict(); });
  }
  return {
    peek: function (key) { var entry = entries.get(key); return entry ? entry.value : undefined; },
    get: function (key, path, expectedBytes) {
      observers.forEach(function (listeners, observedKey) {
        listeners.forEach(function (listener) { if (listener.connected && !listener.connected()) listeners.delete(listener); });
        if (listeners.size === 0) observers.delete(observedKey);
      });
      if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0 || expectedBytes > capacityBytes) {
        return Promise.reject(new Error('content-slice-too-large'));
      }
      var resident = entries.get(key);
      if (resident) {
        entries.delete(key);
        entries.set(key, resident);
        return Promise.resolve(resident.value);
      }
      if (pending.has(key)) return pending.get(key);
      var request = Promise.resolve().then(function () { return load(key, path); }).then(function (value) {
        var bytes = new TextEncoder().encode(value).byteLength;
        if (bytes !== expectedBytes) throw new Error('content-slice-size-mismatch');
        while (residentBytes + bytes > capacityBytes && entries.size > 0) discard(entries.keys().next().value);
        entries.set(key, { value: value, bytes: bytes });
        residentBytes += bytes;
        return value;
      }).finally(function () { pending.delete(key); });
      pending.set(key, request);
      return request;
    },
    observe: function (key, onEvict, connected) {
      if (!entries.has(key)) { onEvict(); return function () {}; }
      var listeners = observers.get(key) || new Set();
      var listener = { evict: onEvict, connected: connected };
      listeners.add(listener);
      observers.set(key, listeners);
      return function () {
        listeners.delete(listener);
        if (listeners.size === 0) observers.delete(key);
      };
    },
    stats: function () { return { residentBytes: residentBytes, entries: entries.size, pending: pending.size }; }
  };
}



(function () {
  // The runtime is always inlined into a browser document — no SSR
  // guard needed. The idempotent check below silently returns if the
  // helper is already attached (e.g., loaded twice via a hot reload).
  if (window.SondeSpinner) return;

  var OVERLAY_ID = 'sonde-spinner-overlay';
  // Canonical Sonde Daylight mark, generated at TS-build time from the
  // shared geometry module so it can never drift from the brand mark
  // used on the cover page or nav. The SVG content is checked-in code,
  // so JSON.stringify here is for transport correctness inside the
  // template literal — not a security boundary.
  var MARK_SVG = "<svg class=\"sonde-spinner\" viewBox=\"0 0 512 512\" width=\"96\" height=\"96\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><defs><radialGradient id=\"sonde-spinner-mark-sun\" cx=\"50%\" cy=\"50%\" r=\"50%\"><stop offset=\"0%\" stop-color=\"var(--sonde-daylight-mark-sun-stop-0)\"/><stop offset=\"60%\" stop-color=\"var(--sonde-daylight-mark-sun-stop-1)\"/><stop offset=\"100%\" stop-color=\"var(--sonde-daylight-mark-sun-stop-2)\"/></radialGradient><clipPath id=\"sonde-spinner-mark-disc\"><circle cx=\"256\" cy=\"256\" r=\"240\"/></clipPath></defs><circle cx=\"256\" cy=\"256\" r=\"240\" fill=\"url(#sonde-spinner-mark-sun)\"/><g clip-path=\"url(#sonde-spinner-mark-disc)\"><g fill=\"var(--sonde-daylight-mark-crater)\" stroke=\"var(--sonde-daylight-mark-crater)\"><g opacity=\"0.7\"><path d=\"M40,240 C60,110 170,40 250,90 C320,130 330,210 260,280 C200,340 50,340 40,240 Z\" opacity=\"0.6\"/><path d=\"M290,130 C360,60 460,110 470,190 C480,270 410,350 330,320 C260,290 230,190 290,130 Z\" opacity=\"0.7\"/><path d=\"M390,280 C470,250 510,300 480,380 C450,440 380,410 390,280 Z\" opacity=\"0.5\"/><path d=\"M130,350 C180,290 260,350 230,430 C200,510 60,450 130,350 Z\" opacity=\"0.5\"/><circle cx=\"230\" cy=\"430\" r=\"18\" fill=\"transparent\" stroke-width=\"4\" opacity=\"0.8\"/><circle cx=\"170\" cy=\"190\" r=\"12\" fill=\"transparent\" stroke-width=\"3\" opacity=\"0.7\"/><circle cx=\"90\" cy=\"230\" r=\"8\" opacity=\"0.8\"/></g></g><g transform=\"translate(250,240) rotate(-40)\" fill=\"var(--sonde-daylight-mark-probe)\" stroke=\"var(--sonde-daylight-mark-probe)\"><line x1=\"-32\" y1=\"-8\" x2=\"-160\" y2=\"-40\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"-160\" cy=\"-40\" r=\"10\"/><line x1=\"-32\" y1=\"16\" x2=\"-125\" y2=\"62\" stroke-width=\"8\" stroke-linecap=\"round\"/><rect x=\"-141\" y=\"38\" width=\"32\" height=\"60\" rx=\"4\" transform=\"rotate(20,-125,62)\"/><line x1=\"-16\" y1=\"-40\" x2=\"-46\" y2=\"-92\" stroke-width=\"7\" stroke-linecap=\"round\"/><rect x=\"-70\" y=\"-108\" width=\"48\" height=\"28\" rx=\"4\"/><circle cx=\"-56\" cy=\"-98\" r=\"8\"/><circle cx=\"-36\" cy=\"-98\" r=\"6\"/><path d=\"M48,-108 Q128,-78 128,0 Q128,78 48,108\" stroke-width=\"5\" stroke-linejoin=\"round\"/><line x1=\"58\" y1=\"-50\" x2=\"108\" y2=\"0\" stroke-width=\"5\"/><line x1=\"58\" y1=\"50\" x2=\"108\" y2=\"0\" stroke-width=\"5\"/><line x1=\"48\" y1=\"0\" x2=\"108\" y2=\"0\" stroke-width=\"5\"/><circle cx=\"110\" cy=\"0\" r=\"14\"/><polygon points=\"-16,-40 48,-40 62,-24 62,24 48,40 -16,40 -30,24 -30,-24\"/></g></g></svg>";

  function parseMark() {
    var doc = new DOMParser().parseFromString(MARK_SVG, 'image/svg+xml');
    var node = doc.documentElement;
    // Browsers can return a <parsererror> root if the input is malformed.
    // The geometry source is checked-in code, so this is purely defensive;
    // fall back to an empty group so the overlay still renders.
    if (node && node.nodeName === 'parsererror') {
      var fallback = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      fallback.setAttribute('class', 'sonde-spinner');
      return fallback;
    }
    return document.importNode(node, true);
  }

  function ensureOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'sonde-spinner-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.appendChild(parseMark());
    var msg = document.createElement('div');
    msg.className = 'sonde-spinner-message';
    overlay.appendChild(msg);
    var sub = document.createElement('div');
    sub.className = 'sonde-spinner-submessage';
    overlay.appendChild(sub);
    document.body.appendChild(overlay);
    return overlay;
  }

  function show(message, submessage) {
    var overlay = ensureOverlay();
    var msg = overlay.querySelector('.sonde-spinner-message');
    var sub = overlay.querySelector('.sonde-spinner-submessage');
    if (msg) msg.textContent = message || 'Working\u2026';
    if (sub) sub.textContent = submessage || '';
    overlay.hidden = false;
  }

  function hide() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.hidden = true;
  }

  window.SondeSpinner = { show: show, hide: hide };
})();


(function () {
  if (window.SondeAsyncOperation) return;

  var activeOperation = null;

  function createAbortController() {
    if (typeof AbortController === 'function') return new AbortController();
    var listeners = [];
    var signal = {
      aborted: false,
      addEventListener: function (type, listener) {
        if (type === 'abort' && typeof listener === 'function') listeners.push(listener);
      },
      removeEventListener: function (type, listener) {
        if (type !== 'abort') return;
        listeners = listeners.filter(function (candidate) { return candidate !== listener; });
      }
    };
    return {
      signal: signal,
      abort: function () {
        if (signal.aborted) return;
        signal.aborted = true;
        listeners.slice().forEach(function (listener) { listener(); });
      }
    };
  }

  function cancelableDescription(description) {
    return (description || 'Sonde is working.') + ' Press Esc to cancel.';
  }

  function show(label, description) {
    if (window.SondeSpinner) window.SondeSpinner.show(label, cancelableDescription(description));
  }

  function hide() {
    if (window.SondeSpinner) window.SondeSpinner.hide();
  }

  function start(kind, label, description) {
    if (activeOperation) cancel('superseded');
    var operation = {
      kind: kind,
      controller: createAbortController(),
      cleanups: [],
      reason: ''
    };
    activeOperation = operation;
    show(label, description);
    return operation;
  }

  function addCleanup(operation, cleanup) {
    if (!operation || typeof cleanup !== 'function') return;
    operation.cleanups.push(cleanup);
  }

  function isAborted(operation) {
    return Boolean(operation && operation.controller && operation.controller.signal.aborted);
  }

  function isActive(operation) {
    return Boolean(operation && activeOperation === operation);
  }

  function current() {
    return activeOperation;
  }

  function activeKind() {
    return activeOperation ? activeOperation.kind : '';
  }

  function finish(operation) {
    var target = operation || activeOperation;
    if (target && activeOperation !== target) return false;
    activeOperation = null;
    hide();
    return true;
  }

  function cancel(reason) {
    var operation = activeOperation;
    if (!operation) return false;
    activeOperation = null;
    operation.reason = reason || 'cancelled';
    operation.controller.abort();
    operation.cleanups.splice(0).forEach(function (cleanup) {
      try {
        cleanup();
      } catch (_error) {
        return;
      }
    });
    hide();
    return true;
  }

  window.SondeAsyncOperation = {
    activeKind: activeKind,
    addCleanup: addCleanup,
    cancel: cancel,
    current: current,
    finish: finish,
    isAborted: isAborted,
    isActive: isActive,
    start: start
  };
})();


(function () {
  var pagedPolyfillPath = "assets/vendor/paged.polyfill.min.js";

  function isPdfPrintFrame() {
    return location.search.indexOf('print=1') !== -1 || location.search.indexOf('scribe_print=1') !== -1;
  }

  var pdfPrintFrameActive = isPdfPrintFrame();
  if (pdfPrintFrameActive) document.documentElement.setAttribute('data-scribe-print-frame', 'true');

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

  function byId(id) {
    return document.getElementById(id);
  }

  function reportSettingsDetails() {
    return document.querySelector('.scribe-report-settings');
  }

  function reportSettingsSummary() {
    var details = reportSettingsDetails();
    return details ? details.querySelector('summary') : null;
  }

  function closeReportSettings(returnFocus) {
    var details = reportSettingsDetails();
    if (!details || !details.hasAttribute('open')) return;
    details.removeAttribute('open');
    var summary = reportSettingsSummary();
    if (returnFocus && summary) summary.focus();
  }

  function syncReportSettingsAria() {
    var details = reportSettingsDetails();
    var summary = reportSettingsSummary();
    if (details && summary) summary.setAttribute('aria-expanded', String(details.hasAttribute('open')));
  }

  function settingsSections() {
    return document.querySelectorAll('.scribe-report-settings .settings-section');
  }

  function settingsSectionId(section) {
    if (!section || !section.classList) return '';
    if (section.classList.contains('settings-platform-theme-section')) return 'theme';
    if (section.classList.contains('settings-theme-section')) return 'mode';
    if (section.classList.contains('settings-language-section')) return 'language';
    return '';
  }

  function currentLocale() {
    var checked = document.querySelector('input[name="sonde-locale-picker-radio"]:checked');
    if (checked) return checked.value;
    var select = byId('report-locale');
    return select ? select.value : document.documentElement.lang;
  }

  var themeStorageKey = "sonde-platform-theme";
  var modeStorageKey = "sonde-theme";
  var localeStorageKey = "sonde-locale";
  var nistBaselineStorageKey = "sonde-nist-baseline";
  var nistOverlayStorageKey = "sonde-nist-overlay";
  var settingsSectionStorageKey = 'sonde-scribe-report-settings-sections';
  var languageSearchLabel = {"msgid":"scribe.report.control.languageSearch","defaultText":"Search languages"};
  var pageStatusLabel = {"msgid":"scribe.report.control.pageStatus","defaultText":"Page"};
  var chunkedFindingLabels = {"sourceSnippetTitle":{"msgid":"scribe.report.source.swiftUiMissingImageLabel.title","defaultText":"SwiftUI image source evidence"},"sourcePermalink":{"msgid":"scribe.report.action.sourcePermalink","defaultText":"Open source permalink"},"collapseSourceSnippet":{"msgid":"scribe.report.action.collapseSourceSnippet","defaultText":"Collapse snippet"},"expandSourceSnippet":{"msgid":"scribe.report.action.expandSourceSnippet","defaultText":"Expand snippet"},"fullScreenSourceSnippet":{"msgid":"scribe.report.action.fullScreenSourceSnippet","defaultText":"Full screen snippet"},"closeFullScreenSourceSnippet":{"msgid":"scribe.report.action.closeFullScreenSourceSnippet","defaultText":"Close full screen snippet"},"shareFinding":{"msgid":"scribe.report.action.shareFinding","defaultText":"Share finding"},"feedbackFinding":{"msgid":"scribe.report.action.feedbackFinding","defaultText":"Send feedback"},"findingPermalink":{"msgid":"scribe.report.action.findingPermalink","defaultText":"Copy finding link"},"openFixPlan":{"msgid":"scribe.report.action.openFixPlan","defaultText":"Open fix plan"},"diffBeforeAfter":{"msgid":"scribe.report.fixPlan.component.beforeAfter","defaultText":"Before / after (auto-fix preview)"},"diffOriginal":{"msgid":"scribe.report.fixPlan.component.original","defaultText":"Original"},"diffFixed":{"msgid":"scribe.report.fixPlan.component.fixed","defaultText":"Fixed"},"diffSplitView":{"msgid":"scribe.report.fixPlan.component.splitView","defaultText":"Split"},"diffUnifiedView":{"msgid":"scribe.report.fixPlan.component.unifiedView","defaultText":"Unified"},"diffFullScreen":{"msgid":"scribe.report.fixPlan.component.fullScreen","defaultText":"Full screen diff"},"diffCloseFullScreen":{"msgid":"scribe.report.fixPlan.component.closeFullScreen","defaultText":"Close"},"autofixTitle":{"msgid":"scribe.report.finding.autofix.title","defaultText":"Autofix"},"measuredResults":{"msgid":"scribe.report.metric.measuredResults","defaultText":"Measured results"},"measuredResultsExplanation":{"msgid":"scribe.report.metric.explanation","defaultText":"Each row shows its own ordered reference bands and measured value. The metric label states which direction is better."},"lowerIsBetter":{"msgid":"scribe.report.metric.lowerIsBetter","defaultText":"Lower is better"},"higherIsBetter":{"msgid":"scribe.report.metric.higherIsBetter","defaultText":"Higher is better"},"measured":{"msgid":"scribe.report.metric.measured","defaultText":"measured"},"referenceRanges":{"msgid":"scribe.report.metric.referenceRanges","defaultText":"Reference ranges"},"displayedScale":{"msgid":"scribe.report.metric.displayedScale","defaultText":"Displayed scale"},"good":{"msgid":"scribe.report.metric.severity.good","defaultText":"Good"},"moderate":{"msgid":"scribe.report.metric.severity.moderate","defaultText":"Moderate"},"high":{"msgid":"scribe.report.metric.severity.high","defaultText":"High"},"critical":{"msgid":"scribe.report.metric.severity.critical","defaultText":"Critical"}};
  var fullscreenIconSvg = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\" data-sonde-icon=\"material:OpenInFull\" data-sonde-icon-provider=\"material\"><g><path d=\"M21 8.59V4c0-.55-.45-1-1-1h-4.59c-.89 0-1.34 1.08-.71 1.71l1.59 1.59-10 10-1.59-1.59c-.62-.63-1.7-.19-1.7.7V20c0 .55.45 1 1 1h4.59c.89 0 1.34-1.08.71-1.71L7.71 17.7l10-10 1.59 1.59c.62.63 1.7.19 1.7-.7\"></path></g></svg>";
  var externalLinkIconSvg = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg>";
  var reportCurrentPage = 1;
  var reportCurrentPageCount = 1;
  var pendingFilterTimer = 0;
  var reportFilterGeneration = 0;
  var reportFilterBatchSize = 500;
  var reportQueryFilter = '';
  var reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  var revealedFinding = null;
  var evidenceReturnContext = null;
  var activeReportOperation = null;

  function reportOperationRuntime() {
    return window.SondeAsyncOperation;
  }

  function reportOperationIsAborted(operation) {
    var runtime = reportOperationRuntime();
    return runtime
      ? runtime.isAborted(operation)
      : Boolean(operation && operation.controller && operation.controller.signal.aborted);
  }

  function startReportOperation(kind, label, description) {
    var runtime = reportOperationRuntime();
    var operation = runtime ? runtime.start(kind, label, description) : null;
    if (!operation) return null;
    activeReportOperation = operation;
    document.body.setAttribute('data-scribe-working', 'true');
    return operation;
  }

  function addReportOperationCleanup(operation, cleanup) {
    var runtime = reportOperationRuntime();
    if (runtime) runtime.addCleanup(operation, cleanup);
  }

  function finishReportOperation(operation) {
    if (operation && activeReportOperation !== operation) return;
    if (operation && operation.kind === 'print') restoreReportAfterPrint();
    var runtime = reportOperationRuntime();
    if (runtime) runtime.finish(operation);
    activeReportOperation = null;
    document.body.removeAttribute('data-scribe-working');
  }

  function cancelReportOperation(reason) {
    var operation = activeReportOperation;
    if (!operation) return false;
    if (operation.kind === 'print') restoreReportAfterPrint();
    if (operation.kind === 'filter') {
      reportFilterGeneration += 1;
      if (pendingFilterTimer) {
        window.clearTimeout(pendingFilterTimer);
        pendingFilterTimer = 0;
      }
    }
    var runtime = reportOperationRuntime();
    if (runtime) runtime.cancel(reason);
    activeReportOperation = null;
    document.body.removeAttribute('data-scribe-working');
    return true;
  }

  function storedSettingsSectionIds() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(settingsSectionStorageKey) : null;
      return typeof stored === 'string'
        ? stored.split(',').filter(function (id) { return id.length > 0; })
        : [];
    } catch (_error) {
      return [];
    }
  }

  function persistSettingsSectionState() {
    var openIds = [];
    settingsSections().forEach(function (section) {
      var id = settingsSectionId(section);
      if (id && section.hasAttribute('open')) openIds.push(id);
    });
    try {
      if (window.localStorage) window.localStorage.setItem(settingsSectionStorageKey, openIds.join(','));
    } catch (_error) {
      return;
    }
  }

  function restoreSettingsSectionState() {
    var openIds = storedSettingsSectionIds();
    settingsSections().forEach(function (section) {
      var id = settingsSectionId(section);
      if (!id) return;
      if (openIds.indexOf(id) === -1) section.removeAttribute('open');
      else section.setAttribute('open', '');
    });
  }

  function availableThemes() {
    var manifest = window.__SCRIBE_MANIFEST__;
    return manifest && manifest.theme && manifest.theme.availableThemes ? manifest.theme.availableThemes : [];
  }

  function availableModes() {
    var manifest = window.__SCRIBE_MANIFEST__;
    return manifest && manifest.theme && manifest.theme.availableModes ? manifest.theme.availableModes : [];
  }

  function themeById(themeId) {
    return availableThemes().find(function (theme) {
      return theme.themeId === themeId;
    });
  }

  function storedThemeId() {
    try {
      return window.localStorage ? window.localStorage.getItem(themeStorageKey) : null;
    } catch (_error) {
      return null;
    }
  }

  function storeThemeId(themeId) {
    try {
      if (window.localStorage) window.localStorage.setItem(themeStorageKey, themeId);
    } catch (_error) {
      return;
    }
  }

  function storedMode() {
    try {
      return window.localStorage ? window.localStorage.getItem(modeStorageKey) : null;
    } catch (_error) {
      return null;
    }
  }

  function storeMode(mode) {
    try {
      if (window.localStorage) window.localStorage.setItem(modeStorageKey, mode);
    } catch (_error) {
      return;
    }
  }

  function storedLocale() {
    try {
      return window.localStorage ? window.localStorage.getItem(localeStorageKey) : null;
    } catch (_error) {
      return null;
    }
  }

  function storeLocale(locale) {
    try {
      if (window.localStorage) window.localStorage.setItem(localeStorageKey, locale);
    } catch (_error) {
      return;
    }
  }

  function storedNistBaseline() {
    try {
      return window.localStorage ? window.localStorage.getItem(nistBaselineStorageKey) : null;
    } catch (_error) {
      return null;
    }
  }

  function storeNistBaseline(value) {
    try {
      if (window.localStorage) window.localStorage.setItem(nistBaselineStorageKey, value || '');
    } catch (_error) {
      return;
    }
  }

  function storedNistOverlay() {
    try {
      return window.localStorage ? window.localStorage.getItem(nistOverlayStorageKey) : null;
    } catch (_error) {
      return null;
    }
  }

  function storeNistOverlay(value) {
    try {
      if (window.localStorage) window.localStorage.setItem(nistOverlayStorageKey, value || '');
    } catch (_error) {
      return;
    }
  }

  function trustedInlineHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/&lt;\/?(?:strong|code)&gt;|&lt;span class=&quot;scribe-capability-tier&quot; data-tier=&quot;[a-zA-Z0-9-]+&quot;&gt;|&lt;\/span&gt;/g, function (escaped) {
        return escaped.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
      });
  }

  function isSafeReportAssetPath(path) {
    return Boolean(
      path &&
        path.charAt(0) !== '/' &&
        !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path) &&
        path.indexOf('\\') === -1 &&
        path.split('/').indexOf('..') === -1
    );
  }

  function themeHrefForCurrentPage(link, theme) {
    var currentHref = link.getAttribute('href') || '';
    if (!isSafeReportAssetPath(theme.cssPath || '')) return currentHref;
    var marker = 'assets/immutable/';
    var markerIndex = currentHref.indexOf(marker);
    var prefix = markerIndex >= 0 ? currentHref.slice(0, markerIndex) : '';
    return prefix + theme.cssPath;
  }

  function applyReportTheme(themeId, persistTheme) {
    var theme = themeById(themeId);
    var link = document.querySelector('[data-scribe-theme-stylesheet]');
    if (!theme || !link) return;
    link.setAttribute('href', themeHrefForCurrentPage(link, theme));
    document.documentElement.setAttribute('data-sonde-theme', theme.themeId);
    var select = byId('report-theme');
    if (select && select.value !== theme.themeId) select.value = theme.themeId;
    document.querySelectorAll('input[name="sonde-platform-theme-toggle"]').forEach(function (input) {
      input.checked = input.value === theme.themeId;
    });
    if (persistTheme !== false) storeThemeId(theme.themeId);
  }

  function defaultReportThemeId() {
    return window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.theme
      ? window.__SCRIBE_MANIFEST__.theme.defaultTheme
      : 'ultraviolet';
  }

  function currentReportThemeId() {
    var activeTheme = document.documentElement.getAttribute('data-sonde-theme');
    if (themeById(activeTheme || '')) return activeTheme;
    return restoredReportThemeId();
  }

  function restoredReportThemeId() {
    var storedTheme = storedThemeId();
    if (themeById(storedTheme || '')) return storedTheme;
    var defaultTheme = defaultReportThemeId();
    return themeById(defaultTheme) ? defaultTheme : '';
  }

  function restoreReportTheme() {
    applyReportTheme(restoredReportThemeId());
  }

  function isSupportedMode(mode) {
    return Boolean(availableModes().find(function (option) {
      return option.modeId === mode;
    }));
  }

  function syncReportThemePreviewMode(mode) {
    var explicitMode = mode === 'light' || mode === 'dark' ? mode : '';
    document.querySelectorAll('.settings-platform-theme-option .theme-preview[data-platform-theme]').forEach(function (preview) {
      if (explicitMode) preview.setAttribute('data-mode', explicitMode);
      else preview.removeAttribute('data-mode');
    });
  }

  function applyReportMode(mode, persistMode) {
    var nextMode = isSupportedMode(mode) ? mode : 'auto';
    document.documentElement.setAttribute('data-theme', nextMode);
    document.documentElement.setAttribute('data-mode', nextMode);
    syncReportThemePreviewMode(nextMode);
    document.querySelectorAll('input[name="sonde-theme-toggle"]').forEach(function (input) {
      input.checked = input.value === nextMode;
    });
    if (persistMode !== false) storeMode(nextMode);
  }

  function restoreReportMode() {
    applyReportMode(restoredReportMode());
  }

  function defaultReportMode() {
    return window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.theme
      ? window.__SCRIBE_MANIFEST__.theme.defaultMode
      : 'auto';
  }

  function currentReportMode() {
    var activeMode =
      document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('data-mode');
    if (isSupportedMode(activeMode || '')) return activeMode;
    return restoredReportMode();
  }

  function restoredReportMode() {
    var storedReportMode = storedMode();
    if (isSupportedMode(storedReportMode || '')) return storedReportMode;
    var defaultMode = defaultReportMode();
    return isSupportedMode(defaultMode) ? defaultMode : 'auto';
  }

  function localeBundle(locale) {
    return window.__SCRIBE_LOCALES__ && window.__SCRIBE_LOCALES__[locale];
  }

  function localeBundleMetadata(locale) {
    var locales = window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.locales
      ? window.__SCRIBE_MANIFEST__.locales.bundles || []
      : [];
    for (var index = 0; index < locales.length; index += 1) {
      if (locales[index] && locales[index].locale === locale) return locales[index];
    }
    return null;
  }

  function localeBundleIsComplete(locale) {
    var bundle = localeBundle(locale);
    if (!bundle) return false;
    var metadata = localeBundleMetadata(locale);
    if (metadata && metadata.coverage) {
      if (typeof metadata.coverage.complete === 'boolean') return metadata.coverage.complete === true;
      return Number(metadata.coverage.fallbackCount || 0) === 0;
    }
    return Number(bundle.fallbackCount || 0) === 0;
  }

  function preferredBrowserLocale() {
    var locales = window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.locales
      ? window.__SCRIBE_MANIFEST__.locales.bundles || []
      : [];
    if (!locales.length) return null;
    var supported = locales.map(function (bundle) { return bundle.locale; });
    var requested = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var index = 0; index < requested.length; index += 1) {
      var locale = requested[index];
      if (supported.indexOf(locale) !== -1) return locale;
    }
    for (var requestIndex = 0; requestIndex < requested.length; requestIndex += 1) {
      var requestedLanguage = String(requested[requestIndex] || '').split('-')[0].toLowerCase();
      if (!requestedLanguage) continue;
      for (var supportedIndex = 0; supportedIndex < supported.length; supportedIndex += 1) {
        var supportedLocale = supported[supportedIndex];
        if (supportedLocale.split('-')[0].toLowerCase() === requestedLanguage) {
          return supportedLocale;
        }
      }
    }
    return null;
  }

  var defaultDocumentTitle = document.title;
  var defaultLocalizedTextCaptured = false;

  function reportFallbackLocale() {
    return window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.locales
      ? window.__SCRIBE_MANIFEST__.locales.fallback || 'en-US'
      : 'en-US';
  }

  function missingLocaleEntryIsFallback(locale) {
    return locale !== reportFallbackLocale();
  }

  function captureDefaultAttribute(element, attributeName, dataAttributeName) {
    if (element.hasAttribute(dataAttributeName)) return;
    var value = element.getAttribute(attributeName);
    if (value !== null) element.setAttribute(dataAttributeName, value);
  }

  function captureDefaultLocalizedText() {
    if (defaultLocalizedTextCaptured) return;
    defaultLocalizedTextCaptured = true;
    defaultDocumentTitle = document.title;
    document.querySelectorAll('[data-scribe-msgid]').forEach(function (element) {
      if (!element.hasAttribute('data-scribe-default-text')) {
        element.setAttribute('data-scribe-default-text', element.textContent || '');
      }
    });
    document.querySelectorAll('[data-scribe-alt-msgid]').forEach(function (element) {
      captureDefaultAttribute(element, 'alt', 'data-scribe-default-alt');
    });
    document.querySelectorAll('[data-scribe-html-msgid]').forEach(function (element) {
      if (!element.hasAttribute('data-scribe-default-html')) {
        element.setAttribute('data-scribe-default-html', element.innerHTML || '');
      }
    });
    document.querySelectorAll('[data-scribe-label-msgid]').forEach(function (element) {
      captureDefaultAttribute(element, 'aria-label', 'data-scribe-default-label');
      captureDefaultAttribute(element, 'title', 'data-scribe-default-title');
      captureDefaultAttribute(element, 'data-tooltip', 'data-scribe-default-tooltip');
    });
    document.querySelectorAll('[data-scribe-placeholder-msgid]').forEach(function (element) {
      captureDefaultAttribute(element, 'placeholder', 'data-scribe-default-placeholder');
    });
  }

  function localeEntry(bundle, element, attributeName) {
    return bundle && element ? bundle.messages[element.getAttribute(attributeName) || ''] : undefined;
  }

  function parseLocaleArgs(element) {
    var raw = element ? element.getAttribute('data-scribe-icu-args') : null;
    if (!raw) return {};
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function formatLocalizedTemplate(template, args) {
    var locale = currentLocale() || reportFallbackLocale();
    return formatLocalizedTemplateForLocale(template, args, locale);
  }

  function formatLocalizedTemplateForLocale(template, args, locale) {
    args = args || {};
    var normalizedTemplate = String(template || '');
    if (normalizedTemplate.indexOf('{') === -1) return normalizedTemplate;
    var pluralFormatted =
      normalizedTemplate.indexOf(', plural,') === -1
        ? normalizedTemplate
        : formatLocalizedPluralBlocks(normalizedTemplate, args, locale || 'en-US');
    if (pluralFormatted.indexOf('{') === -1) return pluralFormatted;
    var substituteArg = function (token, key) {
      return Object.prototype.hasOwnProperty.call(args, key) ? formatLocalizedArgValue(args[key], locale) : token;
    };
    return pluralFormatted
      .replace(/\{([A-Za-z0-9_.-]+),\s*number\}/g, function (token, key) {
        return Object.prototype.hasOwnProperty.call(args, key) && typeof args[key] === 'number'
          ? formatLocalizedNumber(args[key], locale)
          : token;
      })
      .replace(/\{([A-Za-z0-9_.-]+),\s*list\}/g, substituteArg)
      .replace(/\{([A-Za-z0-9_.-]+)\}/g, substituteArg);
  }

  function formatLocalizedPluralBlocks(template, args, locale) {
    var output = '';
    var cursor = 0;
    while (cursor < template.length) {
      var start = template.indexOf('{', cursor);
      if (start === -1) {
        output += template.slice(cursor);
        break;
      }
      var bodyStart = start + 1;
      var header = /^([A-Za-z0-9_.-]+),\s*plural,\s*/.exec(template.slice(bodyStart));
      if (!header) {
        output += template.slice(cursor, bodyStart);
        cursor = bodyStart;
        continue;
      }
      var parsed = parseLocalizedPluralBlock(template, start, header[1] || '');
      if (!parsed) {
        output += template.slice(cursor, bodyStart);
        cursor = bodyStart;
        continue;
      }
      var count = Number(args[parsed.key] || 0);
      var selected = selectLocalizedPluralOption(parsed.options, count, locale);
      output += template.slice(cursor, start);
      output += formatLocalizedTemplateForLocale(selected.replace(/#/g, String(count)), args, locale);
      cursor = parsed.endIndex;
    }
    return output;
  }

  function parseLocalizedPluralBlock(template, start, key) {
    var cursor = start + 1 + key.length;
    var pluralHeader = /^\s*,\s*plural,\s*/.exec(template.slice(cursor));
    if (!pluralHeader) return null;
    cursor += pluralHeader[0].length;
    var options = {};
    while (cursor < template.length) {
      cursor = skipLocalizedWhitespace(template, cursor);
      if (template[cursor] === '}') {
        return options.other === undefined ? null : { key: key, options: options, endIndex: cursor + 1 };
      }
      var option = parseLocalizedPluralOption(template, cursor);
      if (!option) return null;
      options[option.label] = option.value;
      cursor = option.endIndex;
    }
    return null;
  }

  function parseLocalizedPluralOption(template, start) {
    var cursor = skipLocalizedWhitespace(template, start);
    var labelMatch = /^(zero|one|two|few|many|other|=\d+)/.exec(template.slice(cursor));
    if (!labelMatch) return null;
    var label = labelMatch[1] || 'other';
    var labelEnd = cursor + label.length;
    cursor = skipLocalizedWhitespace(template, labelEnd);
    if (template[cursor] !== '{') return null;
    var bodyStart = cursor + 1;
    var depth = 1;
    cursor = bodyStart;
    while (cursor < template.length) {
      var char = template[cursor];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      if (depth === 0) return { label: label, value: template.slice(bodyStart, cursor), endIndex: cursor + 1 };
      cursor += 1;
    }
    return null;
  }

  function selectLocalizedPluralOption(options, count, locale) {
    var exact = options['=' + count];
    if (exact !== undefined) return exact;
    try {
      var category = localizedPluralRulesForLocale(locale).select(count);
      return options[category] || options.other || '';
    } catch (_error) {
      return options.other || '';
    }
  }

  function skipLocalizedWhitespace(value, start) {
    var cursor = start;
    while (/\s/.test(value[cursor] || '')) cursor += 1;
    return cursor;
  }

  var localizedListFormats = {};
  var localizedPluralRules = {};
  var localizedNumberFormats = {};

  function localizedLocaleKey(locale) {
    try {
      return Intl.getCanonicalLocales(locale || 'en-US')[0] || 'en-US';
    } catch (_error) {
      return 'en-US';
    }
  }

  function localizedListFormatter(locale) {
    var key = localizedLocaleKey(locale);
    if (localizedListFormats[key]) return localizedListFormats[key];
    localizedListFormats[key] = new Intl.ListFormat(key, { style: 'long', type: 'conjunction' });
    return localizedListFormats[key];
  }

  function localizedPluralRulesForLocale(locale) {
    var key = localizedLocaleKey(locale);
    if (localizedPluralRules[key]) return localizedPluralRules[key];
    localizedPluralRules[key] = new Intl.PluralRules(key);
    return localizedPluralRules[key];
  }

  function localizedNumberFormatter(locale) {
    var key = localizedLocaleKey(locale);
    if (localizedNumberFormats[key]) return localizedNumberFormats[key];
    localizedNumberFormats[key] = new Intl.NumberFormat(key);
    return localizedNumberFormats[key];
  }

  function formatLocalizedArgValue(value, locale) {
    if (Array.isArray(value)) {
      if (!value.length) return '';
      // A structured sampled-category breakdown ({category, shown, total}[]) localizes
      // each count via the locale number formatter, keeping the English slug as-is; a
      // plain string[] just stringifies. Either way the entries join with the locale
      // list separator. Mirrors the server formatCategoryBreakdownList — keep in sync.
      var values =
        value[0] && typeof value[0] === 'object'
          ? value.map(function (entry) {
              return (
                entry.category +
                ' (' +
                formatLocalizedNumber(entry.shown, locale) +
                ' of ' +
                formatLocalizedNumber(entry.total, locale) +
                ')'
              );
            })
          : value.map(String);
      try {
        if (typeof Intl !== 'undefined' && Intl.ListFormat) {
          return localizedListFormatter(locale).format(values);
        }
      } catch (_error) {
        return values.join(', ');
      }
      return values.join(', ');
    }
    return String(value);
  }

  function formatLocalizedNumber(value, locale) {
    var number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    try {
      return localizedNumberFormatter(locale).format(number);
    } catch (_error) {
      return String(value);
    }
  }

  function localizedEntryText(entry, element) {
    return entry ? formatLocalizedTemplate(entry.text, parseLocaleArgs(element)) : null;
  }

  function setLocalizedFallbackState(element, entry, locale) {
    element.toggleAttribute('data-scribe-fallback', entry ? Boolean(entry.fallback) : missingLocaleEntryIsFallback(locale));
  }

  function queryParam(name) {
    try {
      return new URL(location.href).searchParams.get(name);
    } catch (_error) {
      return null;
    }
  }

  function requestedLocale() {
    var locale = queryParam('scribe_locale');
    return localeBundle(locale || '') ? locale : null;
  }

  function clearTransientQueryParam(name) {
    try {
      var url = new URL(location.href);
      if (!url.searchParams.has(name)) return;
      url.searchParams.delete(name);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(window.history.state, document.title, url.href);
      }
    } catch (_error) {
      return;
    }
  }

  function requestedPrintThemeId() {
    var themeId = queryParam('scribe_theme');
    return themeById(themeId || '') ? themeId : null;
  }

  function requestedPrintMode() {
    var mode = queryParam('scribe_mode');
    return isSupportedMode(mode || '') ? mode : null;
  }

  // Presentation certification supplies these standard scan inputs. They
  // intentionally override restored preferences without persisting, so an
  // exact matrix capture never changes a reader's chosen report appearance.
  function requestedCertificationThemeId() {
    var themeId = queryParam('scan_theme');
    return themeById(themeId || '') ? themeId : null;
  }

  function requestedCertificationMode() {
    var mode = queryParam('scan_theme_mode');
    return isSupportedMode(mode || '') ? mode : null;
  }

  function requestedCertificationLocale() {
    var locale = queryParam('scan_locale');
    return localeBundle(locale || '') ? locale : null;
  }

  function requestedPrintFilters() {
    return {
      query: queryParam('scribe_filter_query') || '',
      severity: queryParam('scribe_filter_severity') || '',
      language: queryParam('scribe_filter_language') || '',
      classification: queryParam('scribe_filter_classification') || '',
      autofix: queryParam('scribe_filter_autofix') || ''
    };
  }

  function restoreRequestedPrintFilters() {
    if (!pdfPrintFrameActive) return;
    setOverviewFilterState(requestedPrintFilters());
  }

  function syncLocaleControls(locale) {
    var select = byId('report-locale');
    if (select && select.value !== locale) select.value = locale;
    document.querySelectorAll('input[name="sonde-locale-picker-radio"]').forEach(function (input) {
      input.checked = input.value === locale;
    });
  }

  function updateText(locale, persistLocale) {
    var bundle = localeBundle(locale);
    if (!bundle) return;
    captureDefaultLocalizedText();
    syncLocaleControls(locale);
    if (persistLocale !== false) storeLocale(locale);
    document.documentElement.lang = locale;
    if (window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.title) {
      var titleEntry = bundle.messages[window.__SCRIBE_MANIFEST__.title.msgid];
      document.title = titleEntry
        ? formatLocalizedTemplate(titleEntry.text, window.__SCRIBE_MANIFEST__.title.icuArgs || {})
        : defaultDocumentTitle;
    }
    document.querySelectorAll('[data-scribe-msgid]').forEach(function (element) {
      var entry = localeEntry(bundle, element, 'data-scribe-msgid');
      var text = entry ? localizedEntryText(entry, element) : element.getAttribute('data-scribe-default-text');
      if (text === null) return;
      element.textContent = text;
      setLocalizedFallbackState(element, entry, locale);
    });
    document.querySelectorAll('[data-scribe-alt-msgid]').forEach(function (element) {
      var entry = localeEntry(bundle, element, 'data-scribe-alt-msgid');
      var text = entry ? localizedEntryText(entry, element) : element.getAttribute('data-scribe-default-alt');
      if (text === null) return;
      element.setAttribute('alt', text);
      setLocalizedFallbackState(element, entry, locale);
    });
    document.querySelectorAll('[data-scribe-html-msgid]').forEach(function (element) {
      var entry = localeEntry(bundle, element, 'data-scribe-html-msgid');
      var text = entry ? localizedEntryText(entry, element) : element.getAttribute('data-scribe-default-html');
      if (text === null) return;
      element.innerHTML = trustedInlineHtml(text);
      setLocalizedFallbackState(element, entry, locale);
    });
    document.querySelectorAll('[data-scribe-label-msgid]').forEach(function (element) {
      var entry = localeEntry(bundle, element, 'data-scribe-label-msgid');
      var entryText = localizedEntryText(entry, element);
      var label = entry ? entryText : element.getAttribute('data-scribe-default-label');
      var title = entry ? entryText : element.getAttribute('data-scribe-default-title');
      var tooltip = entry ? entryText : element.getAttribute('data-scribe-default-tooltip');
      if (label !== null) element.setAttribute('aria-label', label);
      if (title !== null) element.setAttribute('title', title);
      if (tooltip !== null && element.hasAttribute('data-scribe-tooltip')) element.setAttribute('data-tooltip', tooltip);
      setLocalizedFallbackState(element, entry, locale);
    });
    document.querySelectorAll('[data-scribe-placeholder-msgid]').forEach(function (element) {
      var entry = localeEntry(bundle, element, 'data-scribe-placeholder-msgid');
      var text = entry ? localizedEntryText(entry, element) : element.getAttribute('data-scribe-default-placeholder');
      if (text === null) return;
      element.setAttribute('placeholder', text);
      setLocalizedFallbackState(element, entry, locale);
    });
    syncSearchDialogLocale(locale);
    syncLanguageSearchLabel();
    syncBeforeAfterDiffLabels();
    filterLanguageOptions();
    hydrateLocalizedNumbers();
    refreshOpenPlanLocales();
  }

  function localizedText(msgid, fallback) {
    var bundle = localeBundle(currentLocale() || document.documentElement.lang);
    var entry = bundle && msgid ? bundle.messages[msgid] : undefined;
    return entry && entry.text ? entry.text : fallback;
  }

  // The before/after diff's chrome in the ACTIVE locale. The build-time path resolves the same
  // seven msgids through msg(), which bakes one locale into the HTML; reading them from the
  // report's own locale bundle is what lets a client-rendered diff follow a locale switch.
  // The two pane names are composed, not their own msgids: both halves are already localized
  // and an ICU template would have to bake one locale's arguments into every locale's string.
  function beforeAfterDiffLabels() {
    var beforeAfter = localizedText(chunkedFindingLabels.diffBeforeAfter.msgid, chunkedFindingLabels.diffBeforeAfter.defaultText);
    var original = localizedText(chunkedFindingLabels.diffOriginal.msgid, chunkedFindingLabels.diffOriginal.defaultText);
    var fixed = localizedText(chunkedFindingLabels.diffFixed.msgid, chunkedFindingLabels.diffFixed.defaultText);
    return {
      beforeAfter: beforeAfter,
      original: original,
      fixed: fixed,
      originalPane: beforeAfter + ': ' + original,
      fixedPane: beforeAfter + ': ' + fixed,
      splitView: localizedText(chunkedFindingLabels.diffSplitView.msgid, chunkedFindingLabels.diffSplitView.defaultText),
      unifiedView: localizedText(chunkedFindingLabels.diffUnifiedView.msgid, chunkedFindingLabels.diffUnifiedView.defaultText),
      fullScreen: localizedText(chunkedFindingLabels.diffFullScreen.msgid, chunkedFindingLabels.diffFullScreen.defaultText),
      closeFullScreen: localizedText(chunkedFindingLabels.diffCloseFullScreen.msgid, chunkedFindingLabels.diffCloseFullScreen.defaultText)
    };
  }

  // A rendered diff is one innerHTML blob, so the [data-scribe-msgid] sweep cannot reach inside
  // it. Re-labelling in place beats re-rendering: the code itself never changes with the locale,
  // and re-diffing every open finding on a locale switch would be pure waste.
  function syncBeforeAfterDiffLabels() {
    var containers = document.querySelectorAll('[data-scribe-fixplan-before-after]');
    if (containers.length === 0) return;
    var labels = beforeAfterDiffLabels();
    containers.forEach(function (container) {
      container.setAttribute('data-scribe-diff-close-fullscreen-label', labels.closeFullScreen);
      var label = container.querySelector('[data-scribe-diff-label]');
      if (label) label.textContent = labels.beforeAfter;
      var group = container.querySelector('.scribe-diff-view-toggle');
      if (group) group.setAttribute('aria-label', labels.beforeAfter);
      var split = container.querySelector('[data-scribe-diff-view="split"]');
      if (split) split.textContent = labels.splitView;
      var unified = container.querySelector('[data-scribe-diff-view="unified"]');
      if (unified) unified.textContent = labels.unifiedView;
      var fullscreen = container.querySelector('[data-scribe-diff-fullscreen]');
      if (fullscreen) {
        fullscreen.setAttribute('title', labels.fullScreen);
        fullscreen.setAttribute('aria-label', labels.fullScreen);
      }
      container.querySelectorAll('.sonde-diff').forEach(function (region) {
        region.setAttribute('aria-label', labels.beforeAfter);
      });
      container.querySelectorAll('.sonde-diff-pane').forEach(function (pane) {
        var isOld = pane.className.indexOf('sonde-diff-pane--old') >= 0;
        pane.setAttribute('aria-label', isOld ? labels.originalPane : labels.fixedPane);
        var header = pane.querySelector('.sonde-diff-pane-header');
        if (header) header.textContent = isOld ? labels.original : labels.fixed;
      });
    });
  }

  function languageSearchInput() {
    return byId('settings-language-search');
  }

  function syncLanguageSearchLabel() {
    var input = languageSearchInput();
    if (!input) return;
    var label = localizedText(languageSearchLabel.msgid, languageSearchLabel.defaultText);
    input.setAttribute('aria-label', label);
    input.setAttribute('placeholder', label);
    input.setAttribute('title', label);
  }

  function syncSearchDialogLocale(locale) {
    document.querySelectorAll('sonde-search-dialog').forEach(function (dialog) {
      dialog.setAttribute('locale', locale);
    });
  }

  function normalizeLanguageSearch(value) {
    var text = String(value || '').toLowerCase();
    if (text.normalize) text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return text.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function languageOptionSearchText(option) {
    var input = option.querySelector('input[name="sonde-locale-picker-radio"]');
    return [
      option.getAttribute('data-locale-search') || '',
      option.textContent || '',
      input ? input.value : ''
    ].join(' ');
  }

  function filterLanguageOptions() {
    var input = languageSearchInput();
    var query = input ? normalizeLanguageSearch(input.value) : '';
    document.querySelectorAll('.scribe-report-settings .settings-language-option').forEach(function (option) {
      var matches = query.length === 0 || normalizeLanguageSearch(languageOptionSearchText(option)).indexOf(query) !== -1;
      option.hidden = !matches;
      option.setAttribute('aria-hidden', String(!matches));
    });
  }

  function ensureLanguageSearch() {
    var section = document.querySelector('.scribe-report-settings .settings-language-section');
    var body = section ? section.querySelector('.settings-section-body') : null;
    if (!body) return;
    var input = languageSearchInput();
    if (!input) {
      input = document.createElement('input');
      input.id = 'settings-language-search';
      input.className = 'settings-language-search';
      input.type = 'search';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('data-scribe-label-msgid', languageSearchLabel.msgid);
      input.setAttribute('data-scribe-placeholder-msgid', languageSearchLabel.msgid);
      body.insertBefore(input, body.firstChild);
    }
    if (!input.hasAttribute('data-scribe-language-search-bound')) {
      input.setAttribute('data-scribe-language-search-bound', 'true');
      input.addEventListener('input', filterLanguageOptions);
    }
    syncLanguageSearchLabel();
    filterLanguageOptions();
  }

  function formatNumber(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    try {
      return localizedNumberFormatter(currentLocale() || document.documentElement.lang).format(number);
    } catch (_error) {
      return String(value);
    }
  }

  function hydrateLocalizedNumbers() {
    document.querySelectorAll('[data-scribe-number]').forEach(function (element) {
      element.textContent = formatNumber(element.getAttribute('data-scribe-number') || element.textContent || '');
    });
    document.querySelectorAll('[data-scribe-number-full]').forEach(function (element) {
      var fullNumber = formatNumber(element.getAttribute('data-scribe-number-full') || element.textContent || '');
      element.setAttribute('title', fullNumber);
      element.setAttribute('data-tooltip', fullNumber);
    });
  }

  function readFilter(id) {
    var input = byId(id);
    if (!input && id === 'report-search') return reportQueryFilter;
    if (!input) return '';
    if (input.type === 'checkbox') return input.checked ? input.value.toLowerCase() : '';
    return input.value.toLowerCase();
  }

  function readPageSize() {
    if (pdfPrintFrameActive || document.body.hasAttribute('data-scribe-printing')) return Infinity;
    var value = readFilter('filter-page-size') || '100';
    if (value === 'all') return Infinity;
    var size = Number(value);
    return Number.isFinite(size) && size > 0 ? size : 100;
  }

  function matchesFilter(value, expected) {
    if (expected.length === 0) return true;
    return value
      .toLowerCase()
      .split(',')
      .map(function (token) {
        return token.trim();
      })
      .indexOf(expected) !== -1;
  }

  function visibleResultText(pageStart, pageEnd, total, pageSize) {
    if (pageSize === Infinity || total === 0 || total <= pageSize) return formatNumber(total);
    return formatNumber(pageStart + 1) + '-' + formatNumber(pageEnd) + ' / ' + formatNumber(total);
  }

  function updatePagination(total, pageSize, pageCount) {
    var pagination = document.querySelector('.scribe-report-pagination');
    if (!pagination) return;
    reportCurrentPageCount = pageCount;
    pagination.hidden = pageSize === Infinity || total === 0 || pageCount <= 1;
    var status = byId('report-page-status');
    if (status) {
      var label = localizedText(pageStatusLabel.msgid, pageStatusLabel.defaultText);
      status.textContent = label + ' ' + formatNumber(reportCurrentPage) + ' / ' + formatNumber(pageCount);
    }
    document.querySelectorAll('[data-scribe-page-action]').forEach(function (button) {
      var action = button.getAttribute('data-scribe-page-action') || '';
      button.disabled =
        pageSize === Infinity ||
        total === 0 ||
        (action === 'first' && reportCurrentPage <= 1) ||
        (action === 'previous' && reportCurrentPage <= 1) ||
        (action === 'next' && reportCurrentPage >= pageCount) ||
        (action === 'last' && reportCurrentPage >= pageCount);
    });
  }

  function largeReportResultCount() {
    var delivery = findingChunkDelivery();
    if (delivery && typeof delivery.totalCount === 'number') return delivery.totalCount;
    return document.querySelectorAll('[data-scribe-result]').length;
  }

  function waitForReportFrame(callback) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(callback);
      return;
    }
    window.setTimeout(callback, 16);
  }

  function runAfterReportPaint(callback) {
    waitForReportFrame(function () {
      waitForReportFrame(callback);
    });
  }

  function searchableResultMetadata(card) {
    var values = [
      card.getAttribute('data-severity') || '',
      card.getAttribute('data-language') || '',
      card.getAttribute('data-classification') || '',
      card.getAttribute('data-scribe-anchor') || ''
    ];
    card.querySelectorAll('[data-source-path]').forEach(function (element) {
      values.push(element.getAttribute('data-source-path') || '');
    });
    return values
      .filter(function (value) { return value.length > 0; })
      .map(function (value) { return value + ' ' + value.replace(/[-_./]/g, ' '); })
      .join(' ');
  }

  function cachedResultText(card) {
    if (reportResultTextCache) {
      var cached = reportResultTextCache.get(card);
      if (cached !== undefined) return cached;
    }
    var text = ((card.textContent || '') + ' ' + searchableResultMetadata(card)).toLowerCase();
    if (reportResultTextCache) reportResultTextCache.set(card, text);
    return text;
  }

  function readCurrentReportFilters() {
    // Native controls serialize the shared ActiveFilter column/value model.
    var activeFilters = [];
    var selected = {};
    document.querySelectorAll('[data-scribe-filter-column]').forEach(function (control) {
      var columnId = control.getAttribute('data-scribe-filter-column');
      var value = control.type === 'checkbox' && !control.checked ? '' : control.value || '';
      if (columnId && value) { activeFilters.push({ columnId: columnId, value: value }); selected[columnId] = value; }
    });
    return {
      activeFilters: activeFilters,
      query: readFilter('report-search'),
      severity: readFilter('filter-severity'),
      language: readFilter('filter-language'),
      classification: readFilter('filter-classification'),
      autofix: selected.autofix || '',
      pageSize: readPageSize()
    };
  }

  function hasActiveReportFilters() {
    return (
      readFilter('report-search').length > 0 ||
      readFilter('filter-severity').length > 0 ||
      readFilter('filter-language').length > 0 ||
      readFilter('filter-classification').length > 0 ||
      readFilter('filter-autofix').length > 0
    );
  }

  function updateFilterClearControl() {
    var button = document.querySelector('[data-scribe-clear-filters]');
    if (!button) return;
    var active = hasActiveReportFilters();
    button.hidden = !active;
    button.disabled = !active;
  }

  function clearReportFilters() {
    ['report-search', 'filter-severity', 'filter-language', 'filter-classification', 'filter-autofix'].forEach(function (id) {
      setReportFilterValue(id, '');
    });
    updateSeverityShortcutState('');
    updateFilterClearControl();
    persistReportFilters(true);
    scheduleApplyFilters(true, 'Clearing filters...', 'Sonde is restoring the full finding set.');
  }

  function setReportFilterValue(id, value) {
    var input = byId(id);
    if (!input && id === 'report-search') {
      reportQueryFilter = String(value || '').toLowerCase();
      return;
    }
    if (input && input.type === 'checkbox') {
      input.checked = value === input.value;
      return;
    }
    if (input && input.tagName === 'SELECT' && value && !Array.from(input.options).some(function (option) { return option.value === value; })) value = '';
    if (input) input.value = value || '';
  }

  function setOverviewFilterState(filters) {
    setReportFilterValue('report-search', filters.query || '');
    setReportFilterValue('filter-severity', filters.severity || '');
    setReportFilterValue('filter-language', filters.language || '');
    setReportFilterValue('filter-classification', filters.classification || '');
    setReportFilterValue('filter-autofix', filters.autofix || '');
    updateSeverityShortcutState(readFilter('filter-severity'));
    updateFilterClearControl();
  }

  function syncSearchFieldState(query) {
    var searchInput = byId('report-search');
    var searchField = searchInput ? searchInput.closest('.scribe-search-field') : null;
    if (searchField) searchField.setAttribute('data-has-value', query.length > 0 ? 'true' : 'false');
  }

  function resultMatchesFilters(card, filters) {
    var classification = card.getAttribute('data-scribe-has-autofix');
    if (!autofixSelectionMatches(classification === 'true' ? true : classification === 'false' ? false : undefined, filters.autofix)) return false;
    if (!matchesFilter(card.getAttribute('data-severity') || '', filters.severity)) return false;
    if (!matchesFilter(card.getAttribute('data-language') || '', filters.language)) return false;
    if (!matchesFilter(card.getAttribute('data-classification') || '', filters.classification)) return false;
    return filters.query.length === 0 || cachedResultText(card).indexOf(filters.query) !== -1;
  }

  function autofixSelectionMatches(hasAutofix, selection) {
    if (selection === 'preview') return hasAutofix === true;
    return !selection;
  }

  function updateAutofixQualification() {
    var index = window.__SCRIBE_FINDINGS_INDEX__;
    var entries = index && index.filterEntries;
    if (!entries) entries = Array.from(document.querySelectorAll('[data-scribe-result]')).map(function (card) {
      var value = card.getAttribute('data-scribe-has-autofix');
      return { hasAutofix: value === 'true' ? true : value === 'false' ? false : undefined,
        severity: card.getAttribute('data-severity'), language: card.getAttribute('data-language'),
        classification: card.getAttribute('data-classification'), searchText: cachedResultText(card) };
    });
    var filters = readCurrentReportFilters();
    filters.autofix = '';
    var population = entries.filter(function (entry) { return chunkedFindingEntryMatchesFilters(entry, filters); });
    var known = population.filter(function (entry) { return entry.hasAutofix === true; }).length;
    document.querySelectorAll('[data-scribe-autofix-stat]').forEach(function (button) {
      var value = button.querySelector('[data-scribe-number]');
      if (value) {
        value.setAttribute('data-scribe-number', String(known));
        value.textContent = formatNumber(known);
      }
      button.setAttribute('aria-describedby', 'report-autofix-help');
    });
  }

  function persistReportFilters(resetPage, replaceHistory) {
    if (pdfPrintFrameActive) return;
    if (resetPage) reportCurrentPage = 1;
    var filters = readCurrentReportFilters();
    var url = new URL(location.href);
    function set(name, value) { if (value) url.searchParams.set(name, String(value)); else url.searchParams.delete(name); }
    set('q', byId('report-search') ? byId('report-search').value : filters.query);
    url.searchParams.delete('scribe_filter_query');
    ['severity', 'language', 'classification', 'autofix'].forEach(function (name) { set('scribe_filter_' + name, filters[name]); });
    set('scribe_page', reportCurrentPage > 1 ? reportCurrentPage : '');
    set('scribe_page_size', readFilter('filter-page-size') === '100' ? '' : readFilter('filter-page-size'));
    if (url.toString() !== location.href) history[replaceHistory ? 'replaceState' : 'pushState'](null, '', url.toString());
  }

  function restoreReportFiltersFromUrl() {
    var filters = requestedPrintFilters();
    filters.query = queryParam('q') || filters.query;
    setOverviewFilterState(filters);
    var size = queryParam('scribe_page_size') || '100';
    var control = byId('filter-page-size');
    if (control && Array.from(control.options).some(function (option) { return option.value === size; })) control.value = size;
    var page = Number(queryParam('scribe_page') || 1);
    reportCurrentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  }

  function updateVisibleTocAnchors(visibleAnchors) {
    var activeFilters = hasActiveReportFilters();
    document.querySelectorAll('[data-scribe-toc-result]').forEach(function (item) {
      var anchorId = item.getAttribute('data-scribe-toc-anchor') || '';
      item.hidden = anchorId.length > 0 && !visibleAnchors[anchorId];
    });
    document.querySelectorAll('[data-scribe-toc-group-container]').forEach(function (group) {
      var visibleItems = Array.from(group.querySelectorAll('[data-scribe-toc-result]')).some(function (item) {
        return !item.hidden;
      });
      group.hidden = !visibleItems;
      // Un-hiding the matching entries is not enough: they live inside a
      // <details>, so a collapsed group keeps every match out of the rendered
      // page and out of the accessibility tree. A search that finds something
      // has to reveal it.
      var disclosure = group.querySelector('details');
      if (!disclosure) return;
      var filterExpanded = disclosure.hasAttribute('data-scribe-filter-expanded');
      if (visibleItems && activeFilters) {
        if (!filterExpanded) {
          disclosure.setAttribute('data-scribe-open-before-filter', String(disclosure.open));
          disclosure.setAttribute('data-scribe-filter-expanded', 'true');
          var disclosureName = disclosure.getAttribute('name');
          if (disclosureName !== null) {
            disclosure.setAttribute('data-scribe-name-before-filter', disclosureName);
            disclosure.removeAttribute('name');
          }
        }
        disclosure.open = true;
        return;
      }
      if (filterExpanded) {
        disclosure.open = disclosure.getAttribute('data-scribe-open-before-filter') === 'true';
        var nameBeforeFilter = disclosure.getAttribute('data-scribe-name-before-filter');
        if (nameBeforeFilter !== null) disclosure.setAttribute('name', nameBeforeFilter);
        disclosure.removeAttribute('data-scribe-open-before-filter');
        disclosure.removeAttribute('data-scribe-name-before-filter');
        disclosure.removeAttribute('data-scribe-filter-expanded');
      }
    });
  }

  function completeFilterApplication(matches, pageSize) {
    var visibleAnchors = {};
    var total = matches.length;
    var pageCount = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(total / pageSize));
    if (reportCurrentPage > pageCount) reportCurrentPage = pageCount;
    if (reportCurrentPage < 1) reportCurrentPage = 1;
    var pageStart = pageSize === Infinity ? 0 : (reportCurrentPage - 1) * pageSize;
    var pageEnd = pageSize === Infinity ? total : Math.min(total, pageStart + pageSize);
    matches.forEach(function (card, index) {
      var onPage = pageSize === Infinity || (index >= pageStart && index < pageEnd);
      card.hidden = !onPage;
      if (onPage && card.id) visibleAnchors[card.id] = true;
    });
    updateVisibleTocAnchors(visibleAnchors);
    var count = byId('report-result-count');
    if (count) count.textContent = visibleResultText(pageStart, pageEnd, total, pageSize);
    updatePagination(total, pageSize, pageCount);
    hydrateLocalizedNumbers();
    updateSeverityShortcutState(readFilter('filter-severity'));
    updateFilterClearControl();
    updateAutofixQualification();
    updateAutofixPresentation();
  }

  function updateAutofixPresentation() {
    var focused = readFilter('filter-autofix') === 'preview';
    document.querySelectorAll('[data-scribe-autofix-stat]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(focused));
    });
    document.querySelectorAll('[data-scribe-result][data-scribe-has-autofix="true"] > .scribe-finding-body').forEach(function (body) {
      var explanation = body.querySelector(':scope > [data-scribe-full-explanation]');
      if (!focused) {
        if (!explanation) return;
        explanation._scribeOriginalPositions.forEach(function (entry) {
          entry.marker.replaceWith(entry.element);
        });
        explanation.remove();
        return;
      }
      if (explanation) return;
      explanation = document.createElement('details');
      explanation.setAttribute('data-scribe-full-explanation', '');
      var findingId = body.parentElement.id;
      explanation.open = explanationDisclosureState.get(findingId) === true;
      explanation.addEventListener('toggle', function () {
        if (explanation.isConnected && !planPrintActive) explanationDisclosureState.set(findingId, explanation.open);
      });
      var summary = document.createElement('summary');
      summary.setAttribute('data-scribe-msgid', 'scribe.report.autofixFilter.fullExplanation');
      summary.textContent = localizedText('scribe.report.autofixFilter.fullExplanation', 'Full explanation');
      explanation.appendChild(summary);
      explanation._scribeOriginalPositions = [];
      Array.from(body.children).forEach(function (element) {
        if (element.matches('.source-evidence, .finding-fix, [data-scribe-plan-slice], .scribe-report-link-stack')) return;
        var marker = document.createComment('explanation-position');
        element.before(marker);
        explanation._scribeOriginalPositions.push({ marker: marker, element: element });
        explanation.appendChild(element);
      });
      if (explanation._scribeOriginalPositions.length) body.appendChild(explanation);
    });
  }

  function applyFiltersNow() {
    var filters = readCurrentReportFilters();
    syncSearchFieldState(filters.query);
    var matches = [];
    document.querySelectorAll('[data-scribe-result]').forEach(function (card) {
      var cardMatches = resultMatchesFilters(card, filters);
      card.hidden = !cardMatches;
      if (cardMatches) matches.push(card);
    });
    completeFilterApplication(matches, filters.pageSize);
    reconcileEvidenceReveal(true);
  }

  function applyFiltersChunked(generation, operation, done) {
    var filters = readCurrentReportFilters();
    syncSearchFieldState(filters.query);
    var cards = Array.from(document.querySelectorAll('[data-scribe-result]'));
    var matches = [];
    var processCards = function (start) {
      if (generation !== reportFilterGeneration || reportOperationIsAborted(operation)) {
        done(true);
        return;
      }
      var end = Math.min(cards.length, start + reportFilterBatchSize);
      for (var index = start; index < end; index += 1) {
        var card = cards[index];
        var cardMatches = resultMatchesFilters(card, filters);
        card.hidden = !cardMatches;
        if (cardMatches) matches.push(card);
      }
      if (end < cards.length) {
        waitForReportFrame(function () {
          processCards(end);
        });
        return;
      }
      completeFilterApplication(matches, filters.pageSize);
      reconcileEvidenceReveal(true);
      done(false);
    };
    processCards(0);
  }

  function scheduleApplyFilters(resetPage, workingLabel, workingDescription) {
    if (activeReportOperation && activeReportOperation.kind === 'filter') cancelReportOperation('superseded');
    if (resetPage) reportCurrentPage = 1;
    if (pendingFilterTimer) window.clearTimeout(pendingFilterTimer);
    reportFilterGeneration += 1;
    updateFilterClearControl();
    var generation = reportFilterGeneration;
    var showSpinner = largeReportResultCount() > 500;
    var operation = null;
    if (showSpinner) {
      operation = startReportOperation(
        'filter',
        workingLabel || 'Filtering report...',
        workingDescription || 'Sonde is updating visible findings and navigation.'
      );
    }
    pendingFilterTimer = window.setTimeout(function () {
      pendingFilterTimer = 0;
      if (generation !== reportFilterGeneration) return;
      if (reportUsesChunkedFindings() && !pdfPrintFrameActive && !document.body.hasAttribute('data-scribe-printing')) {
        applyChunkedFindingFilters(function () {
          if (generation === reportFilterGeneration && operation) finishReportOperation(operation);
        });
        return;
      }
      ensureFindingsForCurrentFilterPass(function () {
        if (generation !== reportFilterGeneration || reportOperationIsAborted(operation)) return;
        if (!showSpinner) {
          applyFiltersNow();
          return;
        }
        runAfterReportPaint(function () {
          if (generation !== reportFilterGeneration || reportOperationIsAborted(operation)) return;
          applyFiltersChunked(generation, operation, function (aborted) {
            if (!aborted) finishReportOperation(operation);
          });
        });
      });
    }, 0);
  }

  function applyFilters() {
    if (pdfPrintFrameActive) {
      reportFilterGeneration += 1;
      materializeAllFindingChunks(applyFiltersNow);
      return;
    }
    scheduleApplyFilters(false, 'Loading report...', 'Sonde is preparing findings and pagination.');
  }

  function supportedNistBaseline(value) {
    return value === '' || value === 'low' || value === 'moderate' || value === 'high';
  }

  function supportedNistOverlay(value) {
    return value === '' || value === 'privacy';
  }

  function restoreNistCoverageControls() {
    var baseline = byId('nist-baseline-filter');
    var overlay = byId('nist-overlay-filter');
    if (!baseline && !overlay) return;
    var storedBaseline = storedNistBaseline();
    var storedOverlay = storedNistOverlay();
    if (baseline && storedBaseline !== null && supportedNistBaseline(storedBaseline)) baseline.value = storedBaseline;
    if (overlay && storedOverlay !== null && supportedNistOverlay(storedOverlay)) overlay.value = storedOverlay;
    applyNistCoverageControls();
  }

  function nistRowMatchesBaseline(row, baseline, overlay) {
    if (!baseline && !overlay) return true;
    if (baseline && row.getAttribute('data-nist-baseline-' + baseline) === 'true') return true;
    if (overlay === 'privacy' && row.getAttribute('data-nist-overlay-privacy') === 'true') return true;
    return false;
  }

  function applyNistCoverageControls() {
    var baseline = byId('nist-baseline-filter');
    var overlay = byId('nist-overlay-filter');
    var baselineValue = baseline ? baseline.value || '' : '';
    var overlayValue = overlay ? overlay.value || '' : '';
    var visibleCount = 0;
    document.querySelectorAll('[data-nist-control-row]').forEach(function (row) {
      var matches = nistRowMatchesBaseline(row, baselineValue, overlayValue);
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    var count = byId('nist-control-count');
    if (count) count.textContent = String(visibleCount);
    storeNistBaseline(baselineValue);
    storeNistOverlay(overlayValue);
  }

  function attachNistCoverageControls() {
    ['nist-baseline-filter', 'nist-overlay-filter'].forEach(function (id) {
      var control = byId(id);
      if (!control) return;
      control.addEventListener('change', applyNistCoverageControls);
      control.addEventListener('input', applyNistCoverageControls);
    });
  }

  function updateSeverityShortcutState(severity) {
    document.querySelectorAll('[data-scribe-severity-shortcut]').forEach(function (button) {
      button.setAttribute('aria-pressed', String((button.getAttribute('data-scribe-severity-shortcut') || '') === severity));
    });
  }

  function attachOverviewSeverityShortcuts() {
    document.querySelectorAll('[data-scribe-severity-shortcut]').forEach(function (button) {
      button.addEventListener('click', function () {
        var severity = button.getAttribute('data-scribe-severity-shortcut') || '';
        var select = byId('filter-severity');
        if (!select) return;
        select.value = select.value === severity ? '' : severity;
        persistReportFilters(true);
        scheduleApplyFilters(true);
      });
    });
  }

  function attachOverviewFilters() {
    document.querySelectorAll('[data-scribe-overview-filter]').forEach(function (row) {
      var nativeButton = row.tagName === 'BUTTON';
      if (!nativeButton) {
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
      }
      var activate = function () {
        var autofix = row.getAttribute('data-scribe-filter-autofix');
        if (autofix !== null) {
          setReportFilterValue('filter-autofix', autofix);
          persistReportFilters(true);
          scheduleApplyFilters(true);
          return;
        }
        setOverviewFilterState({
          query: row.getAttribute('data-scribe-filter-query') || '',
          severity: row.getAttribute('data-scribe-filter-severity') || '',
          language: row.getAttribute('data-scribe-filter-language') || '',
          classification: row.getAttribute('data-scribe-filter-classification') || ''
        });
        persistReportFilters(true);
        scheduleApplyFilters(true);
      };
      row.addEventListener('click', activate);
      if (!nativeButton) {
        row.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          activate();
        });
      }
    });
  }

  function applyReaderView(viewId) {
    var manifest = window.__SCRIBE_MANIFEST__;
    var view = manifest && manifest.readerViews ? manifest.readerViews.find(function (candidate) {
      return candidate.viewId === viewId;
    }) : undefined;
    document.body.setAttribute('data-reader-view', viewId);
    document.body.setAttribute('data-reader-density', view && view.density ? view.density : 'normal');
    document.querySelectorAll('[data-scribe-anchor]').forEach(function (element) {
      var anchorId = element.getAttribute('data-scribe-anchor') || '';
      element.hidden = Boolean(view && view.hiddenAnchorIds && view.hiddenAnchorIds.indexOf(anchorId) !== -1);
    });
    syncReaderViewTocLinks(view);
  }

  function fragmentIdFromHref(href) {
    if (!href || href.charAt(0) !== '#') return '';
    try {
      return decodeURIComponent(href.slice(1));
    } catch (_error) {
      return href.slice(1);
    }
  }

  function syncReaderViewTocLinks(view) {
    var hiddenAnchorIds = {};
    (view && view.hiddenAnchorIds ? view.hiddenAnchorIds : []).forEach(function (anchorId) {
      hiddenAnchorIds[anchorId] = true;
    });
    document.querySelectorAll('.scribe-report-toc a[href^="#"]').forEach(function (link) {
      var item = link.closest ? link.closest('li') : null;
      if (!item) return;
      item.hidden = Boolean(hiddenAnchorIds[fragmentIdFromHref(link.getAttribute('href') || '')]);
    });
  }

  function stopSummaryToggle(event) {
    if (!event) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function stopPermalinkActivation(event) {
    if (!event) return;
    event.preventDefault();
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
      return;
    }
    event.stopPropagation();
  }

  function recordShare(anchorId) {
    window.__SCRIBE_LAST_SHARE__ = {
      anchorId: anchorId,
      locale: currentLocale(),
      readerView: readFilter('report-reader-view'),
      url: window.location.href
    };
  }

  function emitShare(button, event) {
    stopSummaryToggle(event);
    var anchorId = button.getAttribute('data-share-anchor') || '';
    if (anchorId.length > 0) activateAnchorFragment('#' + anchorId);
    recordShare(anchorId);
  }

  function emitFeedback(button, event) {
    stopSummaryToggle(event);
    var actionId = button.getAttribute('data-feedback-action') || '';
    var buttonAnchor = button.getAttribute('data-feedback-anchor') || '';
    var action = window.__SCRIBE_FEEDBACK_ACTIONS__ && window.__SCRIBE_FEEDBACK_ACTIONS__.find(function (candidate) {
      return candidate.actionId === actionId;
    });
    window.__SCRIBE_FEEDBACK_OUTBOX__ = window.__SCRIBE_FEEDBACK_OUTBOX__ || [];
    window.__SCRIBE_FEEDBACK_OUTBOX__.push({
      actionId: actionId,
      anchorId: buttonAnchor || (action ? action.anchorId : ''),
      locale: currentLocale(),
      licenseVisibility: action ? action.payloadTemplate.licenseVisibility : 'redacted',
      privateReceiptIncluded: false,
      sourceContext: 'redacted'
    });
  }

  function findingTargetFromFragment(fragment) {
    if (!fragment || fragment.length <= 1 || fragment.charAt(0) !== '#') return null;
    try {
      return document.getElementById(decodeURIComponent(fragment.slice(1)));
    } catch (_error) {
      return document.getElementById(fragment.slice(1));
    }
  }

  function findingTargetFromHash() {
    return findingTargetFromFragment(window.location.hash);
  }

  function activateAnchorFragment(fragment) {
    if (!fragment) return false;
    var normalizedFragment = fragment.charAt(0) === '#' ? fragment : '#' + fragment;
    function commitFragment() {
      var targetUrl = new URL(location.href);
      targetUrl.hash = normalizedFragment;
      if (targetUrl.href === location.href) return;
      history.pushState(null, '', targetUrl.href);
    }
    if (!findingTargetFromFragment(normalizedFragment)) {
      var missingAnchorId = fragmentIdFromHref(normalizedFragment);
      ensureFindingChunkForAnchor(missingAnchorId, function (loaded) {
        if (!loaded || !findingTargetFromFragment(normalizedFragment)) return;
        commitFragment();
        ensureFindingTargetOpen();
        scheduleApplyFilters(false);
      });
      return true;
    }
    commitFragment();
    ensureFindingTargetOpen();
    return true;
  }

  function findingDetailsForTarget(target) {
    return target && target.matches && target.matches('details.scribe-finding-details')
      ? target
      : target.closest
        ? target.closest('details.scribe-finding-details')
        : null;
  }

  function openAnchorAncestorDetails(target) {
    if (!target) return;
    var ancestor = target;
    while (ancestor) {
      if (ancestor.matches && ancestor.matches('details') && !ancestor.open) ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
  }

  function visibleNavigationTarget(target, details) {
    if (!target) return null;
    if (target.hidden || (target.closest && target.closest('[hidden]'))) return details || target;
    return target;
  }

  function scrollNavigationTarget(target) {
    if (!target || !target.scrollIntoView) return;
    window.requestAnimationFrame(function () {
      if (!document.activeElement || !document.activeElement.closest('.scribe-report-toc')) focusNavigationTarget(target);
      target.scrollIntoView({ block: 'start' });
    });
  }

  function focusNavigationTarget(target) {
    if (!target) return;
    var focusTarget =
      target.matches && target.matches('details') ? target.querySelector(':scope > summary') || target : target;
    if (!focusTarget.focus) return;
    if (!focusTarget.hasAttribute('tabindex') && !isNativelyFocusable(focusTarget)) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.setAttribute('data-scribe-anchor-focus-target', '');
    }
    try {
      focusTarget.focus({ preventScroll: true });
    } catch (_error) {
      focusTarget.focus();
    }
  }

  function isNativelyFocusable(element) {
    var tagName = element.tagName ? element.tagName.toLowerCase() : '';
    return (
      tagName === 'summary' ||
      tagName === 'button' ||
      tagName === 'select' ||
      tagName === 'textarea' ||
      (tagName === 'a' && element.hasAttribute('href')) ||
      (tagName === 'input' && element.getAttribute('type') !== 'hidden')
    );
  }

  function flashFindingHeader(details) {
    if (!details) return;
    var header = details.querySelector('.scribe-finding-title-line');
    if (!header) return;
    header.classList.remove('scribe-anchor-beacon');
    void header.offsetWidth;
    header.classList.add('scribe-anchor-beacon');
    window.setTimeout(function () {
      header.classList.remove('scribe-anchor-beacon');
    }, 1600);
  }

  function flashAnchorTarget(target, details) {
    if (!target || target === details) return;
    target.classList.remove('scribe-anchor-target-beacon');
    void target.offsetWidth;
    target.classList.add('scribe-anchor-target-beacon');
    window.setTimeout(function () {
      target.classList.remove('scribe-anchor-target-beacon');
    }, 1600);
  }

  function cssEscape(value) {
    return window.CSS && window.CSS.escape ? window.CSS.escape(value) : String(value).replace(/["\\]/g, '\\$&');
  }

  function updateActiveTocLink(target, details) {
    document.querySelectorAll('.scribe-toc-link.is-active').forEach(function (link) {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    if (!target) return;
    var targetId = target.id || '';
    var detailsId = details && details.id ? details.id : '';
    var selector = targetId ? '.scribe-toc-link[href="#' + cssEscape(targetId) + '"]' : '';
    if (selector) {
      document.querySelectorAll(selector).forEach(function (link) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'location');
      });
    }
    if (!detailsId) return;
    document.querySelectorAll('[data-scribe-toc-anchor="' + cssEscape(detailsId) + '"] > .scribe-toc-link').forEach(function (link) {
      if (targetId && link.getAttribute('href') === '#' + targetId) return;
      link.classList.add('is-active');
    });
  }

  function clearEvidenceReveal(hide) {
    if (revealedFinding) {
      if (hide !== false) revealedFinding.hidden = true;
      revealedFinding.removeAttribute('data-scribe-outside-results');
    }
    revealedFinding = null;
    document.querySelectorAll('[data-scribe-target-reveal]').forEach(function (notice) { notice.remove(); });
  }

  function reconcileEvidenceReveal(afterFilter) {
    var target = findingTargetFromHash();
    var finding = target && target.closest ? target.closest('[data-scribe-result]') : null;
    if (revealedFinding && revealedFinding !== finding) clearEvidenceReveal();
    if (afterFilter && finding && !finding.hidden && finding === revealedFinding) {
      clearEvidenceReveal(false);
      return;
    }
    if (!finding || (!finding.hidden && finding !== revealedFinding)) return;
    // Filtering owns counts and pagination. This navigation exception never joins the matches.
    if (!finding.hidden && finding === revealedFinding && !finding.hasAttribute('data-scribe-outside-results')) return;
    revealedFinding = finding;
    finding.hidden = false;
    finding.setAttribute('data-scribe-outside-results', '');
    if (document.querySelector('[data-scribe-target-reveal]')) return;
    finding.before(targetNavigationNotice('scribe.report.control.outsideResults', 'Outside the current results'));
  }

  function targetNavigationNotice(msgid, fallback) {
    var notice = document.createElement('p');
    notice.setAttribute('data-scribe-target-reveal', '');
    notice.setAttribute('data-scribe-target-hash', location.hash);
    notice.setAttribute('role', 'status');
    var explanation = document.createElement('span');
    explanation.setAttribute('data-scribe-msgid', msgid);
    explanation.textContent = localizedText(msgid, fallback);
    notice.appendChild(explanation);
    notice.appendChild(document.createTextNode(' '));
    var back = document.createElement('button');
    back.type = 'button';
    back.setAttribute('data-scribe-return-results', '');
    back.setAttribute('data-scribe-msgid', 'scribe.report.control.returnToResults');
    back.textContent = localizedText('scribe.report.control.returnToResults', 'Return to results');
    back.addEventListener('click', function () {
      var context = evidenceReturnContext;
      var url = new URL(context ? context.url : location.href);
      if (!context) url.hash = '';
      history.pushState(null, '', url.toString());
      clearEvidenceReveal();
      evidenceReturnContext = null;
      scheduleApplyFilters(false);
      var focus = context && context.focus && context.focus.isConnected ? context.focus : byId('report-search');
      if (focus) focus.focus({ preventScroll: true });
      if (context) window.scrollTo(context.x, context.y);
    });
    notice.appendChild(back);
    return notice;
  }

  function ensureFindingTargetOpen() {
    var notice = document.querySelector('[data-scribe-target-reveal]');
    if (notice && notice.getAttribute('data-scribe-target-hash') !== location.hash) clearEvidenceReveal();
    var target = findingTargetFromHash();
    var currentFinding = target && target.closest ? target.closest('[data-scribe-result]') : null;
    if (revealedFinding && currentFinding !== revealedFinding) clearEvidenceReveal();
    if (!target) {
      var anchorId = fragmentIdFromHref(window.location.hash);
      if (!anchorId) return;
      ensureFindingChunkForAnchor(anchorId, function (loaded) {
        if (loaded && fragmentIdFromHref(window.location.hash) === anchorId) ensureFindingTargetOpen();
        if (!loaded && fragmentIdFromHref(window.location.hash) === anchorId && !document.querySelector('[data-scribe-target-reveal]')) {
          var host = byId('main-content');
          if (!host) return;
          var notice = targetNavigationNotice('scribe.report.control.targetUnavailable', 'This report target is unavailable');
          var identity = document.createElement('code');
          identity.textContent = anchorId;
          notice.appendChild(document.createTextNode(' '));
          notice.appendChild(identity);
          host.prepend(notice);
        }
      });
      return;
    }
    var details = findingDetailsForTarget(target);
    if (details) details.open = true;
    reconcileEvidenceReveal();
    openAnchorAncestorDetails(target);
    var navigationTarget = visibleNavigationTarget(target, details);
    flashFindingHeader(details);
    flashAnchorTarget(navigationTarget, details);
    updateActiveTocLink(navigationTarget, details);
    hydrateDeferredSourceSnippets(navigationTarget || details || target);
    scrollNavigationTarget(navigationTarget);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return;
    }
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.insetInlineStart = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch (_error) {}
    textarea.remove();
  }

  function selectedTextWithin(element) {
    var selection = window.getSelection ? window.getSelection() : null;
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return '';
    var range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) return '';
    return selection.toString();
  }

  var sourceSnippetCallbacks = [];
  var sourceSnippetScriptLoading = false;
  var sourceSnippetMap = null;

  function sourceSnippetDataReady() {
    return Array.isArray(window.__SCRIBE_SOURCE_SNIPPETS__);
  }

  function reportAssetPrefix() {
    var script = document.querySelector('script[src$="boot/file-direct.js"]');
    var src = script ? script.getAttribute('src') || '' : '';
    var suffix = 'boot/file-direct.js';
    return src.slice(-suffix.length) === suffix ? src.slice(0, src.length - suffix.length) : '';
  }

  function flushSourceSnippetCallbacks() {
    var callbacks = sourceSnippetCallbacks.slice();
    sourceSnippetCallbacks = [];
    callbacks.forEach(function (callback) {
      callback();
    });
  }

  function ensureSourceSnippetData(callback) {
    if (sourceSnippetDataReady()) {
      callback();
      return;
    }
    sourceSnippetCallbacks.push(callback);
    if (sourceSnippetScriptLoading) return;
    sourceSnippetScriptLoading = true;
    var script = document.createElement('script');
    script.src = reportAssetPrefix() + 'data/source-snippets.js';
    script.defer = true;
    script.onload = flushSourceSnippetCallbacks;
    script.onerror = flushSourceSnippetCallbacks;
    document.head.appendChild(script);
  }

  function sourceSnippetById(snippetId) {
    if (!sourceSnippetDataReady()) return null;
    if (!sourceSnippetMap) {
      sourceSnippetMap = {};
      window.__SCRIBE_SOURCE_SNIPPETS__.forEach(function (snippet) {
        sourceSnippetMap[snippet.snippetId] = snippet;
      });
    }
    return sourceSnippetMap[snippetId] || null;
  }

  var findingChunkCallbacks = {};
  var findingChunkLoading = {};
  var findingChunkRendered = {};
  var findingChunkIndexCallbacks = [];
  var findingChunkIndexLoading = false;
  var findingChunkHashSelectionApplied = '';

  function findingChunkDelivery() {
    var manifest = window.__SCRIBE_MANIFEST__;
    return manifest && manifest.findingChunks ? manifest.findingChunks : null;
  }

  function findingChunkIndexReady() {
    return Boolean(window.__SCRIBE_FINDINGS_INDEX__ && Array.isArray(window.__SCRIBE_FINDINGS_INDEX__.chunks));
  }

  function flushFindingChunkIndexCallbacks() {
    var callbacks = findingChunkIndexCallbacks.slice();
    findingChunkIndexCallbacks = [];
    callbacks.forEach(function (callback) {
      callback();
    });
  }

  function ensureFindingChunkIndex(callback) {
    if (findingChunkIndexReady()) {
      callback();
      return;
    }
    var delivery = findingChunkDelivery();
    if (!delivery || !delivery.indexPath) {
      callback();
      return;
    }
    findingChunkIndexCallbacks.push(callback);
    if (findingChunkIndexLoading) return;
    findingChunkIndexLoading = true;
    var script = document.createElement('script');
    script.src = reportAssetPrefix() + delivery.indexPath;
    script.defer = true;
    script.onload = flushFindingChunkIndexCallbacks;
    script.onerror = flushFindingChunkIndexCallbacks;
    document.head.appendChild(script);
  }

  function flushFindingChunkCallbacks(chunkIndex) {
    var callbacks = findingChunkCallbacks[chunkIndex] || [];
    findingChunkCallbacks[chunkIndex] = [];
    callbacks.forEach(function (callback) {
      callback();
    });
  }

  function findingChunkPayload(chunkIndex) {
    return window.__SCRIBE_FINDINGS_CHUNK__ && window.__SCRIBE_FINDINGS_CHUNK__[chunkIndex];
  }

  function chunkedFindingContainer() {
    return document.querySelector('[data-scribe-chunked-results]');
  }

  function chunkedFindingStatus() {
    return document.querySelector('[data-scribe-chunked-status]');
  }

  function chunkedFindingTocContainer(printOnly) {
    return document.querySelector(
      printOnly ? '[data-scribe-chunked-print-toc-results]' : '[data-scribe-chunked-toc-results]'
    );
  }

  function setChunkedFindingStatus(message, hidden) {
    var status = chunkedFindingStatus();
    if (!status) return;
    status.textContent = message || '';
    status.hidden = Boolean(hidden);
  }

  function localizableRuntimeText(value) {
    if (!value) return '';
    var args = value.icuArgs || {};
    var fallback = formatLocalizedTemplate(value.defaultText || '', args);
    var bundle = localeBundle(currentLocale() || document.documentElement.lang);
    var entry = bundle && value.msgid ? bundle.messages[value.msgid] : undefined;
    return entry && entry.text ? formatLocalizedTemplate(entry.text, args) : fallback;
  }

  function facetRuntimeLabel(facetId, value) {
    var manifest = window.__SCRIBE_MANIFEST__;
    var facets = manifest && manifest.facets ? manifest.facets : [];
    for (var facetIndex = 0; facetIndex < facets.length; facetIndex += 1) {
      var facet = facets[facetIndex];
      if (!facet || facet.facetId !== facetId) continue;
      var values = facet.values || [];
      for (var valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
        if (values[valueIndex] && values[valueIndex].id === value) {
          return localizableRuntimeText(values[valueIndex].label);
        }
      }
    }
    return value;
  }

  function addLocalizableTextAttributes(element, text) {
    if (!element || !text || !text.msgid) return;
    element.setAttribute('data-scribe-msgid', text.msgid);
    if (text.icuArgs) element.setAttribute('data-scribe-icu-args', JSON.stringify(text.icuArgs));
    // captureDefaultLocalizedText() runs ONCE at boot, before any runtime-built element exists,
    // so without this an injected element has no fallback: switching to a locale whose bundle
    // lacks this msgid makes updateText() bail and leave the PREVIOUS locale's text sitting
    // there. Stamp the same formatted default localizableRuntimeText() falls back to.
    if (!element.hasAttribute('data-scribe-default-text')) {
      element.setAttribute(
        'data-scribe-default-text',
        formatLocalizedTemplate(text.defaultText || '', text.icuArgs || {})
      );
    }
  }

  // The source-evidence title comes from the snippet RECORD, never from a build-time constant.
  // The record is where the one title/body decision was made, and the schema refuses a record
  // whose halves disagree — so reading the title from the same object that carries the body is
  // what makes them agree here. Titling from a constant is exactly how 80 snippets came to read
  // "Autofix" over unfixed source: the constant cannot know what the body turned out to be.
  // Returns false when the record is not loaded yet; see enrichSourceEvidenceTitles.
  function applySourceEvidenceTitle(element, snippetId) {
    var snippet = sourceSnippetById(snippetId);
    if (!snippet || !snippet.label || !snippet.label.msgid) return false;
    element.textContent = localizableRuntimeText(snippet.label);
    addLocalizableTextAttributes(element, snippet.label);
    var section = element.closest ? element.closest('.source-evidence') : null;
    if (section && snippet.body && snippet.body.kind === 'autofix') {
      // Same attribute the static finding-detail page stamps, so one selector answers
      // "is this section a diff?" on every surface.
      section.setAttribute('data-scribe-source-evidence', 'before-after');
    }
    return true;
  }

  var chunkedAutofixAnchorSet = null;

  // Which findings the overview may badge, count and filter as an autofix.
  //
  // Read from the chunk index's filter entries, which is where the build puts it precisely so it
  // is available WITHOUT the finding's snippet record — the record is 651 KB and arrives later,
  // and the overview has to answer "is this an autofix?" for a card it is rendering right now.
  // Empty when the index predates the field, which reads as "none known", never as "none".
  function chunkedAutofixAnchorIds() {
    if (chunkedAutofixAnchorSet) return chunkedAutofixAnchorSet;
    chunkedAutofixAnchorSet = {};
    var index = window.__SCRIBE_FINDINGS_INDEX__;
    var entries = index && Array.isArray(index.filterEntries) ? index.filterEntries : [];
    entries.forEach(function (entry) {
      if (entry && typeof entry.hasAutofix === 'boolean' && entry.anchorId) chunkedAutofixAnchorSet[entry.anchorId] = entry.hasAutofix;
    });
    return chunkedAutofixAnchorSet;
  }

  function chunkedFindingHasAutofix(anchorId) {
    return Boolean(anchorId) && chunkedAutofixAnchorIds()[anchorId] === true;
  }

  // Cards and TOC entries can be built before data/source-snippets.js has run. They carry the
  // snippet id and NO text until it does — an empty heading for the instant before the record
  // arrives is honest; a guessed one is the defect this milestone exists to remove.
  function enrichSourceEvidenceTitles(root) {
    if (!sourceSnippetDataReady()) return;
    (root || document).querySelectorAll('[data-scribe-deferred-source-evidence-title]').forEach(function (element) {
      var snippetId = element.getAttribute('data-scribe-deferred-source-evidence-title') || '';
      if (applySourceEvidenceTitle(element, snippetId)) {
        element.removeAttribute('data-scribe-deferred-source-evidence-title');
      }
    });
  }

  function createChunkedFindingTocItem(summary, printOnly) {
    var item = document.createElement('li');
    if (!printOnly) {
      item.setAttribute('data-scribe-toc-result', '');
      item.setAttribute('data-scribe-toc-anchor', summary.anchorId);
    }
    var findingLink = document.createElement('a');
    if (!printOnly) findingLink.className = 'scribe-toc-link';
    findingLink.href = '#' + summary.anchorId;
    findingLink.textContent = localizableRuntimeText(summary.title);
    addLocalizableTextAttributes(findingLink, summary.title);
    item.appendChild(findingLink);

    if (summary.sourceSnippetIds && summary.sourceSnippetIds.length > 0) {
      var children = document.createElement('ol');
      if (!printOnly) children.className = 'scribe-toc-child-icons';
      var sourceItem = document.createElement('li');
      var sourceLink = document.createElement('a');
      if (!printOnly) sourceLink.className = 'scribe-toc-link scribe-toc-link--child';
      sourceLink.href = '#' + summary.sourceSnippetIds[0];
      // The TOC entry names the same section the card heads, so it takes the same title from
      // the same record. A TOC reading "Source evidence" over a section reading "Autofix" is
      // the divergence across surfaces the IA directive forbids.
      sourceLink.setAttribute('data-scribe-deferred-source-evidence-title', summary.sourceSnippetIds[0]);
      // The role the static sidebar has always set for a fixable finding, which the chunked TOC
      // never did because it had nothing to decide it from. Attribute only — the icon-link shape
      // and its role-selects-glyph contract are the static path's and stay untouched.
      sourceLink.setAttribute(
        'data-scribe-toc-child-role',
        chunkedFindingHasAutofix(summary.anchorId) ? 'autofix' : 'source-evidence'
      );
      if (applySourceEvidenceTitle(sourceLink, summary.sourceSnippetIds[0])) {
        sourceLink.removeAttribute('data-scribe-deferred-source-evidence-title');
      }
      sourceItem.appendChild(sourceLink);
      children.appendChild(sourceItem);
      item.appendChild(children);
    }
    return item;
  }

  function replaceChunkedFindingToc(summaries, visibleAnchorIds, printOnly) {
    var container = chunkedFindingTocContainer(printOnly);
    if (!container) return;
    container.replaceChildren();
    summaries.forEach(function (summary) {
      if (!summary || !summary.anchorId) return;
      if (visibleAnchorIds && !visibleAnchorIds[summary.anchorId]) return;
      container.appendChild(createChunkedFindingTocItem(summary, printOnly));
    });
  }

  function hydrateDeferredFindingToc() {
    var findings = window.__SCRIBE_FINDINGS__;
    if (!Array.isArray(findings) || findings.length === 0) return;
    replaceChunkedFindingToc(findings, null, false);
    replaceChunkedFindingToc(findings, null, true);
    // data/source-snippets.js is an eager deferred script, so it has normally run by
    // DOMContentLoaded and the titles above are already stamped. This covers the case where it
    // has not: the TOC keeps its untitled entries until the records that title them arrive.
    if (!sourceSnippetDataReady()) ensureSourceSnippetData(enrichChunkedSourceSnippetPlaceholders);
  }

  function chunkedFindingSummaries(chunkIndexes) {
    var summaries = [];
    chunkIndexes.forEach(function (chunkIndex) {
      var payload = findingChunkPayload(chunkIndex);
      if (Array.isArray(payload)) summaries = summaries.concat(payload);
    });
    return summaries;
  }

  function createChunkedFindingPermalink(anchorId, label) {
    var link = createCanonicalPermalinkAnchor(anchorId, {
      label: label,
      messageId: chunkedFindingLabels.findingPermalink.msgid,
      share: true
    });
    link.className = 'scribe-finding-heading-permalink';
    return link;
  }

  function createChunkedFindingActions(summary) {
    var actions = document.createElement('div');
    actions.className = 'finding-action-icons scribe-finding-action-icons';
    var shareLabel = localizedText(chunkedFindingLabels.shareFinding.msgid, chunkedFindingLabels.shareFinding.defaultText);
    var share = createCanonicalPermalinkAnchor(summary.anchorId, {
      label: shareLabel,
      messageId: chunkedFindingLabels.shareFinding.msgid,
      share: true
    });
    share.className = 'finding-link-btn scribe-finding-permalink';
    share.setAttribute('aria-live', 'polite');
    actions.appendChild(share);
    if (summary.feedbackActionId) {
      var feedbackLabel = localizedText(
        chunkedFindingLabels.feedbackFinding.msgid,
        chunkedFindingLabels.feedbackFinding.defaultText
      );
      var feedback = document.createElement('button');
      feedback.className = 'finding-feedback-btn';
      feedback.type = 'button';
      feedback.setAttribute('data-feedback-action', summary.feedbackActionId);
      feedback.setAttribute('data-feedback-anchor', summary.anchorId);
      feedback.setAttribute('data-scribe-label-msgid', chunkedFindingLabels.feedbackFinding.msgid);
      feedback.setAttribute('title', feedbackLabel);
      feedback.setAttribute('aria-label', feedbackLabel);
      feedback.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 11l18-5v14L3 15v-4z\"/><path d=\"M3 11v4\"/><path d=\"M6 15v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3.5\"/></svg>";
      feedback.addEventListener('click', function (event) {
        emitFeedback(feedback, event);
      });
      actions.appendChild(feedback);
    }
    return actions;
  }

  function createChunkedSourceSnippetPlaceholder(snippetId) {
    var placeholder = document.createElement('div');
    placeholder.className = 'source-snippet scribe-source-snippet-placeholder';
    placeholder.setAttribute('data-scribe-deferred-source-snippet', snippetId);
    var snippet = sourceSnippetById(snippetId);
    if (snippet) {
      placeholder.setAttribute('data-source-path', snippet.sourcePath);
      placeholder.setAttribute('data-source-line', String(snippet.startLine));
      placeholder.setAttribute('data-start-line', String(snippet.startLine));
      placeholder.setAttribute('data-end-line', String(snippet.endLine));
    }
    placeholder.setAttribute(
      'data-scribe-source-permalink-label',
      localizedText(chunkedFindingLabels.sourcePermalink.msgid, chunkedFindingLabels.sourcePermalink.defaultText)
    );
    placeholder.setAttribute(
      'data-scribe-source-collapse-label',
      localizedText(chunkedFindingLabels.collapseSourceSnippet.msgid, chunkedFindingLabels.collapseSourceSnippet.defaultText)
    );
    placeholder.setAttribute(
      'data-scribe-source-expand-label',
      localizedText(chunkedFindingLabels.expandSourceSnippet.msgid, chunkedFindingLabels.expandSourceSnippet.defaultText)
    );
    placeholder.setAttribute(
      'data-scribe-source-fullscreen-label',
      localizedText(chunkedFindingLabels.fullScreenSourceSnippet.msgid, chunkedFindingLabels.fullScreenSourceSnippet.defaultText)
    );
    placeholder.setAttribute(
      'data-scribe-source-close-fullscreen-label',
      localizedText(chunkedFindingLabels.closeFullScreenSourceSnippet.msgid, chunkedFindingLabels.closeFullScreenSourceSnippet.defaultText)
    );
    placeholder.setAttribute(
      'data-scribe-source-code-label',
      snippet && snippet.label
        ? localizableRuntimeText(snippet.label)
        : localizedText(chunkedFindingLabels.sourceSnippetTitle.msgid, chunkedFindingLabels.sourceSnippetTitle.defaultText)
    );
    return placeholder;
  }

  var contentSliceRequests = new Map();
  var planDisclosureState = new Map();
  var findingDisclosureState = new Map();
  var sourceDisclosureState = new Map();
  var explanationDisclosureState = new Map();
  var planPrintActive = false;
  var planPrintCallbacks = null;
  var planPrintReady = false;
  var planPrintGeneration = 0;
  window.__SCRIBE_ACCEPT_CONTENT_SLICE__ = function (key, html) {
    var request = contentSliceRequests.get(key);
    if (request && typeof html === 'string') request.html = html;
  };
  function loadReportContentSlice(key, path) {
    var sourceKey = key.split(':')[0];
    if (contentSliceRequests.has(sourceKey)) return contentSliceRequests.get(sourceKey).promise;
    var request = {};
    request.promise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = reportAssetPrefix() + path;
      script.onload = function () {
        script.remove();
        contentSliceRequests.delete(sourceKey);
        if (typeof request.html === 'string') resolve(request.html);
        else reject(new Error('content-slice-missing'));
      };
      script.onerror = function () {
        script.remove();
        contentSliceRequests.delete(sourceKey);
        reject(new Error('content-slice-unavailable'));
      };
      contentSliceRequests.set(sourceKey, request);
      document.head.appendChild(script);
    });
    return request.promise;
  }
  var reportContentCache = createReportContentCache(4 * 1024 * 1024, loadReportContentSlice);
  window.__SCRIBE_CONTENT_CACHE__ = reportContentCache;

  function refreshOpenPlanLocales() {
    document.querySelectorAll('[data-scribe-plan-slice]').forEach(function (details) {
      if (details.open && details.getAttribute('data-scribe-plan-request-locale') !== currentLocale()) {
        details.dispatchEvent(new Event('scribe-plan-load'));
      }
    });
  }

  function bindInlinePlanDisclosures() {
    document.querySelectorAll('[data-scribe-inline-plan]').forEach(function (placeholder) {
      var anchorId = placeholder.getAttribute('data-scribe-inline-plan');
      var descriptor = (window.__SCRIBE_PLAN_SLICES__ || {})[anchorId];
      var link = placeholder.querySelector('[data-scribe-complete-plan]');
      if (!descriptor || !link) return;
      var replacement = createChunkedPlanDisclosure(
        { anchorId: anchorId, fixPlanHref: link.getAttribute('href'), summaryNode: placeholder.querySelector('summary') },
        descriptor,
      );
      replacement.open = placeholder.open;
      placeholder.replaceWith(replacement);
    });
    if (document.documentElement.getAttribute('data-scribe-disclosure-anchor-bound') !== 'true') {
      document.documentElement.setAttribute('data-scribe-disclosure-anchor-bound', 'true');
      document.addEventListener('click', function (event) {
        if (event.defaultPrevented || !(event.target instanceof Element)) return;
        var summary = event.target.closest('summary');
        var details = summary && summary.parentElement;
        if (!(details instanceof HTMLDetailsElement) || details.open || !details.id) return;
        if (event.target.closest('a, button, input, select, textarea')) return;
        history.replaceState(null, '', '#' + details.id);
      });
    }
  }

  function createChunkedPlanDisclosure(summary, descriptor) {
    var details = document.createElement('details');
    details.className = 'scribe-finding-fix-plan';
    details.id = 'fix-plan-' + summary.anchorId;
    details.setAttribute('data-scribe-plan-slice', descriptor.key);
    details.open = planDisclosureState.get(summary.anchorId) === true;
    var heading = summary.summaryNode ? summary.summaryNode.cloneNode(true) : document.createElement('summary');
    if (!summary.summaryNode) {
      var title = document.createElement('span');
      title.className = 'scribe-finding-fix-plan__label';
      title.setAttribute('data-scribe-msgid', 'scribe.report.fixPlan.pageTitle');
      title.textContent = localizedText('scribe.report.fixPlan.pageTitle', 'Fix plan');
      heading.appendChild(title);
      if (summary.recommendation) {
        var guidance = document.createElement('span');
        guidance.id = 'remediation-' + summary.anchorId;
        guidance.className = 'scribe-finding-fix-plan__guidance';
        guidance.setAttribute('data-scribe-anchor', guidance.id);
        guidance.textContent = localizableRuntimeText(summary.recommendation);
        addLocalizableTextAttributes(guidance, summary.recommendation);
        heading.appendChild(guidance);
      }
    }
    details.appendChild(heading);
    var content = document.createElement('div');
    content.setAttribute('data-scribe-plan-content', '');
    details.appendChild(content);
    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    details.appendChild(status);
    var complete = document.createElement('a');
    complete.href = summary.fixPlanHref;
    complete.setAttribute('data-scribe-msgid', 'scribe.report.action.completeFixPlan');
    complete.textContent = localizedText('scribe.report.action.completeFixPlan', 'Complete fix plan');
    details.appendChild(complete);
    var generation = 0;
    var unsubscribe = null;
    function loadPlan() {
      var locale = currentLocale();
      var finding = details.closest('details[data-scribe-result]');
      if (planPrintActive || !details.open || (finding && !finding.open) || details.getAttribute('data-scribe-plan-locale') === locale) return;
      var requested = ++generation;
      details.setAttribute('data-scribe-plan-request-locale', locale);
      if (unsubscribe) unsubscribe();
      content.replaceChildren();
      status.textContent = localizedText('scribe.report.control.loadingPlan', 'Loading fix plan…');
      var key = descriptor.key + ':' + locale;
      reportContentCache.get(key, descriptor.path, descriptor.bytes).then(function (html) {
        if (requested !== generation || !details.open || !details.isConnected || currentLocale() !== locale) return;
        content.innerHTML = html;
        details.setAttribute('data-scribe-plan-locale', locale);
        status.textContent = html ? '' : localizedText('scribe.report.control.emptyPlan', 'No structured plan content is available.');
        unsubscribe = reportContentCache.observe(key, function () {
          content.replaceChildren();
          details.removeAttribute('data-scribe-plan-locale');
          status.textContent = localizedText('scribe.report.control.evictedPlan', 'Plan content was released. Reopen the plan to load it again.');
        }, function () { return details.isConnected; });
        updateText(locale, false);
      }).catch(function () {
        if (requested !== generation || !details.open || !details.isConnected || currentLocale() !== locale) return;
        status.textContent = localizedText('scribe.report.control.unavailablePlan', 'The plan could not be loaded. Open the complete plan or retry.');
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.textContent = localizedText('scribe.report.control.retryPlan', 'Retry loading plan');
        retry.addEventListener('click', loadPlan);
        status.appendChild(retry);
      });
    }
    details.addEventListener('toggle', function () {
      if (!planPrintActive) planDisclosureState.set(summary.anchorId, details.open);
      if (details.open) loadPlan();
      else generation += 1;
    });
    details.addEventListener('scribe-plan-load', loadPlan);
    return details;
  }

  function metricResultSeverity(result) {
    var threshold = result.thresholds;
    if (threshold.direction === 'asc') {
      if (result.value <= threshold.good) return 'good';
      if (result.value <= threshold.moderate) return 'moderate';
      if (result.value <= threshold.warning) return 'warning';
      return 'critical';
    }
    if (result.value >= threshold.good) return 'good';
    if (result.value >= threshold.moderate) return 'moderate';
    if (result.value >= threshold.warning) return 'warning';
    return 'critical';
  }

  function metricResultBands(result) {
    var threshold = result.thresholds;
    var scaleMaximum = metricResultScaleMaximum(result);
    function band(severity, range, start, end) {
      return {
        severity: severity,
        range: range,
        widthPercent: Math.max(0, Math.min(100, ((end - start) / scaleMaximum) * 100)),
      };
    }
    var bands = threshold.direction === 'asc'
      ? [
          band('good', '≤ ' + threshold.good, 0, threshold.good),
          band('moderate', '> ' + threshold.good + '–' + threshold.moderate, threshold.good, threshold.moderate),
          band('warning', '> ' + threshold.moderate + '–' + threshold.warning, threshold.moderate, threshold.warning),
          band('critical', '> ' + threshold.warning, threshold.warning, scaleMaximum),
        ]
      : [
          band('good', '≥ ' + threshold.good, threshold.good, scaleMaximum),
          band('moderate', threshold.moderate + '–< ' + threshold.good, threshold.moderate, threshold.good),
          band('warning', threshold.warning + '–< ' + threshold.moderate, threshold.warning, threshold.moderate),
          band('critical', '< ' + threshold.warning, 0, threshold.warning),
        ];
    return threshold.direction === 'asc' ? bands : bands.reverse();
  }

  function metricResultScaleMaximum(result) {
    var threshold = result.thresholds;
    return Number((Math.max(result.value, threshold.good, threshold.moderate, threshold.warning, 1) * 1.1).toPrecision(12));
  }

  function metricSeverityLabel(severity) {
    var label = severity === 'warning' ? chunkedFindingLabels.high : chunkedFindingLabels[severity];
    return localizedText(label.msgid, label.defaultText);
  }

  function appendLocalizedMetricText(parent, label) {
    var span = document.createElement('span');
    span.textContent = localizedText(label.msgid, label.defaultText);
    span.setAttribute('data-scribe-msgid', label.msgid);
    parent.appendChild(span);
  }

  function populateMetricAccessibleSummary(parent, result, severity, bands) {
    parent.appendChild(document.createTextNode(result.label + ': '));
    appendLocalizedMetricText(parent, chunkedFindingLabels.measured);
    parent.appendChild(document.createTextNode(' ' + result.value + '; '));
    appendLocalizedMetricText(parent, severity === 'warning' ? chunkedFindingLabels.high : chunkedFindingLabels[severity]);
    parent.appendChild(document.createTextNode('. '));
    appendLocalizedMetricText(parent, chunkedFindingLabels.referenceRanges);
    parent.appendChild(document.createTextNode(': '));
    bands.forEach(function (band, index) {
      if (index > 0) parent.appendChild(document.createTextNode(', '));
      appendLocalizedMetricText(parent, band.severity === 'warning' ? chunkedFindingLabels.high : chunkedFindingLabels[band.severity]);
      parent.appendChild(document.createTextNode(' ' + band.range));
    });
    parent.appendChild(document.createTextNode('. '));
    appendLocalizedMetricText(parent, chunkedFindingLabels.displayedScale);
    parent.appendChild(document.createTextNode(': 0 to ' + metricResultScaleMaximum(result) + '.'));
  }

  function createMetricResultsPanel(findingAnchorId, results, contextLinks) {
    if (!results || results.length === 0) return null;
    var linksByLabel = {};
    (contextLinks || []).forEach(function (link) { linksByLabel[link.label] = link.href; });
    var panel = document.createElement('details');
    panel.id = 'metrics-' + findingAnchorId;
    panel.className = 'sonde-metric-results';
    panel.setAttribute('data-scribe-anchor', panel.id);
    panel.open = true;
    var heading = document.createElement('summary');
    heading.textContent = localizedText(chunkedFindingLabels.measuredResults.msgid, chunkedFindingLabels.measuredResults.defaultText);
    heading.setAttribute('data-scribe-msgid', chunkedFindingLabels.measuredResults.msgid);
    panel.appendChild(heading);
    var panelBody = document.createElement('div');
    panelBody.className = 'sonde-metric-results__body';
    var explanation = document.createElement('p');
    explanation.className = 'sonde-metric-results__explanation';
    explanation.textContent = localizedText(chunkedFindingLabels.measuredResultsExplanation.msgid, chunkedFindingLabels.measuredResultsExplanation.defaultText);
    explanation.setAttribute('data-scribe-msgid', chunkedFindingLabels.measuredResultsExplanation.msgid);
    panelBody.appendChild(explanation);
    results.forEach(function (result) {
      var severity = metricResultSeverity(result);
      var bands = metricResultBands(result);
      var row = document.createElement('div');
      row.className = 'sonde-metric-result';
      row.setAttribute('data-metric', result.metric);
      var identity = document.createElement('div');
      identity.className = 'sonde-metric-result__identity';
      var label = document.createElement(linksByLabel[result.label] ? 'a' : 'strong');
      label.textContent = result.label;
      if (linksByLabel[result.label]) label.href = linksByLabel[result.label];
      identity.appendChild(label);
      var direction = document.createElement('span');
      direction.className = 'sonde-metric-result__direction';
      var directionLabel = result.thresholds.direction === 'asc' ? chunkedFindingLabels.lowerIsBetter : chunkedFindingLabels.higherIsBetter;
      direction.textContent = localizedText(directionLabel.msgid, directionLabel.defaultText);
      direction.setAttribute('data-scribe-msgid', directionLabel.msgid);
      identity.appendChild(direction);
      var accessible = document.createElement('span');
      accessible.className = 'sonde-visually-hidden';
      populateMetricAccessibleSummary(accessible, result, severity, bands);
      identity.appendChild(accessible);
      row.appendChild(identity);
      var scale = document.createElement('div');
      scale.className = 'sonde-metric-result__scale sonde-metric-result__scale--' + result.thresholds.direction;
      scale.setAttribute('aria-hidden', 'true');
      bands.forEach(function (band) {
        var segment = document.createElement('span');
        segment.className = 'sonde-metric-result__band sonde-metric-result__band--' + band.severity;
        segment.style.setProperty('--sonde-metric-band-width', String(band.widthPercent) + '%');
        var bandLabel = document.createElement('strong');
        bandLabel.textContent = metricSeverityLabel(band.severity);
        var bandText = band.severity === 'warning' ? chunkedFindingLabels.high : chunkedFindingLabels[band.severity];
        bandLabel.setAttribute('data-scribe-msgid', bandText.msgid);
        segment.appendChild(bandLabel);
        var bandRange = document.createElement('span');
        bandRange.textContent = band.range;
        segment.appendChild(bandRange);
        scale.appendChild(segment);
      });
      var marker = document.createElement('span');
      marker.className = 'sonde-metric-result__marker';
      marker.style.setProperty('--sonde-metric-marker', String(Math.max(0, Math.min(100, (result.value / metricResultScaleMaximum(result)) * 100))) + '%');
      marker.setAttribute('aria-hidden', 'true');
      var markerValue = document.createElement('span');
      markerValue.textContent = String(result.value);
      marker.appendChild(markerValue);
      scale.appendChild(marker);
      row.appendChild(scale);
      panelBody.appendChild(row);
    });
    panel.appendChild(panelBody);
    return panel;
  }

  function createChunkedFindingCard(summary) {
    var details = document.createElement('details');
    details.open = findingDisclosureState.get(summary.anchorId) === true;
    details.addEventListener('toggle', function () { if (!planPrintActive) findingDisclosureState.set(summary.anchorId, details.open); });
    details.id = summary.anchorId;
    details.className = 'finding-item scribe-finding-details severity-' + summary.severity;
    details.setAttribute('data-scribe-anchor', summary.anchorId);
    details.setAttribute('data-scribe-result', '');
    details.setAttribute('data-severity', summary.severity || '');
    details.setAttribute('data-language', summary.language || '');
    details.setAttribute('data-classification', summary.classification || '');
    var autofix = chunkedAutofixAnchorIds()[summary.anchorId];
    details.setAttribute('data-scribe-has-autofix', typeof autofix === 'boolean' ? String(autofix) : 'unknown');
    details.setAttribute('data-scribe-chunked-finding', 'true');

    var summaryElement = document.createElement('summary');
    summaryElement.className = 'scribe-finding-summary';
    summaryElement.addEventListener('keydown', function (event) {
      if (event.target !== summaryElement || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      details.open = !details.open;
    });
    var toggle = document.createElement('span');
    toggle.className = 'scribe-finding-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg>";
    summaryElement.appendChild(toggle);

    var row = document.createElement('div');
    row.className = 'scribe-finding-title-row';
    var main = document.createElement('div');
    main.className = 'scribe-finding-title-main';
    var line = document.createElement('div');
    line.className = 'scribe-finding-title-line';
    var badge = document.createElement('span');
    badge.className = 'scribe-finding-severity-badge';
    badge.setAttribute('data-scribe-severity-badge', summary.severity || '');
    badge.textContent = facetRuntimeLabel('severity', summary.severity || '');
    var title = document.createElement('h2');
    title.textContent = localizableRuntimeText(summary.title);
    addLocalizableTextAttributes(title, summary.title);
    line.appendChild(badge);
    // The overview's answer to "which of these are already fixed?" without opening any of them.
    // Same msgid the section heading uses, so the badge and the section cannot disagree.
    if (chunkedFindingHasAutofix(summary.anchorId)) {
      var autofixBadge = document.createElement('span');
      autofixBadge.className = 'scribe-finding-severity-badge scribe-finding-autofix-badge';
      autofixBadge.setAttribute('data-scribe-autofix-badge', '');
      autofixBadge.textContent = localizedText(
        chunkedFindingLabels.autofixTitle.msgid,
        chunkedFindingLabels.autofixTitle.defaultText
      );
      autofixBadge.setAttribute('data-scribe-msgid', chunkedFindingLabels.autofixTitle.msgid);
      autofixBadge.setAttribute('data-scribe-default-text', chunkedFindingLabels.autofixTitle.defaultText);
      line.appendChild(autofixBadge);
    }
    line.appendChild(title);
    main.appendChild(line);
    row.appendChild(main);
    summaryElement.appendChild(row);
    details.appendChild(summaryElement);
    details.appendChild(createChunkedFindingActions(summary));

    var body = document.createElement('div');
    body.className = 'scribe-finding-body';
    var paragraph = document.createElement('p');
    paragraph.textContent = localizableRuntimeText(summary.summary);
    addLocalizableTextAttributes(paragraph, summary.summary);
    body.appendChild(paragraph);
    var metricResults = createMetricResultsPanel(summary.anchorId, summary.metricResults, summary.contextLinks);
    if (metricResults) body.appendChild(metricResults);

    if ((!summary.metricResults || summary.metricResults.length === 0) && summary.contextLinks && summary.contextLinks.length) {
      var contextLinks = document.createElement('p');
      contextLinks.className = 'scribe-finding-context-links';
      summary.contextLinks.forEach(function (contextLink, index) {
        if (index > 0) contextLinks.appendChild(document.createTextNode(' · '));
        var contextAnchor = document.createElement('a');
        contextAnchor.className = 'scribe-report-link-action';
        contextAnchor.href = contextLink.href;
        contextAnchor.textContent = contextLink.label;
        contextLinks.appendChild(contextAnchor);
      });
      body.appendChild(contextLinks);
    }

    var planDescriptor = (window.__SCRIBE_PLAN_SLICES__ || {})[summary.anchorId];
    if (summary.recommendation && !planDescriptor) {
      var recommendation = document.createElement('p');
      recommendation.id = 'remediation-' + summary.anchorId;
      recommendation.className = 'finding-fix';
      recommendation.setAttribute('data-scribe-anchor', recommendation.id);
      if (!planDescriptor) {
        var guidance = document.createElement('strong');
        guidance.setAttribute('data-scribe-msgid', 'scribe.report.control.guidance');
        guidance.textContent = localizedText('scribe.report.control.guidance', 'Guidance');
        recommendation.appendChild(guidance);
        recommendation.appendChild(document.createTextNode(': '));
      }
      var action = document.createElement('span');
      action.textContent = localizableRuntimeText(summary.recommendation);
      addLocalizableTextAttributes(action, summary.recommendation);
      recommendation.appendChild(action);
      body.appendChild(recommendation);
    }

    if (summary.fixPlanHref && planDescriptor) {
      body.appendChild(createChunkedPlanDisclosure(summary, planDescriptor));
    } else if (summary.fixPlanHref) {
      var linkStack = document.createElement('div');
      linkStack.className = 'scribe-report-link-stack';
      var fixPlanLink = document.createElement('a');
      fixPlanLink.className = 'scribe-report-link-action';
      fixPlanLink.href = summary.fixPlanHref;
      fixPlanLink.setAttribute('data-scribe-fixplan-entry-link', summary.anchorId);
      fixPlanLink.setAttribute('data-scribe-msgid', chunkedFindingLabels.openFixPlan.msgid);
      fixPlanLink.textContent = localizedText(
        chunkedFindingLabels.openFixPlan.msgid,
        chunkedFindingLabels.openFixPlan.defaultText
      );
      linkStack.appendChild(fixPlanLink);
      body.appendChild(linkStack);
    }

    if (summary.sourceSnippetIds && summary.sourceSnippetIds.length > 0) {
      var preview = chunkedFindingHasAutofix(summary.anchorId);
      var source = document.createElement('details');
      source.className = 'source-evidence';
      // Use the canonical source-snippet anchor id — this is exactly what the TOC source-evidence link targets.
      // Re-deriving it from summary.anchorId re-introduces the finding- prefix, so the link points at a
      // nonexistent id and navigation silently does nothing.
      source.id = summary.sourceSnippetIds[0];
      source.setAttribute('data-scribe-anchor', source.id);
      source.setAttribute('data-scribe-source-disclosure', '');
      source.open = sourceDisclosureState.get(source.id) === true;
      var sourceHeading = document.createElement('summary');
      source.appendChild(sourceHeading);
      var sourceTitle = document.createElement('h3');
      sourceTitle.setAttribute('data-scribe-deferred-source-evidence-title', summary.sourceSnippetIds[0]);
      sourceHeading.appendChild(sourceTitle);
      // Appended first so applySourceEvidenceTitle can reach the .source-evidence section and
      // stamp data-scribe-source-evidence on it.
      if (applySourceEvidenceTitle(sourceTitle, summary.sourceSnippetIds[0])) {
        sourceTitle.removeAttribute('data-scribe-deferred-source-evidence-title');
      }
      if (preview && summary.recommendation) {
        var sourceGuidance = document.createElement('span');
        sourceGuidance.className = 'scribe-finding-fix-plan__guidance';
        sourceGuidance.textContent = localizableRuntimeText(summary.recommendation);
        addLocalizableTextAttributes(sourceGuidance, summary.recommendation);
        sourceHeading.appendChild(sourceGuidance);
      }
      source.appendChild(createChunkedSourceSnippetPlaceholder(summary.sourceSnippetIds[0]));
      body.appendChild(source);
    }

    details.appendChild(body);
    details.addEventListener('toggle', function () {
      if (details.open && details.isConnected) hydrateDeferredSourceSnippets(details);
    });
    return details;
  }

  function enrichChunkedSourceSnippetPlaceholders() {
    if (!sourceSnippetDataReady()) return;
    // Titles land in the same sweep as the placeholder attributes, from the same records, so a
    // heading and the body beneath it can never come from different loads.
    enrichSourceEvidenceTitles(document);
    document
      .querySelectorAll('[data-scribe-deferred-source-snippet]:not([data-source-path])')
      .forEach(function (placeholder) {
        var snippet = sourceSnippetById(placeholder.getAttribute('data-scribe-deferred-source-snippet') || '');
        if (!snippet) return;
        placeholder.setAttribute('data-source-path', snippet.sourcePath);
        placeholder.setAttribute('data-source-line', String(snippet.startLine));
        placeholder.setAttribute('data-start-line', String(snippet.startLine));
        placeholder.setAttribute('data-end-line', String(snippet.endLine));
        var source = placeholder.closest ? placeholder.closest('.source-evidence') : null;
        if (source && snippet.anchorId) {
          source.id = snippet.anchorId;
          source.setAttribute('data-scribe-anchor', snippet.anchorId);
        }
      });
    reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  }

  function clearRenderedFindingChunks() {
    var container = chunkedFindingContainer();
    if (container) container.replaceChildren();
    replaceChunkedFindingToc([], null, false);
    replaceChunkedFindingToc([], null, true);
    findingChunkRendered = {};
    reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  }

  function renderFindingChunk(chunkIndex, visibleAnchorIds) {
    if (findingChunkRendered[chunkIndex]) return;
    var payload = findingChunkPayload(chunkIndex);
    var container = chunkedFindingContainer();
    if (!Array.isArray(payload) || !container) return;
    payload.forEach(function (summary) {
      if (visibleAnchorIds && !visibleAnchorIds[summary.anchorId]) return;
      if (!summary || !summary.anchorId || byId(summary.anchorId)) return;
      container.appendChild(createChunkedFindingCard(summary));
    });
    findingChunkRendered[chunkIndex] = true;
    reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
    setChunkedFindingStatus('', true);
    attachFindingPermalinks();
    attachDeferredSourceSnippetHydration();
    attachSourceSnippetActions(container);
    attachDisplayArtifactActions(container);
    if (sourceSnippetDataReady()) {
      enrichChunkedSourceSnippetPlaceholders();
    } else {
      ensureSourceSnippetData(enrichChunkedSourceSnippetPlaceholders);
    }
  }

  function ensureFindingChunkPayload(chunkIndex, callback) {
    ensureFindingChunkIndex(function () {
      if (!findingChunkIndexReady()) {
        callback();
        return;
      }
      if (findingChunkPayload(chunkIndex)) {
        callback();
        return;
      }
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      var metadata = index.chunks[chunkIndex];
      if (!metadata || !metadata.path) {
        callback();
        return;
      }
      findingChunkCallbacks[chunkIndex] = findingChunkCallbacks[chunkIndex] || [];
      findingChunkCallbacks[chunkIndex].push(callback);
      if (findingChunkLoading[chunkIndex]) return;
      findingChunkLoading[chunkIndex] = true;
      var script = document.createElement('script');
      script.src = reportAssetPrefix() + metadata.path;
      script.defer = true;
      script.onload = function () {
        flushFindingChunkCallbacks(chunkIndex);
      };
      script.onerror = function () {
        flushFindingChunkCallbacks(chunkIndex);
      };
      document.head.appendChild(script);
    });
  }

  function renderFindingChunkWindow(chunkIndex, visibleAnchorIds, callback) {
    ensureFindingChunkPayload(chunkIndex, function () {
      clearRenderedFindingChunks();
      renderFindingChunk(chunkIndex, visibleAnchorIds);
      replaceChunkedFindingToc(chunkedFindingSummaries([chunkIndex]), visibleAnchorIds, false);
      callback();
    });
  }

  function ensureFindingChunkForAnchor(anchorId, callback) {
    var requestedFrom = location.href;
    ensureFindingChunkIndex(function () {
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      var chunkIndex = index && index.anchorToChunk ? index.anchorToChunk[anchorId] : undefined;
      if (chunkIndex === undefined || chunkIndex === null) {
        callback(false);
        return;
      }
      ensureFindingChunkPayload(chunkIndex, function () {
        if (location.href !== requestedFrom && fragmentIdFromHref(location.hash) !== anchorId) {
          callback(false);
          return;
        }
        if (byId(anchorId)) { callback(true); return; }
        var payload = findingChunkPayload(chunkIndex);
        var container = chunkedFindingContainer();
        if (!Array.isArray(payload) || !container) { callback(false); return; }
        for (var index = 0; index < payload.length; index += 1) {
          var summary = payload[index];
          var card = createChunkedFindingCard(summary);
          if (card.id !== anchorId && !card.querySelector('[id="' + cssEscape(anchorId) + '"]')) continue;
          // Keep the current page resident. Only this named finding is revealed outside its results.
          card.hidden = true;
          container.appendChild(card);
          attachFindingPermalinks();
          attachDeferredSourceSnippetHydration();
          attachSourceSnippetActions(card);
          attachDisplayArtifactActions(card);
          callback(true);
          return;
        }
        callback(false);
      });
    });
  }

  function materializeFindingChunks(chunkIndexes, callback) {
    if (!chunkIndexes.length) {
      clearRenderedFindingChunks();
      callback();
      return;
    }
    var remaining = chunkIndexes.length;
    chunkIndexes.forEach(function (chunkIndex) {
      ensureFindingChunkPayload(chunkIndex, function () {
        remaining -= 1;
        if (remaining === 0) {
          clearRenderedFindingChunks();
          chunkIndexes.forEach(function (loadedChunkIndex) {
            renderFindingChunk(loadedChunkIndex, null);
          });
          replaceChunkedFindingToc(chunkedFindingSummaries(chunkIndexes), null, true);
          callback();
        }
      });
    });
  }

  function materializeInitialFindingChunk(callback) {
    ensureFindingChunkIndex(function () {
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      if (!index || !index.chunks || index.chunks.length === 0) {
        callback();
        return;
      }
      renderFindingChunkWindow(0, null, callback);
    });
  }

  function materializeAllFindingChunks(callback) {
    ensureFindingChunkIndex(function () {
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      if (!index || !index.chunks) {
        callback();
        return;
      }
      materializeFindingChunks(
        index.chunks.map(function (chunk) {
          return chunk.chunkIndex;
        }),
        callback
      );
    });
  }

  function reportUsesChunkedFindings() {
    return Boolean(findingChunkDelivery());
  }

  // The autofix label's locale texts live ONCE on the index rather than in every autofix entry's
  // searchText, where they repeated 354 identical characters across 80 of 101 cal.com entries.
  // A query matching any of them is a query for autofix findings, which the entry already answers
  // with its own hasAutofix boolean — same behavior, ~28 KB less on an eagerly loaded index.
  function chunkedQueryMatchesAutofixTerm(query) {
    if (!query) return false;
    var index = window.__SCRIBE_FINDINGS_INDEX__;
    var terms = (index && index.autofixSearchTerms) || [];
    for (var i = 0; i < terms.length; i++) {
      if (String(terms[i]).toLowerCase().indexOf(query) !== -1) return true;
    }
    return false;
  }

  function chunkedFindingEntryMatchesFilters(entry, filters) {
    if (!autofixSelectionMatches(entry.hasAutofix, filters.autofix)) return false;
    if (!matchesFilter(entry.severity || '', filters.severity)) return false;
    if (!matchesFilter(entry.language || '', filters.language)) return false;
    if (!matchesFilter(entry.classification || '', filters.classification)) return false;
    if (filters.query.length === 0) return true;
    if (String(entry.searchText || '').indexOf(filters.query) !== -1) return true;
    return entry.hasAutofix === true && chunkedQueryMatchesAutofixTerm(filters.query);
  }

  function hideChunkedPageSizeControl() {
    var control = document.querySelector('.scribe-page-size-control');
    if (control) control.hidden = true;
  }

  function applyChunkedFindingFilters(callback) {
    ensureFindingChunkIndex(function () {
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      var entries = index && Array.isArray(index.filterEntries) ? index.filterEntries : [];
      var filters = readCurrentReportFilters();
      var matches = entries.filter(function (entry) {
        return chunkedFindingEntryMatchesFilters(entry, filters);
      });
      var chunkIndexes = [];
      var seenChunkIndexes = {};
      matches.forEach(function (entry) {
        if (seenChunkIndexes[entry.chunkIndex]) return;
        seenChunkIndexes[entry.chunkIndex] = true;
        chunkIndexes.push(entry.chunkIndex);
      });
      var hashAnchor = fragmentIdFromHref(window.location.hash);
      if (hashAnchor && hashAnchor !== findingChunkHashSelectionApplied) {
        var hashChunkIndex = index && index.anchorToChunk ? index.anchorToChunk[hashAnchor] : undefined;
        var hashPageIndex = chunkIndexes.indexOf(hashChunkIndex);
        if (hashPageIndex >= 0) reportCurrentPage = hashPageIndex + 1;
        findingChunkHashSelectionApplied = hashAnchor;
      }
      var pageCount = Math.max(1, chunkIndexes.length);
      if (reportCurrentPage > pageCount) reportCurrentPage = pageCount;
      if (reportCurrentPage < 1) reportCurrentPage = 1;
      var selectedChunkIndex = chunkIndexes[reportCurrentPage - 1];
      var selectedEntries = matches.filter(function (entry) {
        return entry.chunkIndex === selectedChunkIndex;
      });
      var visibleAnchorIds = {};
      selectedEntries.forEach(function (entry) {
        visibleAnchorIds[entry.anchorId] = true;
      });
      var precedingCount = matches.filter(function (entry) {
        return chunkIndexes.indexOf(entry.chunkIndex) < reportCurrentPage - 1;
      }).length;
      var finish = function () {
        updateAutofixQualification();
        updateAutofixPresentation();
        var count = byId('report-result-count');
        if (count) {
          count.textContent = visibleResultText(
            precedingCount,
            precedingCount + selectedEntries.length,
            matches.length,
            selectedEntries.length
          );
        }
        updateVisibleTocAnchors(visibleAnchorIds);
        updatePagination(matches.length, 1, pageCount);
        hydrateLocalizedNumbers();
        updateSeverityShortcutState(readFilter('filter-severity'));
        updateFilterClearControl();
        hideChunkedPageSizeControl();
        setChunkedFindingStatus('', true);
        ensureFindingTargetOpen();
        callback();
      };
      if (selectedChunkIndex === undefined) {
        clearRenderedFindingChunks();
        finish();
        return;
      }
      renderFindingChunkWindow(selectedChunkIndex, visibleAnchorIds, finish);
    });
  }

  function ensureFindingsForCurrentFilterPass(callback) {
    if (!reportUsesChunkedFindings()) {
      callback();
      return;
    }
    if (pdfPrintFrameActive || document.body.hasAttribute('data-scribe-printing')) {
      materializeAllFindingChunks(callback);
      return;
    }
    materializeInitialFindingChunk(callback);
  }

  function materializeCompleteReportForPrint(callback) {
    if (planPrintReady) { callback(); return; }
    if (planPrintCallbacks) { planPrintCallbacks.push(callback); return; }
    planPrintCallbacks = [callback];
    var generation = ++planPrintGeneration;
    var locale = currentLocale();
    var operation = activeReportOperation;
    function current() {
      return generation === planPrintGeneration && currentLocale() === locale && !reportOperationIsAborted(operation);
    }
    function ready() {
      if (generation !== planPrintGeneration) return;
      if (!current()) { restoreReportAfterPrint(); return; }
      planPrintReady = true;
      var callbacks = planPrintCallbacks || [];
      planPrintCallbacks = null;
      callbacks.forEach(function (next) { next(); });
    }
    function failed() {
      if (generation !== planPrintGeneration) return;
      restoreReportAfterPrint();
      if (pdfPrintFrameActive) parent.postMessage({ source: 'sonde-scribe-paged', type: 'content-error' }, '*');
      showPlanExportError();
    }
    if (!reportUsesChunkedFindings()) {
      ensureSourceSnippetData(function () {
        if (!current()) { restoreReportAfterPrint(); return; }
        hydrateDeferredSourceSnippets(document, true);
        materializePlanContentForPrint(ready, failed, current);
      });
      return;
    }
    materializeAllFindingChunks(function () {
      if (generation !== planPrintGeneration) return;
      if (!current()) { restoreReportAfterPrint(); return; }
      window.__SCRIBE_COMPLETE_EXPORT_FINDING_COUNT__ = document.querySelectorAll('[data-scribe-result]').length;
      ensureSourceSnippetData(function () {
        hydrateDeferredSourceSnippets(document, true);
        materializePlanContentForPrint(ready, failed, current);
      });
    });
  }

  function showPlanExportError() {
    if (activeReportOperation) cancelReportOperation('content-unavailable');
    var status = document.createElement('p');
    status.setAttribute('role', 'alert');
    status.textContent = localizedText('scribe.report.control.unavailablePlan', 'The plan could not be loaded. Open the complete plan or retry.');
    var main = byId('main-content');
    if (main) main.prepend(status);
  }

  function materializePlanContentForPrint(callback, failed, current) {
    planPrintActive = true;
    var filters = readCurrentReportFilters();
    var entries = window.__SCRIBE_FINDINGS_INDEX__ && window.__SCRIBE_FINDINGS_INDEX__.filterEntries;
    var allowed = entries ? new Set(entries.filter(function (entry) { return chunkedFindingEntryMatchesFilters(entry, filters); }).map(function (entry) { return entry.anchorId; })) : null;
    var groups = new Map();
    var chain = Promise.resolve();
    document.querySelectorAll('[data-scribe-plan-slice]').forEach(function (details) {
      var finding = details.closest('[data-scribe-result]');
      if (!finding || (allowed ? !allowed.has(finding.id) : !resultMatchesFilters(finding, filters))) return;
      var descriptor = (window.__SCRIBE_PLAN_SLICES__ || {})[finding.id];
      if (!descriptor || details.querySelector('[data-scribe-print-plan]')) return;
      chain = chain.then(function () {
        if (!current()) return;
        // Export materialization is an output buffer, separate from the bounded
        // interactive cache. Serial reads release each source string after append.
        var resident = reportContentCache.peek(descriptor.key + ':' + currentLocale());
        var loaded = resident === undefined ? loadReportContentSlice(descriptor.key, descriptor.path) : Promise.resolve(resident);
        return loaded.then(function (html) {
          if (!current() || !details.isConnected) return;
          if (new TextEncoder().encode(html).byteLength !== descriptor.bytes) throw new Error('content-slice-size-mismatch');
          var output = document.createElement('div');
          output.setAttribute('data-scribe-print-plan', '');
          output.innerHTML = html;
          output.querySelectorAll('[data-scribe-fixplan-group]').forEach(function (group) {
            var identity = group.outerHTML;
            var previous = groups.get(identity);
            if (previous) {
              var link = document.createElement('a');
              link.href = '#' + previous;
              var heading = group.querySelector('.scribe-fixplan-group-title');
              link.textContent = heading ? heading.textContent : group.getAttribute('data-scribe-fixplan-group');
              group.replaceChildren(link);
              group.removeAttribute('data-scribe-fixplan-group');
            } else {
              group.id = 'scribe-print-plan-group-' + groups.size;
              groups.set(identity, group.id);
            }
          });
          var content = details.querySelector('[data-scribe-plan-content]');
          if (content) content.hidden = true;
          details.appendChild(output);
        });
      });
    });
    chain.then(function () { if (current()) updateText(currentLocale(), false); callback(); }).catch(failed);
  }

  function appendSourceCodeLines(code, text, startLine, language) {
    // The source-highlight bundle exposes the in-house per-line tokenizer; when
    // present, each line is syntax-highlighted the same way the server-static path
    // renders it (the tokenizer HTML-escapes token text, so innerHTML is safe).
    // Without the bundle, fall back to plain text.
    var highlight = window.__sondeHighlightLine;
    String(text || '').split('\n').forEach(function (line, index, lines) {
      var span = document.createElement('span');
      span.className = 'sonde-syntax-line';
      span.setAttribute('data-line', String(startLine + index));
      if (highlight && line.length > 0) {
        span.innerHTML = highlight(line, language);
      } else {
        span.textContent = line.length > 0 ? line : ' ';
      }
      code.appendChild(span);
      if (index < lines.length - 1) code.appendChild(document.createTextNode('\n'));
    });
  }

  // The G9 VCS source-permalink icon link, shared by the source snippet and the before/after
  // diff — a fixable finding keeps the exact permalink the snippet it replaces would have shown,
  // because the diff's "before" side IS the flagged source. Null when the record carries none.
  function createSourcePermalinkAction(snippet, placeholder) {
    if (!snippet.vcsPermalink) return null;
    var link = document.createElement('a');
    link.className = 'finding-link-btn scribe-source-action scribe-source-action--icon';
    link.href = snippet.vcsPermalink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('data-scribe-source-permalink', '');
    var linkLabel = placeholder.getAttribute('data-scribe-source-permalink-label') || 'Open source';
    link.setAttribute('aria-label', linkLabel);
    link.setAttribute('title', linkLabel);
    link.innerHTML = externalLinkIconSvg;
    return link;
  }

  // The browser twin of sourceSnippetFlaggedCode. The record carries its flagged source inside
  // body, never at the top level: an earlier shape read snippet.code after the schema had moved
  // it, so String(undefined || '') rendered every plain-snippet finding as one blank line, and
  // the deliberate no-bundle autofix fallback rendered blank too. A source view that silently
  // shows nothing is the same class of defect as a title that lies about its body.
  function sourceSnippetFlaggedText(snippet) {
    var body = snippet.body;
    if (!body) return '';
    if (body.kind !== 'autofix') return body.code || '';
    // The rows' ORIGINAL side, in order: removed and unchanged are the lines that exist in the
    // source file; added are the fix's, and separators are chrome.
    var lines = [];
    for (var i = 0; i < body.diff.length; i++) {
      var row = body.diff[i];
      if (row.type === 'removed' || row.type === 'unchanged') lines.push(row.content);
    }
    return lines.join('\n');
  }

  // The record's body, rendered as whatever the record says it is. This is the pairing the
  // chunked path never had: it took the section TITLE from the autofix decision and the body
  // from a raw code string, so 80 findings read "Autofix" over the source they had not fixed.
  // One record now carries both halves, and this reads the discriminant rather than guessing.
  function createSourceEvidenceBody(snippet, placeholder) {
    if (snippet.body && snippet.body.kind === 'autofix') {
      var diff = createBeforeAfterDiffElement(snippet, placeholder);
      // A missing render bundle is the only way this returns nothing. Falling back to the
      // snippet figure would put the unfixed source back under the "Autofix" heading, which is
      // the defect verbatim, so the record's own before side is what renders instead.
      if (diff) return diff;
    }
    return createSourceSnippetFigure(snippet, placeholder);
  }

  function createBeforeAfterDiffElement(snippet, placeholder) {
    if (typeof window.__sondeRenderBeforeAfterDiff !== 'function') return null;
    var host = document.createElement('div');
    // The bundle escapes every value it interpolates, exactly as the server-static path does.
    host.innerHTML = window.__sondeRenderBeforeAfterDiff(snippet.body.diff, beforeAfterDiffLabels(), {
      language: snippet.language,
      permalinkActionHtml: '',
      fullScreenIconHtml: fullscreenIconSvg
    });
    var diff = host.firstElementChild;
    if (!diff) return null;
    diff.setAttribute('data-scribe-source-snippet', snippet.snippetId);
    // Built with DOM APIs and inserted, rather than passed as markup, so the href never has to
    // survive a round trip through a string the runtime assembled itself.
    var permalink = createSourcePermalinkAction(snippet, placeholder);
    var head = diff.querySelector('.scribe-fixplan-before-after-head');
    var label = diff.querySelector('[data-scribe-diff-label]');
    if (permalink && head) head.insertBefore(permalink, label ? label.nextSibling : head.firstChild);
    // scribeBehaviors' initial sweep ran at load, before this diff existed. Its controls ship
    // hidden and reveal only when wired, so an unwired diff would render with no split/unified
    // toggle and no fullscreen at all.
    if (typeof window.__sondeWireScribeDiff === 'function') window.__sondeWireScribeDiff(diff);
    return diff;
  }

  function createSourceSnippetFigure(snippet, placeholder) {
    var figure = document.createElement('figure');
    figure.className = 'source-snippet';
    figure.setAttribute('data-source-path', snippet.sourcePath);
    figure.setAttribute('data-source-line', String(snippet.startLine));
    figure.setAttribute('data-start-line', String(snippet.startLine));
    figure.setAttribute('data-end-line', String(snippet.endLine));
    figure.setAttribute('data-scribe-source-snippet', snippet.snippetId);
    figure.setAttribute(
      'data-scribe-source-collapse-label',
      placeholder.getAttribute('data-scribe-source-collapse-label') || 'Collapse snippet'
    );
    figure.setAttribute(
      'data-scribe-source-expand-label',
      placeholder.getAttribute('data-scribe-source-expand-label') || 'Expand snippet'
    );
    figure.setAttribute(
      'data-scribe-source-fullscreen-label',
      placeholder.getAttribute('data-scribe-source-fullscreen-label') || 'Full screen snippet'
    );
    figure.setAttribute(
      'data-scribe-source-close-fullscreen-label',
      placeholder.getAttribute('data-scribe-source-close-fullscreen-label') || 'Close full screen snippet'
    );
    figure.setAttribute(
      'data-scribe-source-code-label',
      placeholder.getAttribute('data-scribe-source-code-label') || 'Source code'
    );
    var caption = document.createElement('figcaption');
    var captionMain = document.createElement('span');
    captionMain.className = 'scribe-source-caption-main';
    var captionText = document.createElement('span');
    captionText.className = 'scribe-source-caption-text';
    captionText.appendChild(document.createTextNode(snippet.sourcePath + ' '));
    var range = document.createElement('span');
    range.setAttribute('data-line-range', '');
    range.textContent = 'L' + snippet.startLine + '-L' + snippet.endLine;
    captionText.appendChild(range);
    captionMain.appendChild(captionText);
    var actions = document.createElement('span');
    actions.className = 'scribe-source-actions';
    var permalink = createSourcePermalinkAction(snippet, placeholder);
    if (permalink) actions.appendChild(permalink);
    caption.appendChild(captionMain);
    var regionId = 'source-code-' + snippet.snippetId;
    var toggle = document.createElement('button');
    toggle.className = 'finding-link-btn scribe-source-action scribe-source-action--icon';
    toggle.type = 'button';
    toggle.setAttribute('data-scribe-source-toggle', '');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', regionId);
    var collapseLabel = figure.getAttribute('data-scribe-source-collapse-label') || 'Collapse snippet';
    var expandLabel = figure.getAttribute('data-scribe-source-expand-label') || 'Expand snippet';
    toggle.setAttribute('data-collapse-label', collapseLabel);
    toggle.setAttribute('data-expand-label', expandLabel);
    toggle.setAttribute('aria-label', collapseLabel);
    toggle.setAttribute('title', collapseLabel);
    toggle.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg>";
    actions.appendChild(toggle);
    caption.appendChild(actions);
    var region = document.createElement('div');
    region.id = regionId;
    region.className = 'scribe-source-code-region';
    region.setAttribute('data-scribe-source-code-region', '');
    var fullscreen = document.createElement('button');
    fullscreen.className = 'finding-link-btn scribe-source-action scribe-source-action--icon scribe-source-frame-action';
    fullscreen.type = 'button';
    fullscreen.setAttribute('data-scribe-source-fullscreen', '');
    fullscreen.setAttribute('aria-haspopup', 'dialog');
    fullscreen.setAttribute('aria-controls', regionId);
    var fullscreenLabel = figure.getAttribute('data-scribe-source-fullscreen-label') || 'Full screen snippet';
    fullscreen.setAttribute('aria-label', fullscreenLabel);
    fullscreen.setAttribute('title', fullscreenLabel);
    fullscreen.innerHTML = fullscreenIconSvg;
    region.appendChild(fullscreen);
    var pre = document.createElement('pre');
    pre.className = 'sl-code-block';
    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    var sourceCodeLabel = figure.getAttribute('data-scribe-source-code-label') || 'Source code';
    pre.setAttribute('aria-label', sourceCodeLabel + ': ' + snippet.sourcePath + ', L' + snippet.startLine + '-L' + snippet.endLine + ' (' + snippet.snippetId + ')');
    pre.setAttribute('data-language', snippet.language);
    pre.setAttribute('data-start-line', String(snippet.startLine));
    var code = document.createElement('code');
    appendSourceCodeLines(code, sourceSnippetFlaggedText(snippet), snippet.startLine, snippet.language);
    pre.appendChild(code);
    region.appendChild(pre);
    figure.appendChild(caption);
    figure.appendChild(region);
    return figure;
  }

  function hydrateDeferredSourceSnippets(root, force) {
    if (!root || !root.querySelectorAll) return;
    var placeholders = Array.from(root.querySelectorAll('[data-scribe-deferred-source-snippet]:not([data-scribe-source-hydrated])'));
    if (root.matches && root.matches('[data-scribe-deferred-source-snippet]:not([data-scribe-source-hydrated])')) {
      placeholders.unshift(root);
    }
    if (placeholders.length === 0) return;
    ensureSourceSnippetData(function () {
      placeholders.forEach(function (placeholder) {
        if (!placeholder.isConnected) return;
        var disclosure = placeholder.closest('[data-scribe-source-disclosure]');
        if (disclosure && !disclosure.open && !force) return;
        var snippetId = placeholder.getAttribute('data-scribe-deferred-source-snippet') || '';
        var snippet = sourceSnippetById(snippetId);
        if (!snippet || placeholder.getAttribute('data-scribe-source-hydrated') === 'true') return;
        placeholder.setAttribute('data-scribe-source-hydrated', 'true');
        if (placeholder.parentNode) {
          var figure = createSourceEvidenceBody(snippet, placeholder);
          placeholder.parentNode.replaceChild(figure, placeholder);
          attachSourceSnippetActions(figure);
        }
      });
    });
  }

  function attachDeferredSourceSnippetHydration() {
    document.querySelectorAll('[data-scribe-source-disclosure]:not([data-scribe-source-disclosure-bound])').forEach(function (disclosure) {
      disclosure.setAttribute('data-scribe-source-disclosure-bound', 'true');
      disclosure.addEventListener('toggle', function () {
        if (!planPrintActive) sourceDisclosureState.set(disclosure.id, disclosure.open);
        if (disclosure.open && disclosure.isConnected) hydrateDeferredSourceSnippets(disclosure);
      });
      if (disclosure.open) hydrateDeferredSourceSnippets(disclosure);
    });
    document
      .querySelectorAll('details.scribe-finding-details:not([data-scribe-deferred-source-bound])')
      .forEach(function (details) {
      details.setAttribute('data-scribe-deferred-source-bound', 'true');
      details.addEventListener('toggle', function () {
        if (details.open && details.isConnected) {
          hydrateDeferredSourceSnippets(details);
          details.querySelectorAll('[data-scribe-plan-slice][open]').forEach(function (plan) {
            plan.dispatchEvent(new Event('scribe-plan-load'));
          });
        }
      });
    });
  }

  function sourceSnippetFigureFromControl(control) {
    return control && control.closest ? control.closest('.source-snippet') : null;
  }

  function setSourceSnippetCollapsed(figure, collapsed) {
    var toggle = figure.querySelector('[data-scribe-source-toggle]');
    var region = figure.querySelector('[data-scribe-source-code-region]');
    var collapseLabel =
      figure.getAttribute('data-scribe-source-collapse-label') ||
      (toggle ? toggle.getAttribute('data-collapse-label') : '') ||
      'Collapse snippet';
    var expandLabel =
      figure.getAttribute('data-scribe-source-expand-label') ||
      (toggle ? toggle.getAttribute('data-expand-label') : '') ||
      'Expand snippet';
    figure.setAttribute('data-scribe-source-collapsed', String(collapsed));
    if (region) region.hidden = collapsed;
    if (toggle) {
      var label = collapsed ? expandLabel : collapseLabel;
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    }
  }

  
  function ensureScribeFullscreenDialog() {
    var existing = document.getElementById('scribe-source-fullscreen-dialog');
    if (existing) return existing;
    var dialog = document.createElement('dialog');
    dialog.id = 'scribe-source-fullscreen-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.className = 'scribe-source-dialog';
    dialog.innerHTML =
      '<form method="dialog" class="scribe-source-dialog__chrome">' +
      '<strong data-scribe-source-dialog-title></strong>' +
      '<button type="submit" class="scribe-source-action scribe-source-action--icon" data-scribe-source-dialog-close aria-label="Close" title="Close"></button>' +
      '</form>' +
      '<div class="scribe-source-dialog__body" data-scribe-source-dialog-body></div>';
    var closeButton = dialog.querySelector('[data-scribe-source-dialog-close]');
    if (closeButton) {
      var svgNamespace = 'http://www.w3.org/2000/svg';
      var closeIcon = document.createElementNS(svgNamespace, 'svg');
      closeIcon.setAttribute('width', '16');
      closeIcon.setAttribute('height', '16');
      closeIcon.setAttribute('viewBox', '0 0 24 24');
      closeIcon.setAttribute('fill', 'currentColor');
      closeIcon.setAttribute('aria-hidden', 'true');
      closeIcon.setAttribute('focusable', 'false');
      var closeIconPath = document.createElementNS(svgNamespace, 'path');
      closeIconPath.setAttribute('d', 'M21.29 4.12 16.7 8.71l1.59 1.59c.63.63.18 1.71-.71 1.71H13c-.55 0-1-.45-1-1v-4.6c0-.89 1.08-1.34 1.71-.71l1.59 1.59 4.59-4.59c.39-.39 1.02-.39 1.41 0 .38.4.38 1.03-.01 1.42M4.12 21.29l4.59-4.59 1.59 1.59c.63.63 1.71.18 1.71-.71V13c0-.55-.45-1-1-1h-4.6c-.89 0-1.34 1.08-.71 1.71l1.59 1.59-4.59 4.59c-.39.39-.39 1.02 0 1.41.4.38 1.03.38 1.42-.01');
      closeIcon.appendChild(closeIconPath);
      closeButton.appendChild(closeIcon);
    }
    document.body.appendChild(dialog);
    dialog.addEventListener('click', function (event) {
      var rect = dialog.getBoundingClientRect();
      var insideDialog =
        event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (event.target === dialog && !insideDialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      var body = dialog.querySelector('[data-scribe-source-dialog-body]');
      if (body) body.textContent = '';
    });
    return dialog;
  }
  function openScribeFullscreenDialog(titleText, closeLabel, contentNode) {
    var dialog = ensureScribeFullscreenDialog();
    if (!dialog.showModal) return;
    var title = dialog.querySelector('[data-scribe-source-dialog-title]');
    var body = dialog.querySelector('[data-scribe-source-dialog-body]');
    var close = dialog.querySelector('[data-scribe-source-dialog-close]');
    if (title) title.textContent = titleText;
    if (close) {
      close.setAttribute('aria-label', closeLabel);
      close.setAttribute('title', closeLabel);
    }
    if (body) {
      body.textContent = '';
      if (contentNode) body.appendChild(contentNode);
    }
    dialog.setAttribute('aria-label', titleText);
    dialog.showModal();
  }


  function openSourceSnippetFullscreen(figure) {
    var caption = figure.querySelector('.scribe-source-caption-text');
    var region = figure.querySelector('[data-scribe-source-code-region]');
    var titleText = caption ? caption.textContent || '' : figure.getAttribute('data-source-path') || '';
    var clone = null;
    if (region) {
      var activeMarkdownPanel = region.querySelector('[data-scribe-markdown-panel]:not([hidden])');
      clone = (activeMarkdownPanel || region).cloneNode(true);
      if (clone.removeAttribute) clone.removeAttribute('id');
      if (clone.querySelectorAll) {
        clone.querySelectorAll('[id]').forEach(function (element) {
          element.removeAttribute('id');
        });
        clone.querySelectorAll('[aria-controls], [aria-labelledby]').forEach(function (element) {
          element.removeAttribute('aria-controls');
          element.removeAttribute('aria-labelledby');
        });
      }
      var nestedFullscreen = clone.querySelector ? clone.querySelector('[data-scribe-source-fullscreen]') : null;
      if (nestedFullscreen && nestedFullscreen.parentNode) {
        nestedFullscreen.parentNode.removeChild(nestedFullscreen);
      }
      var clonedCopy = clone.querySelector ? clone.querySelector('.scribe-code-copy') : null;
      var clonedCode = clone.querySelector ? clone.querySelector('code') : null;
      if (!clonedCopy && clonedCode) {
        var sourceCopy = region.querySelector('.scribe-code-copy');
        if (sourceCopy) {
          clonedCopy = sourceCopy.cloneNode(true);
          clonedCopy.removeAttribute('hidden');
          clonedCopy.removeAttribute('data-scribe-code-copy-bound');
          clone.insertBefore(clonedCopy, clone.firstChild);
        }
      }
      if (clonedCopy && clonedCode) {
        clonedCopy.addEventListener('click', function () {
          copyText(selectedTextWithin(clonedCode) || clonedCode.textContent || '');
        });
      }
    }
    openScribeFullscreenDialog(
      titleText,
      figure.getAttribute('data-scribe-source-close-fullscreen-label') || 'Close',
      clone,
    );
  }

  function attachSourceSnippetActions(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-scribe-markdown-copy]:not([data-scribe-code-copy-bound])').forEach(function (button) {
      var figure = button.closest ? button.closest('.scribe-markdown-source') : null;
      var code = figure ? figure.querySelector('[data-scribe-markdown-panel="source"] code') : null;
      if (!code) return;
      button.setAttribute('data-scribe-code-copy-bound', 'true');
      button.removeAttribute('hidden');
      button.addEventListener('click', function (event) {
        stopSummaryToggle(event);
        copyText(selectedTextWithin(code) || code.textContent || '');
      });
    });
    scope.querySelectorAll('[data-scribe-markdown-tab]:not([data-scribe-markdown-tab-bound])').forEach(function (button) {
      button.setAttribute('data-scribe-markdown-tab-bound', 'true');
      button.setAttribute('role', 'tab');
      var initiallySelected = button.getAttribute('data-scribe-markdown-selected') === 'true';
      button.setAttribute('aria-selected', String(initiallySelected));
      button.setAttribute('tabindex', initiallySelected ? '0' : '-1');
      function selectMarkdownTab(event) {
        if (event) event.preventDefault();
        var figure = button.closest('.scribe-markdown-source');
        if (!figure) return;
        var selected = button.getAttribute('data-scribe-markdown-tab');
        figure.querySelectorAll('[data-scribe-markdown-tab]').forEach(function (tab) {
          tab.setAttribute('aria-selected', String(tab === button));
          tab.setAttribute('tabindex', tab === button ? '0' : '-1');
        });
        figure.querySelectorAll('[data-scribe-markdown-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-scribe-markdown-panel') !== selected;
        });
      }
      button.addEventListener('click', selectMarkdownTab);
    });
    scope.querySelectorAll('[data-scribe-markdown-panel]').forEach(function (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('tabindex', '0');
      panel.hidden = panel.getAttribute('data-scribe-markdown-panel') !== 'preview';
    });
    scope.querySelectorAll('[data-scribe-markdown-tablist]:not([data-scribe-markdown-tablist-bound])').forEach(function (tablist) {
      tablist.setAttribute('data-scribe-markdown-tablist-bound', 'true');
      tablist.setAttribute('role', 'tablist');
      tablist.addEventListener('keydown', function (event) {
        var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        var current = tabs.indexOf(event.target);
        if (current < 0 || tabs.length === 0) return;
        var next = current;
        if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    });
    scope.querySelectorAll('[data-scribe-source-toggle]:not([data-scribe-source-action-bound])').forEach(function (button) {
      button.setAttribute('data-scribe-source-action-bound', 'true');
      button.addEventListener('click', function (event) {
        stopSummaryToggle(event);
        var figure = sourceSnippetFigureFromControl(button);
        if (!figure) return;
        setSourceSnippetCollapsed(figure, figure.getAttribute('data-scribe-source-collapsed') !== 'true');
      });
    });
    scope
      .querySelectorAll('[data-scribe-source-fullscreen]:not([data-scribe-source-action-bound])')
      .forEach(function (button) {
        button.setAttribute('data-scribe-source-action-bound', 'true');
        button.removeAttribute('hidden');
        button.addEventListener('click', function (event) {
          stopSummaryToggle(event);
          var figure = sourceSnippetFigureFromControl(button);
          if (!figure) return;
          openSourceSnippetFullscreen(figure);
        });
      });
  }

  function displayArtifactFromControl(control) {
    return control && control.closest ? control.closest('[data-scribe-display-artifact]') : null;
  }

  function setDisplayArtifactCollapsed(artifact, collapsed) {
    var toggle = artifact.querySelector('[data-scribe-artifact-toggle]');
    var region = artifact.querySelector('[data-scribe-artifact-region]');
    var collapseLabel = artifact.getAttribute('data-scribe-artifact-collapse-label') || 'Collapse artifact';
    var expandLabel = artifact.getAttribute('data-scribe-artifact-expand-label') || 'Expand artifact';
    var label = collapsed ? expandLabel : collapseLabel;
    artifact.setAttribute('data-scribe-artifact-collapsed', String(collapsed));
    if (region) region.hidden = collapsed;
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    }
  }

  function setDisplayArtifactSourceVisible(artifact, sourceVisible) {
    var rendered = artifact.querySelector('[data-scribe-artifact-rendered]');
    var source = artifact.querySelector('[data-scribe-artifact-source]');
    var toggle = artifact.querySelector('[data-scribe-artifact-source-toggle]');
    if (!source || !toggle) return;
    if (rendered) rendered.hidden = sourceVisible;
    source.hidden = !sourceVisible;
    artifact.setAttribute('data-scribe-artifact-source-visible', String(sourceVisible));
    var label = sourceVisible
      ? toggle.getAttribute('data-rendered-label') || 'View diagram'
      : toggle.getAttribute('data-source-label') || 'View source';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  function ensureDisplayArtifactDialog() {
    var existing = byId('scribe-display-artifact-fullscreen-dialog');
    if (existing) return existing;
    var dialog = document.createElement('dialog');
    dialog.id = 'scribe-display-artifact-fullscreen-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.className = 'scribe-display-artifact-dialog';
    dialog.innerHTML =
      '<form method="dialog" class="scribe-display-artifact-dialog__chrome">' +
      '<strong data-scribe-artifact-dialog-title></strong>' +
      '<button type="submit" class="scribe-source-action scribe-source-action--icon" data-scribe-artifact-dialog-close aria-label="Close" title="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M21.29 4.12 16.7 8.71l1.59 1.59c.63.63.18 1.71-.71 1.71H13c-.55 0-1-.45-1-1v-4.6c0-.89 1.08-1.34 1.71-.71l1.59 1.59 4.59-4.59c.39-.39 1.02-.39 1.41 0 .38.4.38 1.03-.01 1.42M4.12 21.29l4.59-4.59 1.59 1.59c.63.63 1.71.18 1.71-.71V13c0-.55-.45-1-1-1h-4.6c-.89 0-1.34 1.08-.71 1.71l1.59 1.59-4.59 4.59c-.39.39-.39 1.02 0 1.41.4.38 1.03.38 1.42-.01"></path></svg></button>' +
      '</form>' +
      '<div class="scribe-display-artifact-dialog__body" data-scribe-artifact-dialog-body></div>';
    document.body.appendChild(dialog);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    return dialog;
  }

  function openDisplayArtifactFullscreen(artifact) {
    var dialog = ensureDisplayArtifactDialog();
    var title = dialog.querySelector('[data-scribe-artifact-dialog-title]');
    var body = dialog.querySelector('[data-scribe-artifact-dialog-body]');
    var close = dialog.querySelector('[data-scribe-artifact-dialog-close]');
    var heading = artifact.querySelector('h3');
    var region = artifact.querySelector('[data-scribe-artifact-region]');
    var dialogTitle = heading ? heading.textContent || '' : artifact.id || '';
    dialog.setAttribute('aria-label', dialogTitle);
    if (title) title.textContent = dialogTitle;
    if (close) {
      var closeLabel = artifact.getAttribute('data-scribe-artifact-close-fullscreen-label') || 'Close';
      close.setAttribute('aria-label', closeLabel);
      close.setAttribute('title', closeLabel);
    }
    if (body) {
      body.textContent = '';
      if (region) {
        var clone = region.cloneNode(true);
        if (clone.removeAttribute) {
          clone.removeAttribute('id');
          clone.removeAttribute('hidden');
        }
        if (clone.classList) clone.classList.add('scribe-display-artifact__figure--fullscreen');
        clone.setAttribute('data-scribe-artifact-fullscreen-region', '');
        body.appendChild(clone);
      }
    }
    if (dialog.showModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function attachDisplayArtifactActions(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-scribe-artifact-toggle]:not([data-scribe-artifact-action-bound])').forEach(function (button) {
      button.setAttribute('data-scribe-artifact-action-bound', 'true');
      button.addEventListener('click', function (event) {
        stopSummaryToggle(event);
        var artifact = displayArtifactFromControl(button);
        if (!artifact) return;
        setDisplayArtifactCollapsed(artifact, artifact.getAttribute('data-scribe-artifact-collapsed') !== 'true');
      });
    });
    scope
      .querySelectorAll('[data-scribe-artifact-fullscreen]:not([data-scribe-artifact-action-bound])')
      .forEach(function (button) {
        button.setAttribute('data-scribe-artifact-action-bound', 'true');
        button.addEventListener('click', function (event) {
          stopSummaryToggle(event);
          var artifact = displayArtifactFromControl(button);
          if (!artifact) return;
          openDisplayArtifactFullscreen(artifact);
        });
      });
    scope
      .querySelectorAll('[data-scribe-artifact-source-toggle]:not([data-scribe-artifact-action-bound])')
      .forEach(function (button) {
        button.setAttribute('data-scribe-artifact-action-bound', 'true');
        button.addEventListener('click', function (event) {
          stopSummaryToggle(event);
          var artifact = displayArtifactFromControl(button);
          if (!artifact) return;
          setDisplayArtifactSourceVisible(artifact, artifact.getAttribute('data-scribe-artifact-source-visible') !== 'true');
        });
      });
  }

  function attachFindingPermalinks() {
    attachCanonicalPermalinkBehavior({
      beforeActivate: function (event) { stopPermalinkActivation(event); },
      activate: function (fragment) { return activateAnchorFragment(fragment); },
      copyText: copyText,
      copyValue: function () { return window.location.href; },
      onShare: function (fragment) { recordShare(fragmentIdFromHref(fragment)); }
    });
  }

  function searchInput() {
    return byId('report-search');
  }

  function searchSuggestionList() {
    return byId('report-search-hints');
  }

  function setSearchSuggestionsOpen(open) {
    var input = searchInput();
    var list = searchSuggestionList();
    if (input) input.setAttribute('aria-expanded', String(open));
    if (list) list.hidden = !open;
    if (!open && input) input.removeAttribute('aria-activedescendant');
    if (!open && list) {
      list.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
        button.setAttribute('aria-selected', 'false');
      });
    }
  }

  function visibleSearchSuggestions() {
    var list = searchSuggestionList();
    if (!list) return [];
    return Array.prototype.slice.call(list.querySelectorAll('[data-search-suggestion]')).filter(function (button) {
      return !button.hidden;
    });
  }

  function activeSearchSuggestionIndex(suggestions) {
    var input = searchInput();
    if (!input) return -1;
    var activeId = input.getAttribute('aria-activedescendant');
    return suggestions.findIndex(function (button) {
      return button.id === activeId;
    });
  }

  function setActiveSearchSuggestion(suggestions, index) {
    var input = searchInput();
    if (!input || suggestions.length === 0) return;
    var normalized = (index + suggestions.length) % suggestions.length;
    suggestions.forEach(function (button, buttonIndex) {
      button.setAttribute('aria-selected', String(buttonIndex === normalized));
    });
    input.setAttribute('aria-activedescendant', suggestions[normalized].id);
    suggestions[normalized].scrollIntoView({ block: 'nearest' });
    setSearchSuggestionsOpen(true);
  }

  function chooseSearchSuggestion(button) {
    var input = searchInput();
    if (!input || !button) return;
    input.value = button.getAttribute('data-search-suggestion') || '';
    scheduleApplyFilters(true);
    setSearchSuggestionsOpen(false);
    input.focus();
  }

  function moveSearchSuggestion(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return false;
    var suggestions = visibleSearchSuggestions();
    if (suggestions.length === 0) return false;
    var activeIndex = activeSearchSuggestionIndex(suggestions);
    var offset = event.key === 'ArrowDown' ? 1 : -1;
    setActiveSearchSuggestion(suggestions, activeIndex < 0 ? (offset > 0 ? 0 : suggestions.length - 1) : activeIndex + offset);
    event.preventDefault();
    return true;
  }

  function syncSearchSuggestions() {
    var input = searchInput();
    var list = searchSuggestionList();
    if (!input || !list) return;
    var query = input.value.toLowerCase();
    var visible = 0;
    list.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
      var value = (button.getAttribute('data-search-suggestion') || '').toLowerCase();
      var matches = query.length === 0 || value.indexOf(query) !== -1;
      button.hidden = !matches;
      if (!matches) button.setAttribute('aria-selected', 'false');
      if (matches) visible += 1;
    });
    input.removeAttribute('aria-activedescendant');
    setSearchSuggestionsOpen(document.activeElement === input && visible > 0);
  }

  function attachSearchSuggestions() {
    var input = searchInput();
    var list = searchSuggestionList();
    if (!input || !list) return;
    input.addEventListener('focus', syncSearchSuggestions);
    input.addEventListener('blur', function () {
      setSearchSuggestionsOpen(false);
    });
    input.addEventListener('input', syncSearchSuggestions);
    input.addEventListener('keydown', function (event) {
      if (moveSearchSuggestion(event)) return;
      if (event.key === 'Enter') {
        var suggestions = visibleSearchSuggestions();
        var activeIndex = activeSearchSuggestionIndex(suggestions);
        if (activeIndex >= 0) {
          chooseSearchSuggestion(suggestions[activeIndex]);
          event.preventDefault();
        }
      } else if (event.key === 'Escape') {
        setSearchSuggestionsOpen(false);
      }
    });
    list.addEventListener('keydown', moveSearchSuggestion);
    list.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
      button.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });
      button.addEventListener('click', function () {
        chooseSearchSuggestion(button);
      });
    });
    document.addEventListener('click', function (event) {
      if (input.contains(event.target) || list.contains(event.target)) return;
      setSearchSuggestionsOpen(false);
    });
  }


  var reportPrintState = null;
  var requestedPrintState = null;

  function prepareReportForPrint() {
    if (reportPrintState) return;
    var interactiveState = requestedPrintState || {
      filters: readCurrentReportFilters(),
      currentPage: reportCurrentPage
    };
    var closedDetails = [];
    document.querySelectorAll('details:not([open])').forEach(function (details) {
      closedDetails.push(details);
      details.setAttribute('open', '');
    });
    var lazyImages = [];
    document.querySelectorAll('img[loading="lazy"]').forEach(function (image) {
      lazyImages.push({
        image: image,
        loading: image.getAttribute('loading')
      });
      image.setAttribute('loading', 'eager');
    });
    var hiddenState = [];
    document.querySelectorAll('[data-scribe-result], [data-scribe-toc-result], [data-scribe-toc-group-container]').forEach(function (element) {
      hiddenState.push({
        element: element,
        hidden: element.hidden
      });
    });
    reportPrintState = {
      closedDetails: closedDetails,
      lazyImages: lazyImages,
      hiddenState: hiddenState,
      filters: interactiveState.filters,
      currentPage: interactiveState.currentPage
    };
    document.body.setAttribute('data-scribe-printing', 'true');
    applyFiltersNow();
  }

  function restoreReportAfterPrint() {
    planPrintGeneration += 1;
    planPrintCallbacks = null;
    planPrintReady = false;
    planPrintActive = false;
    document.querySelectorAll('[data-scribe-print-plan]').forEach(function (output) { output.remove(); });
    document.querySelectorAll('[data-scribe-plan-content]').forEach(function (content) { content.hidden = false; });
    if (!reportPrintState) return;
    reportPrintState.closedDetails.forEach(function (details) {
      details.removeAttribute('open');
    });
    reportPrintState.lazyImages.forEach(function (entry) {
      if (entry.loading) entry.image.setAttribute('loading', entry.loading);
      else entry.image.removeAttribute('loading');
    });
    reportPrintState.hiddenState.forEach(function (entry) {
      entry.element.hidden = entry.hidden;
    });
    setOverviewFilterState(reportPrintState.filters);
    reportCurrentPage = reportPrintState.currentPage;
    document.body.removeAttribute('data-scribe-printing');
    reportPrintState = null;
    requestedPrintState = null;
    if (reportUsesChunkedFindings()) {
      applyChunkedFindingFilters(function () {});
    }
  }

  function startPdfDownloadFlow() {
    window.__SCRIBE_PDF_DOWNLOAD_REQUESTED__ = true;
    var operation = startReportOperation(
      'pdf',
      'Preparing your PDF...',
      'Sonde is paginating the report with document links before the print dialog opens.'
    );
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:8.5in;height:11in;border:0;visibility:hidden';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Scribe PDF print frame');
    var printUrl = new URL(location.href);
    printUrl.searchParams.set('print', '1');
    var activeLocale = currentLocale() || document.documentElement.lang;
    if (localeBundle(activeLocale || '')) printUrl.searchParams.set('scribe_locale', activeLocale);
    var activeTheme = currentReportThemeId();
    if (activeTheme) printUrl.searchParams.set('scribe_theme', activeTheme);
    var activeMode = currentReportMode();
    if (activeMode) printUrl.searchParams.set('scribe_mode', activeMode);
    var filters = readCurrentReportFilters();
    if (filters.query) printUrl.searchParams.set('scribe_filter_query', filters.query);
    if (filters.severity) printUrl.searchParams.set('scribe_filter_severity', filters.severity);
    if (filters.language) printUrl.searchParams.set('scribe_filter_language', filters.language);
    if (filters.classification) printUrl.searchParams.set('scribe_filter_classification', filters.classification);
    if (filters.autofix) printUrl.searchParams.set('scribe_filter_autofix', filters.autofix);
    iframe.src = printUrl.toString();
    if (operation) operation.printFrame = iframe;
    document.body.appendChild(iframe);
    addReportOperationCleanup(operation, function () {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ source: 'sonde-scribe-paged', type: 'cancel' }, '*');
        }
      } catch (_error) {
        // Removing the frame is the actual cancellation path; postMessage is best effort.
      }
      iframe.remove();
    });
    var timeout = window.setTimeout(function () {
      if (activeReportOperation === operation) cancelReportOperation('timeout');
    }, 120000);
    addReportOperationCleanup(operation, function () {
      window.clearTimeout(timeout);
    });
    var removeTimer = window.setTimeout(function () {
      iframe.remove();
    }, 60000);
    addReportOperationCleanup(operation, function () {
      window.clearTimeout(removeTimer);
    });
  }

  // Lazy-load a runtime export bundle at most once. isReady short-circuits when
  // the bundle generators are already on the window (e.g. from a prior export).
  function makeRuntimeBundleLoader(bundlePath, isReady) {
    var loading = null;
    return function (rootPrefix) {
      if (isReady()) return Promise.resolve();
      if (loading) return loading;
      loading = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = String(rootPrefix || '') + bundlePath;
        script.onload = function () {
          if (isReady()) resolve();
          else reject(new Error('bundle ' + bundlePath + ' loaded without generators'));
        };
        script.onerror = function () {
          reject(new Error('failed to load bundle ' + bundlePath));
        };
        document.head.appendChild(script);
      });
      return loading;
    };
  }

  // Trigger a browser download of generated content via a transient object URL.
  function downloadGeneratedBlob(content, mimeType, filename) {
    var url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  var loadOscalBundle = makeRuntimeBundleLoader("assets/oscal-bundle.js", function () {
    return Boolean(window.SondeOscal && window.SondeOscal.generate);
  });

  function startOscalDownloadFlow(button) {
    window.__SCRIBE_OSCAL_DOWNLOAD_REQUESTED__ = true;
    var rootPrefix = button.getAttribute('data-scribe-oscal-root') || '';
    if (window.SondeSpinner) {
      window.SondeSpinner.show(
        'Generating OSCAL...',
        'Sonde is building an OSCAL Assessment Results document from this report package.'
      );
    }
    loadOscalBundle(rootPrefix)
      .then(function () {
        var data = window.__SCRIBE_OSCAL_INPUT__;
        if (!data || !window.SondeOscal || !window.SondeOscal.generate) {
          throw new Error('OSCAL export data is unavailable');
        }
        var oscal = window.SondeOscal.generate(data.findings || [], {
          url: data.url || '',
          entityName: data.entityName || data.url || '',
          scanDate: data.scanDate || new Date().toISOString(),
          vertical: data.vertical || 'scribe',
          slug: data.slug || 'report',
          rendererEpoch: data.rendererEpoch
        });
        downloadGeneratedBlob(
          JSON.stringify(oscal, null, 2),
          'application/json',
          String((data && data.slug) || 'sonde-scribe-report') + '-oscal.json'
        );
      })
      .catch(function (error) {
        alert('Could not generate OSCAL: ' + (error && error.message ? error.message : 'unknown error'));
      })
      .finally(function () {
        if (window.SondeSpinner) window.SondeSpinner.hide();
      });
  }

  function reportExportGeneratorsReady() {
    return Boolean(
      window.SondeVpat && window.SondeVpat.render && window.SondeOpenAcr && window.SondeOpenAcr.emit
    );
  }

  var loadReportExportBundle = makeRuntimeBundleLoader(
    "assets/report-export-bundle.js",
    reportExportGeneratorsReady
  );

  // Locale can change after boot, so re-read it at click time rather than
  // trusting the baked input — clone first so we never mutate the shipped data.
  function reportExportInputForActiveState() {
    var data = window.__SCRIBE_REPORT_EXPORT_INPUT__;
    if (!data) return null;
    var clone = Object.assign({}, data);
    var locale = currentLocale() || document.documentElement.lang || '';
    if (locale) clone.locale = locale;
    return clone;
  }

  function startVpatExportFlow(button) {
    window.__SCRIBE_VPAT_EXPORT_REQUESTED__ = true;
    var rootPrefix = button.getAttribute('data-scribe-export-root') || '';
    // Open the tab synchronously inside the click gesture so popup blockers
    // allow it; the bundle + HTML load asynchronously and then navigate it.
    var vpatWindow = window.open('', '_blank');
    if (window.SondeSpinner) {
      window.SondeSpinner.show(
        'Generating VPAT...',
        'Sonde is building a VPAT accessibility report for the current theme, mode, and language.'
      );
    }
    loadReportExportBundle(rootPrefix)
      .then(function () {
        var data = reportExportInputForActiveState();
        if (!data || !window.SondeVpat || !window.SondeVpat.render) {
          throw new Error('VPAT export data is unavailable');
        }
        var html = window.SondeVpat.render(data, {
          theme: currentReportThemeId(),
          mode: currentReportMode(),
          generator: 'sonde-scribe',
          brandName: 'Sonde Accessibility Report'
        });
        if (vpatWindow && !vpatWindow.closed) {
          // The new tab needs the object URL alive long enough to navigate to
          // and parse it, so this case keeps its own longer-lived URL.
          var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
          vpatWindow.location = url;
          setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        } else {
          // Popup blocked despite the synchronous open — fall back to a
          // download so the artifact is never lost.
          downloadGeneratedBlob(html, 'text/html', 'sonde-vpat.html');
        }
      })
      .catch(function (error) {
        if (vpatWindow && !vpatWindow.closed) vpatWindow.close();
        alert('Could not generate VPAT: ' + (error && error.message ? error.message : 'unknown error'));
      })
      .finally(function () {
        if (window.SondeSpinner) window.SondeSpinner.hide();
      });
  }

  function startOpenAcrDownloadFlow(button) {
    window.__SCRIBE_OPENACR_DOWNLOAD_REQUESTED__ = true;
    var rootPrefix = button.getAttribute('data-scribe-export-root') || '';
    if (window.SondeSpinner) {
      window.SondeSpinner.show(
        'Generating OpenACR...',
        'Sonde is building an OpenACR YAML accessibility conformance report from this report package.'
      );
    }
    loadReportExportBundle(rootPrefix)
      .then(function () {
        var data = reportExportInputForActiveState();
        if (!data || !window.SondeOpenAcr || !window.SondeOpenAcr.emit) {
          throw new Error('OpenACR export data is unavailable');
        }
        var yaml = window.SondeOpenAcr.emit(data);
        var validation = window.SondeOpenAcr.validate(yaml);
        if (!validation || validation.result !== true) {
          throw new Error((validation && validation.message) || 'OpenACR validation failed');
        }
        downloadGeneratedBlob(yaml, 'application/yaml', 'sonde-openacr.yaml');
      })
      .catch(function (error) {
        alert('Could not generate OpenACR: ' + (error && error.message ? error.message : 'unknown error'));
      })
      .finally(function () {
        if (window.SondeSpinner) window.SondeSpinner.hide();
      });
  }

  function attachPrintActions() {
    window.addEventListener('beforeprint', function () {
      materializeCompleteReportForPrint(prepareReportForPrint);
      prepareReportForPrint();
    });
    window.addEventListener('afterprint', function () {
      restoreReportAfterPrint();
      if (activeReportOperation && activeReportOperation.kind === 'print') {
        finishReportOperation(activeReportOperation);
      }
    });
    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'sonde-scribe-paged') return;
      if (!activeReportOperation || !activeReportOperation.printFrame || event.source !== activeReportOperation.printFrame.contentWindow) return;
      if (data.type === 'content-error') { showPlanExportError(); return; }
      if (
        (data.type === 'rendered' || data.type === 'fallback') &&
        activeReportOperation &&
        activeReportOperation.kind === 'pdf'
      ) {
        finishReportOperation(activeReportOperation);
      }
    });
    document.querySelectorAll('[data-scribe-print]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.__SCRIBE_PRINT_REQUESTED__ = true;
        requestedPrintState = {
          filters: readCurrentReportFilters(),
          currentPage: reportCurrentPage
        };
        var operation = startReportOperation(
          'print',
          'Preparing print view...',
          'Sonde is preparing the complete report for printing.'
        );
        materializeCompleteReportForPrint(function () {
          if (reportOperationIsAborted(operation)) return;
          prepareReportForPrint();
          try {
            if (typeof window.print === 'function') window.print();
          } finally {
            // Native print blocks until its dialog closes. Finish here as well
            // as on the afterprint event for engines that omit that event.
            finishReportOperation(operation);
          }
        });
      });
    });
    document.querySelectorAll('[data-scribe-download-pdf]').forEach(function (button) {
      button.addEventListener('click', function () {
        startPdfDownloadFlow();
      });
    });
    document.querySelectorAll('[data-scribe-download-oscal]').forEach(function (button) {
      button.addEventListener('click', function () {
        startOscalDownloadFlow(button);
      });
    });
    document.querySelectorAll('[data-scribe-export-vpat]').forEach(function (button) {
      button.addEventListener('click', function () {
        startVpatExportFlow(button);
      });
    });
    document.querySelectorAll('[data-scribe-download-openacr]').forEach(function (button) {
      button.addEventListener('click', function () {
        startOpenAcrDownloadFlow(button);
      });
    });
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
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindInlinePlanDisclosures();
    restoreReportTheme();
    var printTheme = pdfPrintFrameActive ? requestedPrintThemeId() : null;
    if (printTheme) applyReportTheme(printTheme);
    var certificationTheme = pdfPrintFrameActive ? null : requestedCertificationThemeId();
    if (certificationTheme) applyReportTheme(certificationTheme, false);
    restoreReportMode();
    var printMode = pdfPrintFrameActive ? requestedPrintMode() : null;
    if (printMode) applyReportMode(printMode);
    var certificationMode = pdfPrintFrameActive ? null : requestedCertificationMode();
    if (certificationMode) applyReportMode(certificationMode, false);
    restoreSettingsSectionState();
    ensureLanguageSearch();
    var storedLocaleId = storedLocale() || '';
    var queryLocale = requestedLocale();
    var certificationLocale = pdfPrintFrameActive ? null : requestedCertificationLocale();
    var printLocale = pdfPrintFrameActive ? queryLocale : null;
    var manifestLocale = window.__SCRIBE_MANIFEST__ && window.__SCRIBE_MANIFEST__.locales
      ? window.__SCRIBE_MANIFEST__.locales.fallback
      : '';
    var documentLocale = document.documentElement.lang || currentLocale();
    var completeDocumentLocale = localeBundleIsComplete(documentLocale) ? documentLocale : null;
    var supportedDocumentLocale = localeBundle(documentLocale) ? documentLocale : null;
    var explicitDocumentLocale = supportedDocumentLocale && supportedDocumentLocale !== manifestLocale
      ? supportedDocumentLocale
      : null;
    var preferredLocale = preferredBrowserLocale();
    var initialLocale =
      printLocale ||
      certificationLocale ||
      (pdfPrintFrameActive ? null : queryLocale) ||
      explicitDocumentLocale ||
      (localeBundle(storedLocaleId) ? storedLocaleId : null) ||
      preferredLocale ||
      completeDocumentLocale ||
      supportedDocumentLocale ||
      manifestLocale ||
      documentLocale;
    var persistInitialLocale = certificationLocale ? false : Boolean(queryLocale && !pdfPrintFrameActive);
    updateText(initialLocale, persistInitialLocale);
    if (queryLocale && !pdfPrintFrameActive) clearTransientQueryParam('scribe_locale');
    attachOverviewSeverityShortcuts();
    attachOverviewFilters();
    document.addEventListener('click', function (event) {
      var clearButton = event.target && event.target.closest
        ? event.target.closest('[data-scribe-clear-filters]')
        : null;
      if (clearButton) clearReportFilters();
    });
    restoreRequestedPrintFilters();
    if (!pdfPrintFrameActive) restoreReportFiltersFromUrl();
    // Deep-link / search hydration (G8): a q= query parameter on the report URL pre-fills the in-page
    // finding filter on first paint so a shared link lands on the already-filtered finding set. Skipped
    // inside the PDF print frame (which carries its own scribe_filter_query parameter).
    var hydratedQuery = pdfPrintFrameActive ? '' : (queryParam('q') || '');
    if (hydratedQuery) {
      setReportFilterValue('report-search', hydratedQuery);
      syncSearchFieldState(hydratedQuery);
    }
    restoreNistCoverageControls();
    hydrateDeferredFindingToc();
    if (pdfPrintFrameActive) {
      bootPdfPrintFrame();
      return;
    }
    applyFilters();
    attachSearchSuggestions();
    attachFindingPermalinks();
    attachDeferredSourceSnippetHydration();
    attachSourceSnippetActions(document);
    attachDisplayArtifactActions(document);
    attachPrintActions();
    attachNistCoverageControls();
    ensureFindingTargetOpen();
    
(function () {
  
  function openDiffFullscreen(container) {
    var label = container.querySelector('[data-scribe-diff-label]');
    var titleText = label ? label.textContent || '' : '';
    var visiblePane = container.querySelector('[data-scribe-diff-pane]:not([hidden])');
    var clone = null;
    if (visiblePane) {
      // Diff panes render no id attributes and no interactive elements
      // (renderer diffBlock templates), so the clone needs no sanitization;
      // revisit if pane markup ever gains either. The clone is made focusable
      // so keyboard users can scroll a long diff inside the dialog.
      clone = visiblePane.cloneNode(true);
      clone.setAttribute('tabindex', '0');
      clone.setAttribute('role', 'region');
      if (titleText) clone.setAttribute('aria-label', titleText);
    }
    openScribeFullscreenDialog(
      titleText,
      container.getAttribute('data-scribe-diff-close-fullscreen-label') || 'Close',
      clone
    );
  }
  function wireDiffToggles(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var containers = Array.prototype.slice.call(scope.querySelectorAll('[data-scribe-diff-toggle]'));
    if (scope.matches && scope.matches('[data-scribe-diff-toggle]')) containers.unshift(scope);
    containers.forEach(wireDiffToggle);
  }
  // Exported so the report runtime can wire a diff it rendered AFTER load — the chunked
  // overview hydrates a finding's before/after only when the reader opens it, long after this
  // IIFE's initial sweep. Idempotent by the wired-guard, so a re-sweep costs nothing.
  window.__sondeWireScribeDiff = wireDiffToggles;
  function wireDiffToggle(container) {
    if (container.getAttribute('data-scribe-diff-wired')) return;
    var toolbar = container.querySelector('.scribe-diff-view-toggle');
    var splitPane = container.querySelector('[data-scribe-diff-pane="split"]');
    var unifiedPane = container.querySelector('[data-scribe-diff-pane="unified"]');
    var buttons = container.querySelectorAll('[data-scribe-diff-view]');
    if (!toolbar || !splitPane || !unifiedPane || buttons.length === 0) return;
    container.setAttribute('data-scribe-diff-wired', 'true');
    // Reveal the controls only once wired, so no-JS readers never see dead ones.
    toolbar.removeAttribute('hidden');
    var fullscreen = container.querySelector('[data-scribe-diff-fullscreen]');
    if (fullscreen) {
      fullscreen.removeAttribute('hidden');
      fullscreen.addEventListener('click', function () {
        openDiffFullscreen(container);
      });
    }
    function select(view) {
      var showUnified = view === 'unified';
      unifiedPane.hidden = !showUnified;
      splitPane.hidden = showUnified;
      buttons.forEach(function (button) {
        var active = button.getAttribute('data-scribe-diff-view') === view;
        button.setAttribute('data-active', active ? 'true' : 'false');
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        select(button.getAttribute('data-scribe-diff-view'));
      });
    });
  }
  wireDiffToggles(document);
})();

    applyReaderView(readFilter('report-reader-view') || document.body.getAttribute('data-reader-view') || "developer");
    document.querySelectorAll('[data-scribe-filter]').forEach(function (input) {
      input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', function () {
        persistReportFilters(true, input.tagName !== 'SELECT');
        scheduleApplyFilters(true);
      });
    });
    document.querySelectorAll('[data-scribe-page-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.getAttribute('data-scribe-page-action') || '';
        if (action === 'first') {
          reportCurrentPage = 1;
        } else if (action === 'previous') {
          reportCurrentPage -= 1;
        } else if (action === 'next') {
          reportCurrentPage += 1;
        } else if (action === 'last') {
          reportCurrentPage = reportCurrentPageCount;
        }
        persistReportFilters(false);
        scheduleApplyFilters(false);
      });
    });
    var locale = byId('report-locale');
    if (locale) locale.addEventListener('change', function () {
      updateText(currentLocale());
      scheduleApplyFilters(false);
    });
    document.querySelectorAll('input[name="sonde-locale-picker-radio"]').forEach(function (input) {
      input.addEventListener('change', function () {
        updateText(input.value);
        scheduleApplyFilters(false);
      });
    });
    var readerView = byId('report-reader-view');
    if (readerView) readerView.addEventListener('change', function () {
      applyReaderView(readerView.value);
    });
    var theme = byId('report-theme');
    if (theme) theme.addEventListener('change', function () {
      applyReportTheme(theme.value);
    });
    document.querySelectorAll('input[name="sonde-platform-theme-toggle"]').forEach(function (input) {
      input.addEventListener('change', function () {
        applyReportTheme(input.value);
      });
    });
    document.querySelectorAll('input[name="sonde-theme-toggle"]').forEach(function (input) {
      input.addEventListener('change', function () {
        applyReportMode(input.value);
      });
    });
    syncReportSettingsAria();
    var details = reportSettingsDetails();
    if (details) {
      details.addEventListener('toggle', syncReportSettingsAria);
      settingsSections().forEach(function (section) {
        section.addEventListener('toggle', persistSettingsSectionState);
      });
    }
    document.addEventListener('click', function (event) {
      var currentDetails = reportSettingsDetails();
      if (!currentDetails || !currentDetails.hasAttribute('open')) return;
      if (currentDetails.contains(event.target)) return;
      closeReportSettings(true);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && cancelReportOperation('escape')) {
        event.preventDefault();
        return;
      }
      if (event.key === 'Escape') closeReportSettings(true);
    });
    document.querySelectorAll('[data-share-anchor]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        emitShare(button, event);
      });
    });
    document.querySelectorAll('[data-feedback-action]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        emitFeedback(button, event);
      });
    });
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;
      var destination;
      try { destination = new URL(link.getAttribute('href'), location.href); } catch (_error) { return; }
      if (!destination.hash || destination.origin !== location.origin || destination.pathname !== location.pathname) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      evidenceReturnContext = { url: location.href, focus: link, x: window.scrollX, y: window.scrollY };
      if (link.closest('.scribe-report-toc') && !event.defaultPrevented && event.button === 0 &&
          !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        // Native fragment navigation transfers focus to the report target. Keep
        // navigation selection in the rail so the next destination stays reachable.
        event.preventDefault();
        link.focus({ preventScroll: true });
        history.pushState(null, '', link.getAttribute('href'));
        ensureFindingTargetOpen();
        return;
      }
      event.preventDefault();
      history.pushState(null, '', destination.toString());
      ensureFindingTargetOpen();
    });
    ensureFindingTargetOpen();
  });
  window.addEventListener('hashchange', ensureFindingTargetOpen);
  window.addEventListener('popstate', function () {
    clearEvidenceReveal();
    restoreReportFiltersFromUrl();
    scheduleApplyFilters(false);
    ensureFindingTargetOpen();
  });
})();
