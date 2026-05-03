'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Profile {
  id: string;
  email: string;
  nickname: string;
  jobCategory: string;
  userGrade?: { totalScore: number; experienceCount: number };
  experiences?: Array<{
    id: string;
    title: string;
    status: string;
    grade: number | null;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    api.get('/api/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => { logout(); router.push('/login'); })
      .finally(() => setLoading(false));
  }, [token, router, logout]);

  if (loading) return <div className="text-center py-20 text-neutral-400">불러오는 중...</div>;
  if (!profile) return null;

  const STATUS_LABEL: Record<string, string> = {
    DRAFT: '임시저장', PENDING: '검토 중', APPROVED: '승인됨', REJECTED: '반려됨',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile.nickname}</h1>
            <p className="text-sm text-neutral-500 mt-1">{profile.jobCategory} · {profile.email}</p>
          </div>
          <Link href="/profile/edit" className="text-sm border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50">
            프로필 수정
          </Link>
          {profile.userGrade && (
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{profile.userGrade.totalScore}점</div>
              <div className="text-xs text-neutral-400 mt-1">경험 {profile.userGrade.experienceCount}개</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">내 경험</h2>
        <Link href="/experiences/new" className="text-sm bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-700">
          + 경험 등록
        </Link>
      </div>

      {!profile.experiences || profile.experiences.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 bg-white border border-neutral-200 rounded-xl">
          등록된 경험이 없습니다
        </div>
      ) : (
        <div className="grid gap-3">
          {profile.experiences.map((exp) => (
            <Link key={exp.id} href={`/experiences/${exp.id}`}
              className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 transition-colors flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{exp.title}</p>
                <p className="text-xs text-neutral-400 mt-1">{new Date(exp.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
              <div className="flex items-center gap-2">
                {exp.grade && <span className="text-xs font-semibold text-amber-600">{exp.grade.toFixed(1)}등급</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  exp.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                  exp.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-neutral-100 text-neutral-500'
                }`}>{STATUS_LABEL[exp.status] ?? exp.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
