import {Component, inject, signal} from '@angular/core';
import {InternalNavBar} from './internal/components/internalNavBar/internal-nav-bar';
import {RouterOutlet} from '@angular/router';
import {NotificationService} from './shared/services/NotificationService/notification-service';

@Component({
  imports: [InternalNavBar, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {

 }
