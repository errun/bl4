(function(){
  var root = document.getElementById('shift-codes');
  if(!root) return;

  var isEN = location.pathname.indexOf('/en/')===0;
  var isJA = location.pathname.indexOf('/ja/')===0;

  var TEXT = {
    title: isEN? 'Latest SHiFT Codes' : (isJA? '最新のSHiFTコード' : '最新 SHiFT 兑换码'),
    desc: isEN? 'Auto-fetched from IGN (cached locally for 6h). Use at your own risk.'
              : (isJA? 'IGNから自動取得（6時間ローカルキャッシュ）。ご利用は自己責任で。'
                     : '从 IGN 自动抓取（本地缓存6小时），请自行甄别。'),
    btnCopy: isEN? 'Copy' : (isJA? 'コピー' : '复制'),
    copied: isEN? 'Copied!' : (isJA? 'コピーしました' : '已复制！'),
    empty: isEN? 'No codes found right now. Try opening the source page below.'
                : (isJA? '現在コードが見つかりません。下の出典ページを開いてください。'
                       : '当前未找到可用兑换码，请尝试打开下方来源页面。'),
    updated: isEN? 'Updated' : (isJA? '更新' : '已更新'),
    openSrc: isEN? 'Open IGN source page' : (isJA? 'IGNの出典ページを開く' : '打开 IGN 来源页')
  };

  var SRC = 'https://www.ign.com/wikis/borderlands-4/Borderlands_4_SHiFT_Codes';
  var PROXIES = [
    'https://r.jina.ai/http://www.ign.com/wikis/borderlands-4/Borderlands_4_SHiFT_Codes',
    'https://r.jina.ai/https://www.ign.com/wikis/borderlands-4/Borderlands_4_SHiFT_Codes'
  ];

  var CACHE_KEY = 'shift_codes_cache_v1';
  var TTL = 6*60*60*1000; // 6h

  function getCache(){
    try{
      var raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      var obj = JSON.parse(raw);
      if(!obj || !obj.exp || obj.exp < Date.now()) { localStorage.removeItem(CACHE_KEY); return null; }
      return obj.data;
    }catch(e){ return null; }
  }
  function setCache(data){
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({exp: Date.now()+TTL, data:data})); }catch(e){}
  }

  function timeout(p, ms){
    return new Promise(function(resolve, reject){
      var t = setTimeout(function(){ reject(new Error('timeout')); }, ms);
      p.then(function(v){ clearTimeout(t); resolve(v); }, function(e){ clearTimeout(t); reject(e); });
    });
  }

  function fetchText(url){
    return timeout(fetch(url, {mode:'cors'}), 2000).then(function(r){
      if(!r.ok) throw new Error('status '+r.status);
      return r.text();
    });
  }

  function parseCodes(txt){
    if(!txt) return [];
    txt = txt.toUpperCase();
    // Typical patterns like XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (4-5 chars per block)
    var re = /\b([A-Z0-9]{4,5}-){4}[A-Z0-9]{4,5}\b/g;
    var m, set = new Set();
    while((m = re.exec(txt))){ set.add(m[0]); }
    return Array.from(set);
  }

  function render(data){
    var codes = (data && data.codes) || [];
    var updated = (data && data.updated) || new Date().toISOString();

    var html = ''
      + '<div class="sc-head">'
      +   '<h1 class="sc-title">'+TEXT.title+'</h1>'
      +   '<p class="sc-desc">'+TEXT.desc+' — <small>'+TEXT.updated+': '+new Date(updated).toLocaleString()+'</small></p>'
      +   '<p><a href="'+SRC+'" target="_blank" rel="noopener">'+TEXT.openSrc+'</a></p>'
      + '</div>';

    if(!codes.length){
      html += '<div class="sc-empty">'+TEXT.empty+'</div>';
    } else {
      html += '<ul class="sc-list">'
        + codes.map(function(c){
            return '<li class="sc-item">'
              +   '<code class="sc-code">'+c+'</code>'
              +   '<button class="sc-copy" data-code="'+c+'">'+TEXT.btnCopy+'</button>'
              + '</li>';
          }).join('')
        + '</ul>';
    }

    root.innerHTML = html;

    root.addEventListener('click', function(e){
      var btn = e.target.closest('.sc-copy');
      if(!btn) return;
      var code = btn.getAttribute('data-code')||'';
      if(!code) return;
      if(navigator.clipboard){
        navigator.clipboard.writeText(code).then(function(){ btn.textContent = TEXT.copied; setTimeout(function(){ btn.textContent = TEXT.btnCopy; }, 1500); });
      } else {
        try{
          var ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
          btn.textContent = TEXT.copied; setTimeout(function(){ btn.textContent = TEXT.btnCopy; }, 1500);
        }catch(err){}
      }
    });
  }

  // init loading
  render({codes:[], updated: Date.now()});

  var cached = getCache(); if(cached){ render(cached); }

  // Fetch from proxies in order
  (function loadSeq(i){
    if(i>=PROXIES.length){ return; }
    fetchText(PROXIES[i]).then(function(txt){
      var codes = parseCodes(txt);
      var data = { codes: codes, updated: Date.now() };
      setCache(data);
      render(data);
    }).catch(function(){ loadSeq(i+1); });
  })(0);
})();

