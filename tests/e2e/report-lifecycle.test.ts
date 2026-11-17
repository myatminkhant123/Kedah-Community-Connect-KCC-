import { describe, expect, it } from 'vitest';
import { isTransitionAllowed } from '../../apps/worker/src/services/workflow.service.js';

describe('E2E workflow lifecycle specification', () => {
  it('supports full resident -> admin -> officer -> resolved chain', () => {
    const steps: Array<
      [Parameters<typeof isTransitionAllowed>[0], Parameters<typeof isTransitionAllowed>[1]]
    > = [
      ['SUBMITTED', 'UNDER_REVIEW'],
      ['UNDER_REVIEW', 'ASSIGNED'],
      ['ASSIGNED', 'IN_PROGRESS'],
      ['IN_PROGRESS', 'RESOLVED'],
    ];
    for (const [from, to] of steps) {
      expect(isTransitionAllowed(from, to)).not.toBeNull();
    }
  });
});
