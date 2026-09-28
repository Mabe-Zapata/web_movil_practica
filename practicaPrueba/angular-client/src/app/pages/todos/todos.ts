import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../../services/todo';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.html',
  styleUrl: './todos.css'
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle = '';

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (todos) => this.todos = todos,
      error: (err) => console.error('Error cargando todos:', err)
    });
  }

  createTodo(): void {
    if (!this.newTodoTitle.trim()) return;

    this.todoService.createTodo({ title: this.newTodoTitle }).subscribe({
      next: (todo) => {
        this.todos.push(todo);
        this.newTodoTitle = '';
      },
      error: (err) => console.error('Error creando todo:', err)
    });
  }

  deleteTodo(id: number | undefined): void {
    if (id === undefined) return;
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== id);
      },
      error: (err) => console.error('Error eliminando todo:', err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
