from base64 import b64encode
from pathlib import Path


root = Path(__file__).resolve().parent
fragment = root.joinpath("02_PAGE_FULL_T123.html").read_bytes()
payload = b64encode(fragment).decode("ascii")

loader = r'''(function(){
  var b=atob("'''+payload+r'''"),u=new Uint8Array(b.length);
  for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  var h=new TextDecoder("utf-8").decode(u),d=document.createElement("div");
  d.innerHTML=h;
  var scripts=[];
  d.querySelectorAll("script").forEach(function(s,i){
    scripts.push(s.cloneNode(true));
    s.setAttribute("data-pk-script-marker",i);
  });
  var host=document.createElement("div");
  host.id="pk-github-main-host";
  while(d.firstChild)host.appendChild(d.firstChild);
  document.currentScript.parentNode.insertBefore(host,document.currentScript);
  scripts.forEach(function(old,i){
    var marker=host.querySelector('[data-pk-script-marker="'+i+'"]');
    if(!marker)return;
    var fresh=document.createElement("script");
    Array.prototype.forEach.call(old.attributes,function(a){
      if(a.name!=="data-pk-script-marker")fresh.setAttribute(a.name,a.value);
    });
    fresh.text=old.textContent;
    marker.replaceWith(fresh);
  });
})();
'''

root.joinpath("tilda-cdn-payload.js").write_text(loader, encoding="utf-8")
print(f"Built CDN payload: {len(loader)} characters")
