/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Aug 05 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { LogIn, User } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';

export default function Avatar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useOAuth4WebApiAuth();
  const { signOut } = user;
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleSignout = () => {
    signOut();
    setMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/device-login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="avatar-button"
        onClick={user?.user ? () => setMenuOpen(!menuOpen) : handleSignIn}
        className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
      >
        {user?.user ? (
          <User size={20} aria-label="user-menu-button" />
        ) : (
          <LogIn size={20} aria-label="login-button" />
        )}
      </button>

      {menuOpen && user?.user && (
        <div
          aria-label="user-menu"
          className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-dark-end border border-white/10 shadow-xl z-50 py-1 overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-xs font-semibold">
              {user.user?.preferred_username || 'anonymous'}
            </p>
          </div>
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition"
          >
            Profile
          </button>
          <button
            onClick={handleSignout}
            className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
