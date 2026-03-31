// preload.js - System Configuration & State Memory
export const Config = {
    firebase: {
        apiKey: "AIzaSyB_aesyRyMJftF1y9AQn6MiLWu0XTdKL4g",
        authDomain: "the-name-vault-d9a8f.firebaseapp.com",
        projectId: "the-name-vault-d9a8f",
        storageBucket: "the-name-vault-d9a8f.firebasestorage.app",
        messagingSenderId: "607838251875",
        appId: "1:607838251875:web:91862a55886277ce100156"
    },
    publishDelay: 5 * 60, // 5 Menit
    topDelay: 10 * 60     // 10 Menit
};

export const State = {
    vaultData: [],
    isAdmin: false,
    isProcessing: false,
    adminClicks: 0
};