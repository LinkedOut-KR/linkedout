'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const CATEGORIES = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'];

const FIELDS = [
  { key: 'problem', label: '문제 상황', placeholder: '어떤 문제나 상황이 있었나요?', min: 20, required: true },
  { key: 'role', label: '나의 역할', placeholder: '이 상황에서 나의 역할은 무엇이었나요?', min: 10, required: true },
  { key: 'goal', label: '목표', placeholder: '달성하고자 했던 목표는 무엇인가요?', min: 10, required: true },
  { key: 'action', label: '실행한 일', placeholder: '목표를 위해 구체적으로 어떤 행동을 했나요?', min: 20, required: true },
  { key: 'result', label: '결과', placeholder: '실행 결과는 어땠나요? 수치로 표현하면 더 좋습니다.', min: 20, required: true },
  { key: 'achievement', label: '성과 및 배운 점', placeholder: '이 경험을 통해 얻은 성과나 배운 점을 적어주세요. (선택)', min: 0, required: false },
] as const;

type FormKey = 'title' | 'summary' | 'category' | 'problem' | 'role' | 'goal' | 'action' | 'result' | 'achievement';

export default function NewExperiencePage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<FormKey, string>>({
    title: '', summary: '', category: '개발',
    problem: '', role: '', goal: '', action: '', result: '', achievement: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: FormKey, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/experiences', form);
      router.push(`/experiences/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '경험 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">경험 등록</h1>
      <p className="text-sm text-neutral-500 mb-8">구체적으로 작성할수록 높은 등급을 받을 수 있습니다.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">직군</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">제목 <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={200}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="경험을 한 줄로 요약하세요"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">요약 <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            minLength={10}
            maxLength={500}
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
            placeholder="경험을 짧게 소개하세요 (목록에 표시됩니다)"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="border border-neutral-200 rounded-xl p-4 flex flex-col gap-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">STAR 구조로 작성하세요</p>
          {FIELDS.map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">
                {label} {required && <span className="text-red-400">*</span>}
              </label>
              <textarea
                required={required}
                value={form[key as FormKey]}
                onChange={(e) => set(key as FormKey, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-neutral-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '임시저장'}
        </button>
      </form>
    </div>
  );
}
