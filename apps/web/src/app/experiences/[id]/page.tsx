import { notFound } from 'next/navigation';
import api from '@/lib/api';
import VoteSection from './VoteSection';

async function getExperience(id: string) {
  try {
    const res = await api.get(`/api/experiences/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exp = await getExperience(id);
  if (!exp) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{exp.category}</span>
          {exp.grade && (
            <span className="text-sm font-semibold text-amber-600">{exp.grade.toFixed(1)}등급</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            exp.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
            exp.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
            'bg-neutral-100 text-neutral-500'
          }`}>
            {exp.status === 'APPROVED' ? '승인됨' : exp.status === 'PENDING' ? '검토 중' : exp.status === 'DRAFT' ? '임시저장' : '반려됨'}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{exp.title}</h1>
        <p className="text-neutral-500">{exp.summary}</p>
        <div className="flex items-center gap-3 mt-3 text-sm text-neutral-400">
          <span>{exp.user?.nickname}</span>
          <span>·</span>
          <span>{exp.user?.jobCategory}</span>
          <span>·</span>
          <span>조회 {exp.viewCount}</span>
          <span>·</span>
          <span>평가 {exp._count?.votes ?? 0}개</span>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 whitespace-pre-wrap text-sm leading-relaxed">
        {exp.content}
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

      <VoteSection experienceId={id} />
    </div>
  );
}
