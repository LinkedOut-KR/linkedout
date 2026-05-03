'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Proof { id: string; fileUrl: string }

interface Props {
  experienceId: string;
  ownerId: string;
  status: string;
  proofs: Proof[];
}

export default function OwnerActions({ experienceId, ownerId, status, proofs }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [url, setUrl] = useState('');
  const [proofList, setProofList] = useState<Proof[]>(proofs);
  const [addingProof, setAddingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.id !== ownerId) return null;
  if (status !== 'DRAFT' && status !== 'REJECTED') return null;

  const handleAddProof = async () => {
    if (!url.trim()) return;
    setAddingProof(true);
    setError('');
    try {
      const res = await api.post(`/api/experiences/${experienceId}/proofs`, { url });
      setProofList((prev) => [...prev, { id: res.data.id.toString(), fileUrl: url }]);
      setUrl('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? '증빙 추가에 실패했습니다.');
    } finally {
      setAddingProof(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/experiences/${experienceId}/submit`);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message ?? '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <h2 className="font-semibold mb-1">검토 요청</h2>
      <p className="text-sm text-neutral-500 mb-4">증빙 URL을 1개 이상 첨부해야 검토를 요청할 수 있습니다.</p>

      {proofList.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1">
          {proofList.map((p) => (
            <li key={p.id} className="text-xs text-blue-600 truncate">
              <a href={p.fileUrl} target="_blank" rel="noreferrer">{p.fileUrl}</a>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="증빙 URL (GitHub, 포트폴리오, 링크드인 등)"
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        />
        <button
          onClick={handleAddProof}
          disabled={addingProof || !url.trim()}
          className="bg-neutral-200 text-neutral-800 px-3 py-2 rounded-lg text-sm hover:bg-neutral-300 disabled:opacity-50"
        >
          {addingProof ? '추가 중...' : '추가'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || proofList.length === 0}
        className="w-full bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50"
      >
        {submitting ? '요청 중...' : '검토 요청하기'}
      </button>
    </div>
  );
}
