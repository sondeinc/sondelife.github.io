(function () {
  var ENDPOINT = "/api/video-event";
  var ATTRIBUTE = "data-sonde-video-id";
  var TRACKED = 'data-sonde-video-tracked';
  var ID_PATTERN = new RegExp("^[a-z0-9-]{1,40}$");
  var PROGRESS = [25,50,75];
  function send(video, milestone) {
    var body = JSON.stringify({ video: video, milestone: milestone });
    try {
      if (typeof navigator.sendBeacon === 'function' &&
          navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    } catch (e) { /* fall back to fetch */ }
    try {
      fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, credentials: 'omit' }).catch(function () {});
    } catch (e) { /* nothing to report to */ }
  }
  function track(video) {
    var id = video.getAttribute(ATTRIBUTE);
    if (!id || !ID_PATTERN.test(id) || video.hasAttribute(TRACKED)) return;
    video.setAttribute(TRACKED, '');
    if (!video.paused || video.currentTime > 0) return;
    var sent = {};
    function once(milestone) {
      if (sent[milestone]) return;
      sent[milestone] = true;
      send(id, milestone);
    }
    video.addEventListener('play', function () { once('start'); });
    function progress() {
      var duration = video.duration;
      if (!sent.start || !(duration > 0) || !isFinite(duration)) return;
      var percent = (video.currentTime / duration) * 100;
      for (var i = 0; i < PROGRESS.length; i++) {
        if (percent >= PROGRESS[i]) once(String(PROGRESS[i]));
      }
      if (sent[String(PROGRESS[PROGRESS.length - 1])]) video.removeEventListener('timeupdate', progress);
    }
    video.addEventListener('timeupdate', progress);
    video.addEventListener('ended', function () {
      if (sent.start) once('complete');
    });
  }
  function attach() {
    var videos = document.querySelectorAll('video[' + ATTRIBUTE + ']');
    for (var i = 0; i < videos.length; i++) track(videos[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
