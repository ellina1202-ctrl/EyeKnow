"use client";

import { useState, useCallback } from "react";

type Mode = "home" | "category" | "free" | "result";

type Category = {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
};

const CATEGORIES: Category[] = [
  {
    id: "symptom",
    name: "증상",
    icon: "💊",
    keywords: ["머리아픔", "호흡곤란", "통증", "어지러움", "메스꺼움", "가려움"],
  },
  {
    id: "need",
    name: "요구",
    icon: "🙋",
    keywords: ["물", "화장실", "체위변경", "식사", "약", "도움"],
  },
  {
    id: "emotion",
    name: "감정",
    icon: "😊",
    keywords: ["좋아요", "힘들어요", "고마워요", "걱정돼요", "외로워요", "괜찮아요"],
  },
  {
    id: "body",
    name: "신체",
    icon: "🧍",
    keywords: ["머리", "목", "등", "다리", "손", "배"],
  },
];

// 간단한 Intent → 문장 템플릿 (실제로는 LLM API 호출 자리)
function generateSentences(keywords: string[], categoryId?: string): string[] {
  if (keywords.length === 0) return ["무엇을 말씀하고 싶으신가요?"];

  const templates: Record<string, string[]> = {
    머리아픔: ["머리가 많이 아파요.", "두통이 심해요.", "머리가 지끈거려요."],
    호흡곤란: ["숨이 차요.", "호흡이 힘들어요.", "숨을 깊게 쉴 수가 없어요."],
    통증: ["여기가 아파요.", "통증이 심해요.", "아픔이 계속돼요."],
    물: ["물 좀 주세요.", "목이 말라요. 물을 마시고 싶어요.", "물 부탁드려요."],
    화장실: ["화장실에 가고 싶어요.", "화장실 좀 도와주세요.", "소변이 마려워요."],
    체위변경: ["자세를 바꿔주세요.", "몸을 돌려주세요.", "조금 일으켜 주세요."],
    좋아요: ["기분이 좋아요.", "괜찮아요, 고마워요.", "잘 지내고 있어요."],
    힘들어요: ["조금 힘들어요.", "많이 지쳤어요.", "도움이 필요해요."],
    고마워요: ["정말 고마워요.", "도와주셔서 감사해요.", "감사합니다."],
  };

  for (const k of keywords) {
    if (templates[k]) return templates[k];
  }

  if (categoryId === "symptom") {
    return [
      `${keywords.join(" ")} 때문에 힘들어요.`,
      `${keywords[0]}이(가) 있어요.`,
      `지금 ${keywords[0]}이(가) 느껴져요.`,
    ];
  }
  if (categoryId === "need") {
    return [
      `${keywords[0]} 좀 주세요.`,
      `${keywords[0]}이(가) 필요해요.`,
      `${keywords[0]} 부탁드려요.`,
    ];
  }
  if (categoryId === "emotion") {
    return [
      `${keywords[0]}.`,
      `지금은 ${keywords[0]}.`,
      `${keywords.join(" ")} 상태예요.`,
    ];
  }

  return [
    `${keywords.join(" ")}에 대해 말하고 싶어요.`,
    `${keywords[0]} 관련해서요.`,
    `지금 ${keywords.join(" ")} 상황이에요.`,
  ];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);
  const [selectedSentence, setSelectedSentence] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [freeInput, setFreeInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 0.9;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedKeywords([]);
    setSentences([]);
    setSelectedSentence("");
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const generateFromCategory = () => {
    if (selectedKeywords.length === 0) return;
    const gens = generateSentences(selectedKeywords, selectedCategory?.id);
    setSentences(gens);
    setMode("result");
  };

  const handleFreeInputChange = (val: string) => {
    setFreeInput(val);
    const allKw = CATEGORIES.flatMap((c) => c.keywords);
    if (val.length > 0) {
      setSuggestions(
        allKw.filter((k) => k.includes(val) || val.includes(k)).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const generateFromFree = () => {
    const kws = freeInput.trim() ? [freeInput.trim()] : suggestions.slice(0, 1);
    if (kws.length === 0 || !kws[0]) return;
    const gens = generateSentences(kws);
    setSelectedKeywords(kws);
    setSentences(gens);
    setMode("result");
  };

  const confirmAndSpeak = (sentence: string) => {
    setSelectedSentence(sentence);
    speak(sentence);
  };

  const reset = () => {
    setMode("home");
    setSelectedCategory(null);
    setSelectedKeywords([]);
    setSentences([]);
    setSelectedSentence("");
    setFreeInput("");
    setSuggestions([]);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // HOME
  if (mode === "home") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-lg w-full text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              OptiTalk / EyeKnow
            </h1>
            <p className="mt-2 text-slate-600 text-sm">
              의도 → 문장 → 발화 생성 시스템
            </p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => setMode("category")}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📱</div>
                <div>
                  <h2 className="font-semibold text-lg">③ 카테고리 모드</h2>
                  <p className="text-sm text-slate-500">
                    핵심어 선택 → Intent(의도) 생성
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("free")}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">👁️</div>
                <div>
                  <h2 className="font-semibold text-lg">④ 자유 입력 모드</h2>
                  <p className="text-sm text-slate-500">
                    Eye-keyboard + 추천어
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            EOG/EMG 제스처 → Intent → LLM 문장 → TTS 파이프라인 데모
          </p>
        </div>
      </main>
    );
  }

  // CATEGORY MODE
  if (mode === "category") {
    return (
      <main className="min-h-screen p-4 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={reset} className="text-sm text-slate-500">
              ← 홈
            </button>
            <h1 className="font-semibold">카테고리 모드</h1>
            <div className="w-10" />
          </div>

          {!selectedCategory ? (
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-400 transition"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-medium">{cat.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-indigo-600"
                >
                  ← {selectedCategory.name}
                </button>
              </div>

              <p className="text-sm text-slate-500">핵심어를 선택하세요 (복수 가능)</p>

              <div className="flex flex-wrap gap-2">
                {selectedCategory.keywords.map((kw) => {
                  const active = selectedKeywords.includes(kw);
                  return (
                    <button
                      key={kw}
                      onClick={() => toggleKeyword(kw)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {kw}
                    </button>
                  );
                })}
              </div>

              {selectedKeywords.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs text-slate-400 mb-2">
                    Intent: [{selectedKeywords.join(", ")}]
                  </p>
                  <button
                    onClick={generateFromCategory}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                  >
                    ⑤ LLM 문장 생성하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  // FREE INPUT MODE
  if (mode === "free") {
    return (
      <main className="min-h-screen p-4 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={reset} className="text-sm text-slate-500">
              ← 홈
            </button>
            <h1 className="font-semibold">자유 입력 모드</h1>
            <div className="w-10" />
          </div>

          <p className="text-sm text-slate-500 mb-3">
            Eye-keyboard 시뮬레이션 (실제로는 시선/제스처 입력)
          </p>

          <input
            type="text"
            value={freeInput}
            onChange={(e) => handleFreeInputChange(e.target.value)}
            placeholder="핵심어 또는 단어 입력..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
          />

          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFreeInput(s);
                    setSuggestions([]);
                  }}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-5 gap-2">
            {["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ", "ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅜ"].map(
              (jamo) => (
                <button
                  key={jamo}
                  onClick={() => handleFreeInputChange(freeInput + jamo)}
                  className="py-3 rounded-lg bg-white border border-slate-200 text-lg font-medium active:bg-indigo-50"
                >
                  {jamo}
                </button>
              )
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFreeInput((p) => p.slice(0, -1))}
              className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-700"
            >
              ⌫ 지우기
            </button>
            <button
              onClick={generateFromFree}
              disabled={!freeInput.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium disabled:opacity-40"
            >
              ⑤ 문장 생성
            </button>
          </div>
        </div>
      </main>
    );
  }

  // RESULT (LLM + TTS)
  if (mode === "result") {
    return (
      <main className="min-h-screen p-4 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={reset} className="text-sm text-slate-500">
              ← 홈
            </button>
            <h1 className="font-semibold">⑤ LLM 문장 생성</h1>
            <div className="w-10" />
          </div>

          <div className="mb-4 p-3 rounded-xl bg-indigo-50 text-sm text-indigo-800">
            Intent: <strong>[{selectedKeywords.join(", ")}]</strong>
          </div>

          <p className="text-sm text-slate-500 mb-3">문장 후보를 확인하고 선택하세요</p>

          <div className="space-y-3">
            {sentences.map((s, i) => (
              <button
                key={i}
                onClick={() => confirmAndSpeak(s)}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  selectedSentence === s
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-indigo-500 font-medium">{i + 1}</span>
                  <span className="text-lg">{s}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedSentence && (
            <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">⑥ 음성 출력 (화면 + TTS)</p>
              <p className="text-xl font-medium text-slate-800 mb-3">
                “{selectedSentence}”
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => speak(selectedSentence)}
                  disabled={isSpeaking}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-50"
                >
                  {isSpeaking ? "🔊 말하는 중..." : "🔊 다시 듣기"}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600"
                >
                  새로 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return null;
}
