'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const CATEGORIES = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'];

const FIELDS = [
  { key: 'problem',     label: '문제 상황',      placeholder: '어떤 문제나 상황이 있었나요?',               required: true },
  { key: 'role',        label: '나의 역할',       placeholder: '이 상황에서 나의 역할은 무엇이었나요?',        required: true },
  { key: 'goal',        label: '목표',            placeholder: '달성하고자 했던 목표는 무엇인가요?',          required: true },
  { key: 'action',      label: '실행한 일',       placeholder: '목표를 위해 구체적으로 어떤 행동을 했나요?',   required: true },
  { key: 'result',      label: '결과',            placeholder: '실행 결과는 어땠나요?',                     required: true },
  { key: 'achievement', label: '성과 및 배운 점', placeholder: '얻은 성과나 배운 점을 적어주세요. (선택)',     required: false },
] as const;

type FormKey = 'title' | 'summary' | 'category' | 'problem' | 'role' | 'goal' | 'action' | 'result' | 'achievement';

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { token, user } = useAuthStore();
  const [form, setForm] = useState<Record<FormKey, string>>({
    title: '', summary: '', category: '', problem: '', role: '', goal: '', action: '', result: '', achievement: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    api.get(`/api/experiences/${params.id}`).then((res) => {
      const e = res.data;
      if (e.userId !== user?.id) { router.push(`/experiences/${params.id}`); return; }
      if (e.status !== 'DRAFT' && e.status !== 'REJECTED') { router.push(`/experiences/${params.id}`); return; }
      setForm({
        title: e.title ?? '',
        summary: e.summary ?? '',
        category: e.category ?? '',
        problem: e.problem ?? '',
        role: e.role ?? '',
        goal: e.goal ?? '',
        action: e.action ?? '',
        result: e.result ?? '',
        achievement: e.achievement ?? '',
      });
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [token, user, params.id, router]);

  const set = (key: FormKey, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/api/experiences/${params.id}`, form);
      router.push(`/experiences/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">경험 수정</h1>
      <p className="text-sm text-neutral-500 mb-8">초안 또는 반려된 경험만 수정할 수 있습니다.</p>

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
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={200}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">요약</label>
          <input
            type="text"
            required
            minLength={10}
            maxLength={500}
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="border border-neutral-200 rounded-xl p-4 flex flex-col gap-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">STAR 구조</p>
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
