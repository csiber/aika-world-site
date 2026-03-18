const KEYS = {
  token: 'aika_token',
  role: 'aika_role',
  email: 'aika_email',
  nickname: 'aika_nickname',
  fullName: 'aika_full_name',
};

export function getToken() {
  return localStorage.getItem(KEYS.token) || null;
}

export function setToken(token) {
  localStorage.setItem(KEYS.token, token);
}

export function setUserData(user) {
  if (user.role) localStorage.setItem(KEYS.role, user.role);
  if (user.email) localStorage.setItem(KEYS.email, user.email);
  if (user.nickname) localStorage.setItem(KEYS.nickname, user.nickname);
  if (user.fullName) localStorage.setItem(KEYS.fullName, user.fullName);
}

export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function getStoredRole() {
  return localStorage.getItem(KEYS.role) || null;
}
