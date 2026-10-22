import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private getUserRoles(): string[] {
    const raw = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
    return raw.map((r: any) => (r.authority ? r.authority : r));
  }

  public hasRole(roleName: string) {
    const roles = this.getUserRoles();
    const role = roles.find((r) => r === roleName) || null;
    return role !== null;
  }
}
