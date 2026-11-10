/* Données partagées : état de l'expo, sauvegarde auto, exports. */
var Expo=(function(){
  var db=null,data=null,timer=null,persist=false;
  function clone(o){return JSON.parse(JSON.stringify(o));}
  function openDb(){return new Promise(function(res){try{
    var r=indexedDB.open('expo-murs',1);
    r.onupgradeneeded=function(){r.result.createObjectStore('s');};
    r.onsuccess=function(){res(r.result);};r.onerror=function(){res(null);};
  }catch(e){res(null);}});}
  function dbGet(){return new Promise(function(res){if(!db)return res(null);try{
    var q=db.transaction('s').objectStore('s').get('etat');
    q.onsuccess=function(){res(q.result||null);};q.onerror=function(){res(null);};}catch(e){res(null);}});}
  function dbSet(v){return new Promise(function(res){if(!db)return res();try{
    var t=db.transaction('s','readwrite');t.objectStore('s').put(v,'etat');
    t.oncomplete=function(){res();};t.onerror=function(){res();};}catch(e){res();}});}
  function dbDel(){return new Promise(function(res){if(!db)return res();try{
    var t=db.transaction('s','readwrite');t.objectStore('s').delete('etat');
    t.oncomplete=function(){res();};t.onerror=function(){res();};}catch(e){res();}});}

  var base=(typeof SELECTION!=='undefined'&&SELECTION&&Array.isArray(SELECTION.murs))?SELECTION:EXPO;
  var sig=(function(t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return String(h);})(JSON.stringify(base));
  var ready=openDb().then(function(d){db=d;persist=!!d;return dbGet();}).then(function(s){
    data=(s&&s._base===sig)?s:clone(base);data._base=sig;return data;});

  function save(){clearTimeout(timer);timer=setTimeout(function(){data._base=sig;dbSet(data);},200);}

  function clean(){
    var d=clone(data);delete d._base;
    d.murs.forEach(function(m){m.photos.forEach(function(p){
      Object.keys(p).forEach(function(k){if(k.charAt(0)==='_')delete p[k];});
    });});
    return d;
  }
  function download(name,text,type){
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));
    a.download=name;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  }
  function exportJS(){download('expo-selection.js','/* Fichier généré par le bouton Exporter : remplacez simplement expo-selection.js par celui-ci. */\nconst SELECTION = '+JSON.stringify(clean(),null,2)+';\n','text/javascript');}

  function mountTools(el){
    el.innerHTML='<a class="btn help" href="aide.html" target="_blank" rel="noopener">Aide</a>'+
      '<button class="btn" data-a="pdf" type="button">Exporter PDF</button>'+
      '<button class="btn" data-a="js" type="button">Exporter pour GitHub</button>';
    el.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');
      if(a==='pdf')window.open('pdf.html?print','_blank');else if(a==='js')exportJS();});
  }
  return {ready:ready,save:save,mountTools:mountTools};
})();
