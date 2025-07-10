// Store token in localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};

// Get authenticated user data
export const getAuthUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Set authenticated user data
export const setAuthUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Remove authenticated user data
export const removeAuthUser = () => {
    localStorage.removeItem('user');
};

// Logout user
export const logout = () => {
    removeToken();
    removeAuthUser();
};

// Create authenticated fetch function
export const authFetch = async (url, options = {}) => {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}; 