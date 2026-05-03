import Link from 'next/link';
import api from '@/lib/api';

interface Experience {
  id: string;
  title: string;
  summary: string;
  category: string;
  grade: number | null;
  viewCount: number;
  createdAt: string;
  user: { nickname: string };
  _count: { votes: number };
}

async function getExperiences(search?: string, category?: string, sort?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    const res = await api.get(`/api/experiences?${params}`);
    return res.data;
  } catch {
    return { data: [], total: 0 };
  }
}

const CATEGORIES = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
  const { search, category, sort } = await searchParams;
  const { data: experiences } = await getExperiences(search, category, sort);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">경험 탐색</h1>
        <p className="text-neutral-500 text-sm">검증된 실무 경험을 확인하세요</p>
      </div>

      <form className="flex gap-2 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="경험 검색..."
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <select name="category" defaultValue={category} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">전체 직군</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="sort" defaultValue={sort} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="latest">최신순</option>
          <option value="popular">조회순</option>
          <option value="grade">등급순</option>
        </select>
        <button type="submit" className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-700">검색</button>
      </form>

      {experiences.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-lg mb-2">아직 경험이 없습니다</p>
          <Link href="/experiences/new" className="text-sm text-neutral-900 underline">첫 경험을 등록해보세요</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {experiences.map((exp: Experience) => (
            <Link
              key={exp.id}
              href={`/experiences/${exp.id}`}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{exp.category}</span>
                    {exp.grade && (
                      <span className="text-xs font-semibold text-amber-600">{exp.grade.toFixed(1)}등급</span>
                    )}
                  </div>
                  <h2 className="font-semibold text-neutral-900 truncate">{exp.title}</h2>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{exp.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-neutral-400">
                <span>{exp.user.nickname}</span>
                <span>·</span>
                <span>조회 {exp.viewCount}</span>
                <span>·</span>
                <span>평가 {exp._count.votes}</span>
                <span>·</span>
                <span>{new Date(exp.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
