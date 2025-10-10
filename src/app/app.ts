import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('deliver-app');
  isMenuOpen = false;
  isUserMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Cerrar menú de usuario si está abierto
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onUserToggle(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleUserMenu();
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  async logout() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
    this.closeUserMenu();
  }
}
