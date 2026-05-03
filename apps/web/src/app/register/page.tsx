'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const CATEGORIES = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'];

type Step = 'phone' | 'form';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nickname: '', jobCategory: '개발' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/phone/send', { phone });
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/phone/verify', { phone, code });
      setStep('form');
    } catch (err: any) {
      setError(err.response?.data?.message ?? '인증번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { ...form, phone });
      setAuth(res.data.user, res.data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-8">회원가입</h1>

      {step === 'phone' ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">휴대폰 번호</label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <button
                onClick={sendCode}
                disabled={loading || !phone}
                className="bg-neutral-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-neutral-700 disabled:opacity-50 whitespace-nowrap"
              >
                {codeSent ? '재전송' : '인증번호 발송'}
              </button>
            </div>
          </div>
          {codeSent && (
            <div>
              <label className="block text-sm font-medium mb-1">인증번호</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6자리 입력"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  onClick={verifyCode}
                  disabled={loading || code.length !== 6}
                  className="bg-neutral-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-neutral-700 disabled:opacity-50"
                >
                  확인
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-1">개발 환경에서는 서버 로그에서 인증번호를 확인하세요</p>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input type="password" required minLength={8} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">닉네임</label>
            <input type="text" required value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">직군</label>
            <select value={form.jobCategory}
              onChange={(e) => setForm({ ...form, jobCategory: e.target.value })}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-neutral-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50">
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
      )}

      <p className="text-sm text-neutral-500 mt-6 text-center">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-neutral-900 font-medium underline">로그인</Link>
      </p>
    </div>
  );
}
