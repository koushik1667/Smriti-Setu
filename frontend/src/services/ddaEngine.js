/**
 * Dynamic Difficulty Adjustment (DDA) Engine for Elderly Dementia Therapeutics
 *
 * Implements a heuristic Bayesian-inspired Cognitive Load Index (CLI) calculator
 * and adaptive difficulty state machine that dynamically adjusts puzzle complexity,
 * sensory pacing, card count, and visual assistance affordances across 10 levels.
 */

// Difficulty configurations across 10 graduated clinical tiers
export const DIFFICULTY_TIERS = {
  1: {
    level: 1,
    label: 'Gentle Familiarity',
    badge: 'Level 1: Gentle (4 Cards)',
    gridRows: 2,
    gridCols: 2,
    pairsCount: 2,
    flipBackDelayMs: 1200,
    peekDurationMs: 0,
    audioSpeed: 0.8,
    hintLatencyMs: 6000,
    scoreMultiplier: 1.0,
    description: '4 large tactile cards (2 pairs), relaxed pace'
  },
  2: {
    level: 2,
    label: 'Focused Recall',
    badge: 'Level 2: Novice (6 Cards)',
    gridRows: 2,
    gridCols: 3,
    pairsCount: 3,
    flipBackDelayMs: 1050,
    peekDurationMs: 0,
    audioSpeed: 0.85,
    hintLatencyMs: 8000,
    scoreMultiplier: 1.25,
    description: '6 cards (3 pairs), gentle prompt pacing'
  },
  3: {
    level: 3,
    label: 'Pattern Discrimination',
    badge: 'Level 3: Moderate (8 Cards)',
    gridRows: 2,
    gridCols: 4,
    pairsCount: 4,
    flipBackDelayMs: 950,
    peekDurationMs: 0,
    audioSpeed: 0.9,
    hintLatencyMs: 10000,
    scoreMultiplier: 1.5,
    description: '8 cards (4 pairs), quicker memory recall'
  },
  4: {
    level: 4,
    label: 'Visual Tenacity',
    badge: 'Level 4: Active (10 Cards)',
    gridRows: 2,
    gridCols: 5,
    pairsCount: 5,
    flipBackDelayMs: 900,
    peekDurationMs: 0,
    audioSpeed: 0.92,
    hintLatencyMs: 11000,
    scoreMultiplier: 1.75,
    description: '10 cards (5 pairs), expanded visual field'
  },
  5: {
    level: 5,
    label: 'Active Working Memory',
    badge: 'Level 5: Tough (12 Cards)',
    gridRows: 3,
    gridCols: 4,
    pairsCount: 6,
    flipBackDelayMs: 800,
    peekDurationMs: 1800,
    audioSpeed: 0.95,
    hintLatencyMs: 12000,
    scoreMultiplier: 2.0,
    description: '12 cards (6 pairs) with 1.8s initial preview'
  },
  6: {
    level: 6,
    label: 'Advanced Cognitive Agility',
    badge: 'Level 6: Very Tough (16 Cards)',
    gridRows: 4,
    gridCols: 4,
    pairsCount: 8,
    flipBackDelayMs: 700,
    peekDurationMs: 2200,
    audioSpeed: 1.0,
    hintLatencyMs: 14000,
    scoreMultiplier: 2.5,
    description: '16 cards (8 pairs), rapid recall'
  },
  7: {
    level: 7,
    label: 'Master Sensory Recall',
    badge: 'Level 7: Expert (20 Cards)',
    gridRows: 4,
    gridCols: 5,
    pairsCount: 10,
    flipBackDelayMs: 650,
    peekDurationMs: 2500,
    audioSpeed: 1.0,
    hintLatencyMs: 15000,
    scoreMultiplier: 3.0,
    description: '20 cards (10 pairs), high visual discrimination'
  },
  8: {
    level: 8,
    label: 'Grandmaster Recall',
    badge: 'Level 8: Master (24 Cards)',
    gridRows: 4,
    gridCols: 6,
    pairsCount: 12,
    flipBackDelayMs: 600,
    peekDurationMs: 2800,
    audioSpeed: 1.05,
    hintLatencyMs: 16000,
    scoreMultiplier: 3.5,
    description: '24 cards (12 pairs), working memory endurance'
  },
  9: {
    level: 9,
    label: 'Elite Working Memory',
    badge: 'Level 9: Elite (28 Cards)',
    gridRows: 4,
    gridCols: 7,
    pairsCount: 14,
    flipBackDelayMs: 550,
    peekDurationMs: 3200,
    audioSpeed: 1.05,
    hintLatencyMs: 17000,
    scoreMultiplier: 4.0,
    description: '28 cards (14 pairs), rapid multi-item retention'
  },
  10: {
    level: 10,
    label: 'Titan Cognitive Agility',
    badge: 'Level 10: Grandmaster Titan (32 Cards)',
    gridRows: 4,
    gridCols: 8,
    pairsCount: 16,
    flipBackDelayMs: 500,
    peekDurationMs: 3500,
    audioSpeed: 1.1,
    hintLatencyMs: 18000,
    scoreMultiplier: 5.0,
    description: '32 cards (16 pairs), peak cognitive agility challenge'
  }
};

export class DDAEngine {
  static WEIGHTS = {
    hesitation: 0.35,
    errorRate: 0.45,
    reactionTime: 0.20
  };

  static calculateCognitiveLoad({
    reactionTimeMs = 2000,
    hesitationScore = 1500,
    errorRate = 0,
    retryCount = 0
  }) {
    const normReaction = Math.min(100, Math.max(0, ((reactionTimeMs - 800) / 6000) * 100));
    const normHesitation = Math.min(100, Math.max(0, ((hesitationScore - 1000) / 7000) * 100));
    const normErrors = Math.min(100, Math.max(0, (errorRate / 0.60) * 100));
    const retryPenalty = Math.min(25, retryCount * 10);

    const rawCLI =
      this.WEIGHTS.reactionTime * normReaction +
      this.WEIGHTS.hesitation * normHesitation +
      this.WEIGHTS.errorRate * normErrors +
      retryPenalty;

    return Math.round(Math.min(100, Math.max(5, rawCLI)) * 10) / 10;
  }

  static evaluateNextDifficulty(currentLevel, sessionMetrics) {
    const cli = this.calculateCognitiveLoad(sessionMetrics);
    let nextLevel = currentLevel;
    let action = 'MAINTAIN';
    let reason = 'Comfortable balance within the cognitive engagement zone.';

    if (cli > 65 || (sessionMetrics.errorRate && sessionMetrics.errorRate > 0.40)) {
      if (currentLevel > 1) {
        nextLevel = currentLevel - 1;
        action = 'DECREASE';
        reason = `High strain detected (CLI: ${cli}). Adjusting difficulty to preserve confidence.`;
      } else {
        reason = `High strain detected, but already at minimum tier. Hints active.`;
      }
    } else if (cli < 35 && sessionMetrics.errorRate < 0.20) {
      if (currentLevel < 10) {
        nextLevel = currentLevel + 1;
        action = 'INCREASE';
        reason = `High recall speed & accuracy (CLI: ${cli})! Advancing to tougher Level ${nextLevel}!`;
      } else {
        reason = `Grandmaster Titan mastery reached at maximum difficulty tier!`;
      }
    }

    return {
      nextLevel,
      cli,
      action,
      reason,
      config: DIFFICULTY_TIERS[nextLevel]
    };
  }
}
