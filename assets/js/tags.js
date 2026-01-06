(function(){
  var root = document.getElementById('tag-page');
  if(!root) return;
  var tag = root.getAttribute('data-tag');
  if(!tag){
    // try infer from URL /tags/<slug>.html
    var m = (location.pathname||'').match(/\/(?:en\/)?tags\/([^\/]+)\.html$/);
    tag = m ? decodeURIComponent(m[1]).replace(/-/g,' ') : '';
  }
  tag = (tag||'').trim();
  if(!tag) return;

  var isEN = location.pathname.indexOf('/en/')===0;
  var isJA = location.pathname.indexOf('/ja/')===0;
  var buildsMapEN = {
    'Endgame': [
      {href:'/en/builds/zane-endgame-shock-dps.html', title:'Zane Endgame Shock DPS'}
    ],
    'Leveling': [
      {href:'/en/builds/universal-leveling.html', title:'Universal Leveling Build'}
    ],
    'Boss': [
      {href:'/en/builds/moze-solo-boss.html', title:'Moze Solo Boss'}
    ],
    'Beginner': [
      {href:'/en/builds/amara-starter.html', title:'Amara Starter Guide'}
    ],
    'Guide': [
      {href:'/en/builds/team-support.html', title:'Team Support Guide'}
    ],
    'Skill Trees': [
      {href:'/en/builds/fl4k-pet-master.html', title:'FL4K Pet Master (skills overview)'}
    ],
    // Character tags (if future builds align)
    'Zane': [ {href:'/en/builds/zane-endgame-shock-dps.html', title:'Zane Endgame Shock DPS'} ]
  };
  var buildsMapZH = {
    '终局': [ {href:'/builds/zane-endgame-shock-dps.html', title:'Zane 终局电击 DPS'} ],
    '升级': [ {href:'/builds/universal-leveling.html', title:'通用升级路线'} ],
    'Boss': [ {href:'/builds/moze-solo-boss.html', title:'莫泽 单挑 Boss'} ],
    '新手': [ {href:'/builds/amara-starter.html', title:'阿玛拉 新手向'} ],
    '攻略': [ {href:'/builds/team-support.html', title:'组队支援 攻略'} ],
    '技能树': [ {href:'/builds/fl4k-pet-master.html', title:'FL4K 宠物流（技能概览）'} ],
    'Zane': [ {href:'/builds/zane-endgame-shock-dps.html', title:'Zane 终局电击 DPS'} ]
  };
  var buildsMapJA = {
    'Endgame': [ {href:'/ja/builds/zane-endgame-shock-dps.html', title:'Zane エンドゲーム・ショックDPS'} ],
    'Leveling': [ {href:'/ja/builds/universal-leveling.html', title:'汎用レベリング'} ],
    'Boss': [ {href:'/ja/builds/moze-solo-boss.html', title:'Moze ソロボス特化'} ],
    'Beginner': [ {href:'/ja/builds/amara-starter.html', title:'Amara ビギナー向けスターター'} ],
    'Guide': [ {href:'/ja/builds/team-support.html', title:'チームサポート'} ],
    'Skill Trees': [ {href:'/ja/builds/fl4k-pet-master.html', title:'FL4K ペットマスター'} ],
    'Zane': [ {href:'/ja/builds/zane-endgame-shock-dps.html', title:'Zane エンドゲーム・ショックDPS'} ]
  };

  function h(html){ var d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }

  // Build list
  var buildsWrap = document.getElementById('tag-builds');
  if(buildsWrap){
    var buildTag = root.getAttribute('data-build-tag') || tag;
    var map = isEN ? buildsMapEN : (isJA ? buildsMapJA : buildsMapZH);
    var list = map[buildTag] || [];
    buildsWrap.innerHTML = '';
    if(list.length){
      var ul = h('<ul class="tag-builds-list"></ul>');
      list.forEach(function(b){
        ul.appendChild(h('<li><a href="'+b.href+'">'+b.title+'</a></li>'));
      });
      buildsWrap.appendChild(ul);
    }else{
      buildsWrap.innerHTML = '<p class="text-muted">'+(isEN?'No in-site builds labeled with this tag yet.':(isJA?'このタグのビルドはまだありません。':'暂时没有对应标签的构建。'))+'</p>';
    }
  }

  // Videos list
  var videosWrap = document.getElementById('tag-videos');
  if(videosWrap){
    var fallbackHtml = (videosWrap.innerHTML || '').trim();
    fetch('/assets/data/videos.json',{cache:'no-store'})
      .then(function(r){return r.json();})
      .then(function(list){
        var items = (list||[]).filter(function(v){ return Array.isArray(v.tags) && v.tags.indexOf(tag)!==-1; });
        if(!items.length){
          if(fallbackHtml) return;
          videosWrap.innerHTML = '<p class="text-muted">'+(isEN?'No videos for this tag yet.':(isJA?'このタグの動画はまだありません。':'暂无该标签的视频。'))+'</p>';
          return;
        }
        var html = items.map(function(v){
          var thumb = 'https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg';
          return '<a class="video-thumb" href="https://www.youtube.com/watch?v='+v.id+'" target="_blank" rel="noopener">'
               +   '<img src="'+thumb+'" alt="'+(v.title||'BL4 video')+'" loading="lazy">'
               +   '<span class="caption">'+(v.title||'')+'</span>'
               + '</a>';
        }).join('');
        videosWrap.innerHTML = '<div class="tag-videos-grid">'+html+'</div>';
      })
      .catch(function(){
        if(fallbackHtml) return;
        videosWrap.innerHTML = '<p class="text-muted">'+(isEN?'Failed to load videos.':(isJA?'動画の読み込みに失敗しました。':'视频加载失败。'))+'</p>';
      });
  }
})();
