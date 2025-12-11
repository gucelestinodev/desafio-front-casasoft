import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  private snackBar = inject(MatSnackBar);

  sucesso(msg: string) {
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snack-success']
    });
  }

  erro(msg: string) {
    this.snackBar.open(msg, 'OK', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snack-error']
    });
  }

  info(msg: string) {
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snack-info']
    });
  }
}
