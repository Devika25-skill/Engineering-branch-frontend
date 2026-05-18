import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, GraduationCap, Trophy, Target, ClipboardList, Plus, Trash2, ArrowRight, ArrowLeft, Loader2, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import { studentService, SubjectInput } from '@/services/studentService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import LoginDialog from "@/components/auth/LoginDialog";

const OTHER_CUSTOM = 'Other / Custom';

interface SubjectRow extends SubjectInput {
  id: string;
  compulsory: boolean;
  customName: string;
}

const CourseRecommendations = () => {
  const { user, isLoggedIn, isLoading, needsUserDetails } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStandard, setSelectedStandard] = useState('12');
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [extracurricularOptions, setExtracurricularOptions] = useState<string[]>([]);
  const [achievementLevelOptions, setAchievementLevelOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [entranceExams, setEntranceExams] = useState([{ id: '1', name: 'JEE Main', score: '', air: '' }]);
  const [skipEntrance, setSkipEntrance] = useState(false);
  const [extracurriculars, setExtracurriculars] = useState([{ id: '1', category: '', title: '', level: '', description: '' }]);
  const [skipExtracurricular, setSkipExtracurricular] = useState(false);


  const getDefaultSubjects = (standard: string): SubjectRow[] => {
    if (standard === '12') {
      return [
        { id: 'math', name: 'Math', marks: 0, total: 100, compulsory: true, customName: '' },
        { id: 'phy', name: 'Physics', marks: 0, total: 100, compulsory: true, customName: '' },
        { id: 'chem', name: 'Chemistry', marks: 0, total: 100, compulsory: true, customName: '' },
      ];
    }
    return [{ id: Date.now().toString(), name: '', marks: 0, total: 100, compulsory: false, customName: '' }];
  };

  useEffect(() => {
    const initializePage = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const [masterSubjects, masterExtracurriculars, masterAchievementLevels] = await Promise.all([
          studentService.fetchSubjects('academic', selectedStandard),
          studentService.fetchSubjects('extracurricular'),
          studentService.fetchSubjects('achievement_level')
        ]);
        setSubjectOptions(masterSubjects);
        setExtracurricularOptions(masterExtracurriculars);
        setAchievementLevelOptions(masterAchievementLevels);

        // Try fetching from DB first
        let savedData = null;
        try {
          savedData = await studentService.fetchAcademicProfile(user.email, selectedStandard);
        } catch (e) {
          console.log("No DB profile found, checking local storage...");
        }

        if (savedData && savedData.subjects) {
          const defaults = getDefaultSubjects(selectedStandard);
          const savedMap = savedData.subjects;

          // Merge saved data with defaults
          const merged = defaults.map(def => {
            if (savedMap[def.name]) {
              return { ...def, marks: savedMap[def.name].marks_obtained, total: savedMap[def.name].out_of };
            }
            return def;
          });

          // Add extra subjects
          Object.entries(savedMap).forEach(([name, scores]: [string, any]) => {
            if (name !== 'other_subject' && !defaults.some(d => d.name === name)) {
              merged.push({
                id: (Date.now() + Math.random()).toString(),
                name,
                marks: scores.marks_obtained,
                total: scores.out_of,
                compulsory: false,
                customName: ''
              });
            }
          });

          // Handle other_subject array if it exists
          if (savedMap.other_subject && Array.isArray(savedMap.other_subject)) {
            savedMap.other_subject.forEach((sub: any) => {
              merged.push({
                id: (Date.now() + Math.random()).toString(),
                name: OTHER_CUSTOM,
                marks: sub.marks_obtained,
                total: sub.out_of,
                compulsory: false,
                customName: sub.subject_name
              });
            });
          }

          setIsNewProfile(false);
          setSubjects(merged);
        } else {
          setIsNewProfile(true);
          // No DB data, check Local Storage for "draft"
          const localKey = `fb_draft_${user.email}_${selectedStandard}`;
          const cached = localStorage.getItem(localKey);
          if (cached) {
            setSubjects(JSON.parse(cached));
          } else {
            setSubjects(getDefaultSubjects(selectedStandard));
          }
        }

        // Fetch and Populate Extracurriculars
        try {
          const extraData = await studentService.fetchExtracurricularProfile(user.email);
          if (extraData && Object.keys(extraData).length > 0) {
            const formatted: any[] = [];
            Object.entries(extraData).forEach(([category, achievements]: [string, any]) => {
              if (Array.isArray(achievements)) {
                achievements.forEach((ach: any) => {
                  formatted.push({
                    id: (Date.now() + Math.random()).toString(),
                    category: category === 'other_achievement' ? OTHER_CUSTOM : category,
                    title: ach.achievement_name,
                    level: ach.level,
                    description: ach.brief_description
                  });
                });
              }
            });
            if (formatted.length > 0) {
              setExtracurriculars(formatted);
            }
          }
        } catch (e) {
          console.log("No extracurricular profile found.");
        }
      } catch (err) {
        console.error('Init failed:', err);
        setSubjects(getDefaultSubjects(selectedStandard));
      } finally {
        setLoading(false);
      }
    };
    initializePage();
  }, [selectedStandard, user?.email]);

  // Persistent Local Storage (Draft)
  useEffect(() => {
    if (user?.email && subjects.length > 0 && !loading) {
      const localKey = `fb_draft_${user.email}_${selectedStandard}`;
      localStorage.setItem(localKey, JSON.stringify(subjects));
    }
  }, [subjects, user?.email, selectedStandard, loading]);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || needsUserDetails) {
        if (!hasAutoOpened) {
          setTimeout(() => setLoginDialogOpen(true), 100);
          setHasAutoOpened(true);
        }
      }
    }
  }, [isLoading, isLoggedIn, needsUserDetails, hasAutoOpened]);

  const updateRow = (id: string, field: keyof SubjectRow, value: any) => {
    setSubjects(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleMarksChange = (id: string, value: string) => {
    // Only allow positive integers
    const val = value.replace(/[^0-9]/g, '');
    const numValue = val === '' ? 0 : parseInt(val);

    setSubjects(prev => prev.map(row => {
      if (row.id === id) {
        // Marks cannot exceed total
        const finalMarks = Math.min(numValue, row.total);
        return { ...row, marks: finalMarks };
      }
      return row;
    }));
  };

  const handleTotalChange = (id: string, value: string) => {
    // Only allow positive integers
    const val = value.replace(/[^0-9]/g, '');

    // Limit to 3 digits
    const limitedVal = val.slice(0, 3);
    const numValue = limitedVal === '' ? 0 : parseInt(limitedVal);

    setSubjects(prev => prev.map(row => {
      if (row.id === id) {
        // When total changes, marks might need to be capped
        const marks = Math.min(row.marks, numValue);
        return { ...row, total: numValue, marks };
      }
      return row;
    }));
  };

  const addRow = () => {
    setSubjects(prev => [...prev, { id: Date.now().toString(), name: '', marks: 0, total: 100, compulsory: false, customName: '' }]);
  };

  const removeRow = (id: string) => {
    setSubjects(prev => prev.filter(row => row.id !== id));
  };

  const handleSave = async () => {
    if (!user?.email) {
      toast({ title: "Please login to save your profile", variant: "destructive" });
      return;
    }

    const missingCustom = subjects.some(s => s.name === OTHER_CUSTOM && !s.customName.trim());
    if (missingCustom) {
      toast({ title: "Custom subjects need a name", description: "Please enter a name for all 'Other / Custom' subjects.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const cleaned = subjects
        .filter(sub => sub.name && sub.marks !== undefined)
        .map(sub => ({
          name: sub.name === OTHER_CUSTOM ? sub.customName.trim() : sub.name,
          marks: Number(sub.marks),
          total: Number(sub.total) || 100
        }));

      const saveResponse = await studentService.saveAcademicProfile({
        username: user.email,
        standard: selectedStandard,
        subjects: cleaned
      });

      // Call the API to get recommendations
      const response = await studentService.fetchRecommendations(user.email);

      if (response.success || response.status === 'success') {
        // Clear local draft after successful save
        const localKey = `fb_draft_${user.email}_${selectedStandard}`;
        localStorage.removeItem(localKey);

        let successMessage = isNewProfile ? "Details saved successfully" : "Details updated successfully";
        if (saveResponse.status === 'no_change') {
          successMessage = "Details are already filled!";
        }

        toast({ title: successMessage });
        setIsNewProfile(false);
      } else {
        throw new Error('Failed to generate recommendations');
      }
    } catch (err: any) {
      toast({ title: "Error Saving Profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExtracurricular = async () => {
    if (!user?.email) {
      toast({ title: "Please login to save your profile", variant: "destructive" });
      return false;
    }

    setSaving(true);
    try {
      let payloadAchievements = [];
      if (!skipExtracurricular) {
        payloadAchievements = extracurriculars.filter(ach => ach.category && ach.title).map(ach => ({
          category: ach.category,
          title: ach.title,
          level: ach.level,
          description: ach.description
        }));
      }

      const saveResponse = await studentService.saveExtracurricularProfile({
        username: user.email,
        achievements: payloadAchievements
      });

      let successMessage = "Details saved successfully";
      if (saveResponse.status === 'no_change') {
        successMessage = "Details are already filled!";
      }

      toast({ title: successMessage });
      return true;
    } catch (err: any) {
      toast({ title: "Error Saving Profile", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      await handleSave();
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      // Placeholder for saving entrance exams
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      const success = await handleSaveExtracurricular();
      if (success) {
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const steps = [
    { id: 1, title: "Academic Performance", desc: "What's your academic story so far?", icon: GraduationCap },
    { id: 2, title: "Entrance Exam Score", desc: "Tell us how you cracked the big ones", icon: Target },
    { id: 3, title: "Extracurricular Activities", desc: "Beyond books, what else drives you?", icon: Trophy },
    { id: 4, title: "Personal Assessment", desc: "A quick assessment to know you better.", icon: ClipboardList },
  ];

  const progressPercent = (currentStep / 4) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
            AI-Powered Course Recommendations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your academic journey, and our AI will recommend the perfect career path for you.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm animate-fade-in animation-delay-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">Step {currentStep} of 4</span>
            <span className="text-sm font-medium text-gray-500">{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              const isPast = currentStep > s.id;

              return (
                <div key={s.id} className="flex flex-col items-center text-center group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' :
                      isPast ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-300'
                    }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className={`text-sm font-bold mb-1 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 hidden md:block px-2 leading-tight">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>


        {/* Main Form Area */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-indigo-50 overflow-hidden animate-fade-in animation-delay-400">
          <div className="p-8 md:p-12">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStandard === 'fy_eng' || selectedStandard === 'ty_eng' ? selectedStandard.replace('_', ' ').toUpperCase() : `${selectedStandard}th`} Academic Marks</h2>
                      <p className="text-gray-500 text-sm">Subject-wise Marks</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Select Standard:</label>
                    <select
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                      value={selectedStandard}
                      onChange={(e) => setSelectedStandard(e.target.value)}
                    >
                      <option value="12">12th grade</option>
                      <option value="11">11th grade</option>
                      <option value="10">10th grade</option>
                      <option value="9">9th grade</option>
                      <option value="fy_eng">FY Engineering</option>
                      <option value="ty_eng">TY Engineering</option>
                    </select>
                  </div>
                </div>

                {(loading || !isLoggedIn) ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
                        <div className="col-span-4 h-11 bg-white rounded-xl animate-pulse"></div>
                        <div className="col-span-3 h-11 bg-white rounded-xl animate-pulse"></div>
                        <div className="col-span-3 h-11 bg-white rounded-xl animate-pulse"></div>
                        <div className="col-span-2 h-11 bg-gray-100/50 rounded-xl animate-pulse"></div>
                      </div>
                    ))}
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <p className="text-gray-400 font-medium italic">
                        {!isLoggedIn ? "🔒 Please login to access your academic profile" : "Fetching your records..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-8">
                      {subjects.map((row) => {
                        const availableOptions = subjectOptions.filter(opt =>
                          opt === OTHER_CUSTOM ||
                          opt === row.name ||
                          !subjects.some(s => s.name === opt)
                        );
                        const isCustom = row.name === OTHER_CUSTOM;

                        return (
                          <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-2 items-start">
                            <div className={`col-span-1 ${isCustom ? 'md:col-span-3' : 'md:col-span-6'} flex flex-col gap-1.5`}>
                              <label className="text-xs font-bold text-gray-400 uppercase">{row.compulsory ? 'Subject*' : 'Subject'}</label>
                              <select
                                className="w-full px-4 py-3 bg-gray-50/50 rounded-lg border border-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all h-12"
                                value={row.name}
                                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                              >
                                <option value="">Select Subject</option>
                                {availableOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            {isCustom && (
                              <div className="col-span-1 md:col-span-3 flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                                <label className="text-xs font-bold text-gray-400 uppercase">Custom Name</label>
                                <Input
                                  placeholder="e.g. Applied"
                                  value={row.customName}
                                  onChange={(e) => updateRow(row.id, 'customName', e.target.value)}
                                  className="h-12 rounded-lg bg-white border-blue-400 focus:ring-1 focus:ring-blue-500 shadow-sm"
                                />
                              </div>
                            )}

                            <div className="col-span-1 md:col-span-3 flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-gray-400 uppercase">Marks you scored*</label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={row.marks === 0 ? '' : row.marks}
                                placeholder="for eg. 85"
                                onChange={(e) => handleMarksChange(row.id, e.target.value)}
                                className="h-12 rounded-lg bg-gray-50/50 border-gray-100 text-base focus:bg-white transition-all"
                              />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-gray-400 uppercase">Total marks</label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={row.total === 0 ? '' : row.total}
                                onChange={(e) => handleTotalChange(row.id, e.target.value)}
                                className="h-12 rounded-lg bg-gray-50/50 border-gray-100 text-base focus:bg-white transition-all"
                              />
                            </div>

                            <div className="col-span-1 md:col-span-1 flex items-center justify-end h-12 pt-6 md:pt-5">
                              {!row.compulsory && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeRow(row.id)}
                                  className="text-gray-400 hover:text-red-500 h-10 w-10 bg-gray-50/50 rounded-lg border border-gray-100 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={addRow}
                      variant="outline"
                      className="w-full py-6 border-dashed border-2 border-indigo-100 bg-indigo-50/10 hover:bg-indigo-50/30 text-indigo-600 font-bold rounded-2xl transition-all duration-300 group"
                    >
                      <Plus className="mr-2 group-hover:rotate-90 transition-transform" size={20} />
                      Add Optional Subject
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Target size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Entrance Exam Scores</h1>
                    <p className="text-gray-500 font-medium">Competitive Exam Results</p>
                  </div>
                </div>

                <p className="text-gray-500 mb-8">Enter your scores for competitive exams to get better branch recommendations.</p>

                <div className="mb-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="skipEntrance"
                      checked={skipEntrance}
                      onChange={(e) => setSkipEntrance(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="skipEntrance" className="text-gray-700 font-medium leading-relaxed">
                      I did not intend to give any entrance exam. I would like to skip this step.
                    </label>
                  </div>
                </div>

                {!skipEntrance && (
                  <div className="space-y-6">
                    {entranceExams.map((exam, idx) => (
                      <div key={exam.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative group">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase">Exam Name</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                            value={exam.name}
                            onChange={(e) => {
                              const newExams = [...entranceExams];
                              newExams[idx].name = e.target.value;
                              setEntranceExams(newExams);
                            }}
                          >
                            <option>JEE Main</option>
                            <option>MHT CET</option>
                            <option>BITSAT</option>
                            <option>VITEEE</option>
                            <option>COMEDK</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase">Percentile / Score</label>
                          <Input
                            placeholder="e.g. 98.5"
                            className="bg-white border-gray-200 rounded-xl h-12 text-sm"
                            value={exam.score}
                            onChange={(e) => {
                              const newExams = [...entranceExams];
                              newExams[idx].score = e.target.value;
                              setEntranceExams(newExams);
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase">All India Rank (AIR)</label>
                          <Input
                            placeholder="e.g. 15000"
                            className="bg-white border-gray-200 rounded-xl h-12 text-sm"
                            value={exam.air}
                            onChange={(e) => {
                              const newExams = [...entranceExams];
                              newExams[idx].air = e.target.value;
                              setEntranceExams(newExams);
                            }}
                          />
                        </div>
                        {entranceExams.length > 1 && (
                          <button
                            onClick={() => setEntranceExams(entranceExams.filter(e => e.id !== exam.id))}
                            className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full py-6 border-dashed border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 rounded-2xl font-bold flex items-center justify-center gap-2"
                      onClick={() => setEntranceExams([...entranceExams, { id: Date.now().toString(), name: 'JEE Main', score: '', air: '' }])}
                    >
                      <Plus size={20} />
                      Add Another Exam (BITSAT, VITEEE, etc.)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Extracurricular Achievements</h1>
                    <p className="text-gray-500 font-medium">Beyond Academics</p>
                  </div>
                </div>

                <p className="text-gray-500 mb-8">Highlight your achievements beyond academics to strengthen your engineering profile.</p>

                <div className="mb-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="skipExtracurricular"
                      checked={skipExtracurricular}
                      onChange={(e) => setSkipExtracurricular(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="skipExtracurricular" className="text-gray-700 font-medium leading-relaxed">
                      I did not intend to add any extracurricular achievements. I would like to skip this step.
                    </label>
                  </div>
                </div>

                {!skipExtracurricular && (
                  <div className="space-y-8">
                    {extracurriculars.map((activity, idx) => (
                      <div key={activity.id} className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50">
                        {extracurriculars.length > 1 && (
                          <button
                            onClick={() => {
                              const newActs = extracurriculars.filter(a => a.id !== activity.id);
                              setExtracurriculars(newActs);
                            }}
                            className="absolute -top-3 -right-3 p-2 bg-white border border-red-100 text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
                            title="Remove Achievement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                            <select
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                              value={activity.category}
                              onChange={(e) => {
                                const newActs = [...extracurriculars];
                                newActs[idx].category = e.target.value;
                                setExtracurriculars(newActs);
                              }}
                            >
                              <option value="">Select Category</option>
                              {extracurricularOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-6 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase">Title / Achievement Name</label>
                            <Input
                              placeholder="e.g. State Level Football Runner-up"
                              className="bg-white border-gray-200 rounded-xl h-12 text-sm"
                              value={activity.title}
                              onChange={(e) => {
                                const newActs = [...extracurriculars];
                                newActs[idx].title = e.target.value;
                                setExtracurriculars(newActs);
                              }}
                            />
                          </div>
                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase">Level</label>
                            <select
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                              value={activity.level}
                              onChange={(e) => {
                                const newActs = [...extracurriculars];
                                newActs[idx].level = e.target.value;
                                setExtracurriculars(newActs);
                              }}
                            >
                              <option value="">Select Level</option>
                              {achievementLevelOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400 uppercase">Brief Description</label>
                          <Textarea
                            placeholder="What did you learn or achieve? (e.g. Led the team to victory...)"
                            className="bg-white border-gray-200 rounded-xl min-h-[100px] text-sm resize-none"
                            value={activity.description}
                            onChange={(e) => {
                              const newActs = [...extracurriculars];
                              newActs[idx].description = e.target.value;
                              setExtracurriculars(newActs);
                            }}
                          />
                        </div>

                        {extracurriculars.length > 1 && (
                          <button
                            onClick={() => setExtracurriculars(extracurriculars.filter(a => a.id !== activity.id))}
                            className="absolute -right-3 -top-3 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full py-8 border-dashed border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 rounded-[2rem] font-bold flex items-center justify-center gap-2 transition-all"
                      onClick={() => setExtracurriculars([...extracurriculars, { id: Date.now().toString(), category: '', title: '', level: '', description: '' }])}
                    >
                      <Plus size={20} />
                      Add Another Achievement
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-center text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-8">
                    <ClipboardList size={40} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Almost there, ready for the last step?</h1>
                  <p className="text-gray-500 text-lg max-w-md mb-10">
                    This short assessment helps us understand you beyond your marks. Just 10 minutes and your recommendation is ready.
                  </p>
                  <Button className="px-12 py-8 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-indigo-50">
                    + Start the assessment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in animation-delay-500">
          <Button
            variant="ghost"
            onClick={handlePrevStep}
            className="w-full sm:w-auto px-8 py-6 text-gray-500 hover:text-gray-900 rounded-2xl text-lg font-bold"
          >
            ← Back
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNextStep}
              disabled={saving}
              className="w-full sm:w-auto px-10 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  Save & continue →
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <LoginDialog
        open={loginDialogOpen}
        canClose={true}
        origin="fb_course_recommender"
        onOpenChange={(open) => {
          setLoginDialogOpen(open);
        }}
      />
    </div>
  );
};

export default CourseRecommendations;
