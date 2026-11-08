import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private getUserRoles(): string[] {
    let raw: unknown = [];
    try {
      raw = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
    } catch {
      raw = [];
    }
    return Array.isArray(raw)
      ? raw
        .map((role: unknown) => typeof role === 'object' && role !== null && 'authority' in role
          ? role.authority
          : role)
        .filter((role): role is string => typeof role === 'string')
      : [];
  }

  public hasRole(roleName: string): boolean {
    return this.getUserRoles().includes(roleName);
  }
}
