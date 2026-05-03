import { notFound } from 'next/navigation';
import api from '@/lib/api';
import VoteSection from './VoteSection';
import OwnerActions from './OwnerActions';

async function getExperience(id: string) {
  try {
    const res = await api.get(`/api/experiences/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPROVED: { label: '승인됨', cls: 'bg-green-50 text-green-700' },
  PENDING:  { label: '검토 중', cls: 'bg-yellow-50 text-yellow-700' },
  DRAFT:    { label: '임시저장', cls: 'bg-neutral-100 text-neutral-500' },
  REJECTED: { label: '반려됨', cls: 'bg-red-50 text-red-600' },
};

const SECTIONS = [
  { key: 'problem', label: '문제 상황' },
  { key: 'role',    label: '나의 역할' },
  { key: 'goal',    label: '목표' },
  { key: 'action',  label: '실행한 일' },
  { key: 'result',  label: '결과' },
  { key: 'achievement', label: '성과 및 배운 점' },
] as const;

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exp = await getExperience(id);
  if (!exp) notFound();

  const status = STATUS_MAP[exp.status] ?? { label: exp.status, cls: 'bg-neutral-100 text-neutral-500' };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{exp.category}</span>
          {exp.grade != null && (
            <span className="text-sm font-semibold text-amber-600">{Number(exp.grade).toFixed(1)}등급</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{exp.title}</h1>
        <p className="text-neutral-500">{exp.summary}</p>
        <div className="flex items-center gap-3 mt-3 text-sm text-neutral-400 flex-wrap">
          <span>{exp.user?.nickname}</span>
          {exp.user?.jobCategory && <><span>·</span><span>{exp.user.jobCategory}</span></>}
          <span>·</span>
          <span>조회 {exp.viewCount}</span>
          <span>·</span>
          <span>평가 {exp._count?.votes ?? 0}개</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {SECTIONS.map(({ key, label }) =>
          exp[key] ? (
            <div key={key} className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{label}</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-800">{exp[key]}</p>
            </div>
          ) : null
        )}
      </div>

      {exp.experienceGrade && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-3">평가 점수</h2>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {[
              { label: '난이도', value: exp.experienceGrade.grade },
              { label: '임팩트', value: exp.experienceGrade.grade },
              { label: '직무가치', value: exp.experienceGrade.grade },
              { label: '신뢰도', value: exp.experienceGrade.grade },
            ].map((item) => (
              <div key={item.label} className="bg-neutral-50 rounded-lg py-3">
                <div className="text-lg font-bold text-amber-600">{Number(item.value).toFixed(1)}</div>
                <div className="text-neutral-500 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-3">총 {exp.experienceGrade.voteCount}명이 평가했습니다</p>
        </div>
      )}

      <OwnerActions experienceId={id} ownerId={exp.userId} status={exp.status} proofs={exp.proofs ?? []} />

      {exp.status === 'APPROVED' && <VoteSection experienceId={id} />}
    </div>
  );
}
