/* Shared left side panel. Include right after <body> with data-page="dashboard|register|database".
   It provides #who and #signOut, which each page fills in and wires up. */
(function(){
  "use strict";
  var me = document.currentScript, page = me.getAttribute("data-page") || "";
  var I = {
    dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    register:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.6"/></svg>',
    database:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11"/></svg>',
    scan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"/></svg>',
    add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg>',
    collapse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    mark:'<svg viewBox="0 0 22 22" shape-rendering="crispEdges"><rect width="22" height="22" fill="#fff"/><path fill="#151A20" d="M2 2h7v7H2zM13 2h7v7h-7zM2 13h7v7H2z"/><path fill="#fff" d="M3.5 3.5h4v4h-4zM14.5 3.5h4v4h-4zM3.5 14.5h4v4h-4z"/><path fill="#151A20" d="M4.5 4.5h2v2h-2zM15.5 4.5h2v2h-2zM4.5 15.5h2v2h-2zM13 13h3v3h-3zM17 16h3v4h-3zM13 18h3v2h-3z"/></svg>'
  };
  var modules = [["dashboard","dashboard.html","Dashboard"],["register","index.html","Register"],["database","database.html","Database"]];
  var title = (modules.filter(function(m){ return m[0] === page; })[0] || [,,"Asset Register"])[2];

  try{ if(localStorage.getItem("sb-collapsed") === "1") document.documentElement.classList.add("sb-collapsed"); }catch(e){}

  var nav = modules.map(function(m){
    return '<a class="sb-item" href="'+m[1]+'"'+(m[0] === page ? ' aria-current="page"' : '')+' title="'+m[2]+'">'+I[m[0]]+'<span class="sb-text">'+m[2]+'</span></a>';
  }).join("");
  var html =
    '<header class="sb-top"><button class="sb-burger" type="button" id="sbBurger" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">'+I.menu+'</button><span class="sb-top-title">'+title+'</span></header>'+
    '<div class="sb-scrim" id="sbScrim"></div>'+
    '<aside class="sidebar" id="sidebar" aria-label="Main menu">'+
      '<a class="sb-brand" href="dashboard.html" title="Asset Register"><span class="sb-mark">'+I.mark+'</span><span class="sb-name"><b>Asset Register</b><small>PLUD</small></span></a>'+
      '<nav aria-label="Modules"><div class="sb-label">Modules</div>'+nav+
        '<div class="sb-label">Quick actions</div>'+
        '<a class="sb-item" href="index.html#scan" title="Scan tag">'+I.scan+'<span class="sb-text">Scan tag</span></a>'+
        '<a class="sb-item" href="index.html#add" title="Add asset">'+I.add+'<span class="sb-text">Add asset</span></a>'+
      '</nav>'+
      '<div class="sb-foot">'+
        '<div class="sb-user"><span class="sb-avatar" id="sbAvatar" aria-hidden="true">·</span><span class="sb-who"><small>Signed in as</small><span id="who"></span></span></div>'+
        '<div class="sb-row"><button class="sb-btn sb-signout" type="button" id="signOut" title="Sign out">'+I.out+'<span class="sb-text">Sign out</span></button>'+
        '<button class="sb-btn sb-collapse" type="button" id="sbCollapse" aria-label="Collapse menu" title="Collapse menu">'+I.collapse+'</button></div>'+
      '</div>'+
    '</aside>';
  me.insertAdjacentHTML("afterend", html);

  var sb = document.getElementById("sidebar"), scrim = document.getElementById("sbScrim"), burger = document.getElementById("sbBurger");
  function setOpen(open){
    sb.classList.toggle("open", open); scrim.classList.toggle("show", open); burger.setAttribute("aria-expanded", String(open));
    if(open){ var f = sb.querySelector("[aria-current=page]") || sb.querySelector("a"); if(f) f.focus(); }
  }
  burger.addEventListener("click", function(){ setOpen(!sb.classList.contains("open")); });
  scrim.addEventListener("click", function(){ setOpen(false); burger.focus(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && sb.classList.contains("open")){ setOpen(false); burger.focus(); } });
  sb.addEventListener("click", function(e){ if(e.target.closest("a")) setOpen(false); });

  var col = document.getElementById("sbCollapse");
  function syncCol(){ var c = document.documentElement.classList.contains("sb-collapsed"); col.setAttribute("aria-label", c ? "Expand menu" : "Collapse menu"); col.title = c ? "Expand menu" : "Collapse menu"; }
  col.addEventListener("click", function(){
    var c = document.documentElement.classList.toggle("sb-collapsed");
    try{ localStorage.setItem("sb-collapsed", c ? "1" : "0"); }catch(e){}
    syncCol();
  });
  syncCol();

  // Avatar initial follows the signed-in name
  var who = document.getElementById("who"), av = document.getElementById("sbAvatar");
  new MutationObserver(function(){ var t = (who.textContent || "").trim(); av.textContent = t ? t[0] : "·"; who.title = who.title || t; }).observe(who, { childList:true, characterData:true, subtree:true });
})();
