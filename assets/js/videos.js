(function(){
  var container = document.getElementById('yt-hot-videos');
  if(!container) return;
  fetch('/assets/data/videos.json', {cache:'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(list){
      if(!Array.isArray(list) || list.length===0){
        container.innerHTML = '<p style="opacity:.7">暂无视频</p>';
        return;
      }
      var html = ['<div class="videos-grid">'];
      list.forEach(function(v){
        var thumb = 'https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg';
        var tags = (v.tags||[]).map(function(t){return '<span class="tag">'+t+'</span>';}).join('');
        html.push(
          '<div class="video-card" data-tags="'+(v.tags||[]).join(',')+'">'+
            '<a class="thumb" href="https://www.youtube.com/watch?v='+v.id+'" target="_blank" rel="noopener">'+
              '<img src="'+thumb+'" alt="'+(v.title||'BL4 video')+'" loading="lazy" decoding="async" />'+
              '<div class="yt-play">▶</div>'+
            '</a>'+
            '<div class="video-info">'+
              '<h3 class="video-title">'+(v.title||'')+'</h3>'+
              '<div class="video-tags">'+tags+'</div>'+
            '</div>'+
          '</div>'
        );
      });
      html.push('</div>');
      container.innerHTML = html.join('');
    })
    .catch(function(){ container.innerHTML = '<p style="opacity:.7">加载视频失败</p>'; });
})();

