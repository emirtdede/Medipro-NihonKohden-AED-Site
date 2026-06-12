
// --- Profile Management ---

async function loadProfile() {
    const res = await apiCall('/profile');
    if (res && res.success) {
        const u = res.user;
        document.getElementById('profile-email').value = u.email;
        document.getElementById('profile-phone').value = u.phone || '';

        updateStatus('email', u.email_verified);
        updateStatus('phone', u.phone_verified);
    }
}

function updateStatus(type, verified) {
    const el = document.getElementById(`${type}-status`);
    if (verified) {
        el.innerHTML = '<span style="color: green; margin-left: 10px;">✔ Doğrulandı</span>';
    } else {
        el.innerHTML = `<button onclick="sendVerify('${type}')" class="btn-verify">Doğrula</button>`;
    }
}

async function updateProfileData() {
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;

    // Direct update without password prompt (Session authenticated)
    const res = await apiCall('/profile/update', 'POST', {
        email, phone
    });

    if (res && res.success) {
        alert(res.message);
        loadProfile();
    } else {
        alert(res ? res.message : 'Hata oluştu.');
    }
}

async function updateDataWithPassword() {
    const currentPass = document.getElementById('current-pass').value;
    const newPass = document.getElementById('new-pass').value;

    if (!currentPass || !newPass) {
        alert('Lütfen mevcut ve yeni şifreyi girin.');
        return;
    }

    const res = await apiCall('/profile/update', 'POST', {
        currentPassword: currentPass,
        newPassword: newPass
    });

    if (res && res.success) {
        alert(res.message);
        document.getElementById('current-pass').value = '';
        document.getElementById('new-pass').value = '';
    } else {
        alert(res ? res.message : 'Hata oluştu.');
    }
}

async function sendVerify(type) {
    const res = await apiCall('/profile/send-verification', 'POST', { type });
    if (res && res.success) {
        // Show the backend message (which says check verification_code.txt) in the prompt
        const code = prompt(`${res.message}\n\nLütfen kodu buraya girin:`);
        if (code) {
            verifyCode(type, code);
        }
    } else {
        alert(res ? res.message : 'Hata oluştu.');
    }
}

async function verifyCode(type, code) {
    const res = await apiCall('/profile/verify', 'POST', { type, code });
    if (res && res.success) {
        alert('Doğrulama başarılı!');
        loadProfile();
    } else {
        alert(res ? res.message : 'Hata oluştu.');
    }
}
