const firebaseConfig = {
    apiKey: "AIzaSyBkDvvZ8URn-bvQWhqbZElEx4POR12tJo4",
    authDomain: "pitch-craft-a20f2.firebaseapp.com",
    projectId: "pitch-craft-a20f2",
    storageBucket: "pitch-craft-a20f2.firebasestorage.app",
    messagingSenderId: "912823133018",
    appId: "1:912823133018:web:0b46413e38559cd2014963",
    measurementId: "G-4EMWVMF2ZL"
  };

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const dashboard = document.getElementById('dashboard');
const dashboardLoading = document.getElementById('dashboard-loading');
const userDisplay = document.getElementById('user-display');
const userEmail = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

auth.onAuthStateChanged((user) => {
    if (user) {
        userDisplay.textContent = user.displayName || user.email;
        userEmail.textContent = user.email;
        userAvatar.textContent = (user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)).toUpperCase();
        
        dashboardLoading.style.display = 'none';
        dashboard.style.display = 'block';
    } else {
        window.location.href = 'index.html'; 
    }
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log("User logged out");
    }).catch((error) => {
        console.error("Logout error:", error);
    });
});