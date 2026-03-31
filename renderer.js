// renderer.js - UI Engine
export function triggerToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

export function changeView(sectionId) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId !== 'all-names-section') {
        document.getElementById('search-bar').value = "";
    }
}

export function buildList(containerId, data, isRanked = false) {
    const list = document.getElementById(containerId);
    list.innerHTML = '';
    
    data.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'name-item';
        
        let rankStr = '';
        if (isRanked) {
            let col = "var(--text-muted)";
            if(index === 0) col = "#ffd700"; else if(index === 1) col = "#c0c0c0"; else if(index === 2) col = "#cd7f32";
            rankStr = `<span style="color:${col}; font-weight:900; margin-right:8px;">#${index+1}</span>`;
        }

        div.innerHTML = `
            <div style="font-weight:600;">${rankStr}${item.name}</div>
            <button class="vote-btn" onclick="window.castVote('${item.id}', ${item.votes}, '${item.name}')">Appreciate (${item.votes})</button>
        `;
        list.appendChild(div);
    });
}
