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
            '<span class="vf-count" id="vf-count" aria-live="polite"></span>'+
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
            '<a class="thumb" href="#" data-yt="'+v.id+'">'+
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

      // Modal player for in-site playback (YouTube no-cookie)
      var modal = document.createElement('div');
      modal.className = 'yt-modal';
      modal.setAttribute('hidden','');
      modal.innerHTML = ''+
        '<div class="yt-modal__backdrop" data-close="1"></div>'+
        '<div class="yt-modal__dialog" role="dialog" aria-modal="true" aria-label="YouTube player">'+
          '<button class="yt-modal__close" type="button" aria-label="Close">×</button>'+
          '<div class="yt-modal__player">'+
            '<iframe id="yt-iframe" src="" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>'+
          '</div>'+
        '</div>';
      document.body.appendChild(modal);
      var iframe = modal.querySelector('#yt-iframe');
      function openModal(id){
        iframe.src = 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
        modal.removeAttribute('hidden');
        document.body.style.overflow='hidden';
      }
      function closeModal(){
        iframe.src = '';
        modal.setAttribute('hidden','');
        document.body.style.overflow='';
      }
      modal.addEventListener('click', function(e){ if(e.target.dataset.close){ closeModal(); } });
      modal.querySelector('.yt-modal__close').addEventListener('click', closeModal);
      document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !modal.hasAttribute('hidden')) closeModal(); });

      // Intercept thumbnail clicks to open modal
      container.addEventListener('click', function(e){
        var a = e.target.closest('a.thumb');
        if(!a || !container.contains(a)) return;
        e.preventDefault();
        var id = a.getAttribute('data-yt');
        if(id) openModal(id);
      });


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

