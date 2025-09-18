(function(){
  var container = document.getElementById('yt-hot-videos');
  if(!container) return;

  function uniq(arr){
    var m = Object.create(null), out=[];
    for(var i=0;i<arr.length;i++){ var x = String(arr[i]); if(!m[x]){ m[x]=1; out.push(x); } }
    return out;
  }

  fetch('/assets/data/videos.json', {cache:'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(list){
      if(!Array.isArray(list) || list.length===0){
        container.innerHTML = '<p style="opacity:.7">No videos yet</p>';
        return;
      }

      // Collect all unique tags
      var allTags = uniq([].concat.apply([], list.map(function(v){ return v.tags||[]; }))).sort();

      // Build filters + grid skeleton
      var parts = [];
      parts.push(
        '<div class="video-filters">'+
          '<div class="filter-actions">'+
            '<button type="button" class="btn btn-small" id="vf-clear">Clear</button>\n'+
            '<label class="match-toggle"><input type="checkbox" id="vf-any" /> Match any</label>\n'+
            '<span class="vf-count" id="vf-count" aria-live="polite"></span>'+\
          '</div>'+
          '<div class="filter-tags">'+ allTags.map(function(t){
              return '<label class="filter-tag"><input type="checkbox" value="'+t+'"><span>'+t+'</span></label>';
            }).join('') +
          '</div>'+
        '</div>'
      );

      parts.push('<div class="videos-grid" id="vf-grid">');
      list.forEach(function(v){
        var thumb = 'https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg';
        var tagsHtml = (v.tags||[]).map(function(t){return '<span class="tag">'+t+'</span>';}).join('');
        parts.push(
          '<div class="video-card" data-tags="'+(v.tags||[]).join(',')+'">'+
            '<a class="thumb" href="https://www.youtube.com/watch?v='+v.id+'" target="_blank" rel="noopener">'+
              '<img src="'+thumb+'" alt="'+(v.title||'BL4 video')+'" loading="lazy" decoding="async" />'+
              '<div class="yt-play">▶</div>'+
            '</a>'+
            '<div class="video-info">'+
              '<h3 class="video-title">'+(v.title||'')+'</h3>'+
              '<div class="video-tags">'+tagsHtml+'</div>'+
            '</div>'+
          '</div>'
        );
      });
      parts.push('</div>');

      container.innerHTML = parts.join('');

      // Wiring filter logic
      var grid = document.getElementById('vf-grid');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.video-card'));
      var inputs = Array.prototype.slice.call(container.querySelectorAll('.filter-tags input[type=checkbox]'));
      var anyBox = document.getElementById('vf-any');
      var clearBtn = document.getElementById('vf-clear');
      var countEl = document.getElementById('vf-count');

      function currentSelection(){
        return inputs.filter(function(i){ return i.checked; }).map(function(i){ return i.value; });
      }

      function intersect(a,b){
        for(var i=0;i<a.length;i++){ if(b.indexOf(a[i])!==-1) return true; }
        return false;
      }
      function isSubset(a,b){ // a subset of b
        for(var i=0;i<a.length;i++){ if(b.indexOf(a[i])===-1) return false; }
        return true;
      }

      function applyFilter(){
        var sel = currentSelection();
        var modeAny = !!anyBox && anyBox.checked;
        var visible = 0;
        cards.forEach(function(card){
          var tags = (card.getAttribute('data-tags')||'').split(',').filter(Boolean);
          var show = (sel.length===0) ? true : (modeAny ? intersect(sel, tags) : isSubset(sel, tags));
          card.style.display = show ? '' : 'none';
          if(show) visible++;
        });
        if(countEl){ countEl.textContent = visible + ' / ' + cards.length; }
      }

      inputs.forEach(function(i){ i.addEventListener('change', applyFilter); });
      if(anyBox){ anyBox.addEventListener('change', applyFilter); }
      if(clearBtn){ clearBtn.addEventListener('click', function(){ inputs.forEach(function(i){ i.checked=false; }); applyFilter(); }); }

      // Initial
      applyFilter();
    })
    .catch(function(){ container.innerHTML = '<p style="opacity:.7">Failed to load videos</p>'; });
})();

