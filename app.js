const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "pitch-craft-a20f2.firebaseapp.com",
    projectId: "pitch-craft-a20f2",
    storageBucket: "pitch-craft-a20f2.appspot.com",
    messagingSenderId: "912823133018",
    appId: "1:912823133018:web:0b46413e38559cd2014963",
    measurementId: "G-4EMWVMF2ZL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();


// DOM Elements
const username = document.getElementById('reg-username').value.trim();
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginFormElement = document.getElementById('loginForm');
const registerFormElement = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutSuccess = document.getElementById('logout-success');
const registerSuccess = document.getElementById('register-success');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loginLoading = document.getElementById('login-loading');
const registerLoading = document.getElementById('register-loading');

function fadeSwitch(hideEl, showEl) {
  hideEl.classList.remove('fade-in');
  hideEl.style.display = 'none';
  showEl.style.display = 'block';
  showEl.classList.add('fade-in');
}

// Show signup form
showRegisterLink.addEventListener('click', () => {
  fadeSwitch(loginForm, registerForm);
  hideAllMessages();
});

// Show login form
showLoginLink.addEventListener('click', () => {
  fadeSwitch(registerForm, loginForm);
  hideAllMessages();
});

// Hide messages
function hideAllMessages() {
  [logoutSuccess, registerSuccess, loginError, registerError].forEach((el) => {
    if (el) el.style.display = 'none';
  });
}

// Login form
loginFormElement.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  let isValid = true;

  if (email === '') {
    emailError.style.display = 'block';
    isValid = false;
  } else emailError.style.display = 'none';

  if (password === '') {
    passwordError.style.display = 'block';
    isValid = false;
  } else passwordError.style.display = 'none';

  if (isValid) {
    loginLoading.style.display = 'block';
    loginError.style.display = 'none';

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Login successful:", userCredential.user.email);
        window.location.href = 'dashboard.html';
        loginLoading.style.display = 'none';
        loginFormElement.reset();
      })
      .catch((error) => {
        loginLoading.style.display = 'none';
        loginError.style.display = 'block';
        console.error("Login error:", error);
      });
  }
});

// Signup form
registerFormElement.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  const emailError = document.getElementById('reg-email-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmPasswordError = document.getElementById('reg-confirm-password-error');

  let isValid = true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.style.display = 'block';
    isValid = false;
  } else emailError.style.display = 'none';

  if (password.length < 6) {
    passwordError.style.display = 'block';
    isValid = false;
  } else passwordError.style.display = 'none';

  if (password !== confirmPassword) {
    confirmPasswordError.style.display = 'block';
    isValid = false;
  } else confirmPasswordError.style.display = 'none';

  if (isValid) {
    registerLoading.style.display = 'block';
    registerError.style.display = 'none';

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user.updateProfile({ displayName: username }).then(() => {
          fadeSwitch(registerForm, loginForm);
          registerSuccess.style.display = 'block';
          registerFormElement.reset();
          registerLoading.style.display = 'none';
        });
      })
      .catch((error) => {
        registerLoading.style.display = 'none';
        registerError.style.display = 'block';
        if (error.code === 'auth/email-already-in-use') {
          registerError.textContent = 'This email is already in use.';
        } else {
          registerError.textContent = 'Error creating account. Please try again.';
        }
        console.error("Registration error:", error);
      });
  }
});
