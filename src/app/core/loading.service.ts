import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _active = new BehaviorSubject<number>(0);
  readonly loading$ = this._active.asObservable().pipe(map(n => n > 0));

  start() { this._active.next(this._active.value + 1); }
  stop()  { this._active.next(Math.max(0, this._active.value - 1)); }
}
