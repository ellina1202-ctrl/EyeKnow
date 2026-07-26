export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">
          EyeKnow
        </h1>
        <p className="text-lg text-slate-600">
          의도-문장-발화 생성 시스템
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">📱</div>
            <h2 className="font-semibold text-lg mb-1">카테고리 모드</h2>
            <p className="text-sm text-slate-500">
              핵심어 → Intent(의도)
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">👁️</div>
            <h2 className="font-semibold text-lg mb-1">자유 입력 모드</h2>
            <p className="text-sm text-slate-500">
              Eye-keyboard + 추천어
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
          기본 세팅 완료 · Vercel 배포 준비됨
        </div>
      </div>
    </main>
  );
}
