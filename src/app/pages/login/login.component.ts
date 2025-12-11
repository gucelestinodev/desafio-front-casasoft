import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

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
  private snackbar = inject(SnackbarService);

  constructor() { }

  email = '';
  password = '';
  loginError = false;

  login(form?: NgForm) {
    this.loginError = false;
    if (form && form.invalid) return;

    const payload = { login: this.email, senha: this.password };

    this.auth.login(payload).subscribe({
      next: () => this.router.navigateByUrl('/painel'),
      error: (err) => {
        const api = err?.error;
        if (Array.isArray(api)) {
          this.snackbar.erro(api[0].Message);
        } else {
          this.snackbar.erro('Erro ao tentar fazer login.');
        }
      }
    });
  }
}
