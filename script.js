// IMPORT SISTEM FIREBASE DARI CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// KODE RAHASIA FIREBASE KAMU
const firebaseConfig = {
  apiKey: "AIzaSyB_aesyRyMJftF1y9AQn6MiLWu0XTdKL4g",
  authDomain: "the-name-vault-d9a8f.firebaseapp.com",
  projectId: "the-name-vault-d9a8f",
  storageBucket: "the-name-vault-d9a8f.firebasestorage.app",
  messagingSenderId: "607838251875",
  appId: "1:607838251875:web:91862a55886277ce100156"
};

// Inisialisasi Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data Array Global
let defaultNames = [];

// Fungsi Toast Notifikasi
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// Navigasi (Jadikan window. agar bisa dipanggil dari HTML)
window.showSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if(sectionId !== 'all-names-section') {
        document.getElementById('search-bar').value = "";
    }
}

// Render Names
function renderAllNames(filteredArray = defaultNames) {
    const listDiv = document.getElementById('all-names-list');
    listDiv.innerHTML = '';
    filteredArray.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'name-item';
        div.style.animationDelay = `${i * 0.05}s`;
        div.innerHTML = `
            <span style="font-weight:600; font-size:1.1rem">${item.name}</span>
            <button class="vote-btn" onclick="voteName('${item.id}', ${item.votes}, '${item.name}')">Appreciate (${item.votes})</button>
        `;
        listDiv.appendChild(div);
    });
}

window.filterNames = function() {
    const searchVal = document.getElementById('search-bar').value.toLowerCase();
    const filtered = defaultNames.filter(item => item.name.toLowerCase().includes(searchVal));
    renderAllNames(filtered);
}

function renderTopNames() {
    const listDiv = document.getElementById('top-names-list');
    listDiv.innerHTML = '';
    const sortedNames = [...defaultNames].sort((a, b) => b.votes - a.votes).slice(0, 50);
    
    sortedNames.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'name-item';
        div.style.animationDelay = `${index * 0.05}s`;
        
        let rankColor = "var(--text-muted)";
        if (index === 0) rankColor = "#ffd700"; 
        else if (index === 1) rankColor = "#c0c0c0"; 
        else if (index === 2) rankColor = "#cd7f32"; 

        div.innerHTML = `
            <span style="font-weight:600; font-size: 1.1rem;">
                <span style="color:${rankColor}; margin-right:10px; font-weight:800;">#${index + 1}</span> 
                ${item.name}
            </span>
            <span style="color: var(--gold); font-size: 0.9rem; font-weight:800;">${item.votes} VP</span>
        `;
        listDiv.appendChild(div);
    });
}

// 🌐 MENGAMBIL DATA DARI DATABASE SECARA REAL-TIME 🌐
const namesCollection = collection(db, "names");
const q = query(namesCollection, orderBy("name")); // Urutkan sesuai abjad

// onSnapshot: Otomatis update layar kalau ada data baru di database
onSnapshot(q, (snapshot) => {
    defaultNames = [];
    snapshot.forEach((doc) => {
        defaultNames.push({ id: doc.id, ...doc.data() }); 
    });

    const searchVal = document.getElementById('search-bar');
    if(searchVal && searchVal.value !== "") { filterNames(); } else { renderAllNames(); }
    
    if(document.getElementById('top-names-section').classList.contains('active')) {
        renderTopNames();
    }
});

// 🌐 FUNGSI VOTE KE DATABASE 🌐
window.voteName = async function(docId, currentVotes, name) {
    try {
        const nameRef = doc(db, "names", docId);
        await updateDoc(nameRef, {
            votes: currentVotes + 1
        });
        showToast(`✨ Appreciated: ${name}`);
    } catch (e) {
        showToast("❌ Gagal memberikan apresiasi. Cek koneksi.");
        console.error(e);
    }
}

// 🔐 SECRET ADMIN OVERRIDE PROTOCOL 🔐
let secretClicks = 0;
let secretTimeout;
let isAdmin = false;

window.handleSecretClick = function(e) {
    e.preventDefault(); 
    secretClicks++;
    clearTimeout(secretTimeout);

    if(secretClicks >= 4) {
        isAdmin = true;
        showToast("🔐 SYSTEM OVERRIDE: Admin Mode Engaged.");
        secretClicks = 0;
    } else {
        secretTimeout = setTimeout(() => {
            if (secretClicks > 0 && secretClicks < 4 && !isAdmin) {
                window.open("https://instagram.com/n4bilirzap.ip", "_blank");
            }
            secretClicks = 0; 
        }, 400); 
    }
}

// 🌐 Submit NAMA KE DATABASE FIREBASE 🌐
let isProcessing = false;

window.submitNewName = async function() {
    if(isProcessing) { showToast("⚠️ Protokol sedang berjalan!"); return; }

    const nameInput = document.getElementById('new-name');
    const nameValue = nameInput.value.trim();

    if (nameValue === "") { showToast("⚠️ Identitas tidak boleh kosong!"); return; }

    // CEK ADMIN MODE (Bypass Delay)
    if (isAdmin) {
        showToast(`⚡ ADMIN BYPASS: Mendorong ke Database...`);
        try {
            await addDoc(collection(db, "names"), { name: nameValue, votes: 0 });
            showToast(`⚡ ADMIN BYPASS: ${nameValue} berhasil dipublikasi!`);
            nameInput.value = "";
        } catch(e) { 
            showToast("❌ Gagal menghubungi Vault!"); 
            console.error(e);
        }
        return; 
    }

    // USER BIASA (Ada Delay)
    isProcessing = true;
    document.getElementById('process-dashboard').style.display = 'block';
    document.getElementById('waiting-msg').style.display = 'block';

    const totalPublishTime = 5 * 60; 
    const totalTopTime = 10 * 60;    
    let publishSeconds = totalPublishTime;
    let topSeconds = totalTopTime;

    const timePublishEl = document.getElementById('time-publish');
    const timeTopEl = document.getElementById('time-top');
    const fillPublishEl = document.getElementById('fill-publish');
    const fillTopEl = document.getElementById('fill-top');

    fillPublishEl.style.width = '0%';
    fillTopEl.style.width = '0%';
    showToast("⏳ Menambahkan ke antrean server...");

    const interval = setInterval(async () => {
        publishSeconds--;
        topSeconds--;

        // Publish Update
        if (publishSeconds >= 0) {
            const m = Math.floor(publishSeconds / 60);
            const s = publishSeconds % 60;
            timePublishEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            fillPublishEl.style.width = `${((totalPublishTime - publishSeconds) / totalPublishTime) * 100}%`;
        }

        if (publishSeconds === 0) {
            timePublishEl.innerText = "SELESAI";
            timePublishEl.style.color = "#00f5ff";
            
            // PUSH KE DATABASE SETELAH WAKTU HABIS
            try {
                await addDoc(collection(db, "names"), { name: nameValue, votes: 0 });
                showToast(`✅ ${nameValue} berhasil ditambahkan ke Vault Utama!`);
            } catch(e) {
                showToast("❌ Gagal menghubungi server saat publish.");
                console.error(e);
            }
        }

        // Top Update
        if (topSeconds >= 0) {
            const m = Math.floor(topSeconds / 60);
            const s = topSeconds % 60;
            timeTopEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            fillTopEl.style.width = `${((totalTopTime - topSeconds) / totalTopTime) * 100}%`;
        }

        if (topSeconds === 0) {
            timeTopEl.innerText = "SELESAI";
            timeTopEl.style.color = "#00f5ff";
            showToast(`🏆 ${nameValue} sudah terverifikasi penuh!`);
            clearInterval(interval);
            isProcessing = false;
            nameInput.value = "";
            document.getElementById('waiting-msg').innerText = "✅ Semua proses sinkronisasi server selesai.";
            document.getElementById('waiting-msg').style.color = "var(--gold)";
        }
    }, 1000);
}