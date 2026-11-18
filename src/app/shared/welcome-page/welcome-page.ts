import { Component } from '@angular/core';
import {DatePipe} from '@angular/common';
import {environmentDev} from '../../../environments/environment.dev';
import {RouterLink} from '@angular/router';

@Component({
  imports: [
    DatePipe,
    RouterLink
  ],
  selector: 'app-welcome-page',
  styleUrl: './welcome-page.css',
  templateUrl: './welcome-page.html',
})
export class WelcomePage {
  today: Date = new Date();
  protected readonly env = environmentDev;
}
