// main.js - Core Engine & Event Router
import { Config, State } from './preload.js';
import * as UI from './renderer.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Inisiasi Database
const app = initializeApp(Config.firebase);
const db = getFirestore(app);

// 2. Hubungkan Fungsi UI ke Layar HTML (Window Binding)
window.switchTab = UI.changeView;

window.runSearch = function() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const result = State.vaultData.filter(n => n.name.toLowerCase().includes(query));
    UI.buildList('all-names-list', result, false);
};

// 3. Sistem Hak Akses Admin (Secret Trigger)
document.getElementById('secret-trigger').addEventListener('click', (e) => {
    e.preventDefault();
    State.adminClicks++;
    if(State.adminClicks >= 4) {
        State.isAdmin = true;
        UI.triggerToast("🔐 SYSTEM OVERRIDE: Admin Bypass Active");
        State.adminClicks = 0;
    }
    setTimeout(() => { State.adminClicks = 0; }, 500);
});

// 4. Sistem Voting Database
window.castVote = async function(id, currentVotes, name) {
    try {
        await updateDoc(doc(db, "names", id), { votes: currentVotes + 1 });
        UI.triggerToast(`✨ Appreciated: ${name}`);
    } catch(err) { UI.triggerToast("❌ Gagal terhubung ke Server"); }
};

// 5. Sistem Publish & Timer
window.submitIdentity = async function() {
    if(State.isProcessing) return UI.triggerToast("⚠️ Sedang memproses antrean!");
    
    const input = document.getElementById('new-name');
    const nameVal = input.value.trim();
    if(!nameVal) return UI.triggerToast("⚠️ Nama tidak boleh kosong!");

    // Bypass jika Admin
    if(State.isAdmin) {
        UI.triggerToast("⚡ ADMIN BYPASS: Mendorong ke Server...");
        await addDoc(collection(db, "names"), { name: nameVal, votes: 0 });
        input.value = "";
        return UI.triggerToast(`✅ ${nameVal} langsung dipublikasi!`);
    }

    // Sistem Delay untuk User Biasa
    State.isProcessing = true;
    document.getElementById('dashboard').style.display = 'block';
    
    let pSec = Config.publishDelay;
    let tSec = Config.topDelay;
    const pTxt = document.getElementById('time-publish'); const pFill = document.getElementById('fill-publish');
    const tTxt = document.getElementById('time-top');     const tFill = document.getElementById('fill-top');

    UI.triggerToast("⏳ Menambahkan ke antrean...");

    const timer = setInterval(async () => {
        pSec--; tSec--;

        if(pSec >= 0) {
            pTxt.innerText = `${Math.floor(pSec/60)}:${pSec%60 < 10 ? '0':''}${pSec%60}`;
            pFill.style.width = `${((Config.publishDelay - pSec) / Config.publishDelay) * 100}%`;
        }
        if(pSec === 0) {
            pTxt.innerText = "SELESAI"; pTxt.style.color = "#00f5ff";
            try { 
                await addDoc(collection(db, "names"), { name: nameVal, votes: 0 }); 
                UI.triggerToast(`✅ ${nameVal} masuk Vault Utama!`);
            } catch(e) {}
        }

        if(tSec >= 0) {
            tTxt.innerText = `${Math.floor(tSec/60)}:${tSec%60 < 10 ? '0':''}${tSec%60}`;
            tFill.style.width = `${((Config.topDelay - tSec) / Config.topDelay) * 100}%`;
        }
        if(tSec === 0) {
            tTxt.innerText = "SELESAI"; tTxt.style.color = "#00f5ff";
            UI.triggerToast(`🏆 ${nameVal} sinkron ke Leaderboard!`);
            clearInterval(timer);
            State.isProcessing = false;
            input.value = "";
            document.getElementById('wait-msg').innerText = "✅ Seluruh proses selesai.";
        }
    }, 1000);
};

// 6. Listener Real-time Database (Otomatis Render saat ada perubahan)
onSnapshot(query(collection(db, "names"), orderBy("name")), (snapshot) => {
    State.vaultData = [];
    snapshot.forEach(d => State.vaultData.push({ id: d.id, ...d.data() }));
    
    // Render Ulang Layar
    if(document.getElementById('search-bar').value) { window.runSearch(); } 
    else { UI.buildList('all-names-list', State.vaultData, false); }
    
    const topData = [...State.vaultData].sort((a,b) => b.votes - a.votes).slice(0, 50);
    UI.buildList('top-names-list', topData, true);
});
