const IMG="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/";
const boats=[
 {name:"Aqua Strike 32",type:"Racing",price:289.99,tag:"Best seller",image:IMG+"4692-pNWJhV62zBSzsIMpf0UQaXTG6zDXcd.jpg",speed:"55+ MPH",hull:'32" Deep-V ABS',motor:"Water-cooled Brushless 2000KV",battery:"4S LiPo Ready",desc:"High-performance RC racing boat built to cut through chop at competitive speeds, with responsive dual rudders."},
 {name:"Carbon Bullet X",type:"Performance",price:419.99,tag:"New",image:IMG+"4688-qteOg2SZ5eASeN8yjmz8K9qf46op3i.jpg",speed:"65+ MPH",hull:"Carbon Fiber Monohull",motor:"High-Torque 2200KV Brushless",battery:"6S LiPo Ready",desc:"Ultra-lightweight carbon fiber construction for maximum acceleration and record-breaking straightaways."},
 {name:"Wave Runner 24",type:"Sport",price:199.99,tag:"Popular",image:IMG+"4695-YUSj535LwHvRK8vhB2eJRtIKmPxKrV.jpg",speed:"40+ MPH",hull:'24" Self-Righting Catamaran',motor:"Water-cooled Brushless",battery:"3S LiPo Included",desc:"A self-righting hull means you never get stranded upside down while carving and jumping waves."},
 {name:"Deep Blue Mono",type:"Scale",price:329.99,tag:"Ready-to-run",image:IMG+"4690-qc3N2aZopSAv1GjKMRjjPtRoqqCwfH.jpg",speed:"48+ MPH",hull:'30" Stepped Deep-V',motor:"High-Efficiency Brushless",battery:"4S LiPo Compatible",desc:"Authentic scale detailing with a realistic pilot cockpit, navigation LEDs, and corrosion-resistant hardware."},
 {name:"Night Tide Pro",type:"Racing",price:499.99,tag:"Limited",image:IMG+"4686-lMJbRs9ZKejhUN5faGeYOwsh84xVB8.jpg",speed:"70+ MPH",hull:'36" Aerodynamic Hydroplane',motor:"Dual Water-Cooled Extreme ESC",battery:"6S LiPo Dual Pack",desc:"Competition-grade hydroplane that skims the surface with near-zero drag and blistering top speed."},
 {name:"River Scout",type:"Sport",price:159.99,tag:"Beginner friendly",image:IMG+"4542-OBQbvKHS5jYOr6MxfyAZ3MTfbVVoOS.jpg",speed:"32+ MPH",hull:'18" Impact-Resistant Poly',motor:"Sealed Water-Cooled Motor",battery:"2S/3S LiPo Compatible",desc:"Perfect for beginners on calm lakes and rivers, with a throttle governor and a resilient front bumper."}
];
const GOOGLE_SHEET_URL="https://script.google.com/macros/s/AKfycbz7ovAj51iEZZCp0CKxO8jDn0XqfSrCxKNda_FL83A9L3BgoeImaPtOmUhP2HIzz00V/exec";
const FREE=99;
const $=s=>document.querySelector(s), money=v=>"$"+Number(v).toFixed(2);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let filter="all", cart=[], active=null, toastT;

function notify(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2800)}

/* ---- shop grid ---- */
function draw(){
  const q=$("#search").value.toLowerCase().trim();
  const list=boats.filter(b=>(filter==="all"||b.type===filter)&&(b.name+" "+b.type).toLowerCase().includes(q));
  $("#grid").innerHTML=list.map(b=>`
  <article class="card">
    <div class="photo"><img src="${b.image}" alt="${esc(b.name)}" loading="lazy"><span class="badge">${esc(b.tag)}</span></div>
    <div class="body">
      <div class="type">${esc(b.type)} boat</div><h3>${esc(b.name)}</h3>
      <div class="chips"><span>${esc(b.speed)}</span><span>${esc(b.battery)}</span></div>
      <div class="buy"><span class="price">${money(b.price)}</span><button class="btn" data-bid="${esc(b.name)}">Place Bid</button></div>
    </div>
  </article>`).join("");
  $("#empty").style.display=list.length?"none":"block";
}
document.querySelectorAll(".filters button").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".filters button").forEach(x=>x.setAttribute("aria-pressed",x===btn));
  filter=btn.dataset.f;draw();
});
$("#search").oninput=draw;
$("#grid").onclick=e=>{
  const button=e.target.closest("[data-bid]");
  if(button)openBid(boats.find(x=>x.name===button.dataset.bid));
};

/* ---- cart ---- */
function renderCart(){
  const t=cart.reduce((s,b)=>s+b.price,0);
  $("#count").textContent=cart.length;$("#total").textContent=money(t);
  $("#fill").style.width=Math.min(100,t/FREE*100)+"%";
  $("#ship").textContent=t>=FREE?"You get free shipping.":`Add ${money(FREE-t)} more for free shipping.`;
  $("#items").innerHTML=cart.length?cart.map((b,i)=>`<div class="line"><span>${esc(b.name)}<br><small>${money(b.price)}</small></span><button data-rm="${i}">Remove</button></div>`).join(""):"<p>Your cart is empty. Pick a boat to get started.</p>";
}
$("#items").onclick=e=>{if(e.target.dataset.rm!==undefined){cart.splice(+e.target.dataset.rm,1);renderCart()}};
const toggleCart=o=>$("#cartRoot").classList.toggle("open",o);
$("#openCart").onclick=()=>toggleCart(true);$("#shade").onclick=$("#closeCart").onclick=()=>toggleCart(false);
$("#checkout").onclick=()=>alert("Connect this button to your checkout (Stripe, Shopify, etc.).");

/* ---- modal helpers ---- */
function openM(m){m.classList.add("open");m.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeM(m){m.classList.remove("open");m.setAttribute("aria-hidden","true");document.body.style.overflow=""}
const bidModal=$("#bidModal");
const fields={name:["#bName","#eName"],email:["#bEmail","#eEmail"],mobile:["#bMobile","#eMobile"],amount:["#bAmount","#eAmount"]};
function setErr(k,msg){$(fields[k][0]).classList.toggle("err",!!msg);$(fields[k][1]).textContent=msg||""}
const clearErr=()=>Object.keys(fields).forEach(k=>setErr(k,""));

function openBid(b){
  active=b;clearErr();
  $("#mImg").src=b.image;$("#mImg").alt=b.name;$("#mType").textContent=b.type+" boat";
  $("#mName").textContent=b.name;$("#mDesc").textContent=b.desc;$("#mPrice").textContent=money(b.price);
  $("#mSpecs").innerHTML=[["Top speed",b.speed],["Motor",b.motor],["Hull",b.hull],["Battery",b.battery]].map(([k,v])=>`<div><b>${k}</b>${esc(v)}</div>`).join("");
  $("#bAmount").value=b.price.toFixed(2);$("#minHint").textContent="(min "+money(b.price)+")";
  $("#bidForm").style.display="block";$("#mSuccess").style.display="none";
  openM(bidModal);setTimeout(()=>$("#bName").focus(),150);
}
$("#mClose").onclick=$("#mDone").onclick=()=>{closeM(bidModal);clearErr()};
bidModal.addEventListener("click",e=>{if(e.target===bidModal)closeM(bidModal)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeM(bidModal);toggleCart(false)}});

$("#bAmount").addEventListener("input",()=>{
  const v=parseFloat($("#bAmount").value);
  setErr("amount",active&&(isNaN(v)||v<active.price)?`Bid must be at least ${money(active.price)}.`:"");
});
document.querySelectorAll(".qb [data-add]").forEach(btn=>btn.onclick=()=>{
  if(!active)return;
  let c=parseFloat($("#bAmount").value);if(isNaN(c)||c<active.price)c=active.price;
  $("#bAmount").value=(Math.round((c+parseFloat(btn.dataset.add))*100)/100).toFixed(2);setErr("amount","");
});

/* ---- submit bid -> Google Sheet ---- */
$("#bidForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!active)return;clearErr();let bad=false;
  const name=$("#bName").value.trim(), email=$("#bEmail").value.trim(), mobile=$("#bMobile").value.trim(), bid=parseFloat($("#bAmount").value);
  if(name.length<2){setErr("name","Please enter your full name.");bad=true}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr("email","Please enter a valid email.");bad=true}
  if(mobile.replace(/\D/g,"").length<7){setErr("mobile","Enter a valid mobile number (7+ digits).");bad=true}
  if(isNaN(bid)){setErr("amount","Please enter a valid bid.");bad=true}
  else if(bid<active.price){setErr("amount",`Bid cannot be lower than ${money(active.price)}.`);bad=true}
  if(bad)return;

  const ts=new Date().toLocaleString(), bidTxt=money(bid), start=money(active.price);
  const p={timestamp:ts,Timestamp:ts,name,"Full Name":name,Name:name,email,"Email Address":email,Email:email,mobile,"Mobile Number":mobile,Mobile:mobile,Phone:mobile,
    boatName:active.name,"Boat Name":active.name,boatType:active.type+" boat","Boat Category":active.type+" boat",startingPrice:start,"Starting Price":start,bidPrice:bidTxt,"Bidding Price":bidTxt};

  const btn=$("#mSubmit"), label=btn.textContent;btn.disabled=true;btn.textContent="Sending...";
  let synced=false;
  if(GOOGLE_SHEET_URL){
    try{const fd=new FormData();Object.keys(p).forEach(k=>fd.append(k,p[k]));
      await fetch(GOOGLE_SHEET_URL,{method:"POST",mode:"no-cors",body:fd});synced=true}catch(x){console.error(x)}
  }
  btn.disabled=false;btn.textContent=label;

  $("#bidForm").style.display="none";$("#mSuccess").style.display="block";
  $("#sMsg").textContent=`Thank you ${name}! Your bid has been registered.`;
  $("#sSum").innerHTML=`<div><b>Boat:</b> ${esc(active.name)}</div><div><b>Starting price:</b> ${start}</div><div><b>Your bid:</b> ${bidTxt}</div>
   <div><b>Email:</b> ${esc(email)}</div><div><b>Mobile:</b> ${esc(mobile)}</div>
   <div><b>Google Sheet:</b> ${synced?'<span class="ok">Submission sent</span>':'<span class="warn">Could not reach the sheet. Please contact us to confirm your bid.</span>'}</div>`;
  notify(`Bid placed for ${active.name}: ${bidTxt}`);
});

$("#newsletter").onsubmit=e=>{e.preventDefault();notify("Thanks for subscribing!");e.target.reset()};
draw();renderCart();
