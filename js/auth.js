document.addEventListener('DOMContentLoaded', () => {
  insertTestUsers();
  setupSignupForms();
  setupLoginForms();
  autoFillForms();
});

function insertTestUsers() {
  const existing = Storage.get('users', []);
  const emails = existing.map(user => user.email);

  const testUsers = [
    {
      id: "test-1",
      name: "Test Influencer",
      email: "influencer@test.com",
      password: "test123",
      role: "influencer",
      created: new Date().toISOString(),
      socialMedia: {
        instagram: { handle: "@testinfluencer", followers: 1000 }
      }
    },
    {
      id: "test-2",
      name: "Test Admin",
      email: "admin@test.com",
      password: "test123",
      role: "admin",
      created: new Date().toISOString()
    },
    {
      id: "test-3",
      name: "Test Brand",
      email: "brand@test.com",
      password: "test123",
      role: "brand",
      created: new Date().toISOString()
    }
  ];

  const newUsers = testUsers.filter(user => !emails.includes(user.email));
  if (newUsers.length > 0) {
    Storage.set('users', [...existing, ...newUsers]);
  }
}

function setupSignupForms() {
  const influencerForm = document.getElementById('influencer-form');
  if (influencerForm) {
    influencerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('influencer-name').value.trim();
      const email = document.getElementById('influencer-email').value.trim();
      const password = document.getElementById('influencer-password').value;
      const instagram = document.getElementById('influencer-instagram').value.trim();
      const facebook = document.getElementById('influencer-facebook').value.trim();

      if (!name || !email || !password) {
        UIUtils.showNotification('Please fill all required fields', 'error');
        return;
      }

      if (!FormUtils.validateEmail(email)) {
        UIUtils.showNotification('Please enter a valid email', 'error');
        return;
      }

      const user = {
        id: Date.now().toString(),
        name,
        email,
        role: 'influencer',
        created: new Date().toISOString(),
        socialMedia: {}
      };

      if (instagram) {
        user.socialMedia.instagram = {
          handle: instagram,
          followers: 0
        };
      }

      if (facebook) {
        user.socialMedia.facebook = {
          handle: facebook,
          followers: 0
        };
      }

      const users = Storage.get('users', []);
      users.push(user);
      Storage.set('users', users);

      UIUtils.showNotification('Account created successfully', 'success');
      Auth.login(user);
    });
  }

  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-name').value.trim();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const passcode = document.getElementById('admin-passcode').value;

      if (!name || !email || !password || !passcode) {
        UIUtils.showNotification('Please fill all fields', 'error');
        return;
      }

      if (!FormUtils.validateEmail(email)) {
        UIUtils.showNotification('Please enter a valid email', 'error');
        return;
      }

      if (passcode !== 'admin123') {
        UIUtils.showNotification('Invalid admin passcode', 'error');
        return;
      }

      const user = {
        id: Date.now().toString(),
        name,
        email,
        role: 'admin',
        created: new Date().toISOString()
      };

      const users = Storage.get('users', []);
      users.push(user);
      Storage.set('users', users);

      UIUtils.showNotification('Admin account created successfully', 'success');
      Auth.login(user);
    });
  }

  const brandForm = document.getElementById('brand-form');
  if (brandForm) {
    brandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('brand-name').value.trim();
      const email = document.getElementById('brand-email').value.trim();
      const website = document.getElementById('brand-website').value.trim();
      const description = document.getElementById('brand-description').value.trim();

      if (!name || !email || !website || !description) {
        UIUtils.showNotification('Please fill all fields', 'error');
        return;
      }

      if (!FormUtils.validateEmail(email)) {
        UIUtils.showNotification('Please enter a valid email', 'error');
        return;
      }

      const request = {
        id: Date.now().toString(),
        name,
        email,
        website,
        description,
        status: 'pending',
        created: new Date().toISOString()
      };

      const brandRequests = Storage.get('brandRequests', []);
      brandRequests.push(request);
      Storage.set('brandRequests', brandRequests);

      UIUtils.showNotification('Brand access request submitted successfully', 'success');
      brandForm.reset();
    });
  }
}

function setupLoginForms() {
  const influencerLoginForm = document.getElementById('influencer-login');
  if (influencerLoginForm) {
    influencerLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('influencer-email-login').value.trim();
      const password = document.getElementById('influencer-password-login').value;
      const remember = document.getElementById('influencer-remember').checked;

      if (!email || !password) {
        UIUtils.showNotification('Please fill all fields', 'error');
        return;
      }

      const users = Storage.get('users', []);
      const user = users.find(user => user.email === email && user.role === 'influencer');

      if (!user) {
        UIUtils.showNotification('Invalid email or password', 'error');
        return;
      }

      if (remember) {
        Storage.set('remember_influencer_email', email);
      } else {
        Storage.remove('remember_influencer_email');
      }

      UIUtils.showNotification('Login successful', 'success');
      Auth.login(user);
    });
  }

  const adminLoginForm = document.getElementById('admin-login');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email-login').value.trim();
      const password = document.getElementById('admin-password-login').value;
      const remember = document.getElementById('admin-remember').checked;

      if (!email || !password) {
        UIUtils.showNotification('Please fill all fields', 'error');
        return;
      }

      const users = Storage.get('users', []);
      const user = users.find(user => user.email === email && user.role === 'admin');

      if (!user) {
        UIUtils.showNotification('Invalid email or password', 'error');
        return;
      }

      if (remember) {
        Storage.set('remember_admin_email', email);
      } else {
        Storage.remove('remember_admin_email');
      }

      UIUtils.showNotification('Login successful', 'success');
      Auth.login(user);
    });
  }

  const brandLoginForm = document.getElementById('brand-login');
  if (brandLoginForm) {
    brandLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('brand-email-login').value.trim();
      const password = document.getElementById('brand-password-login').value;
      const remember = document.getElementById('brand-remember').checked;

      if (!email || !password) {
        UIUtils.showNotification('Please fill all fields', 'error');
        return;
      }

      const users = Storage.get('users', []);
      const user = users.find(user => user.email === email && user.role === 'brand');

      if (!user) {
        UIUtils.showNotification('Invalid email or password', 'error');
        return;
      }

      if (remember) {
        Storage.set('remember_brand_email', email);
      } else {
        Storage.remove('remember_brand_email');
      }

      UIUtils.showNotification('Login successful', 'success');
      Auth.login(user);
    });
  }
}

function autoFillForms() {
  const adminEmailInput = document.getElementById('admin-email-login');
  const adminRememberCheckbox = document.getElementById('admin-remember');

  if (adminEmailInput && adminRememberCheckbox) {
    const rememberedEmail = Storage.get('remember_admin_email');
    if (rememberedEmail) {
      adminEmailInput.value = rememberedEmail;
      adminRememberCheckbox.checked = true;
    }
  }

  const influencerEmailInput = document.getElementById('influencer-email-login');
  const influencerRememberCheckbox = document.getElementById('influencer-remember');

  if (influencerEmailInput && influencerRememberCheckbox) {
    const rememberedEmail = Storage.get('remember_influencer_email');
    if (rememberedEmail) {
      influencerEmailInput.value = rememberedEmail;
      influencerRememberCheckbox.checked = true;
    }
  }

  const brandEmailInput = document.getElementById('brand-email-login');
  const brandRememberCheckbox = document.getElementById('brand-remember');

  if (brandEmailInput && brandRememberCheckbox) {
    const rememberedEmail = Storage.get('remember_brand_email');
    if (rememberedEmail) {
      brandEmailInput.value = rememberedEmail;
      brandRememberCheckbox.checked = true;
    }
  }
}
