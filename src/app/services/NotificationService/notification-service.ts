import {Injectable,signal} from '@angular/core';


export interface Notification {
  text: string;
  type: NotifyType;
}

export type NotifyType = 'success' | 'danger' | 'warning' | 'info';

@Injectable({
  providedIn:'root'
})

export class NotificationService {

  notification = signal<Notification | null>(null);
  private timeoutId: any;

  notify(text:string, type:NotifyType = 'success',durationMs: number = 4000){
    // Clear any existing timer if a new message arrives quickly
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set the reactive signal
    this.notification.set({text,type})

    // Automatically hide after the specified time
    this.timeoutId = setTimeout(() => {
      this.clear();
    }, durationMs);
  }

  clear(){
    this.notification.set(null);
  }
}
