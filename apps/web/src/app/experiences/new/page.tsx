'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const CATEGORIES = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'];

export default function NewExperiencePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', content: '', category: '개발' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <h1 className="text-2xl font-bold mb-8">경험 등록</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">직군</label>
          <select value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="경험을 한 줄로 요약하세요"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">요약</label>
          <input type="text" required value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="경험을 짧게 설명하세요 (목록에 표시)"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">상세 내용</label>
          <textarea required value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            placeholder="경험을 상세히 작성하세요"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50">
          {loading ? '저장 중...' : '임시저장 (DRAFT)'}
        </button>
      </form>
    </div>
  );
}
