import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  // if (req.url.includes('/hub')) return next(req);

  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
