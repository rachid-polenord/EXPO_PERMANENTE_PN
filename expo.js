Expo.ready.then(function(DATA){
var qs=new URLSearchParams(location.search);
var idx=DATA.murs.findIndex(function(m){return m.id===qs.get('id');});if(idx<0)idx=0;
var mur=DATA.murs[idx];
var $=function(i){return document.getElementById(i);};
document.title=mur.nom+' – '+DATA.titre;
$('nom').textContent=mur.nom;$('pos').textContent=(idx+1)+' / '+DATA.murs.length;
function setNav(id,i){var a=$(id);if(i<0||i>=DATA.murs.length){a.className+=' off';return;}
  a.href='mur.html?id='+encodeURIComponent(DATA.murs[i].id);}
setNav('prev',idx-1);setNav('next',idx+1);
Expo.mountTools($('tl'));
$('rem').value=mur.commentaire||'';
$('rem').oninput=function(){mur.commentaire=this.value;Expo.save();};

var stage=$('stage'),layer=$('layer'),asp=2,sel=null;
function placed(p){return p.x!=null&&p.y!=null;}
function name(p){return (p.fichier||'').split('/').pop().slice(0,40);}

var wall=new Image();wall.className='wallimg';wall.alt=mur.nom;
wall.onload=function(){stage.insertBefore(wall,layer);asp=wall.naturalWidth/wall.naturalHeight;go();};
wall.onerror=function(){var d=document.createElement('div');d.className='wallvide';
  d.textContent='Photo du mur à ajouter : '+mur.image;stage.insertBefore(d,layer);go();};
wall.src=mur.image;
function go(){stage.style.setProperty('--asp',asp);renderWall();renderCol();}
function refresh(){Expo.save();renderWall();renderCol();}

function track(el,e,mv,up){
  el.setPointerCapture(e.pointerId);
  function m(ev){mv(ev);}
  function u(ev){el.removeEventListener('pointermove',m);el.removeEventListener('pointerup',u);el.removeEventListener('pointercancel',u);up(ev);}
  el.addEventListener('pointermove',m);el.addEventListener('pointerup',u);el.addEventListener('pointercancel',u);
}
function over(node,ev){var r=node.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;}

function renderWall(){
  layer.innerHTML='';
  mur.photos.filter(placed).forEach(function(p){
    var el=document.createElement('button');el.type='button';el.className='ph'+(p===sel?' sel':'');el._p=p;
    el.style.left=p.x+'%';el.style.top=p.y+'%';el.style.width=(p.largeur||12)+'%';
    el.setAttribute('aria-label',name(p));
    if(p.pivot)el.style.transform='perspective(700px) rotateY('+p.pivot+'deg)';
    var img=new Image();img.alt='';img.draggable=false;
    if(p.ratio){el.style.aspectRatio=p.ratio;img.className='fill';}
    img.onload=function(){p._r=img.naturalWidth/img.naturalHeight;};
    img.onerror=function(){el.classList.add('vide');if(!el.style.aspectRatio)el.style.aspectRatio=1.5;img.remove();
      el.insertBefore(document.createTextNode(name(p)),el.firstChild);};
    img.src=p.fichier;el.appendChild(img);
    var h=document.createElement('span');h.className='hnd';el.appendChild(h);
    var rh=document.createElement('span');rh.className='rot';rh.title='Pivoter (double-clic : remettre droit)';el.appendChild(rh);
    wallDrag(el,h,rh,p);layer.appendChild(el);
  });
}
var lastRot=0;
function wallDrag(el,h,rh,p){
  el.addEventListener('pointerdown',function(e){
    e.preventDefault();
    sel=p;[].forEach.call(layer.children,function(c){c.classList.toggle('sel',c._p===p);});
    var r=stage.getBoundingClientRect(),mode=e.target===h?'size':e.target===rh?'rot':'move';
    var s={cx:e.clientX,cy:e.clientY,x:p.x,y:p.y,w:p.largeur||12,a:p.pivot||0},moved=0;
    track(el,e,function(ev){
      var dx=(ev.clientX-s.cx)/r.width*100,dy=(ev.clientY-s.cy)/r.height*100;
      moved=Math.max(moved,Math.abs(ev.clientX-s.cx)+Math.abs(ev.clientY-s.cy));
      if(mode==='size'){p.largeur=Math.max(2,s.w+dx);el.style.width=p.largeur+'%';}
      else if(mode==='rot'){p.pivot=Math.round(Math.max(-80,Math.min(80,s.a+(ev.clientX-s.cx)*0.4)));
        el.style.transform=p.pivot?'perspective(700px) rotateY('+p.pivot+'deg)':'';}
      else{p.x=s.x+dx;p.y=s.y+dy;el.style.left=p.x+'%';el.style.top=p.y+'%';}
    },function(ev){
      if(mode==='move'&&over($('col'),ev)){p.x=p.y=null;sel=null;}
      if(mode==='rot'&&moved<4){var n=Date.now();if(n-lastRot<400)p.pivot=0;lastRot=n;}
      refresh();
    });
  });
}

function renderCol(){
  var used={};
  DATA.murs.forEach(function(m){if(m!==mur)m.photos.forEach(function(p){if(placed(p))used[p.fichier]=1;});});
  var un=mur.photos.filter(function(p){return !placed(p)&&!used[p.fichier];});
  $('sub').textContent=un.length?'Glissez une photo sur le mur.':'Toutes les photos sont placées. Glissez une photo du mur ici pour la retirer.';
  var L=$('list');L.innerHTML='';
  un.forEach(function(p){
    var t=document.createElement('div');t.className='thumb';
    var img=new Image();img.alt='';img.draggable=false;img.loading='lazy';
    img.onload=function(){p._r=img.naturalWidth/img.naturalHeight;};
    img.onerror=function(){img.remove();t.textContent=name(p);t.classList.add('vide');};
    img.src=p.fichier;t.appendChild(img);
    t.addEventListener('pointerdown',function(e){
      e.preventDefault();var s={cx:e.clientX,cy:e.clientY},drag=false,gh=null;
      track(t,e,function(ev){
        if(!drag&&Math.hypot(ev.clientX-s.cx,ev.clientY-s.cy)>6){drag=true;gh=document.createElement('img');gh.className='ghost';gh.src=p.fichier;document.body.appendChild(gh);}
        if(drag){gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';}
      },function(ev){
        if(gh)gh.remove();
        if(drag&&over(stage,ev))placeAt(p,ev.clientX,ev.clientY);
      });
    });
    L.appendChild(t);
  });
}
function placeAt(p,cx,cy){
  var r=stage.getBoundingClientRect(),w=p.largeur||12,ratio=p.ratio||p._r||1.5;
  var wp=w/100*r.width,hp=wp/ratio;
  p.largeur=w;p.x=Math.max(0,Math.min(100-w,(cx-r.left-wp/2)/r.width*100));
  p.y=Math.max(0,(cy-r.top-hp/2)/r.height*100);
  sel=p;refresh();
}
document.addEventListener('keydown',function(e){
  if((e.key==='Delete'||e.key==='Backspace')&&sel&&placed(sel)&&!/INPUT|TEXTAREA/.test(e.target.tagName)){sel.x=sel.y=null;sel=null;refresh();}});

$('add').onchange=function(e){
  var files=[].slice.call(e.target.files);e.target.value='';
  files.forEach(function(f){
    var fr=new FileReader();
    fr.onload=function(){var im=new Image();im.onload=function(){
      var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');
      c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      var u=c.toDataURL('image/webp',0.82);if(u.indexOf('data:image/webp')!==0)u=c.toDataURL('image/jpeg',0.82);
      mur.photos.push({fichier:u,titre:f.name.replace(/\.[^.]+$/,''),legende:'',x:null,y:null});
      refresh();};im.src=fr.result;};
    fr.readAsDataURL(f);});
};
});
