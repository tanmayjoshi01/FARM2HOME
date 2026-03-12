// Basic utility to decode JWT token payload without external library
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  
  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded ? decoded.role : null;
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
