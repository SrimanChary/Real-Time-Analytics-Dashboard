import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  loading        = signal(false);
  error          = signal('');
  showPass       = signal(false);
  isRegisterMode = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email:    [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePass(): void { this.showPass.set(!this.showPass()); }

  toggleMode(): void {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.error.set('');
    if (this.isRegisterMode()) {
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
    } else {
      this.form.get('email')?.clearValidators();
    }
    this.form.get('email')?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, email, password } = this.form.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    const req$ = this.isRegisterMode()
      ? this.auth.register({ username, email, password })
      : this.auth.login({ username, password });
    req$.subscribe({
      next: () => this.router.navigateByUrl(returnUrl),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
        this.loading.set(false);
      },
    });
  }

  fillDemo(): void { this.form.patchValue({ username: 'admin', password: 'Admin@123' }); }
}
