// === Simple client-side auth & data (localStorage) ===
const LS_USERS = "ss_users";
const LS_CURRENT = "ss_current_user";
const LS_REVIEWS = "ss_reviews";

// Utilities
function loadUsers(){ return JSON.parse(localStorage.getItem(LS_USERS)||"[]"); }
function saveUsers(list){ localStorage.setItem(LS_USERS, JSON.stringify(list)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem(LS_CURRENT)||"null"); }
function setCurrentUser(u){ if(u) localStorage.setItem(LS_CURRENT, JSON.stringify(u)); else localStorage.removeItem(LS_CURRENT); }

// Public for other pages
window.getCurrentUser = getCurrentUser;

// Header auth link setup
function hydrateHeaderAuthLink(){
  const link = document.getElementById("auth-link");
  if(!link) return;
  const u = getCurrentUser();
  if(u){
    link.textContent = "Logout";
    link.href = "#";
    link.onclick = (e)=>{ e.preventDefault(); setCurrentUser(null); location.href="index.html"; };
  }else{
    link.textContent = "Login";
    link.href = "login.html";
  }
}

// Protect generator & mypages
function protectPages(){
  const path = location.pathname;
  const needsAuth = /generator\.html$|mypages\.html$/.test(path);
  if(needsAuth && !getCurrentUser()){
    location.href = "login.html?next=" + encodeURIComponent(path.replace(/^.*\//,""));
  }
}

// Register
function wireRegister(){
  const form = document.getElementById("register-form");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const pass  = document.getElementById("reg-password").value;
    const conf  = document.getElementById("reg-confirm").value;
    if(!email || !pass || !conf) return alert("Fill all fields.");
    if(pass!==conf) return alert("Passwords do not match.");
    const users = loadUsers();
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase()))
      return alert("Account already exists.");
    const user = { email, pass, sites: [], reviewGiven:false };
    users.push(user); saveUsers(users); setCurrentUser({ email, sites: [], reviewGiven:false });
    location.href = "generator.html";
  });
}

// Login
function wireLogin(){
  const form = document.getElementById("login-form");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass  = document.getElementById("password").value;
    const users = loadUsers();
    const u = users.find(x=>x.email.toLowerCase()===email.toLowerCase() && x.pass===pass);
    if(!u) return alert("Invalid credentials.");
    setCurrentUser({ email:u.email, sites:u.sites||[], reviewGiven: !!u.reviewGiven });
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "generator.html";
    location.href = next;
  });
}

// Purchase handler (called from pricing.html)
window.handlePurchase = function(plan){
  const u = getCurrentUser();
  if(!u){ location.href = "login.html?next=" + encodeURIComponent("pricing.html"); return; }

  const params = new URLSearchParams(location.search);
  const buyNew = params.get("buynew")==="1";

  // By default: allow only ONE site through normal pricing
  if(!buyNew && (u.sites && u.sites.length>0)){
    alert("You already own a site. Use 'Buy New' to add another.");
    location.href = "mypages.html";
    return;
  }

  // Create site entry
  const siteId = "site_" + Math.random().toString(36).slice(2,8);
  const siteName = plan + " Site";
  const site = { id: siteId, name: siteName, plan };

  // Update current user
  u.sites = u.sites || [];
  u.sites.push(site);
  setCurrentUser(u);

  // Persist in users list
  const users = loadUsers();
  const ix = users.findIndex(x=>x.email===u.email);
  if(ix>=0){
    users[ix].sites = u.sites;
    saveUsers(users);
  }

  alert(`Purchased ${plan}. A new site "${siteName}" has been added to your account.`);
  location.href = "mypages.html";
};

document.addEventListener("DOMContentLoaded", ()=>{
  hydrateHeaderAuthLink();
  protectPages();
  wireLogin();
  wireRegister();
});
