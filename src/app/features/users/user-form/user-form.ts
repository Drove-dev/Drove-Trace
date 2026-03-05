import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  imports: [],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  user = signal<any>(null);

  ngOnInit() {
    // Accedemos directamente al estado del historial
    const state = history.state;

    if (state?.data) {
      this.user.set(state.data);
    }

    console.log(this.user());
  }
}
