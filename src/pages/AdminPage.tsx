// ============================================================
// TypeMaster — Admin & Curriculum Management Page
// ============================================================
import { useState, useEffect } from 'react';
import {
  BookOpen, PlusCircle, Trash2, Save, RotateCcw,
  Search, Eye, Sparkles, X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { loadCourseData, saveCourseData, resetCourseData } from '@/lib/storage';
import { LESSONS } from '@/data/courseData';
import type { Lesson, CourseData, LevelId } from '@/types';
import { nanoid } from '@/lib/nanoid';

export function AdminPage() {
  const { showToast } = useApp();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [selectedLevel, setSelectedLevel] = useState<LevelId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  // Form state for creating custom lesson
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLevel, setNewLevel] = useState<LevelId>('intermediate');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newFocusKeys, setNewFocusKeys] = useState('');
  const [newMinAccuracy, setNewMinAccuracy] = useState(90);
  const [newMinWpm, setNewMinWpm] = useState(30);
  const [newXpReward, setNewXpReward] = useState(40);
  const [newText, setNewText] = useState('');

  // Load course data
  const loadData = async () => {
    const data = await loadCourseData();
    setCourseData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Combined lessons: default + custom
  const customLessons = courseData?.customLessons ?? [];
  const allLessons: Lesson[] = [...(courseData?.lessons ?? LESSONS), ...customLessons];

  const filteredLessons = allLessons.filter(l => {
    const matchesLevel = selectedLevel === 'all' || l.levelId === selectedLevel;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Create lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both a title and typing text.',
      });
      return;
    }

    const lesson: Lesson = {
      id: `custom-${nanoid(8)}`,
      levelId: newLevel,
      moduleId: `mod-custom-${newLevel}`,
      moduleName: 'Custom Community Lessons',
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom user-created typing exercise.',
      objectives: ['Practice custom specialized vocabulary', 'Improve consistency'],
      difficulty: newDifficulty,
      text: newText.trim(),
      focusKeys: newFocusKeys.split(',').map(s => s.trim()).filter(Boolean),
      minAccuracy: Number(newMinAccuracy),
      minWpm: Number(newMinWpm),
      xpReward: Number(newXpReward),
      isDefault: false,
    };

    if (courseData) {
      const updated: CourseData = {
        ...courseData,
        customLessons: [...courseData.customLessons, lesson],
        lastModified: Date.now(),
      };
      await saveCourseData(updated);
      setCourseData(updated);
      showToast({
        type: 'success',
        title: 'Custom Lesson Created!',
        message: `"${lesson.title}" added to ${lesson.levelId} curriculum.`,
      });
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewText('');
      setNewFocusKeys('');
      setActiveTab('browse');
    }
  };

  // Delete custom lesson
  const handleDeleteCustomLesson = async (id: string) => {
    if (!courseData) return;
    const updated: CourseData = {
      ...courseData,
      customLessons: courseData.customLessons.filter(l => l.id !== id),
      lastModified: Date.now(),
    };
    await saveCourseData(updated);
    setCourseData(updated);
    showToast({
      type: 'info',
      title: 'Lesson Deleted',
      message: 'Custom lesson was removed.',
    });
  };

  // Reset curriculum to defaults
  const handleResetCurriculum = async () => {
    if (window.confirm('Reset all course modules and custom lessons to factory defaults?')) {
      await resetCourseData();
      await loadData();
      showToast({
        type: 'info',
        title: 'Curriculum Reset',
        message: 'Default curriculum re-initialized.',
      });
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-warning">Local Admin</span>
          </div>
          <h1 className="page-title">
            <BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--clr-primary-500)' }} aria-hidden="true" />
            Curriculum & Content Management
          </h1>
          <p className="page-subtitle">
            Inspect lesson structures, add custom typing exercises, and manage course data locally.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-primary-500)' }}>{allLessons.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Available Lessons</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-success-500)' }}>{LESSONS.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard Core Curriculum</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-warning-500)' }}>{customLessons.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Custom Added Lessons</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <BookOpen size={15} style={{ marginRight: '0.35rem' }} /> Curriculum Explorer ({filteredLessons.length})
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={15} style={{ marginRight: '0.35rem' }} /> Add Custom Lesson
          </button>
        </div>

        {/* TAB 1: Browse Lessons */}
        {activeTab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <button
                    key={lvl}
                    className={`btn btn-sm ${selectedLevel === lvl ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ textTransform: 'capitalize', border: selectedLevel === lvl ? undefined : '1px solid var(--border-default)' }}
                    onClick={() => setSelectedLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Filter lessons"
                />
              </div>
            </div>

            {/* Lesson Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className={`badge level-${lesson.levelId}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {lesson.levelId}
                      </span>
                      {!lesson.isDefault && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Custom</span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Difficulty: Level {lesson.difficulty} of 5
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{lesson.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>{lesson.description}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Target: ≥{lesson.minWpm} WPM · ≥{lesson.minAccuracy}% acc · +{lesson.xpReward} XP · {lesson.text.length} chars
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPreviewLesson(lesson)}
                      aria-label={`Preview lesson ${lesson.title}`}
                      style={{ border: '1px solid var(--border-default)' }}
                    >
                      <Eye size={14} style={{ marginRight: '0.25rem' }} /> Preview
                    </button>
                    {!lesson.isDefault && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCustomLesson(lesson.id)}
                        aria-label={`Delete custom lesson ${lesson.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Curriculum footer button */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleResetCurriculum}
                style={{ color: 'var(--text-tertiary)' }}
              >
                <RotateCcw size={14} style={{ marginRight: '0.25rem' }} /> Reset Curriculum to Defaults
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Create Custom Lesson */}
        {activeTab === 'create' && (
          <div className="card" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--clr-primary-500)' }} /> Create New Custom Lesson
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Design specialized typing exercises for coding syntax, technical vocabulary, or targeted drill practice.
            </p>

            <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Lesson Title *
                </label>
                <input
                  type="text"
                  className="input"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. JavaScript Async/Await Practice"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Track / Level
                  </label>
                  <select
                    className="input"
                    value={newLevel}
                    onChange={e => setNewLevel(e.target.value as LevelId)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Difficulty (1 to 5)
                  </label>
                  <select
                    className="input"
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Hard</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Description
                </label>
                <input
                  type="text"
                  className="input"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Briefly describe what this lesson trains"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Focus Keys (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  className="input"
                  value={newFocusKeys}
                  onChange={e => setNewFocusKeys(e.target.value)}
                  placeholder="e.g. a, s, d, f or {, }, (, )"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Min Accuracy (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    className="input"
                    value={newMinAccuracy}
                    onChange={e => setNewMinAccuracy(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Min WPM
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={150}
                    className="input"
                    value={newMinWpm}
                    onChange={e => setNewMinWpm(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    className="input"
                    value={newXpReward}
                    onChange={e => setNewXpReward(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Typing Practice Text *
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {newText.length} characters · {newText.trim() ? newText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  className="input"
                  rows={5}
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="Enter the exact text the typist will transcribe in this lesson..."
                  required
                  style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Save size={16} /> Save Lesson to Curriculum
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveTab('browse')}
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lesson Preview Modal */}
        {previewLesson && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Lesson text preview"
          >
            <div className="card" style={{ maxWidth: '600px', width: '100%', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className={`badge level-${previewLesson.levelId}`} style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {previewLesson.levelId}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{previewLesson.title}</h3>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreviewLesson(null)} aria-label="Close preview">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {previewLesson.description}
              </p>

              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Target Passage:
              </div>
              <div
                style={{
                  background: 'var(--bg-surface-2)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-default)',
                  marginBottom: '1.25rem',
                }}
              >
                {previewLesson.text}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setPreviewLesson(null)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
