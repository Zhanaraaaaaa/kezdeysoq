
import React, { useState, useEffect } from 'react';
import { DetectedStudent } from '../types';

interface StudentPickerProps {
  image: string;
  students: DetectedStudent[];
  onFinish: (selected: DetectedStudent) => void;
}

const StudentPicker: React.FC<StudentPickerProps> = ({ image, students, onFinish }) => {
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    let timeoutId: number;
    const duration = 3500;
    const startTime = Date.now();

    const spin = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      const interval = 60 + (progress * 500); 

      if (elapsed < duration) {
        setHighlightIdx(Math.floor(Math.random() * students.length));
        timeoutId = window.setTimeout(spin, interval);
      } else {
        const finalIdx = Math.floor(Math.random() * students.length);
        setHighlightIdx(finalIdx);
        setIsSpinning(false);
        setTimeout(() => onFinish(students[finalIdx]), 1000);
      }
    };

    spin();
    return () => clearTimeout(timeoutId);
  }, [students, onFinish]);

  const activeStudent = highlightIdx >= 0 ? students[highlightIdx] : null;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Кім тақтаға шығады?</h3>
        <p className="text-emerald-600 font-medium animate-pulse">Кездейсоқ таңдау жүріп жатыр...</p>
      </div>

      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-black">
        <img src={image} alt="Classroom" className="w-full h-full object-cover opacity-80" />
        
        {/* All potential boxes faintly */}
        {students.map((s, i) => {
          const [ymin, xmin, ymax, xmax] = s.box;
          return (
            <div 
              key={s.id}
              className="absolute border border-white/20 pointer-events-none"
              style={{
                top: `${ymin / 10}%`,
                left: `${xmin / 10}%`,
                width: `${(xmax - xmin) / 10}%`,
                height: `${(ymax - ymin) / 10}%`
              }}
            />
          );
        })}

        {/* Highlighted Box */}
        {activeStudent && (
          <div 
            className={`absolute border-4 transition-all duration-100 pointer-events-none shadow-[0_0_20px_rgba(52,211,153,0.6)] ${isSpinning ? 'border-amber-400' : 'border-emerald-500 scale-105'}`}
            style={{
              top: `${activeStudent.box[0] / 10}%`,
              left: `${activeStudent.box[1] / 10}%`,
              width: `${(activeStudent.box[3] - activeStudent.box[1]) / 10}%`,
              height: `${(activeStudent.box[2] - activeStudent.box[0]) / 10}%`
            }}
          >
            {!isSpinning && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full font-bold whitespace-nowrap animate-bounce shadow-lg">
                ОСЫ ОҚУШЫ!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPicker;
