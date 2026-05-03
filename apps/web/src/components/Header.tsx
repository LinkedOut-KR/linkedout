'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function Header() {
  const { user, token, logout, setAuth, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    if (token && !user) {
      api.get('/api/users/me').then((res) => {
        setAuth(res.data, token);
      }).catch(() => {});
    }
  }, [token, user, init, setAuth]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">LinkedOut</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-600 hover:text-neutral-900">경험 탐색</Link>
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-amber-600 hover:text-amber-700 font-medium">관리자</Link>
              )}
              <Link href="/experiences/new" className="text-neutral-600 hover:text-neutral-900">경험 등록</Link>
              <Link href="/profile" className="text-neutral-600 hover:text-neutral-900">{user?.nickname ?? '내 프로필'}</Link>
              <button onClick={handleLogout} className="text-neutral-400 hover:text-neutral-700">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:text-neutral-900">로그인</Link>
              <Link href="/register" className="bg-neutral-900 text-white px-3 py-1.5 rounded-md hover:bg-neutral-700">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
