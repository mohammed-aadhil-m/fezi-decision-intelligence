import React, { useState } from 'react';
import { DecisionCategory, DecisionContext, UserPriorities } from '../types/decision';
import { CATEGORY_QUESTION_CONFIGS } from '../services/questionnaireEngine';
import {
  Briefcase,
  TrendingUp,
  Globe2,
  DollarSign,
  GraduationCap,
  Home,
  ShoppingBag,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  HelpCircle,
} from 'lucide-react';

interface DecisionWizardProps {
  initialTitle?: string;
  initialCategory?: DecisionCategory;
  onComplete: (context: DecisionContext, priorities: UserPriorities) => void;
  onCancel: () => void;
}

const CATEGORIES: { id: DecisionCategory; name: string; icon: any }[] = [
  { id: 'career', name: 'Career', icon: Briefcase },
  { id: 'relocation', name: 'Relocation', icon: Globe2 },
  { id: 'business', name: 'Business', icon: TrendingUp },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'finance', name: 'Finance', icon: DollarSign },
  { id: 'property', name: 'Property', icon: Home },
  { id: 'purchases', name: 'Purchases', icon: ShoppingBag },
  { id: 'personal', name: 'Personal', icon: User },
];

export const DecisionWizard: React.FC<DecisionWizardProps> = ({
  initialTitle = '',
  initialCategory = 'career',
  onComplete,
  onCancel,
}) => {
  // Step 1: Decision & Category
  // Step 2: "First, tell us about your current situation."
  // Step 3: "Now, tell us about the option you are considering."
  // Step 4: "What matters most to you?"
  const [step, setStep] = useState<number>(1);

  const [title, setTitle] = useState<string>(
    initialTitle || 'Should I accept this ₹8 LPA software developer job in Chennai?'
  );
  const [category, setCategory] = useState<DecisionCategory>(initialCategory);

  // Form values stored dynamically by question ID
  const [formData, setFormData] = useState<Record<string, any>>({
    currentRole: 'Junior Software Engineer',
    currentSalary: 5.5,
    experienceYears: 2.5,
    currentLocation: 'Coimbatore',
    careerGoal: 'Senior Fullstack Engineer within 2 years',
    offeredRole: 'Software Developer',
    offeredSalary: 8.0,
    offeredLocation: 'Chennai (OMR Corridor)',
    workMode: 'hybrid',
    commuteMinutes: 45,
    benefits: 'Standard medical cover, up to 10% variable bonus',
  });

  const categoryConfig = CATEGORY_QUESTION_CONFIGS[category];

  // Dynamic priorities initialized for active category
  const [priorities, setPriorities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    categoryConfig.defaultPriorities.forEach((p) => {
      init[p.key] = p.defaultWeight;
    });
    return init;
  });

  // Switch priorities when category changes
  const handleCategoryChange = (newCat: DecisionCategory) => {
    setCategory(newCat);
    const newConfig = CATEGORY_QUESTION_CONFIGS[newCat];
    const newP: Record<string, number> = {};
    newConfig.defaultPriorities.forEach((p) => {
      newP[p.key] = p.defaultWeight;
    });
    setPriorities(newP);
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Build final context
      const fullContext: DecisionContext = {
        decisionTitle: title,
        category,
        currentRole: formData.currentRole,
        currentSalary: parseFloat(formData.currentSalary) || 5.5,
        currentLocation: formData.currentLocation,
        experienceYears: parseFloat(formData.experienceYears) || 2.5,
        offeredRole: formData.offeredRole,
        offeredSalary: parseFloat(formData.offeredSalary) || 8.0,
        offeredLocation: formData.offeredLocation,
        workMode: formData.workMode || 'hybrid',
        commuteMinutes: parseInt(formData.commuteMinutes) || 45,
        careerGoal: formData.careerGoal,
        customFields: formData,
      };

      const finalPriorities: UserPriorities = {
        careerGrowth: priorities.careerGrowth ?? 30,
        salary: priorities.salary ?? 25,
        stability: priorities.stability ?? 15,
        workLifeBalance: priorities.workLifeBalance ?? 15,
        locationAndCommute: priorities.locationAndCommute ?? 15,
        learningAndCulture: priorities.learningAndCulture ?? 10,
      };

      onComplete(fullContext, finalPriorities);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-sans selection:bg-[#B9E5F3] selection:text-[#090B0C]">
      {/* Step Indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-lg mx-auto mb-3">
          {[
            { num: 1, label: 'Decision' },
            { num: 2, label: 'Current Situation' },
            { num: 3, label: 'Option Details' },
            { num: 4, label: 'Priorities' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-medium text-xs transition ${
                  step === s.num
                    ? 'bg-[#B9E5F3] text-[#090B0C]'
                    : step > s.num
                    ? 'border border-[#B9E5F3]/50 text-[#B9E5F3]'
                    : 'border border-white/10 text-[#8E959E]'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : `0${s.num}`}
              </div>
              <span className={`text-[10px] font-mono mt-1 ${step === s.num ? 'text-[#B9E5F3]' : 'text-[#8E959E]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-[2px] bg-white/10 rounded-full max-w-lg mx-auto overflow-hidden">
          <div
            className="h-full bg-[#B9E5F3] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-10 border border-white/10 shadow-2xl relative text-left">
        {/* STEP 1: Decision Title & Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
                Step 01
              </span>
              <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal mt-1">
                What are you deciding?
              </h2>
              <p className="text-xs text-[#8E959E] mt-1 font-sans">
                State your decision clearly. FEZI will tailor the questionnaire specifically to this category.
              </p>
            </div>

            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={3}
              placeholder="e.g. Should I accept this ₹8 LPA software developer job in Chennai?"
              className="w-full p-4 rounded-2xl bg-[#090B0C] border border-white/10 focus:border-[#B9E5F3] text-base text-[#F5F5F2] placeholder-[#8E959E]/40 focus:outline-none transition resize-none font-sans"
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8E959E] mb-3">
                Decision Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#090B0C] border-[#B9E5F3] text-[#F5F5F2]'
                          : 'bg-[#090B0C]/40 border-white/5 hover:border-white/20 text-[#8E959E]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: “First, tell us about your current situation.” */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
                Step 02 — Baseline Situation
              </span>
              <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal mt-1">
                {categoryConfig.currentSituationHeading}
              </h2>
              <p className="text-xs text-[#8E959E] mt-1 font-sans">
                {categoryConfig.currentSituationSubheading}
              </p>
            </div>

            <div className="space-y-4">
              {categoryConfig.currentQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#090B0C] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#F5F5F2] flex items-center gap-2">
                      <span>{q.label}</span>
                      {q.required && (
                        <span className="text-[10px] font-mono text-[#B9E5F3]">*Required</span>
                      )}
                    </label>
                    <span className="text-[10px] font-mono text-[#8E959E]" title={q.materialImpact}>
                      Why this matters →
                    </span>
                  </div>

                  <input
                    type={q.type}
                    value={formData[q.id] ?? ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs sm:text-sm text-[#F5F5F2] placeholder-[#8E959E]/40 focus:border-[#B9E5F3] focus:outline-none"
                  />
                  <div className="text-[10px] text-[#8E959E] font-mono italic">
                    {q.materialImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: “Now, tell us about the option you are considering.” */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
                Step 03 — Proposed Option
              </span>
              <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal mt-1">
                {categoryConfig.optionHeading}
              </h2>
              <p className="text-xs text-[#8E959E] mt-1 font-sans">
                {categoryConfig.optionSubheading}
              </p>
            </div>

            <div className="space-y-4">
              {categoryConfig.optionQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#090B0C] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#F5F5F2] flex items-center gap-2">
                      <span>{q.label}</span>
                      {q.required && (
                        <span className="text-[10px] font-mono text-[#B9E5F3]">*Required</span>
                      )}
                    </label>
                    <span className="text-[10px] font-mono text-[#8E959E]" title={q.materialImpact}>
                      Why this matters →
                    </span>
                  </div>

                  {q.type === 'select' && q.options ? (
                    <select
                      value={formData[q.id] ?? q.options[0].value}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs sm:text-sm text-[#F5F5F2] focus:border-[#B9E5F3] focus:outline-none"
                    >
                      {q.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={q.type}
                      value={formData[q.id] ?? ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs sm:text-sm text-[#F5F5F2] placeholder-[#8E959E]/40 focus:border-[#B9E5F3] focus:outline-none"
                    />
                  )}
                  <div className="text-[10px] text-[#8E959E] font-mono italic">
                    {q.materialImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: “What matters most to you?” */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
                Step 04 — Weighting
              </span>
              <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal mt-1">
                What matters most to you?
              </h2>
              <p className="text-xs text-[#8E959E] mt-1 font-sans">
                Adjust how much each factor impacts the mathematical score.
              </p>
            </div>

            <div className="space-y-3.5">
              {categoryConfig.defaultPriorities.map((item) => {
                const val = priorities[item.key] ?? item.defaultWeight;

                return (
                  <div key={item.key} className="p-3.5 rounded-2xl bg-[#090B0C] border border-white/5">
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <span className="text-xs font-medium text-[#F5F5F2]">{item.label}</span>
                        <span className="text-[11px] text-[#8E959E] block">{item.desc}</span>
                      </div>
                      <span className="text-xs font-mono text-[#B9E5F3] font-bold">
                        {val}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={val}
                      onChange={(e) =>
                        setPriorities({ ...priorities, [item.key]: parseInt(e.target.value) })
                      }
                      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B9E5F3]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-white/10">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#8E959E] hover:text-[#F5F5F2] text-xs font-mono border border-white/15 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition disabled:opacity-50"
          >
            <span>{step === 4 ? 'Run FEZI Decision Engine' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
