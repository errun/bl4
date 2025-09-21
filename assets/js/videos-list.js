(function(){
  var root = document.getElementById('videos-list');
  if(!root) return;
  var filtersWrap = document.getElementById('video-filters');
  var isEN = location.pathname.indexOf('/en/')===0;

  var TAGS = [
    {key:'Endgame', labelEN:'Endgame', labelZH:'终局'},
    {key:'Leveling', labelEN:'Leveling', labelZH:'升级'},
    {key:'Boss', labelEN:'Boss', labelZH:'Boss'},
    {key:'Beginner', labelEN:'Beginner', labelZH:'新手'},
    {key:'Guide', labelEN:'Guide', labelZH:'攻略'},
    {key:'Skill Trees', labelEN:'Skill Trees', labelZH:'技能树'},
    {key:'Vex', labelEN:'Vex', labelZH:'Vex'},
    {key:'Rafa', labelEN:'Rafa', labelZH:'Rafa'}
  ];

  var selected = new Set();

  function renderFilters(){
    if(!filtersWrap) return;
    var html = '<div class="filter-actions">'
      + '<span class="vf-count" id="vf-count">'+(isEN?'Loading...':'加载中...')+'</span>'
      + '</div>'
      + '<div class="filter-tags">'
      + TAGS.map(function(t){
          var label = isEN? t.labelEN : t.labelZH;
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

  function render(list){
    if(!list.length){
      root.innerHTML = '<div class="no-results">'+(isEN?'No videos match current filters.':'没有匹配当前筛选的视频。')+'</div>';
      return;
    }
    var cards = list.map(function(v){
      var title = v.title || 'BL4 video';
      var id = v.id || '';
      var thumb = 'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
      var href = 'https://www.youtube.com/watch?v='+id;
      var isNew = (v && (v.new === true || (function(){
        var d = v.published; if(!d) return false; var dt = new Date(d); if(isNaN(dt)) return false; return (Date.now() - dt.getTime()) <= 2*24*60*60*1000;
      })()));
      return '<a class="video-thumb" href="'+href+'" target="_blank" rel="noopener" style="position:relative">'
           +   (isNew? '<span class="badge-new" style="position:absolute;top:6px;left:6px;z-index:2;background:#e91e63;color:#fff;border-radius:4px;padding:2px 6px;font-size:12px;line-height:1;">NEW</span>' : '')
           +   '<img src="'+thumb+'" alt="'+title.replace(/"/g, '&quot;')+'" loading="lazy">'
           +   '<span class="caption">'+title+'</span>'
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
    if(countEl){ countEl.textContent = (isEN?'Videos: ':'视频：') + list.length; }
    render(list);
  }

  renderFilters();

  fetch('/assets/data/videos.json', {cache:'no-store'})
    .then(function(r){ return r.json();})
    .then(function(items){
      allVideos = Array.isArray(items)? items.slice() : [];
      allVideos.sort(function(a,b){ return String(b.published||'').localeCompare(String(a.published||'')); });
      apply();
    })
    .catch(function(){
      var countEl = document.getElementById('vf-count');
      if(countEl){ countEl.textContent = isEN? 'Failed to load videos' : '视频加载失败'; }
    });
})();

