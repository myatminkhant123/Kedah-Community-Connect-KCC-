import { describe, expect, it } from 'vitest';
import { isTransitionAllowed } from '../src/services/workflow.service.js';

describe('workflow transition rules', () => {
  it('allows valid lifecycle transitions', () => {
    expect(isTransitionAllowed('SUBMITTED', 'UNDER_REVIEW')).not.toBeNull();
    expect(isTransitionAllowed('UNDER_REVIEW', 'ASSIGNED')).not.toBeNull();
    expect(isTransitionAllowed('UNDER_REVIEW', 'REJECTED')).not.toBeNull();
    expect(isTransitionAllowed('ASSIGNED', 'IN_PROGRESS')).not.toBeNull();
    expect(isTransitionAllowed('IN_PROGRESS', 'RESOLVED')).not.toBeNull();
    expect(isTransitionAllowed('RESOLVED', 'REOPENED')).not.toBeNull();
    expect(isTransitionAllowed('SUBMITTED', 'CANCELLED')).not.toBeNull();
  });

  it('rejects illegal transitions', () => {
    expect(isTransitionAllowed('SUBMITTED', 'RESOLVED')).toBeNull();
    expect(isTransitionAllowed('REJECTED', 'IN_PROGRESS')).toBeNull();
    expect(isTransitionAllowed('CANCELLED', 'UNDER_REVIEW')).toBeNull();
    expect(isTransitionAllowed('ASSIGNED', 'CANCELLED')).toBeNull();
  });
});
