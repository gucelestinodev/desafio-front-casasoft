import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

type LoginPayload = { login: string; senha: string };

type LoginResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userToken: {
      email: string;
      firstName: string;
      login: string;
      nomeEmpresa: string;
      claims: { value: string; type: string }[];
    };
  };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = `${environment.AUTH_BASE}/api/v1/login/token`;

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, payload).pipe(
      tap((res) => {
        const access = res?.data?.accessToken;
        const refresh = res?.data?.refreshToken;
        if (access) localStorage.setItem('token', access);
        if (refresh) localStorage.setItem('refreshToken', refresh);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  get token() { return localStorage.getItem('token'); }
  isAuthenticated() { return !!this.token; }
}
