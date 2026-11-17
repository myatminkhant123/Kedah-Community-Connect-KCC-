import type { Category, Department } from '@kcc/shared';
import { nowIso } from '../lib/db.js';

export class DepartmentRepository {
  constructor(private readonly db: D1Database) {}

  async listCategories(activeOnly = true): Promise<Category[]> {
    const query = activeOnly
      ? `SELECT id, name, description, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC`
      : `SELECT id, name, description, is_active FROM categories ORDER BY name ASC`;
    const { results } = await this.db.prepare(query).all<{
      id: string;
      name: string;
      description: string | null;
      is_active: number;
    }>();
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: r.is_active === 1,
    }));
  }

  async findCategoryById(id: string): Promise<Category | null> {
    const r = await this.db
      .prepare(`SELECT id, name, description, is_active FROM categories WHERE id = ? LIMIT 1`)
      .bind(id)
      .first<{ id: string; name: string; description: string | null; is_active: number }>();
    return r
      ? { id: r.id, name: r.name, description: r.description, isActive: r.is_active === 1 }
      : null;
  }

  async createCategory(params: {
    id: string;
    name: string;
    description: string | null;
  }): Promise<Category> {
    await this.db
      .prepare(`INSERT INTO categories (id, name, description, is_active) VALUES (?, ?, ?, 1)`)
      .bind(params.id, params.name, params.description)
      .run();
    return { id: params.id, name: params.name, description: params.description, isActive: true };
  }

  async updateCategory(
    id: string,
    fields: { name?: string; description?: string | null; isActive?: boolean },
  ): Promise<Category | null> {
    const existing = await this.findCategoryById(id);
    if (!existing) return null;
    await this.db
      .prepare(`UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?`)
      .bind(
        fields.name ?? existing.name,
        fields.description !== undefined ? fields.description : existing.description,
        (fields.isActive ?? existing.isActive) ? 1 : 0,
        id,
      )
      .run();
    return this.findCategoryById(id);
  }

  async listDepartments(activeOnly = true): Promise<Department[]> {
    const query = activeOnly
      ? `SELECT id, name, description, is_active, created_at FROM departments WHERE is_active = 1 ORDER BY name ASC`
      : `SELECT id, name, description, is_active, created_at FROM departments ORDER BY name ASC`;
    const { results } = await this.db.prepare(query).all<{
      id: string;
      name: string;
      description: string | null;
      is_active: number;
      created_at: string;
    }>();
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: r.is_active === 1,
      createdAt: r.created_at,
    }));
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    const r = await this.db
      .prepare(
        `SELECT id, name, description, is_active, created_at FROM departments WHERE id = ? LIMIT 1`,
      )
      .bind(id)
      .first<{
        id: string;
        name: string;
        description: string | null;
        is_active: number;
        created_at: string;
      }>();
    return r
      ? {
          id: r.id,
          name: r.name,
          description: r.description,
          isActive: r.is_active === 1,
          createdAt: r.created_at,
        }
      : null;
  }

  async createDepartment(params: {
    id: string;
    name: string;
    description: string | null;
  }): Promise<Department> {
    const createdAt = nowIso();
    await this.db
      .prepare(
        `INSERT INTO departments (id, name, description, is_active, created_at) VALUES (?, ?, ?, 1, ?)`,
      )
      .bind(params.id, params.name, params.description, createdAt)
      .run();
    return {
      id: params.id,
      name: params.name,
      description: params.description,
      isActive: true,
      createdAt,
    };
  }

  async updateDepartment(
    id: string,
    fields: { name?: string; description?: string | null; isActive?: boolean },
  ): Promise<Department | null> {
    const existing = await this.findDepartmentById(id);
    if (!existing) return null;
    await this.db
      .prepare(`UPDATE departments SET name = ?, description = ?, is_active = ? WHERE id = ?`)
      .bind(
        fields.name ?? existing.name,
        fields.description !== undefined ? fields.description : existing.description,
        (fields.isActive ?? existing.isActive) ? 1 : 0,
        id,
      )
      .run();
    return this.findDepartmentById(id);
  }
}
