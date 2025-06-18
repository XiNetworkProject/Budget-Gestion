import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { title: 'Bienvenue sur Budget Gestion', description: 'Enregistrez vos dépenses et revenus en un seul endroit.' },
  { title: 'Suivez vos dépenses', description: 'Analysez vos catégories et optimisez vos budgets.' },
  { title: 'Atteignez vos objectifs', description: 'Fixez des objectifs d’épargne et suivez vos progrès.' }
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isLast = step === steps.length - 1;

  const next = () => {
    if (isLast) {
      navigate('/home', { replace: true });
    } else {
      setStep(s => s + 1);
    }
  };
  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <div className="p-4 flex flex-col justify-between h-screen">
      <div className="flex-1 flex items-center justify-center">
        {/* Placeholder illustration */}
        <div className="bg-gray-300 w-64 h-64 rounded"></div>
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold">{steps[step].title}</h1>
        <p className="text-base text-gray-600">{steps[step].description}</p>
      </div>
      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <button onClick={prev} className="bg-primary text-secondary px-4 py-2 rounded">Précédent</button>
        ) : <div />}  
        <button onClick={next} className="bg-primary text-secondary px-4 py-2 rounded">
          {isLast ? 'Terminer' : 'Suivant'}
        </button>
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === step ? 'bg-primary' : 'bg-gray-400'}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Onboarding; 