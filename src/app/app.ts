import {Component, inject, signal} from '@angular/core';
import {NavBar} from './components/navBar/nav-bar';
import {RouterOutlet} from '@angular/router';
import {NotificationService} from './services/NotificationService/notification-service';

@Component({
  imports: [NavBar, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
   notification = inject(NotificationService)
 }
