(function () {
  var labels = {"allLanguages":"All languages","allKinds":"All kinds","allTags":"All tags","previous":"Previous","next":"Next","showing":"Showing","of":"of","modules":"modules"};
  var navSearch = document.getElementById('site-search');
  var rootHref = document.body ? document.body.getAttribute('data-scribe-root-href') || './index.html' : './index.html';

  function redirectSearch(value) {
    var query = value.trim();
    window.location.href = rootHref + '?q=' + encodeURIComponent(query);
  }

  if (navSearch) {
    navSearch.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        redirectSearch(navSearch.value);
      }
    });
  }

  var table = document.querySelector('.scribe-leaderboard');
  if (!table) return;

  var form = document.querySelector('.scribe-leaderboard-controls');
  var body = table.querySelector('tbody');
  var rows = body ? Array.prototype.slice.call(body.querySelectorAll('tr')) : [];
  var search = document.getElementById('scribe-leaderboard-search');
  var language = document.getElementById('scribe-leaderboard-language');
  var kind = document.getElementById('scribe-leaderboard-kind');
  var tag = document.getElementById('scribe-leaderboard-tag');
  var tagInput = document.getElementById('scribe-leaderboard-tag-input');
  var tagList = document.getElementById('scribe-leaderboard-tag-list');
  var pagination = document.querySelector('.scribe-leaderboard-pagination');
  var pageSize = Number(table.getAttribute('data-page-size')) || 25;
  var state = { search: '', language: '', kind: '', tag: '', sortKey: 'rank', sortDir: 'asc', page: 1 };
  var passing = [];
  var debounceTimer = 0;
  var activeTagIndex = -1;
  var tagOptions = tagList ? Array.prototype.slice.call(tagList.querySelectorAll('[role="option"]')) : [];

  function populateSelect(select, values, allLabel) {
    if (!select) return;
    var current = select.value;
    select.textContent = '';
    var all = document.createElement('option');
    all.value = '';
    all.textContent = allLabel;
    select.appendChild(all);
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = values.indexOf(current) >= 0 ? current : '';
  }

  function observedValues(name) {
    var values = [];
    rows.forEach(function (row) {
      var value = row.getAttribute('data-' + name) || '';
      if (name === 'tags') {
        value.split(',').forEach(function (tagValue) {
          if (tagValue && values.indexOf(tagValue) < 0) values.push(tagValue);
        });
      } else if (value && values.indexOf(value) < 0) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) { return a.localeCompare(b); });
  }

  function syncFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    state.search = q;
    if (search) search.value = q;
    if (navSearch) navSearch.value = q;
  }

  function rowMatches(row) {
    var name = row.getAttribute('data-name') || '';
    var tags = row.getAttribute('data-tags') || '';
    if (state.search && name.indexOf(state.search.toLowerCase()) === -1) return false;
    if (state.language && row.getAttribute('data-language') !== state.language) return false;
    if (state.kind && row.getAttribute('data-kind') !== state.kind) return false;
    if (state.tag && tags.split(',').indexOf(state.tag) === -1) return false;
    return true;
  }

  function numericValue(row, key) {
    var raw = row.getAttribute('data-' + key);
    return raw === null || raw === '' ? NaN : Number(raw);
  }

  function compareRows(a, b) {
    var key = state.sortKey;
    var direction = state.sortDir === 'desc' ? -1 : 1;
    if (key === 'module') {
      return (a.getAttribute('data-module') || '').localeCompare(b.getAttribute('data-module') || '') * direction;
    }
    if (key === 'rank') {
      return (Number(a.getAttribute('data-rank')) - Number(b.getAttribute('data-rank'))) * direction;
    }
    var aIncomplete = a.getAttribute('data-incomplete') === '1';
    var bIncomplete = b.getAttribute('data-incomplete') === '1';
    if (aIncomplete !== bIncomplete) return aIncomplete ? 1 : -1;
    var av = numericValue(a, key);
    var bv = numericValue(b, key);
    if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
    if (Number.isNaN(av)) return 1;
    if (Number.isNaN(bv)) return -1;
    return (av - bv) * direction;
  }

  function ensurePagination() {
    if (!pagination || pagination.getAttribute('data-built') === '1') return;
    pagination.setAttribute('data-built', '1');
    pagination.innerHTML = '<button type="button" class="scribe-leaderboard-prev">' + labels.previous + '</button><span class="scribe-leaderboard-page-info" aria-live="polite"></span><button type="button" class="scribe-leaderboard-next">' + labels.next + '</button>';
    pagination.querySelector('.scribe-leaderboard-prev').addEventListener('click', function () {
      if (state.page > 1) {
        state.page -= 1;
        render();
      }
    });
    pagination.querySelector('.scribe-leaderboard-next').addEventListener('click', function () {
      var maxPage = Math.max(1, Math.ceil(passing.length / pageSize));
      if (state.page < maxPage) {
        state.page += 1;
        render();
      }
    });
  }

  function render() {
    window.__scribeRenderCount = (window.__scribeRenderCount || 0) + 1;
    passing = rows.filter(rowMatches).sort(compareRows);
    var maxPage = Math.max(1, Math.ceil(passing.length / pageSize));
    if (state.page > maxPage) state.page = maxPage;
    var start = (state.page - 1) * pageSize;
    var end = start + pageSize;
    var visible = passing.slice(start, end);

    passing.forEach(function (row) {
      if (body) body.appendChild(row);
    });
    rows.forEach(function (row) {
      row.setAttribute('data-filtered', 'true');
    });
    passing.forEach(function (row, index) {
      var rank = row.querySelector('[data-rank-cell]');
      if (rank) rank.textContent = String(index + 1);
    });
    visible.forEach(function (row) {
      row.setAttribute('data-filtered', 'false');
    });

    ensurePagination();
    if (pagination) {
      var info = pagination.querySelector('.scribe-leaderboard-page-info');
      var prev = pagination.querySelector('.scribe-leaderboard-prev');
      var next = pagination.querySelector('.scribe-leaderboard-next');
      pagination.hidden = passing.length <= pageSize;
      if (info) {
        var from = passing.length === 0 ? 0 : start + 1;
        var to = Math.min(end, passing.length);
        info.textContent = labels.showing + ' ' + from + '-' + to + ' ' + labels.of + ' ' + passing.length + ' ' + labels.modules;
      }
      if (prev) prev.disabled = state.page <= 1;
      if (next) next.disabled = state.page >= maxPage;
    }
  }

  function resetAndRender() {
    state.page = 1;
    render();
  }

  function updateTagOptions() {
    if (!tagInput || !tagList) return;
    var filter = tagInput.value.toLowerCase();
    var visible = tagOptions.filter(function (option) {
      var isVisible = !filter || option.textContent.toLowerCase().indexOf(filter) >= 0;
      option.hidden = !isVisible;
      return isVisible;
    });
    tagInput.setAttribute('aria-expanded', String(visible.length > 0));
    activeTagIndex = visible.length > 0 ? 0 : -1;
    tagOptions.forEach(function (option) { option.removeAttribute('aria-selected'); });
    if (activeTagIndex >= 0) {
      visible[activeTagIndex].setAttribute('aria-selected', 'true');
      tagInput.setAttribute('aria-activedescendant', visible[activeTagIndex].id);
    } else {
      tagInput.removeAttribute('aria-activedescendant');
    }
  }

  function chooseTag(value) {
    state.tag = value;
    if (tagInput) tagInput.value = value;
    if (tagList) tagInput.setAttribute('aria-expanded', 'false');
    resetAndRender();
  }

  populateSelect(language, observedValues('language'), labels.allLanguages);
  populateSelect(kind, observedValues('kind'), labels.allKinds);
  populateSelect(tag, observedValues('tags'), labels.allTags);
  syncFromUrl();

  if (form) {
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  }
  if (search) {
    search.addEventListener('input', function () {
      state.search = search.value.trim().toLowerCase();
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(resetAndRender, 120);
    });
  }
  if (language) language.addEventListener('change', function () { state.language = language.value; resetAndRender(); });
  if (kind) kind.addEventListener('change', function () { state.kind = kind.value; resetAndRender(); });
  if (tag) tag.addEventListener('change', function () { state.tag = tag.value; resetAndRender(); });

  if (tagInput && tagList) {
    tagInput.addEventListener('input', updateTagOptions);
    tagInput.addEventListener('keydown', function (event) {
      var visible = tagOptions.filter(function (option) { return !option.hidden; });
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (visible.length === 0) return;
        activeTagIndex = event.key === 'ArrowDown'
          ? Math.min(activeTagIndex + 1, visible.length - 1)
          : Math.max(activeTagIndex - 1, 0);
        tagOptions.forEach(function (option) { option.removeAttribute('aria-selected'); });
        visible[activeTagIndex].setAttribute('aria-selected', 'true');
        tagInput.setAttribute('aria-activedescendant', visible[activeTagIndex].id);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (activeTagIndex >= 0 && visible[activeTagIndex]) chooseTag(visible[activeTagIndex].getAttribute('data-value') || '');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        tagInput.value = '';
        chooseTag('');
        tagInput.setAttribute('aria-expanded', 'false');
      }
    });
    tagOptions.forEach(function (option) {
      option.addEventListener('click', function () { chooseTag(option.getAttribute('data-value') || ''); });
    });
  }

  table.querySelectorAll('th[data-sort-key]').forEach(function (header) {
    header.addEventListener('click', function () {
      var key = header.getAttribute('data-sort-key') || 'rank';
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = key === 'module' ? 'asc' : 'desc';
      }
      resetAndRender();
    });
  });

  render();
})();