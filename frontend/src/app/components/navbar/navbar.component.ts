import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminNavComponent } from '../adminnav/adminnav.component';
import { UserNavComponent } from '../usernav/usernav.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AdminNavComponent, UserNavComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
}
