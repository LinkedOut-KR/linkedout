'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Props { experienceId: string }

export default function VoteSection({ experienceId }: Props) {
  const token = useAuthStore((s) => s.token);
  const [vote, setVote] = useState({ difficulty: 5, impact: 5, workValue: 5, authenticity: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-center text-sm text-neutral-500">
      평가하려면 <a href="/login" className="text-neutral-900 underline">로그인</a>이 필요합니다
    </div>
  );

  if (submitted) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-sm text-green-700">
      평가가 완료되었습니다 ✓
    </div>
  );

  const fields = [
    { key: 'difficulty' as const, label: '난이도' },
    { key: 'impact' as const, label: '임팩트' },
    { key: 'workValue' as const, label: '직무가치' },
    { key: 'authenticity' as const, label: '신뢰도' },
  ];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/api/experiences/${experienceId}/vote`, vote);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '평가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h2 className="font-semibold mb-4">경험 평가하기</h2>
      <div className="grid gap-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 w-16">{label}</span>
            <input
              type="range" min={1} max={9} value={vote[key]}
              onChange={(e) => setVote({ ...vote, [key]: +e.target.value })}
              className="flex-1"
            />
            <span className="text-sm font-semibold w-4 text-center">{vote[key]}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 w-full bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? '제출 중...' : '평가 제출'}
      </button>
    </div>
  );
}
