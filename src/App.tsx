import React, { useState, useEffect } from 'react';
import { DecisionReport, DecisionContext, UserPriorities } from './types/decision';
import { SAMPLE_DECISIONS } from './data/sampleDecisions';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DecisionWizard } from './components/DecisionWizard';
import { AnalysisLoading } from './components/AnalysisLoading';
import { DecisionReportView } from './components/DecisionReportView';
import { ShareModal } from './components/ShareModal';
import { DecisionReelModal } from './components/DecisionReelModal';
import { DashboardModal } from './components/DashboardModal';
import { AuthModal } from './components/AuthModal';
import { User } from './types/decision';

export const App: React.FC = () => {
  // Navigation / View State
  const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'analyzing' | 'report'>('landing');

  // User Authentication State
  const [user, setUser] = useState<User | null>(api.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active Decision Report
  const [activeReport, setActiveReport] = useState<DecisionReport>(SAMPLE_DECISIONS[0]);

  // Saved Decisions list (persistent in backend database with local cache fallback)
  const [savedDecisions, setSavedDecisions] = useState<DecisionReport[]>(SAMPLE_DECISIONS);

  // Check auth and load decisions from backend DB on mount
  useEffect(() => {
    const initializeAuthAndData = async () => {
      try {
        const verifiedUser = await api.getMe();
        if (verifiedUser) setUser(verifiedUser);
        const remote = await api.getDecisions();
        if (remote && remote.length > 0) {
          setSavedDecisions(remote);
          setActiveReport(remote[0]);
        }
      } catch (err) {
        console.warn('Could not sync with backend DB:', err);
      }
    };
    initializeAuthAndData();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  // Wizard state
  const [pendingAnalysisContext, setPendingAnalysisContext] = useState<{
    context: DecisionContext;
    priorities: UserPriorities;
  } | null>(null);
  const [wizardInitialQuery, setWizardInitialQuery] = useState<string>('');

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  // Start Decision Wizard
  const handleStartDecision = (query?: string) => {
    setWizardInitialQuery(query || '');
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit from Wizard to Analysis
  const handleWizardComplete = (context: DecisionContext, priorities: UserPriorities) => {
    setPendingAnalysisContext({ context, priorities });
    setCurrentView('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Analysis Completion with Backend DB Persistence
  const handleAnalysisComplete = async () => {
    if (!pendingAnalysisContext) {
      setCurrentView('landing');
      return;
    }

    // Call backend API / Decision Engine
    const newReport = await api.analyzeDecision(
      pendingAnalysisContext.context,
      pendingAnalysisContext.priorities
    );

    // Save to Database
    await api.saveDecision(newReport);

    setSavedDecisions((prev) => [newReport, ...prev]);
    setActiveReport(newReport);
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selecting a decision from Dashboard or Samples
  const handleSelectReport = (report: DecisionReport) => {
    setActiveReport(report);
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deleting a decision from DB
  const handleDeleteDecision = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteDecision(id);
    setSavedDecisions((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#090B0C] text-[#F5F5F2] flex flex-col font-sans selection:bg-[#B9E5F3] selection:text-[#090B0C] relative overflow-x-hidden">


      {/* Top Sticky Navigation */}
      <Navbar
        onNewDecision={() => handleStartDecision()}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onGoHome={() => setCurrentView('landing')}
        savedCount={savedDecisions.length}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === 'landing' && (
          <LandingPage
            onStartDecision={handleStartDecision}
            onSelectSample={handleSelectReport}
            sampleDecisions={SAMPLE_DECISIONS}
          />
        )}

        {currentView === 'wizard' && (
          <DecisionWizard
            initialTitle={wizardInitialQuery}
            onComplete={handleWizardComplete}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'analyzing' && (
          <AnalysisLoading
            decisionTitle={pendingAnalysisContext?.context.decisionTitle || 'Evaluating Decision Parameters'}
            onComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'report' && (
          <DecisionReportView
            report={activeReport}
            onShare={() => setIsShareModalOpen(true)}
            onOpenReel={() => setIsReelModalOpen(true)}
            onEditContext={() => handleStartDecision(activeReport.title)}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authedUser) => setUser(authedUser)}
      />

      <ShareModal
        report={activeReport}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <DecisionReelModal
        report={activeReport}
        isOpen={isReelModalOpen}
        onClose={() => setIsReelModalOpen(false)}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={handleSelectReport}
        onNewDecision={() => handleStartDecision()}
        onDeleteDecision={handleDeleteDecision}
      />
    </div>
  );
};

export default App;
