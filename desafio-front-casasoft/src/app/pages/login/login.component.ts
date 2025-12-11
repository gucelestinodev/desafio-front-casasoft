import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loginError = false;

  login(form?: NgForm) {
  this.loginError = false;
  if (form && form.invalid) return;

  const payload = { login: this.email, senha: this.password };

  this.auth.login(payload).subscribe({
    next: () => this.router.navigateByUrl('/painel'),
    error: () => (this.loginError = true),
  });
}
}
