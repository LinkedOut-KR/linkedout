'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, token, logout, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => { init(); }, [init]);

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
