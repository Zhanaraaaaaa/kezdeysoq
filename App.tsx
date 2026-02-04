
import React, { useState } from 'react';
import { AppState, DetectedStudent } from './types';
import CameraView from './components/CameraView';
import StudentPicker from './components/StudentPicker';
import { detectStudents } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [students, setStudents] = useState<DetectedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<DetectedStudent | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleStartScan = () => {
    setState(AppState.SCANNING);
    setError(null);
  };

  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setState(AppState.PROCESSING);
    
    try {
      const detected = await detectStudents(image);
      if (detected.length > 0) {
        setStudents(detected);
        setState(AppState.LIST_READY);
      } else {
        setError("Суреттен оқушылар табылмады. Жақынырақ немесе анығырақ түсіріп көріңіз.");
        setState(AppState.SCANNING);
      }
    } catch (err) {
      setError("Қате орын алды. Қайта көріңіз.");
      setState(AppState.SCANNING);
    }
  };

  const startPicking = () => {
    setState(AppState.PICKING);
  };

  const handleFinishPicking = (student: DetectedStudent) => {
    setSelectedStudent(student);
    setState(AppState.RESULT);
    setCopyStatus(null);
  };

  const reset = () => {
    setState(AppState.IDLE);
    setStudents([]);
    setSelectedStudent(null);
    setCapturedImage(null);
    setError(null);
    setCopyStatus(null);
  };

  const publicationText = selectedStudent
    ? `✨ Бүгінгі таңдауда ${selectedStudent.name} оқушысы таңдалды!\n\nҚұттықтаймыз! Жауап беруге дайын болыңыз.`
    : '';

  const handleCopyPublication = async () => {
    if (!publicationText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicationText);
      setCopyStatus('Публикация мәтіні көшірілді!');
    } catch (copyError) {
      setCopyStatus('Көшіру мүмкін болмады. Қайта көріңіз.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-id-badge text-white"></i>
            </div>
            <h1 className="font-bold text-xl text-slate-800">Student Vision</h1>
          </div>
          {state !== AppState.IDLE && (
            <button onClick={reset} className="text-slate-500 hover:text-slate-800 text-sm font-medium">Басына қайту</button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        
        {state === AppState.IDLE && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-camera-retro text-4xl text-emerald-600"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Оқушыны сурет арқылы таңдау</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Сыныптағы оқушыларды суретке түсіріңіз. Gemini AI оларды танып, біреуін кездейсоқ белгілеп береді.
            </p>
            <button
              onClick={handleStartScan}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl flex items-center gap-3 mx-auto"
            >
              <i className="fas fa-camera"></i>
              Суретке түсіру
            </button>
          </div>
        )}

        {state === AppState.SCANNING && (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">Оқушыларды түсіріңіз</h3>
              <p className="text-slate-500 text-sm">Барлық оқушы кадрға сиятындай етіп түсіріңіз</p>
            </div>
            <CameraView onCapture={handleCapture} isProcessing={false} />
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm border border-red-100">{error}</div>}
          </div>
        )}

        {state === AppState.PROCESSING && (
          <div className="text-center space-y-6">
            <div className="relative w-80 h-60 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover blur-sm" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold">Оқушыларды іздеуде...</p>
              </div>
            </div>
          </div>
        )}

        {state === AppState.LIST_READY && (
          <div className="w-full space-y-6 text-center">
            <div className="relative w-full max-w-xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              {capturedImage && <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />}
              {students.map((s) => (
                <div 
                  key={s.id}
                  className="absolute border-2 border-emerald-400 bg-emerald-400/20"
                  style={{
                    top: `${s.box[0] / 10}%`,
                    left: `${s.box[1] / 10}%`,
                    width: `${(s.box[3] - s.box[1]) / 10}%`,
                    height: `${(s.box[2] - s.box[0]) / 10}%`
                  }}
                />
              ))}
            </div>
            <div className="bg-emerald-50 text-emerald-700 py-3 px-6 rounded-full inline-block font-bold">
              <i className="fas fa-check-circle mr-2"></i>
              {students.length} оқушы табылды
            </div>
            <button
              onClick={startPicking}
              className="w-full max-w-sm py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl mx-auto flex items-center justify-center gap-3"
            >
              <i className="fas fa-random"></i>
              Кім шығатынын анықтау
            </button>
          </div>
        )}

        {state === AppState.PICKING && capturedImage && (
          <StudentPicker image={capturedImage} students={students} onFinish={handleFinishPicking} />
        )}

        {state === AppState.RESULT && selectedStudent && capturedImage && (
          <div className="w-full max-w-2xl text-center space-y-6 animate-in fade-in scale-95 duration-500">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-8 border-emerald-500 shadow-2xl">
              <img src={capturedImage} alt="Result" className="w-full h-full object-cover" />
              <div 
                className="absolute border-[6px] border-emerald-500 shadow-[0_0_50px_#10b981]"
                style={{
                  top: `${selectedStudent.box[0] / 10}%`,
                  left: `${selectedStudent.box[1] / 10}%`,
                  width: `${(selectedStudent.box[3] - selectedStudent.box[1]) / 10}%`,
                  height: `${(selectedStudent.box[2] - selectedStudent.box[0]) / 10}%`
                }}
              >
                 <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-2">
                    <i className="fas fa-star text-amber-300"></i>
                    ТАҢДАЛДЫ!
                 </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <button onClick={startPicking} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl">
                Қайта таңдау
              </button>
              <button onClick={reset} className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                Жаңа сурет
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Публикация мәтіні</h3>
                  <p className="text-sm text-slate-500">Бір шертіп көшіруге дайын хабарлама.</p>
                </div>
                <button
                  onClick={handleCopyPublication}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm"
                >
                  Көшіру
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-slate-700 whitespace-pre-line text-sm">
                {publicationText}
              </div>
              {copyStatus && (
                <div className="text-sm text-emerald-600 font-medium">
                  {copyStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-slate-400 text-xs">
        <p>Gemini AI Vision технологиясымен жұмыс істейді</p>
      </footer>
    </div>
  );
};

export default App;
