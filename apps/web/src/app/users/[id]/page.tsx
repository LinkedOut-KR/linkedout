import { notFound } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

async function getPublicProfile(id: string) {
  try {
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getPublicProfile(id);
  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{user.nickname}</h1>
            <p className="text-sm text-neutral-500 mt-1">{user.jobCategory}</p>
            {user.profile?.bio && (
              <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{user.profile.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {user.profile?.githubUrl && (
                <a href={user.profile.githubUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline">
                  GitHub
                </a>
              )}
              {user.profile?.linkedinUrl && (
                <a href={user.profile.linkedinUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline">
                  LinkedIn
                </a>
              )}
              {user.profile?.portfolioUrl && (
                <a href={user.profile.portfolioUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline">
                  포트폴리오
                </a>
              )}
            </div>
          </div>
          {user.userGrade && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-amber-600">{user.userGrade.totalScore}점</div>
              <div className="text-xs text-neutral-400 mt-1">
                승인 경험 {user._count?.experiences ?? user.userGrade.experienceCount}개
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="font-semibold mb-4">승인된 경험</h2>

      {!user.experiences || user.experiences.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 bg-white border border-neutral-200 rounded-xl">
          승인된 경험이 없습니다
        </div>
      ) : (
        <div className="grid gap-3">
          {user.experiences.map((exp: any) => (
            <Link key={exp.id} href={`/experiences/${exp.id}`}
              className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{exp.category}</span>
                    {exp.grade != null && (
                      <span className="text-xs font-semibold text-amber-600">{Number(exp.grade).toFixed(1)}등급</span>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{exp.title}</p>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{exp.summary}</p>
                </div>
                <div className="text-xs text-neutral-400 shrink-0">조회 {exp.viewCount}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
