window.__SCRIBE_FILE_DIRECT_RUNTIME__ = {
  profile: 'file-direct',
  relativePathsOnly: true,
  requiresServer: false
};


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
    function prepareMaterializedFrame() {
      if (printFrameCancelled) return;
      if (document.body) document.body.setAttribute('data-scribe-printing', 'true');
      document.querySelectorAll('details').forEach(function (details) {
        details.setAttribute('open', '');
      });
      document.querySelectorAll('img[loading="lazy"]').forEach(function (image) {
        image.setAttribute('loading', 'eager');
      });
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
        try {
          parent.postMessage({ source: 'sonde-scribe-paged', type: 'fallback' }, '*');
        } catch (_error) {
          return;
        }
        if (printFrameCancelled) return;
        window.focus();
        if (typeof window.print === 'function') window.print();
      };
      document.head.appendChild(pagedScript);
    }
    function prepareFrame() {
      if (printFrameCancelled) return;
      materializeCompleteReportForPrint(prepareMaterializedFrame);
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
  var chunkedFindingLabels = {"sourceSnippetTitle":{"msgid":"scribe.report.repositoryHealth.sourceSnippet.title","defaultText":"Repository health source evidence"},"sourcePermalink":{"msgid":"scribe.report.action.sourcePermalink","defaultText":"Open source permalink"},"collapseSourceSnippet":{"msgid":"scribe.report.action.collapseSourceSnippet","defaultText":"Collapse snippet"},"expandSourceSnippet":{"msgid":"scribe.report.action.expandSourceSnippet","defaultText":"Expand snippet"},"fullScreenSourceSnippet":{"msgid":"scribe.report.action.fullScreenSourceSnippet","defaultText":"Full screen snippet"},"closeFullScreenSourceSnippet":{"msgid":"scribe.report.action.closeFullScreenSourceSnippet","defaultText":"Close full screen snippet"},"shareFinding":{"msgid":"scribe.report.action.shareFinding","defaultText":"Share finding"},"feedbackFinding":{"msgid":"scribe.report.action.feedbackFinding","defaultText":"Send feedback"},"findingPermalink":{"msgid":"scribe.report.action.findingPermalink","defaultText":"Copy finding link"}};
  var reportCurrentPage = 1;
  var reportCurrentPageCount = 1;
  var pendingFilterTimer = 0;
  var reportFilterGeneration = 0;
  var reportFilterBatchSize = 500;
  var reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
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
    var runtime = reportOperationRuntime();
    if (runtime) runtime.finish(operation);
    activeReportOperation = null;
    document.body.removeAttribute('data-scribe-working');
  }

  function cancelReportOperation(reason) {
    var operation = activeReportOperation;
    if (!operation) return false;
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
      .replace(/&lt;strong&gt;/g, '<strong>')
      .replace(/&lt;\/strong&gt;/g, '</strong>');
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
    var marker = 'assets/themes/';
    var markerIndex = currentHref.indexOf(marker);
    var prefix = markerIndex >= 0 ? currentHref.slice(0, markerIndex) : '';
    return prefix + theme.cssPath;
  }

  function applyReportTheme(themeId) {
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
    storeThemeId(theme.themeId);
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

  function applyReportMode(mode) {
    var nextMode = isSupportedMode(mode) ? mode : 'auto';
    document.documentElement.setAttribute('data-theme', nextMode);
    document.documentElement.setAttribute('data-mode', nextMode);
    syncReportThemePreviewMode(nextMode);
    document.querySelectorAll('input[name="sonde-theme-toggle"]').forEach(function (input) {
      input.checked = input.value === nextMode;
    });
    storeMode(nextMode);
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
    return pluralFormatted
      .replace(/\{([A-Za-z0-9_.-]+),\s*list\}/g, function (token, key) {
        return Object.prototype.hasOwnProperty.call(args, key) ? formatLocalizedArgValue(args[key], locale) : token;
      })
      .replace(/\{([A-Za-z0-9_.-]+)\}/g, function (token, key) {
        return Object.prototype.hasOwnProperty.call(args, key) ? formatLocalizedArgValue(args[key], locale) : token;
      });
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

  function formatLocalizedArgValue(value, locale) {
    if (Array.isArray(value)) {
      if (!value.length) return '';
      var values = value.map(String);
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

  function requestedPrintFilters() {
    return {
      query: queryParam('scribe_filter_query') || '',
      severity: queryParam('scribe_filter_severity') || '',
      language: queryParam('scribe_filter_language') || '',
      classification: queryParam('scribe_filter_classification') || ''
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
      document.title = titleEntry ? formatLocalizedTemplate(titleEntry.text, {}) : defaultDocumentTitle;
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
    syncLanguageSearchLabel();
    filterLanguageOptions();
    hydrateLocalizedNumbers();
    updateSidebarToggleLabel(isSidebarCollapsed());
  }

  function localizedText(msgid, fallback) {
    var bundle = localeBundle(currentLocale() || document.documentElement.lang);
    var entry = bundle && msgid ? bundle.messages[msgid] : undefined;
    return entry && entry.text ? entry.text : fallback;
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
      return new Intl.NumberFormat(currentLocale() || document.documentElement.lang || undefined).format(number);
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
    return input ? input.value.toLowerCase() : '';
  }

  function readPageSize() {
    if (pdfPrintFrameActive || document.body.hasAttribute('data-scribe-printing')) return Infinity;
    var value = readFilter('filter-page-size') || '500';
    if (value === 'all') return Infinity;
    var size = Number(value);
    return Number.isFinite(size) && size > 0 ? size : 500;
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
    return {
      query: readFilter('report-search'),
      severity: readFilter('filter-severity'),
      language: readFilter('filter-language'),
      classification: readFilter('filter-classification'),
      pageSize: readPageSize()
    };
  }

  function hasActiveReportFilters() {
    return (
      readFilter('report-search').length > 0 ||
      readFilter('filter-severity').length > 0 ||
      readFilter('filter-language').length > 0 ||
      readFilter('filter-classification').length > 0
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
    ['report-search', 'filter-severity', 'filter-language', 'filter-classification'].forEach(function (id) {
      var input = byId(id);
      if (input) input.value = '';
    });
    updateSeverityShortcutState('');
    updateFilterClearControl();
    scheduleApplyFilters(true, 'Clearing filters...', 'Sonde is restoring the full finding set.');
  }

  function setReportFilterValue(id, value) {
    var input = byId(id);
    if (input) input.value = value || '';
  }

  function setOverviewFilterState(filters) {
    setReportFilterValue('report-search', filters.query || '');
    setReportFilterValue('filter-severity', filters.severity || '');
    setReportFilterValue('filter-language', filters.language || '');
    setReportFilterValue('filter-classification', filters.classification || '');
    updateSeverityShortcutState(readFilter('filter-severity'));
    updateFilterClearControl();
  }

  function syncSearchFieldState(query) {
    var searchInput = byId('report-search');
    var searchField = searchInput ? searchInput.closest('.scribe-search-field') : null;
    if (searchField) searchField.setAttribute('data-has-value', query.length > 0 ? 'true' : 'false');
  }

  function resultMatchesFilters(card, filters) {
    if (!matchesFilter(card.getAttribute('data-severity') || '', filters.severity)) return false;
    if (!matchesFilter(card.getAttribute('data-language') || '', filters.language)) return false;
    if (!matchesFilter(card.getAttribute('data-classification') || '', filters.classification)) return false;
    return filters.query.length === 0 || cachedResultText(card).indexOf(filters.query) !== -1;
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
    document.querySelectorAll('[data-scribe-toc-result]').forEach(function (item) {
      var anchorId = item.getAttribute('data-scribe-toc-anchor') || '';
      item.hidden = anchorId.length > 0 && !visibleAnchors[anchorId];
    });
    document.querySelectorAll('[data-scribe-toc-group-container]').forEach(function (group) {
      var visibleItems = Array.from(group.querySelectorAll('[data-scribe-toc-result]')).some(function (item) {
        return !item.hidden;
      });
      group.hidden = !visibleItems;
    });
    var count = byId('report-result-count');
    if (count) count.textContent = visibleResultText(pageStart, pageEnd, total, pageSize);
    updatePagination(total, pageSize, pageCount);
    hydrateLocalizedNumbers();
    updateSeverityShortcutState(readFilter('filter-severity'));
    updateFilterClearControl();
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
        scheduleApplyFilters(true);
      });
    });
  }

  function attachOverviewFilters() {
    document.querySelectorAll('[data-scribe-overview-filter]').forEach(function (row) {
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      var activate = function () {
        setOverviewFilterState({
          query: row.getAttribute('data-scribe-filter-query') || '',
          severity: row.getAttribute('data-scribe-filter-severity') || '',
          language: row.getAttribute('data-scribe-filter-language') || '',
          classification: row.getAttribute('data-scribe-filter-classification') || ''
        });
        scheduleApplyFilters(true);
      };
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      });
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
    if (!findingTargetFromFragment(normalizedFragment)) {
      var missingAnchorId = fragmentIdFromHref(normalizedFragment);
      ensureFindingChunkForAnchor(missingAnchorId, function (loaded) {
        if (!loaded || !findingTargetFromFragment(normalizedFragment)) return;
        history.replaceState(null, '', normalizedFragment);
        ensureFindingTargetOpen();
        scheduleApplyFilters(false);
      });
      return true;
    }
    history.replaceState(null, '', normalizedFragment);
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
    var ancestor = target.parentElement;
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
      focusNavigationTarget(target);
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

  function ensureFindingTargetOpen() {
    var target = findingTargetFromHash();
    if (!target) {
      var anchorId = fragmentIdFromHref(window.location.hash);
      if (!anchorId) return;
      ensureFindingChunkForAnchor(anchorId, function (loaded) {
        if (loaded) ensureFindingTargetOpen();
      });
      return;
    }
    var details = findingDetailsForTarget(target);
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
    }
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
  }

  function createChunkedFindingPermalink(anchorId, label) {
    var link = document.createElement('a');
    link.className = 'scribe-finding-heading-permalink';
    link.href = '#' + anchorId;
    link.setAttribute('data-share-anchor', anchorId);
    link.setAttribute('data-scribe-permalink', '#' + anchorId);
    link.setAttribute('data-scribe-label-msgid', chunkedFindingLabels.findingPermalink.msgid);
    link.setAttribute('title', label);
    link.setAttribute('aria-label', label);
    link.textContent = '#';
    return link;
  }

  function createChunkedFindingActions(summary) {
    var actions = document.createElement('div');
    actions.className = 'finding-action-icons scribe-finding-action-icons';
    var shareLabel = localizedText(chunkedFindingLabels.shareFinding.msgid, chunkedFindingLabels.shareFinding.defaultText);
    var share = document.createElement('a');
    share.className = 'finding-link-btn scribe-finding-permalink';
    share.href = '#' + summary.anchorId;
    share.setAttribute('data-share-anchor', summary.anchorId);
    share.setAttribute('data-scribe-permalink', '#' + summary.anchorId);
    share.setAttribute('data-scribe-label-msgid', chunkedFindingLabels.shareFinding.msgid);
    share.setAttribute('title', shareLabel);
    share.setAttribute('aria-label', shareLabel);
    share.setAttribute('aria-live', 'polite');
    share.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n          <path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"></path>\n          <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"></path>\n        </svg>";
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
      feedback.innerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">\n          <path d=\"M3 11l18-5v14L3 15v-4z\"></path>\n          <path d=\"M3 11v4\"></path>\n          <path d=\"M6 15v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3.5\"></path>\n        </svg>";
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
    return placeholder;
  }

  function createChunkedFindingCard(summary) {
    var details = document.createElement('details');
    details.id = summary.anchorId;
    details.className = 'finding-item scribe-finding-details severity-' + summary.severity;
    details.setAttribute('data-scribe-anchor', summary.anchorId);
    details.setAttribute('data-scribe-result', '');
    details.setAttribute('data-severity', summary.severity || '');
    details.setAttribute('data-language', summary.language || '');
    details.setAttribute('data-classification', summary.classification || '');
    details.setAttribute('data-scribe-chunked-finding', 'true');

    var summaryElement = document.createElement('summary');
    summaryElement.className = 'scribe-finding-summary';
    var toggle = document.createElement('span');
    toggle.className = 'scribe-finding-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\" aria-hidden=\"true\">\n          <path d=\"m6 9 6 6 6-6\"></path>\n        </svg>";
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

    if (summary.sourceSnippetIds && summary.sourceSnippetIds.length > 0) {
      var source = document.createElement('section');
      source.className = 'source-evidence';
      source.id = 'source-' + summary.anchorId;
      source.setAttribute('data-scribe-anchor', source.id);
      var sourceTitle = document.createElement('h3');
      sourceTitle.textContent = localizedText(
        chunkedFindingLabels.sourceSnippetTitle.msgid,
        chunkedFindingLabels.sourceSnippetTitle.defaultText
      );
      sourceTitle.setAttribute('data-scribe-msgid', chunkedFindingLabels.sourceSnippetTitle.msgid);
      source.appendChild(sourceTitle);
      source.appendChild(createChunkedSourceSnippetPlaceholder(summary.sourceSnippetIds[0]));
      body.appendChild(source);
    }

    details.appendChild(body);
    details.addEventListener('toggle', function () {
      if (details.open) hydrateDeferredSourceSnippets(details);
    });
    return details;
  }

  function enrichChunkedSourceSnippetPlaceholders() {
    if (!sourceSnippetDataReady()) return;
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

  function renderFindingChunk(chunkIndex) {
    if (findingChunkRendered[chunkIndex]) return;
    var payload = findingChunkPayload(chunkIndex);
    var container = chunkedFindingContainer();
    if (!Array.isArray(payload) || !container) return;
    payload.forEach(function (summary) {
      if (!summary || !summary.anchorId || byId(summary.anchorId)) return;
      container.appendChild(createChunkedFindingCard(summary));
    });
    findingChunkRendered[chunkIndex] = true;
    reportResultTextCache = typeof WeakMap === 'function' ? new WeakMap() : null;
    setChunkedFindingStatus('', true);
    attachFindingPermalinks();
    attachSourceSnippetActions(container);
    attachDisplayArtifactActions(container);
    if (sourceSnippetDataReady()) {
      enrichChunkedSourceSnippetPlaceholders();
    } else {
      ensureSourceSnippetData(enrichChunkedSourceSnippetPlaceholders);
    }
  }

  function ensureFindingChunk(chunkIndex, callback) {
    ensureFindingChunkIndex(function () {
      if (!findingChunkIndexReady()) {
        callback();
        return;
      }
      if (findingChunkRendered[chunkIndex]) {
        callback();
        return;
      }
      if (findingChunkPayload(chunkIndex)) {
        renderFindingChunk(chunkIndex);
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
      findingChunkCallbacks[chunkIndex].push(function () {
        renderFindingChunk(chunkIndex);
        callback();
      });
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

  function ensureFindingChunkForAnchor(anchorId, callback) {
    ensureFindingChunkIndex(function () {
      var index = window.__SCRIBE_FINDINGS_INDEX__;
      var chunkIndex = index && index.anchorToChunk ? index.anchorToChunk[anchorId] : undefined;
      if (chunkIndex === undefined || chunkIndex === null) {
        callback(false);
        return;
      }
      ensureFindingChunk(chunkIndex, function () {
        callback(true);
      });
    });
  }

  function materializeFindingChunks(chunkIndexes, callback) {
    if (!chunkIndexes.length) {
      callback();
      return;
    }
    var remaining = chunkIndexes.length;
    chunkIndexes.forEach(function (chunkIndex) {
      ensureFindingChunk(chunkIndex, function () {
        remaining -= 1;
        if (remaining === 0) callback();
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
      ensureFindingChunk(0, callback);
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

  function ensureFindingsForCurrentFilterPass(callback) {
    if (!reportUsesChunkedFindings()) {
      callback();
      return;
    }
    if (pdfPrintFrameActive || document.body.hasAttribute('data-scribe-printing')) {
      materializeAllFindingChunks(callback);
      return;
    }
    if (hasActiveReportFilters() || reportCurrentPage > 1 || readPageSize() === Infinity) {
      materializeAllFindingChunks(callback);
      return;
    }
    materializeInitialFindingChunk(callback);
  }

  function materializeCompleteReportForPrint(callback) {
    if (!reportUsesChunkedFindings()) {
      callback();
      return;
    }
    materializeAllFindingChunks(function () {
      window.__SCRIBE_COMPLETE_EXPORT_FINDING_COUNT__ = document.querySelectorAll('[data-scribe-result]').length;
      ensureSourceSnippetData(function () {
        hydrateDeferredSourceSnippets(document);
        window.setTimeout(callback, 0);
      });
    });
  }

  function appendSourceCodeLines(code, text, startLine) {
    String(text || '').split('\n').forEach(function (line, index, lines) {
      var span = document.createElement('span');
      span.className = 'sonde-syntax-line';
      span.setAttribute('data-line', String(startLine + index));
      span.textContent = line.length > 0 ? line : ' ';
      code.appendChild(span);
      if (index < lines.length - 1) code.appendChild(document.createTextNode('\n'));
    });
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
    if (snippet.vcsPermalink) {
      var link = document.createElement('a');
      link.className = 'finding-link-btn scribe-source-action scribe-source-action--icon';
      link.href = snippet.vcsPermalink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('data-scribe-source-permalink', '');
      var linkLabel = placeholder.getAttribute('data-scribe-source-permalink-label') || 'Open source';
      link.setAttribute('aria-label', linkLabel);
      link.setAttribute('title', linkLabel);
      link.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\">\n          <path d=\"M15 3h6v6\"></path>\n          <path d=\"M10 14 21 3\"></path>\n          <path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>\n        </svg>";
      captionMain.appendChild(link);
    }
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
    toggle.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\" aria-hidden=\"true\">\n          <path d=\"m6 9 6 6 6-6\"></path>\n        </svg>";
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
    fullscreen.setAttribute('aria-controls', regionId);
    var fullscreenLabel = figure.getAttribute('data-scribe-source-fullscreen-label') || 'Full screen snippet';
    fullscreen.setAttribute('aria-label', fullscreenLabel);
    fullscreen.setAttribute('title', fullscreenLabel);
    fullscreen.innerHTML = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\">\n          <path d=\"M8 3H3v5\"></path>\n          <path d=\"M16 3h5v5\"></path>\n          <path d=\"M8 21H3v-5\"></path>\n          <path d=\"M16 21h5v-5\"></path>\n        </svg>";
    region.appendChild(fullscreen);
    var pre = document.createElement('pre');
    pre.className = 'sl-code-block';
    pre.tabIndex = 0;
    pre.setAttribute('data-language', snippet.language);
    pre.setAttribute('data-start-line', String(snippet.startLine));
    var code = document.createElement('code');
    appendSourceCodeLines(code, snippet.code, snippet.startLine);
    pre.appendChild(code);
    region.appendChild(pre);
    figure.appendChild(caption);
    figure.appendChild(region);
    return figure;
  }

  function hydrateDeferredSourceSnippets(root) {
    if (!root || !root.querySelectorAll) return;
    var placeholders = Array.from(root.querySelectorAll('[data-scribe-deferred-source-snippet]:not([data-scribe-source-hydrated])'));
    if (root.matches && root.matches('[data-scribe-deferred-source-snippet]:not([data-scribe-source-hydrated])')) {
      placeholders.unshift(root);
    }
    if (placeholders.length === 0) return;
    ensureSourceSnippetData(function () {
      placeholders.forEach(function (placeholder) {
        var snippetId = placeholder.getAttribute('data-scribe-deferred-source-snippet') || '';
        var snippet = sourceSnippetById(snippetId);
        if (!snippet || placeholder.getAttribute('data-scribe-source-hydrated') === 'true') return;
        placeholder.setAttribute('data-scribe-source-hydrated', 'true');
        if (placeholder.parentNode) {
          var figure = createSourceSnippetFigure(snippet, placeholder);
          placeholder.parentNode.replaceChild(figure, placeholder);
          attachSourceSnippetActions(figure);
        }
      });
    });
  }

  function attachDeferredSourceSnippetHydration() {
    document
      .querySelectorAll('details.scribe-finding-details:not([data-scribe-deferred-source-bound])')
      .forEach(function (details) {
      details.setAttribute('data-scribe-deferred-source-bound', 'true');
      details.addEventListener('toggle', function () {
        if (details.open) hydrateDeferredSourceSnippets(details);
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

  function ensureSourceSnippetDialog() {
    var existing = byId('scribe-source-fullscreen-dialog');
    if (existing) return existing;
    var dialog = document.createElement('dialog');
    dialog.id = 'scribe-source-fullscreen-dialog';
    dialog.className = 'scribe-source-dialog';
    dialog.innerHTML =
      '<form method="dialog" class="scribe-source-dialog__chrome">' +
      '<strong data-scribe-source-dialog-title></strong>' +
      '<button type="submit" class="scribe-source-action" data-scribe-source-dialog-close>Close</button>' +
      '</form>' +
      '<div class="scribe-source-dialog__body" data-scribe-source-dialog-body></div>';
    document.body.appendChild(dialog);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    return dialog;
  }

  function openSourceSnippetFullscreen(figure) {
    var dialog = ensureSourceSnippetDialog();
    var title = dialog.querySelector('[data-scribe-source-dialog-title]');
    var body = dialog.querySelector('[data-scribe-source-dialog-body]');
    var close = dialog.querySelector('[data-scribe-source-dialog-close]');
    var caption = figure.querySelector('.scribe-source-caption-text');
    var region = figure.querySelector('[data-scribe-source-code-region]');
    if (title) title.textContent = caption ? caption.textContent || '' : figure.getAttribute('data-source-path') || '';
    if (close) close.textContent = figure.getAttribute('data-scribe-source-close-fullscreen-label') || 'Close';
    if (body) {
      body.textContent = '';
      if (region) {
        var clone = region.cloneNode(true);
        if (clone.removeAttribute) clone.removeAttribute('id');
        var nestedFullscreen = clone.querySelector ? clone.querySelector('[data-scribe-source-fullscreen]') : null;
        if (nestedFullscreen && nestedFullscreen.parentNode) {
          nestedFullscreen.parentNode.removeChild(nestedFullscreen);
        }
        body.appendChild(clone);
      }
    }
    if (dialog.showModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function attachSourceSnippetActions(root) {
    var scope = root && root.querySelectorAll ? root : document;
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
    dialog.className = 'scribe-display-artifact-dialog';
    dialog.innerHTML =
      '<form method="dialog" class="scribe-display-artifact-dialog__chrome">' +
      '<strong data-scribe-artifact-dialog-title></strong>' +
      '<button type="submit" class="scribe-source-action" data-scribe-artifact-dialog-close>Close</button>' +
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
    if (close) close.textContent = artifact.getAttribute('data-scribe-artifact-close-fullscreen-label') || 'Close';
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
    document.querySelectorAll('[data-scribe-permalink]:not([data-scribe-permalink-bound])').forEach(function (link) {
      link.setAttribute('data-scribe-permalink-bound', 'true');
      link.addEventListener('click', function (event) {
        stopPermalinkActivation(event);
        var fragment = link.getAttribute('data-scribe-permalink') || link.getAttribute('href') || '';
        if (!fragment) return;
        if (!activateAnchorFragment(fragment)) return;
        copyText(window.location.href);
        if (link.hasAttribute('data-share-anchor')) recordShare(fragmentIdFromHref(fragment));
        link.classList.add('is-copied');
        window.setTimeout(function () {
          link.classList.remove('is-copied');
        }, 1600);
      });
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
      if (matches) visible += 1;
    });
    setSearchSuggestionsOpen(document.activeElement === input && visible > 0);
  }

  function attachSearchSuggestions() {
    var input = searchInput();
    var list = searchSuggestionList();
    if (!input || !list) return;
    input.addEventListener('focus', syncSearchSuggestions);
    input.addEventListener('input', syncSearchSuggestions);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setSearchSuggestionsOpen(false);
    });
    list.querySelectorAll('[data-search-suggestion]').forEach(function (button) {
      button.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-search-suggestion') || '';
        scheduleApplyFilters(true);
        setSearchSuggestionsOpen(false);
        input.focus();
      });
    });
    document.addEventListener('click', function (event) {
      if (input.contains(event.target) || list.contains(event.target)) return;
      setSearchSuggestionsOpen(false);
    });
  }

  var sidebarStorageKey = 'sonde-scribe-report-sidebar-width';
  var sidebarCollapsedStorageKey = 'sonde-scribe-report-sidebar-collapsed';

  function sidebarLayout() {
    return document.querySelector('[data-scribe-report-layout]');
  }

  function reportSidebar() {
    return document.querySelector('[data-scribe-report-sidebar]');
  }

  function sidebarToggleButton() {
    return document.querySelector('[data-scribe-sidebar-toggle]');
  }

  function isSidebarCollapsed() {
    var sidebar = reportSidebar();
    return Boolean(sidebar && sidebar.getAttribute('data-sidebar-collapsed') === 'true');
  }

  function localizedSidebarToggleLabel(msgid, fallback) {
    var bundle = localeBundle(currentLocale() || document.documentElement.lang);
    var entry = bundle && msgid ? bundle.messages[msgid] : undefined;
    return entry && entry.text ? entry.text : fallback;
  }

  function updateSidebarToggleLabel(collapsed) {
    var button = sidebarToggleButton();
    if (!button) return;
    var msgid = collapsed
      ? button.getAttribute('data-collapsed-label-msgid')
      : button.getAttribute('data-expanded-label-msgid');
    var label = localizedSidebarToggleLabel(msgid || '', collapsed ? 'Expand contents' : 'Collapse contents');
    button.setAttribute('aria-expanded', String(!collapsed));
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  function setSidebarCollapsed(collapsed) {
    var layout = sidebarLayout();
    var sidebar = reportSidebar();
    var panel = byId('scribe-report-toc-panel');
    if (!layout || !sidebar) return;
    if (collapsed) {
      storeSidebarWidth(sidebar.getBoundingClientRect().width);
      layout.setAttribute('data-sidebar-collapsed', 'true');
      sidebar.setAttribute('data-sidebar-collapsed', 'true');
    } else {
      layout.removeAttribute('data-sidebar-collapsed');
      sidebar.removeAttribute('data-sidebar-collapsed');
      restoreSidebarWidth();
    }
    if (panel) panel.hidden = collapsed;
    updateSidebarToggleLabel(collapsed);
    try {
      if (window.localStorage) window.localStorage.setItem(sidebarCollapsedStorageKey, collapsed ? 'true' : 'false');
    } catch (_error) {
      return;
    }
  }

  function restoreSidebarCollapsed() {
    try {
      var stored = window.localStorage ? window.localStorage.getItem(sidebarCollapsedStorageKey) : null;
      setSidebarCollapsed(stored === 'true');
    } catch (_error) {
      setSidebarCollapsed(false);
    }
  }

  function clampSidebarWidth(width) {
    return Math.max(224, Math.min(520, width));
  }

  function storeSidebarWidth(width) {
    try {
      if (window.localStorage) window.localStorage.setItem(sidebarStorageKey, String(clampSidebarWidth(width)));
    } catch (_error) {
      return;
    }
  }

  function setSidebarWidth(width) {
    var layout = sidebarLayout();
    if (!layout) return;
    var nextWidth = clampSidebarWidth(width);
    layout.style.setProperty('--scribe-sidebar-width', String(nextWidth) + 'px');
    storeSidebarWidth(nextWidth);
  }

  function restoreSidebarWidth() {
    try {
      var storedWidth = window.localStorage ? Number.parseInt(window.localStorage.getItem(sidebarStorageKey) || '', 10) : NaN;
      if (Number.isFinite(storedWidth)) setSidebarWidth(storedWidth);
    } catch (_error) {
      return;
    }
  }

  function attachSidebarResize() {
    var sidebar = reportSidebar();
    var resizer = document.querySelector('[data-scribe-sidebar-resizer]');
    if (!sidebar || !resizer) return;
    restoreSidebarWidth();
    var startX = 0;
    var startWidth = 0;
    function onPointerMove(event) {
      setSidebarWidth(startWidth + event.clientX - startX);
    }
    function onPointerUp() {
      sidebar.removeAttribute('data-resizing');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }
    resizer.addEventListener('pointerdown', function (event) {
      startX = event.clientX;
      startWidth = sidebar.getBoundingClientRect().width;
      sidebar.setAttribute('data-resizing', 'true');
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      event.preventDefault();
    });
    resizer.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var direction = event.key === 'ArrowLeft' ? -1 : 1;
      setSidebarWidth(sidebar.getBoundingClientRect().width + direction * 24);
      event.preventDefault();
    });
  }

  function attachSidebarCollapse() {
    var button = sidebarToggleButton();
    if (!button) return;
    restoreSidebarCollapsed();
    button.addEventListener('click', function () {
      setSidebarCollapsed(!isSidebarCollapsed());
    });
  }

  var reportPrintState = null;

  function prepareReportForPrint() {
    if (reportPrintState) return;
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
      hiddenState: hiddenState
    };
    document.body.setAttribute('data-scribe-printing', 'true');
    applyFiltersNow();
  }

  function restoreReportAfterPrint() {
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
    document.body.removeAttribute('data-scribe-printing');
    reportPrintState = null;
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
    iframe.src = printUrl.toString();
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
    window.addEventListener('afterprint', restoreReportAfterPrint);
    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'sonde-scribe-paged') return;
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
        materializeCompleteReportForPrint(function () {
          prepareReportForPrint();
          if (typeof window.print === 'function') window.print();
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
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (list.hidden) openMenu();
      else closeMenu();
    });
    list.querySelectorAll('[role="menuitem"]').forEach(function (item) {
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
    restoreReportTheme();
    var printTheme = pdfPrintFrameActive ? requestedPrintThemeId() : null;
    if (printTheme) applyReportTheme(printTheme);
    restoreReportMode();
    var printMode = pdfPrintFrameActive ? requestedPrintMode() : null;
    if (printMode) applyReportMode(printMode);
    restoreSettingsSectionState();
    ensureLanguageSearch();
    var storedLocaleId = storedLocale() || '';
    var queryLocale = requestedLocale();
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
      (pdfPrintFrameActive ? null : queryLocale) ||
      explicitDocumentLocale ||
      (localeBundle(storedLocaleId) ? storedLocaleId : null) ||
      preferredLocale ||
      completeDocumentLocale ||
      supportedDocumentLocale ||
      manifestLocale ||
      documentLocale;
    updateText(initialLocale, queryLocale && !pdfPrintFrameActive ? true : false);
    if (queryLocale && !pdfPrintFrameActive) clearTransientQueryParam('scribe_locale');
    attachOverviewSeverityShortcuts();
    attachOverviewFilters();
    restoreRequestedPrintFilters();
    applyFilters();
    restoreNistCoverageControls();
    if (pdfPrintFrameActive) {
      bootPdfPrintFrame();
      return;
    }
    attachSearchSuggestions();
    attachFindingPermalinks();
    attachDeferredSourceSnippetHydration();
    attachSourceSnippetActions(document);
    attachDisplayArtifactActions(document);
    attachSidebarResize();
    attachSidebarCollapse();
    attachPrintActions();
    attachNistCoverageControls();
    ensureFindingTargetOpen();
    applyReaderView(readFilter('report-reader-view') || document.body.getAttribute('data-reader-view') || "developer");
    document.querySelectorAll('[data-scribe-filter]').forEach(function (input) {
      input.addEventListener('input', function () { scheduleApplyFilters(true); });
      input.addEventListener('change', function () { scheduleApplyFilters(true); });
    });
    document.querySelectorAll('[data-scribe-clear-filters]').forEach(function (button) {
      button.addEventListener('click', function () {
        clearReportFilters();
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
      var link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;
      window.setTimeout(ensureFindingTargetOpen, 0);
    });
    ensureFindingTargetOpen();
  });
  window.addEventListener('hashchange', ensureFindingTargetOpen);
})();
