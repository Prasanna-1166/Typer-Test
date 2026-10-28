// ============================================================
// TypeMaster — Certificates Page
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, Lock, Printer, ArrowRight, Share2, Sparkles, BookOpen, GraduationCap, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLessonsForLevel } from '@/data/courseData';
import type { LevelId, CertificateRecord } from '@/types';
import { nanoid } from '@/lib/nanoid';
import { toISODate } from '@/lib/metrics';

interface TrackCertConfig {
  levelId: LevelId;
  title: string;
  badgeTitle: string;
  subtitle: string;
  description: string;
  color: string;
  icon: typeof Award;
  minWpm: number;
  minAccuracy: number;
  finalLessonId: string;
}

const TRACKS: TrackCertConfig[] = [
  {
    levelId: 'beginner',
    title: 'Foundational Touch Typist',
    badgeTitle: 'Beginner Certification',
    subtitle: 'Home Row, All Alphabet Keys & Core Mechanics',
    description: 'Validates mastery of the home row, proper finger positioning, and accurate touch typing of English sentences without looking at the keyboard.',
    color: '#22c55e',
    icon: GraduationCap,
    minWpm: 18,
    minAccuracy: 85,
    finalLessonId: 'beg-7-3',
  },
  {
    levelId: 'intermediate',
    title: 'Speed & Accuracy Specialist',
    badgeTitle: 'Intermediate Certification',
    subtitle: 'Numbers, Punctuation, Capitalization & Speed Building',
    description: 'Validates fluency across full alphanumeric layouts, consistent typing rhythm, and advanced punctuation control at professional office typing speeds.',
    color: '#f59e0b',
    icon: Zap,
    minWpm: 35,
    minAccuracy: 88,
    finalLessonId: 'int-5-2',
  },
  {
    levelId: 'advanced',
    title: 'Professional Master Typist',
    badgeTitle: 'Advanced Certification',
    subtitle: 'Technical Text, Symbols, Code Syntax & High-Velocity Typing',
    description: 'Demonstrates elite typing capability under demanding test conditions, code syntax proficiency, and rapid alphanumeric transcription.',
    color: '#6366f1',
    icon: Award,
    minWpm: 60,
    minAccuracy: 92,
    finalLessonId: 'adv-5-2',
  },
];

export function CertificatesPage() {
  const { progress, issueCertificate, showToast } = useApp();
  const [selectedCert, setSelectedCert] = useState<{ track: TrackCertConfig; record?: CertificateRecord } | null>(null);
  const [recipientName, setRecipientName] = useState('Touch Typist');

  const certificatesByLevel = new Map<LevelId, CertificateRecord>(
    progress.certificates.map(c => [c.levelId, c])
  );

  const handleClaimCertificate = (track: TrackCertConfig) => {
    const cp = progress.courseProgress[track.levelId];
    const finalResult = progress.lessonProgress[track.finalLessonId]?.lastResult;
    const finalWpm = finalResult ? finalResult.netWpm : track.minWpm;
    const finalAccuracy = finalResult ? finalResult.accuracy : track.minAccuracy;

    const certId = `TM-${track.levelId.toUpperCase().slice(0, 3)}-${nanoid(6).toUpperCase()}`;
    const newRecord: CertificateRecord = {
      id: certId,
      levelId: track.levelId,
      displayName: recipientName.trim() || 'Touch Typist',
      issuedAt: Date.now(),
      finalWpm: Math.round(finalWpm),
      finalAccuracy: Math.round(finalAccuracy * 10) / 10,
      lessonsCompleted: cp ? cp.completedLessonIds.length : 0,
    };

    issueCertificate(newRecord);
    setSelectedCert({ track, record: newRecord });
    showToast({
      type: 'success',
      title: 'Certificate Issued',
      message: `Your ${track.title} certificate has been generated and saved.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showToast({
        type: 'info',
        title: 'Copied',
        message: `Certificate ID ${id} copied to clipboard.`,
      });
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div className="page-header no-print">
          <h1 className="page-title">
            <Award size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
            Certifications
          </h1>
          <p className="page-subtitle">
            Earn verified course completion certificates by mastering all lessons and passing track assessments.
          </p>
        </div>

        {/* Name Customization Banner */}
        <div className="card no-print" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Certificate Recipient Name</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Enter your name as you want it displayed on official credentials.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              className="input"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="e.g. Jane Doe"
              maxLength={40}
              style={{ minWidth: '220px' }}
              aria-label="Name on certificate"
            />
          </div>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid grid-3 no-print" style={{ marginBottom: '2.5rem' }}>
          {TRACKS.map(track => {
            const Icon = track.icon;
            const allLessons = getLessonsForLevel(track.levelId);
            const cp = progress.courseProgress[track.levelId];
            const completedCount = cp ? cp.completedLessonIds.length : 0;
            const isCompletedAll = completedCount >= allLessons.length && allLessons.length > 0;
            const existingCert = certificatesByLevel.get(track.levelId);

            // Check if user passed final assessment
            const finalLp = progress.lessonProgress[track.finalLessonId];
            const hasPassedFinal = finalLp && finalLp.completedAt !== null &&
              finalLp.bestWpm >= track.minWpm &&
              finalLp.bestAccuracy >= track.minAccuracy;

            const isEligible = Boolean(isCompletedAll || hasPassedFinal);

            return (
              <div
                key={track.levelId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: `4px solid ${track.color}`,
                  position: 'relative',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: `${track.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: track.color }}>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  {existingCert ? (
                    <span className="badge badge-success">
                      <CheckCircle size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                      Issued
                    </span>
                  ) : isEligible ? (
                    <span className="badge badge-warning">
                      <Sparkles size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                      Ready to Claim
                    </span>
                  ) : (
                    <span className="badge badge-neutral">
                      <Lock size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                      Locked
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: track.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  {track.badgeTitle}
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {track.title}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1, lineHeight: 1.5 }}>
                  {track.description}
                </p>

                {/* Requirements info */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.775rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Requirements:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    <span>Curriculum Lessons:</span>
                    <span style={{ fontWeight: 600 }}>{completedCount} / {allLessons.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    <span>Assessment Speed:</span>
                    <span style={{ fontWeight: 600 }}>≥ {track.minWpm} WPM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Assessment Accuracy:</span>
                    <span style={{ fontWeight: 600 }}>≥ {track.minAccuracy}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="progress-bar-wrap" style={{ height: '6px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${allLessons.length > 0 ? Math.min(100, Math.round((completedCount / allLessons.length) * 100)) : 0}%`,
                        background: track.color,
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {existingCert ? (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setSelectedCert({ track, record: existingCert })}
                    aria-label={`View certificate for ${track.title}`}
                  >
                    <Award size={15} aria-hidden="true" /> View & Print Certificate
                  </button>
                ) : isEligible ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', background: track.color, borderColor: track.color }}
                    onClick={() => handleClaimCertificate(track)}
                    aria-label={`Claim certificate for ${track.title}`}
                  >
                    <Sparkles size={15} aria-hidden="true" /> Claim Certificate
                  </button>
                ) : (
                  <Link
                    to={`/courses/${track.levelId}`}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border-default)' }}
                    aria-label={`Go to lessons for ${track.title}`}
                  >
                    <BookOpen size={15} aria-hidden="true" /> Continue Lessons <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Certificate Display / Modal */}
        {selectedCert && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Certificate preview"
          >
            <div style={{ maxWidth: '780px', width: '100%' }}>
              {/* Modal controls - hidden in print */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handlePrint}
                  aria-label="Print or save as PDF"
                >
                  <Printer size={16} aria-hidden="true" /> Print / Save as PDF
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ background: 'white', color: '#1e293b' }}
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate preview"
                >
                  Close
                </button>
              </div>

              {/* The Certificate itself */}
              <div
                className="certificate"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  padding: '3rem 2.5rem',
                  border: `6px double ${selectedCert.track.color}`,
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                {/* Header Seal */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: `${selectedCert.track.color}15`,
                      border: `2px solid ${selectedCert.track.color}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selectedCert.track.color,
                    }}
                  >
                    <Award size={32} aria-hidden="true" />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: selectedCert.track.color, marginTop: '0.5rem' }}>
                    TypeMaster Certification
                  </div>
                </div>

                <h2 style={{ fontSize: '2rem', fontFamily: 'serif', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Certificate of Achievement
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  This credential is awarded to
                </p>

                {/* Recipient Name */}
                <div style={{ borderBottom: '2px solid #cbd5e1', display: 'inline-block', minWidth: '320px', paddingBottom: '0.35rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.02em' }}>
                    {selectedCert.record?.displayName || recipientName || 'Touch Typist'}
                  </span>
                </div>

                <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.75rem' }}>
                  for successfully mastering touch typing fundamentals and meeting all speed and accuracy milestones in the
                </p>

                {/* Certificate Title */}
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: selectedCert.track.color, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {selectedCert.track.title}
                </div>

                {/* Performance stats row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Verified Speed</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedCert.record?.finalWpm ?? selectedCert.track.minWpm} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>WPM</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedCert.record?.finalAccuracy ?? selectedCert.track.minAccuracy}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date Issued</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', paddingTop: '0.15rem' }}>
                      {selectedCert.record ? toISODate(selectedCert.record.issuedAt) : 'Pending Issue'}
                    </div>
                  </div>
                </div>

                {/* Verification Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <div>Credential ID: <strong style={{ color: '#475569' }}>{selectedCert.record?.id || 'TM-PREVIEW-000'}</strong></div>
                    <div>Verification: Verified via Local Curriculum Completion</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#334155' }}>TypeMaster Learning</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #94a3b8', paddingTop: '2px', minWidth: '140px' }}>
                      Competency Verification
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy ID button in preview modal */}
              {selectedCert.record?.id && (
                <div className="no-print" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'white' }}
                    onClick={() => handleCopyId(selectedCert.record!.id)}
                  >
                    <Share2 size={14} style={{ marginRight: '0.25rem' }} /> Copy Certificate ID ({selectedCert.record.id})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
