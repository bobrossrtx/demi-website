// If the frontend is served by the backend (same origin), leave this empty.
// For local dev with a separate frontend origin (e.g. :3000), set REACT_APP_API_URL.
const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const apiUrl = (path: string) => {
  if (!path.startsWith('/')) return `${API_URL}/${path}`;
  return `${API_URL}${path}`;
};

export interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  hide_username?: boolean;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginData {
  username_or_email: string;
  password: string;
}

export interface ErrorResponse {
  error: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const authResponse: AuthResponse = await response.json();
    this.setToken(authResponse.token);
    this.setUser(authResponse.user);
    return authResponse;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const authResponse: AuthResponse = await response.json();
    this.setToken(authResponse.token);
    this.setUser(authResponse.user);
    return authResponse;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(apiUrl('/api/users/me'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error('Failed to fetch user data');
    }

    const user: User = await response.json();
    this.setUser(user);
    return user;
  },
};
