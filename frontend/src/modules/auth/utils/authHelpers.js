/**
 * Store auth token and user data in localStorage.
 * @param {string} token
 * @param {object} user
 */
export const setAuthData = (token, user) => {
  localStorage.setItem("transitops_token", token);
  localStorage.setItem("transitops_user", JSON.stringify(user));
};

/**
 * Retrieve the stored auth token.
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem("transitops_token");
};

/**
 * Retrieve the stored user object.
 * @returns {object|null}
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("transitops_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Clear all auth data from localStorage.
 */
export const clearAuthData = () => {
  localStorage.removeItem("transitops_token");
  localStorage.removeItem("transitops_user");
  localStorage.removeItem("transitops_role");
  localStorage.removeItem("transitops_username");
};

/**
 * Check if the user is authenticated (has a token).
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get the user's role from stored data.
 * @returns {string|null}
 */
export const getUserRole = () => {
  const user = getStoredUser();
  return user ? user.role : null;
};
