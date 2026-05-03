'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface ProfileData {
  nickname: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [form, setForm] = useState<ProfileData>({
    nickname: '', bio: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    api.get('/api/users/me').then((res) => {
      const u = res.data;
      setForm({
        nickname: u.nickname ?? '',
        bio: u.profile?.bio ?? '',
        githubUrl: u.profile?.githubUrl ?? '',
        linkedinUrl: u.profile?.linkedinUrl ?? '',
        portfolioUrl: u.profile?.portfolioUrl ?? '',
      });
    }).finally(() => setLoading(false));
  }, [token, router]);

  const set = (k: keyof ProfileData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await api.patch('/api/users/me', form);
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">불러오는 중...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-8">프로필 수정</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">닉네임</label>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => set('nickname', e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">소개</label>
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            rows={4}
            placeholder="자신을 소개해주세요"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            type="url"
            value={form.githubUrl}
            onChange={(e) => set('githubUrl', e.target.value)}
            placeholder="https://github.com/username"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedinUrl}
            onChange={(e) => set('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">포트폴리오 URL</label>
          <input
            type="url"
            value={form.portfolioUrl}
            onChange={(e) => set('portfolioUrl', e.target.value)}
            placeholder="https://portfolio.example.com"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">저장되었습니다. 이동 중...</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-neutral-200 py-2 rounded-lg text-sm hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
