// import React, { createContext, useContext, useState, useEffect } from 'react';

// export type UserRole = 'conductor' | 'supervisor' | 'analista' | 'administrador';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   department: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Mock users for demonstration
// const mockUsers: User[] = [
//   {
//     id: '1',
//     name: 'Juan Pérez',
//     email: 'juan.perez@santacruz.go.cr',
//     role: 'conductor',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '2',
//     name: 'María Rodríguez',
//     email: 'maria.rodriguez@santacruz.go.cr',
//     role: 'supervisor',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '3',
//     name: 'Carlos Jiménez',
//     email: 'carlos.jimenez@santacruz.go.cr',
//     role: 'analista',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '4',
//     name: 'Ana González',
//     email: 'ana.gonzalez@santacruz.go.cr',
//     role: 'administrador',
//     department: 'Gestión Vial'
//   }
// ];

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check for stored user session
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Mock authentication - in real app, this would call your NestJS backend
//     const foundUser = mockUsers.find(u => u.email === email);
//     if (foundUser && password === 'password') {
//       setUser(foundUser);
//       localStorage.setItem('user', JSON.stringify(foundUser));
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect } from 'react';

// export type UserRole = 'conductor' | 'supervisor' | 'analista' | 'administrador';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   department: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Mock users for demonstration
// const mockUsers: User[] = [
//   {
//     id: '1',
//     name: 'Juan Pérez',
//     email: 'juan.perez@santacruz.go.cr',
//     role: 'conductor',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '2',
//     name: 'María Rodríguez',
//     email: 'maria.rodriguez@santacruz.go.cr',
//     role: 'supervisor',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '3',
//     name: 'Carlos Jiménez',
//     email: 'carlos.jimenez@santacruz.go.cr',
//     role: 'analista',
//     department: 'Gestión Vial'
//   },
//   {
//     id: '4',
//     name: 'Ana González',
//     email: 'ana.gonzalez@santacruz.go.cr',
//     role: 'administrador',
//     department: 'Gestión Vial'
//   }
// ];

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check for stored user session
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Mock authentication - in real app, this would call your NestJS backend
//     const foundUser = mockUsers.find(u => u.email === email);
//     if (foundUser && password === 'password') {
//       setUser(foundUser);
//       localStorage.setItem('user', JSON.stringify(foundUser));
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// src/contexts/AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { authService } from '../services/authService';

// export type UserRole = 'conductor' | 'supervisor' | 'analista' | 'administrador';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   department: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Restaurar sesión desde localStorage al cargar
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) setUser(JSON.parse(storedUser));
//     setLoading(false);
//   }, []);

//   // 👉 AHORA sí llamamos al backend y guardamos token + user
//   const login = async (email: string, password: string): Promise<boolean> => {
//   try {
//     const res = await authService.login({ email, password });

//     // normalizador de role -> a tu union
//     const toRole = (r: unknown): UserRole => {
//       const v = String(r || '').toLowerCase();
//       if (v === 'conductor' || v === 'supervisor' || v === 'analista' || v === 'administrador') {
//         return v as UserRole;
//       }
//       return 'conductor';
//     };

//     const typedUser: User = {
//       id: String((res.user as any).id),
//       name: (res.user as any).name,
//       email: (res.user as any).email,
//       role: toRole((res.user as any).role),
//       department: (res.user as any).department ?? '',
//     };

//     localStorage.setItem('token', res.access_token);
//     localStorage.setItem('user', JSON.stringify(typedUser));
//     setUser(typedUser);
//     return true;
//   } catch {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     return false;
//   }
// };


//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
//   return ctx;
// };

// src/contexts/AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { authService } from '../services/authService';

// export type UserRole = 'conductor' | 'supervisor' | 'analista' | 'administrador';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   department: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const rawUser = localStorage.getItem('user');
//     if (rawUser) {
//       try {
//         const parsed: User = JSON.parse(rawUser);
//         setUser(parsed);
//       } catch {
//         localStorage.removeItem('user');
//       }
//     }
//     setLoading(false);
//   }, []);

    

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const res = await authService.login({ email, password });
//       // guarda token + user
//       localStorage.setItem('token', res.access_token);
//       localStorage.setItem('user', JSON.stringify(res.user));
//       setUser(res.user); // TIP: res.user.role debe ser uno de: 'conductor' | 'supervisor' | 'analista' | 'administrador'
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
//   return ctx;
// };

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export type UserRole = 'conductor' | 'supervisor' | 'analista' | 'administrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convierte cualquier variante del rol del backend a tu union UserRole
const normalizeRole = (raw?: string): UserRole => {
  const r = (raw ?? '').trim().toLowerCase();
  switch (r) {
    case 'conductor':
    case 'driver':
      return 'conductor';
    case 'supervisor':
      return 'supervisor';
    case 'analista':
    case 'analyst':
      return 'analista';
    case 'administrador':
    case 'admin':
    case 'administrator':
      return 'administrador';
    default:
      return 'conductor'; // fallback seguro
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.login({ email, password }); // POST /auth/login

      // Normaliza el rol (el backend lo envía como string)
      const typedUser: User = { ...res.user, role: normalizeRole(res.user.role) };

      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(typedUser));
      setUser(typedUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};






