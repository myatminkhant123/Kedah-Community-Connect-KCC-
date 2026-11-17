import type { LoginInput, PublicUser, RegisterInput } from '@kcc/shared';
import { generateRandomToken, hashPassword, sha256Hex, verifyPassword } from '../lib/crypto.js';
import { generateId } from '../lib/db.js';
import { conflict, forbidden, unauthorized } from '../lib/errors.js';
import { UserRepository } from '../repositories/user.repository.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(input: RegisterInput): Promise<{
    user: PublicUser;
    sessionToken: string;
    csrfToken: string;
    expiresAt: string;
  }> {
    const existing = await this.userRepo.findByEmailWithPassword(input.email);
    if (existing) {
      throw conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepo.createUser({
      id: generateId('usr'),
      email: input.email,
      displayName: input.displayName,
      passwordHash,
      role: 'RESIDENT',
    });

    const session = await this.issueSession(user.id);
    return { user, ...session };
  }

  async login(input: LoginInput): Promise<{
    user: PublicUser;
    sessionToken: string;
    csrfToken: string;
    expiresAt: string;
  }> {
    const found = await this.userRepo.findByEmailWithPassword(input.email);
    if (!found) {
      throw unauthorized('Invalid email or password');
    }

    const valid = await verifyPassword(input.password, found.passwordHash);
    if (!valid) {
      throw unauthorized('Invalid email or password');
    }

    if (!found.user.isActive) {
      throw forbidden('Account is deactivated');
    }

    const session = await this.issueSession(found.user.id);
    return { user: found.user, ...session };
  }

  async logout(sessionId: string): Promise<void> {
    await this.userRepo.revokeSession(sessionId);
  }

  private async issueSession(userId: string): Promise<{
    sessionToken: string;
    csrfToken: string;
    expiresAt: string;
  }> {
    const sessionToken = generateRandomToken(32);
    const tokenHash = await sha256Hex(sessionToken);
    const csrfToken = generateRandomToken(24);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    await this.userRepo.createSession({
      id: generateId('ses'),
      userId,
      tokenHash,
      csrfToken,
      expiresAt,
    });

    return { sessionToken, csrfToken, expiresAt };
  }
}
