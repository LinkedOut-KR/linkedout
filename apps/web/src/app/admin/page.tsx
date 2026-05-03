'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface PendingExp {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
  user: { id: string; nickname: string; email: string };
  proofs: { id: string; fileUrl: string }[];
  _count: { votes: number };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [list, setList] = useState<PendingExp[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'ADMIN') { router.push('/'); return; }
    api.get('/api/experiences/admin/pending')
      .then((res) => setList(res.data.data))
      .catch(() => setError('목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [token, user, router]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError('');
    try {
      await api.patch(`/api/experiences/${id}/approve`, {
        grade: grades[id] ? Number(grades[id]) : undefined,
        note: notes[id] || undefined,
      });
      setList((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message ?? '승인에 실패했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    setError('');
    try {
      await api.patch(`/api/experiences/${id}/reject`, { note: notes[id] || undefined });
      setList((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message ?? '반려에 실패했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">불러오는 중...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">경험 검토 관리</h1>
        <span className="text-sm text-neutral-500">대기 중: {list.length}건</span>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {list.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 bg-white border border-neutral-200 rounded-xl">
          검토 대기 중인 경험이 없습니다
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {list.map((exp) => (
            <div key={exp.id} className="bg-white border border-neutral-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{exp.category}</span>
                    <span className="text-xs text-neutral-400">{new Date(exp.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <Link href={`/experiences/${exp.id}`} target="_blank"
                    className="font-semibold hover:underline text-neutral-900">
                    {exp.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-1">{exp.summary}</p>
                </div>
                <div className="text-right text-sm shrink-0">
                  <p className="font-medium">{exp.user.nickname}</p>
                  <p className="text-neutral-400 text-xs">{exp.user.email}</p>
                </div>
              </div>

              {exp.proofs.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-neutral-500 mb-1">증빙 자료</p>
                  <ul className="flex flex-col gap-0.5">
                    {exp.proofs.map((p) => (
                      <li key={p.id}>
                        <a href={p.fileUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block">
                          {p.fileUrl}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min={1} max={9} step={0.1}
                    placeholder="등급 (1~9, 비워두면 자동)"
                    value={grades[exp.id] ?? ''}
                    onChange={(e) => setGrades((g) => ({ ...g, [exp.id]: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="메모 (선택)"
                    value={notes[exp.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [exp.id]: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <button
                  onClick={() => handleApprove(exp.id)}
                  disabled={processing === exp.id}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  승인
                </button>
                <button
                  onClick={() => handleReject(exp.id)}
                  disabled={processing === exp.id}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  반려
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
