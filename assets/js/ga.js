// Google Analytics 4 initialization for BL4Builds.net
// ID: G-KE5S4B65Y7
(function(){
  try {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());

    var p = location && location.pathname ? location.pathname : '';
    var isRoot = (p === '/' || p === '/index.html');

    // On root we avoid auto page_view to prevent double counting during immediate redirect.
    var cfg = { anonymize_ip: true };
    if (isRoot) cfg.send_page_view = false;

    gtag('config', 'G-KE5S4B65Y7', cfg);
  } catch (e) { /* no-op */ }
})();

