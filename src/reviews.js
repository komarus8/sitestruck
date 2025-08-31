// Reviews on index: one per user, only if purchased (has at least 1 site)
(function(){
  const listEl = document.getElementById("reviews-list");
  const avgEl  = document.getElementById("avg-rating");
  const formWrap = document.getElementById("review-form-wrap");
  const note = document.getElementById("review-note");
  const already = document.getElementById("review-already");
  const form = document.getElementById("review-form");

  if(!listEl || !avgEl) return;

  function loadReviews(){
    try { return JSON.parse(localStorage.getItem("ss_reviews")||"[]"); } catch{ return []; }
  }
  function saveReviews(arr){ localStorage.setItem("ss_reviews", JSON.stringify(arr)); }
  function getUser(){
    try { return JSON.parse(localStorage.getItem("ss_current_user")||"null"); } catch{ return null; }
  }

  function render(){
    const reviews = loadReviews();
    listEl.innerHTML = "";
    if(reviews.length===0){ listEl.innerHTML = "<p class='center mt-12'>No reviews yet.</p>"; avgEl.textContent = "0.0"; return; }
    let total = 0;
    reviews.forEach(r=>{
      total += r.rating;
      const div = document.createElement("div");
      div.className = "review-item";
      div.innerHTML = `<div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div><p>${r.text}</p><small>${r.user}</small>`;
      listEl.appendChild(div);
    });
    avgEl.textContent = (total / reviews.length).toFixed(1);
  }

  function initPermissions(){
    const u = getUser();
    if(!u){ formWrap.classList.add("hidden"); note.classList.remove("hidden"); return; }
    const purchased = u.sites && u.sites.length>0;
    if(!purchased){ formWrap.classList.add("hidden"); note.classList.remove("hidden"); return; }

    // Check if user already reviewed
    const all = loadReviews();
    const has = all.some(x=>x.user.toLowerCase()===u.email.toLowerCase());
    if(has){ formWrap.classList.add("hidden"); already.classList.remove("hidden"); }
    else { formWrap.classList.remove("hidden"); already.classList.add("hidden"); note.classList.add("hidden"); }
  }

  if(form){
    form.addEventListener("submit", e=>{
      e.preventDefault();
      const u = getUser(); if(!u) return alert("Please log in.");
      const rating = parseInt(document.getElementById("rev-rating").value,10);
      const text = document.getElementById("rev-text").value.trim();
      if(!(rating>=1 && rating<=5)) return alert("Choose rating 1-5.");
      if(!text) return;

      const all = loadReviews();
      if(all.some(x=>x.user.toLowerCase()===u.email.toLowerCase())){
        alert("You already submitted a review.");
        return;
      }

      all.push({ user:u.email, rating, text, ts:Date.now() });
      saveReviews(all);
      form.reset();
      render(); initPermissions();
    });
  }

  render(); initPermissions();
})();
