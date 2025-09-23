(function(){
  var root = document.getElementById('videos-list');
  if(!root) return;
  var filtersWrap = document.getElementById('video-filters');
  var isEN = location.pathname.indexOf('/en/')===0;
  var isJA = location.pathname.indexOf('/ja/')===0;

  var TAGS = [
    {key:'Endgame', labelEN:'Endgame', labelZH:'终局', labelJA:'エンドゲーム'},
    {key:'Leveling', labelEN:'Leveling', labelZH:'升级', labelJA:'レベリング'},
    {key:'Boss', labelEN:'Boss', labelZH:'Boss', labelJA:'ボス'},
    {key:'Beginner', labelEN:'Beginner', labelZH:'新手', labelJA:'初心者'},
    {key:'Guide', labelEN:'Guide', labelZH:'攻略', labelJA:'ガイド'},
    {key:'Skill Trees', labelEN:'Skill Trees', labelZH:'技能树', labelJA:'スキルツリー'},
    {key:'Vex', labelEN:'Vex', labelZH:'Vex', labelJA:'Vex'},
    {key:'Rafa', labelEN:'Rafa', labelZH:'Rafa', labelJA:'Rafa'}
  ];

  var selected = new Set();

  function renderFilters(){
    if(!filtersWrap) return;
    var html = '<div class="filter-actions">'
      + '<span class="vf-count" id="vf-count">'+(isEN?'Loading...':(isJA?'読み込み中...':'加载中...'))+'</span>'
      + '</div>'
      + '<div class="filter-tags">'
      + TAGS.map(function(t){
          var label = isEN? t.labelEN : (isJA? t.labelJA : t.labelZH);
          var id = 'vf_'+t.key.replace(/\s+/g,'_');
          return '<label class="filter-tag" for="'+id+'">'
               +   '<input type="checkbox" id="'+id+'" data-key="'+t.key+'">'
               +   '<span>'+label+'</span>'
               + '</label>';
        }).join('')
      + '</div>';
    filtersWrap.innerHTML = html;
    filtersWrap.addEventListener('change', function(e){
      var el = e.target;
      if(el && el.matches('input[type=checkbox][data-key]')){
        var k = el.getAttribute('data-key');
        if(el.checked) selected.add(k); else selected.delete(k);
        apply();
      }
    });
  }

  var allVideos = [];

  // Lightweight enrichment via YouTube oEmbed (no API key)
  var YT_CACHE_TTL = 24*60*60*1000; // 24h
  function getCache(id){
    try{
      var raw = localStorage.getItem('yt_oe_'+id);
      if(!raw) return null;
      var obj = JSON.parse(raw);
      if(!obj || !obj.exp || obj.exp < Date.now()) { localStorage.removeItem('yt_oe_'+id); return null; }
      return obj.data;
    }catch(e){ return null; }
  }
  function setCache(id, data){
    try{ localStorage.setItem('yt_oe_'+id, JSON.stringify({exp: Date.now()+YT_CACHE_TTL, data: data})); }catch(e){}
  }
  function fetchOEmbed(id){
    var url = 'https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id);
    return fetch(url, {mode:'cors'}).then(function(r){ if(!r.ok) throw new Error('oembed '+r.status); return r.json();})
      .then(function(j){ return { title: j.title, author: j.author_name, thumbnail: j.thumbnail_url }; });
  }
  function enrichOne(v){
    var id = v && v.id; if(!id) return Promise.resolve();
    var cached = getCache(id);
    if(cached){ v._oe = cached; return Promise.resolve(); }
    return fetchOEmbed(id).then(function(data){ v._oe = data; setCache(id, data); }).catch(function(){ /* ignore */ });
  }
  function enrichMany(videos){
    // limit concurrency
    var idx = 0, active = 0, max = 6;
    return new Promise(function(resolve){
      function next(){
        if(idx >= videos.length && active===0) return resolve();
        while(active < max && idx < videos.length){
          var v = videos[idx++]; active++;
          enrichOne(v).finally(function(){ active--; if(active===0) apply(); next(); });
        }
      }
      next();
    });
  }

  function render(list){
    if(!list.length){
      root.innerHTML = '<div class="no-results">'+(isEN?'No videos match current filters.':(isJA?'該当する動画はありません。':'没有匹配当前筛选的视频。'))+'</div>';
      return;
    }
    var cards = list.map(function(v){
      var id = v.id || '';
      var oe = v._oe || {};
      var titleBase = oe.title || v.title || 'BL4 video';
      var title = titleBase.length > 120 ? titleBase.slice(0,117)+'...' : titleBase;
      var thumb = oe.thumbnail || ('https://i.ytimg.com/vi/'+id+'/hqdefault.jpg');
      var thumbMQ = 'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg';
      var thumbD  = 'https://i.ytimg.com/vi/'+id+'/default.jpg';
      var href = 'https://www.youtube.com/watch?v='+id;
      var isNew = (v && (v.new === true || (function(){
        var d = v.published; if(!d) return false; var dt = new Date(d); if(isNaN(dt)) return false; return (Date.now() - dt.getTime()) <= 2*24*60*60*1000;
      })()));
      var channel = oe.author || v.channel || '';
      return '<a class="video-thumb" href="'+href+'" target="_blank" rel="noopener" style="position:relative">'
           +   (isNew? '<span class="badge-new" style="position:absolute;top:6px;left:6px;z-index:2;background:#e91e63;color:#fff;border-radius:4px;padding:2px 6px;font-size:12px;line-height:1;">NEW</span>' : '')
           +   '<img src="'+thumb+'" alt="'+title.replace(/"/g, '&quot;')+'" loading="lazy" decoding="async" width="480" height="270" data-step="1" onerror="if(this.dataset.step==='1'){this.src=\''+thumbMQ+'\';this.dataset.step='2';}else if(this.dataset.step==='2'){this.src=\''+thumbD+'\';this.dataset.step='3';}else{this.src='/assets/img/logo-neon.svg';this.onerror=null;}">'
           +   '<span class="caption">'+title+(channel?'<br><span class="caption-sub" style="opacity:.8;font-size:12px;">'+channel+'</span>':'')+'</span>'
           + '</a>';
    }).join('');
    root.innerHTML = '<div class="tag-videos-grid">'+cards+'</div>';
  }

  function apply(){
    var list = allVideos;
    if(selected.size){
      list = list.filter(function(v){
        var tags = Array.isArray(v.tags)? v.tags : [];
        for(var t of selected){ if(tags.indexOf(t)!==-1) return true; }
        return false;
      });
    }
    var countEl = document.getElementById('vf-count');
    if(countEl){ countEl.textContent = (isEN?'Videos: ':(isJA?'動画：':'视频：')) + list.length; }
    render(list);
  }

  renderFilters();

  fetch('/assets/data/videos.json', {cache:'no-store'})
    .then(function(r){ return r.json();})
    .then(function(items){
      allVideos = Array.isArray(items)? items.slice() : [];
      allVideos.sort(function(a,b){ return String(b.published||'').localeCompare(String(a.published||'')); });
      apply();
      // Enrich titles/channel/thumbnail via oEmbed in background (no API key)
      enrichMany(allVideos).catch(function(){ /* ignore */ });
    })
    .catch(function(){
      var countEl = document.getElementById('vf-count');
      if(countEl){ countEl.textContent = isEN? 'Failed to load videos' : (isJA? '動画の読み込みに失敗しました' : '视频加载失败'); }
    });
})();

