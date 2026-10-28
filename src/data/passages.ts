// ============================================================
// TypeMaster — Test Passage Library
// ============================================================
// Passages for timed tests at different difficulty levels.
// ============================================================

export interface TestPassage {
  id: string;
  text: string;
  difficulty: 1 | 2 | 3;
  category: string;
}

const PASSAGES_EASY: TestPassage[] = [
  { id: 'e1', difficulty: 1, category: 'general', text: 'The sun rises every morning and sets every evening. Birds sing in the trees and flowers bloom in the garden. Life is full of simple pleasures that we often overlook. Take a moment to breathe and enjoy the world around you.' },
  { id: 'e2', difficulty: 1, category: 'general', text: 'Learning to type well takes time and practice. The more you practice, the better you become. Start slowly and focus on accuracy first. Speed will come naturally as your fingers learn where each key is.' },
  { id: 'e3', difficulty: 1, category: 'general', text: 'A good book can take you anywhere. You can visit far-off places, meet new people, and learn about the world without leaving your chair. Reading is one of the best gifts you can give yourself.' },
  { id: 'e4', difficulty: 1, category: 'general', text: 'Fresh air and exercise are good for the body and the mind. A walk in the park, a swim in the pool, or a ride on a bike can lift your mood and clear your head. Try to move a little every day.' },
  { id: 'e5', difficulty: 1, category: 'general', text: 'Cooking is a skill that everyone can learn. Start with simple recipes and work your way up to more complex dishes. The best part about cooking at home is knowing exactly what goes into your food.' },
  { id: 'e6', difficulty: 1, category: 'general', text: 'Music has the power to change how we feel. A fast song can energize us when we are tired. A slow song can calm us when we are stressed. Some songs bring back memories of people and places we love.' },
];

const PASSAGES_MEDIUM: TestPassage[] = [
  { id: 'm1', difficulty: 2, category: 'general', text: 'The internet has transformed the way people communicate, learn, and work. In just a few decades, it has shifted from a research tool used by a small number of scientists and academics into a global network connecting billions of people across every continent. This transformation has brought enormous benefits but also significant challenges.' },
  { id: 'm2', difficulty: 2, category: 'science', text: 'Climate change refers to long-term shifts in global temperatures and weather patterns. While some changes are natural, since the mid-20th century the primary driver has been human activities, particularly the burning of fossil fuels. The consequences include rising sea levels, more frequent extreme weather events, and disruptions to ecosystems worldwide.' },
  { id: 'm3', difficulty: 2, category: 'technology', text: 'Smartphones have become an indispensable part of modern life. These pocket-sized computers allow us to communicate instantly across the globe, access virtually all of human knowledge, navigate unfamiliar streets, and capture high-quality photographs and video. Their influence on social behavior, productivity, and mental health is a subject of growing research.' },
  { id: 'm4', difficulty: 2, category: 'general', text: 'The art of writing is fundamentally about communication. Whether you are composing an email, a business report, a creative story, or a scientific paper, the goal is to convey your ideas clearly and precisely to your reader. Strong writing requires practice, revision, and a willingness to receive and act on feedback.' },
  { id: 'm5', difficulty: 2, category: 'history', text: 'The Renaissance was a period of great cultural and intellectual activity in Europe that began in Italy during the 14th century and spread throughout the continent over the following two centuries. It was characterized by renewed interest in the classical knowledge of ancient Greece and Rome, and gave rise to remarkable advances in art, architecture, literature, and science.' },
  { id: 'm6', difficulty: 2, category: 'science', text: 'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. Using sunlight, water absorbed from the soil, and carbon dioxide from the atmosphere, these organisms produce oxygen as a byproduct. This process forms the foundation of nearly all food chains on Earth.' },
];

const PASSAGES_HARD: TestPassage[] = [
  { id: 'h1', difficulty: 3, category: 'philosophy', text: 'The philosophical tradition known as existentialism, which flourished particularly in the mid-twentieth century, holds that human beings are defined not by predetermined essence but by the choices they make and the actions they take. Philosophers such as Jean-Paul Sartre and Simone de Beauvoir argued that existence precedes essence — that is, we first exist, and only through living do we define what we are. This radical freedom, they insisted, comes with an inescapable responsibility.' },
  { id: 'h2', difficulty: 3, category: 'technology', text: 'Quantum computing represents a fundamentally different approach to information processing. Unlike classical computers, which encode information as binary bits that are always either 0 or 1, quantum computers use quantum bits — qubits — that can exist in a superposition of both states simultaneously. This property, along with entanglement and interference, allows quantum computers to perform certain types of calculations exponentially faster than any classical machine.' },
  { id: 'h3', difficulty: 3, category: 'literature', text: 'Postmodern literature is characterized by its self-referential narratives, unreliable narrators, fragmented structures, and a pervasive skepticism toward grand, unified theories of meaning. Writers such as Thomas Pynchon, Don DeLillo, and Toni Morrison challenged conventional notions of authorship, identity, and historical truth, producing works that demand active interpretation and resist definitive readings.' },
  { id: 'h4', difficulty: 3, category: 'science', text: 'The Standard Model of particle physics is one of the most successful scientific theories ever developed, accurately predicting the behavior of subatomic particles across an astonishing range of conditions. It describes three of the four fundamental forces: electromagnetic, weak nuclear, and strong nuclear. Gravity, described separately by general relativity, remains stubbornly outside its framework — a tension that represents one of the deepest unsolved problems in physics.' },
  { id: 'h5', difficulty: 3, category: 'economics', text: 'Behavioral economics emerged from the realization that human beings frequently deviate from the rational agent model assumed in classical economic theory. Through a series of elegant experiments, Daniel Kahneman and Amos Tversky demonstrated systematic cognitive biases — such as loss aversion, the availability heuristic, and anchoring — that reliably lead people to make economically suboptimal decisions. Their work fundamentally changed how economists, policymakers, and business strategists understand human judgment.' },
  { id: 'h6', difficulty: 3, category: 'mixed', text: 'The dataset contained 1,247,832 records (±2.3% margin of error), sampled across 47 countries between January 2021 and December 2023. Statistical analysis revealed a correlation coefficient of r=0.73 (p<0.001) between socioeconomic indicators and digital literacy scores. Notably, countries with GDP per capita above $25,000 showed 34% higher adoption rates — though this relationship was non-linear (R²=0.61). See Appendix B, Tables 4-7, for full breakdowns by region.' },
];

export const ALL_PASSAGES: TestPassage[] = [...PASSAGES_EASY, ...PASSAGES_MEDIUM, ...PASSAGES_HARD];

/**
 * Get a random passage for the given difficulty.
 * Avoids repeating the last passage ID if provided.
 */
export function getRandomPassage(difficulty: 1 | 2 | 3, lastId?: string): TestPassage {
  const pool = difficulty === 1 ? PASSAGES_EASY : difficulty === 2 ? PASSAGES_MEDIUM : PASSAGES_HARD;
  const filtered = pool.filter(p => p.id !== lastId);
  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Get a passage appropriate for a timed duration.
 * Shorter durations → shorter/easier passages.
 */
export function getPassageForTest(duration: number, difficulty: 1 | 2 | 3, lastId?: string): string {
  const passage = getRandomPassage(difficulty, lastId);
  if (duration <= 30) {
    // For short tests, use just the first sentence(s)
    const sentences = passage.text.match(/[^.!?]+[.!?]+/g) ?? [passage.text];
    const target = duration <= 15 ? 1 : 2;
    return sentences.slice(0, target).join(' ').trim() + ' ' + passage.text;
  }
  return passage.text + ' ' + passage.text; // repeat to ensure enough text
}

/**
 * Free practice passage pool (shorter, varied).
 */
export const FREE_PRACTICE_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow. Jackdaws love my big sphinx of quartz. The job requires extra pluck and zeal from every young wage earner.`;
