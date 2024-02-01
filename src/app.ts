// src/todo.service.ts
import { Subject, Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { stat } from 'fs';

interface Todo {
  id?: number;
  todo: string;
  completed: boolean;
}

class TodoService implements Todo {
  private todos: Todo[] = [];
  private addTodoSubject = new Subject<Todo>();
  private removeTodoSubject = new Subject<number>();
  private toggleTodoSubject = new Subject<number>();

  todo: string = '';
  completed: boolean = false;
  addTodo$: Observable<Todo> = this.addTodoSubject.asObservable();
  removeTodo$: Observable<number> = this.removeTodoSubject.asObservable();
  toggleTodo$: Observable<number> = this.toggleTodoSubject.asObservable();

  constructor() {
    // Fetch initial todos (you can replace this with an API call)
    this.getInitialTodos();
  }

  private getInitialTodos() {
    // Simulating initial todos
    let response = ajax('https://dummyjson.com/todos?limit=10');
    response.pipe(map(data => data.response.todos)).subscribe(resulte => {
        this.todos = resulte;
        this.todos.forEach(todo => this.addTodoSubject.next(todo));
    })
  }

  getTodos(): Todo[] {
    console.log(this.todos);
    
    return this.todos;
  }

  addTodo(todo: Todo) {
    if(!todo.id)
      todo.id = this.todos[this.todos.length -1]?.id! +1

    this.todos.push(todo);
    this.addTodoSubject.next(todo);
  }

  removeTodo(id: number) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      const removedTodo = this.todos.splice(index, 1)[0];
      this.removeTodoSubject.next(removedTodo.id);
    }
  }

  toggleTodoStatus(id: number) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this.todos[index].completed = !this.todos[index].completed;
      this.toggleTodoSubject.next(id);
    }
  }
}

let todoService = new TodoService();

todoService.addTodo$.subscribe(() => render())
todoService.removeTodo$.subscribe(() => render())
todoService.toggleTodo$.subscribe(() => render())

let todoListContainer = document.querySelector('.todo-list')!;

function render() {
  todoListContainer.innerHTML = '';
  todoService.getTodos().forEach(todo => {

    const todoItem = document.createElement('div');
    todoItem.id = `todo-${todo.id}`;
    todoItem.innerHTML = `<input type="checkbox" ${todo.completed ? 'checked' : ''}> ${todo.todo} `;
    todoItem.addEventListener('click', () => todoService.toggleTodoStatus(todo.id!));
    var delBtn = document.createElement('button');
    delBtn.innerHTML = "Delete";
    fromEvent(delBtn, 'click').subscribe(() => {
      todoService.removeTodo(todo.id!);
    })
    todoItem.prepend(delBtn);
    todoListContainer.appendChild(todoItem);

  });
}

fromEvent(document.querySelector('#todo-add')!, 'click').subscribe(() => {
  let name: any = document.querySelector('#todo-name')!;
  var status: any = document.querySelector('#todo-status')!;
  
  todoService.addTodo({todo: name.value, completed: status.checked});
})
