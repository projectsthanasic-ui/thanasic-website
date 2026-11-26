// Google Analytics 4 for the Thanasic site (G-J3SK9C4TH3).
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-J3SK9C4TH3';
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', 'G-J3SK9C4TH3');
  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var eventName = null;
    if (/^tel:/i.test(href)) {
      eventName = 'phone_click';
    } else if (/^(https?:\/\/(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com))/i.test(href) || /^whatsapp:/i.test(href)) {
      eventName = 'whatsapp_click';
    }
    if (eventName) {
      gtag('event', eventName, {
        link_url: href,
        link_text: (link.innerText || link.getAttribute('aria-label') || '').trim().slice(0, 100),
        page_path: window.location.pathname
      });
    }
  }, true);
})();
