define(["require", "exports", "rxjs", "rxjs/operators", "rxjs/ajax"], function (require, exports, rxjs_1, operators_1, ajax_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TodoService {
        constructor() {
            this.todos = [];
            this.addTodoSubject = new rxjs_1.Subject();
            this.removeTodoSubject = new rxjs_1.Subject();
            this.toggleTodoSubject = new rxjs_1.Subject();
            this.todo = '';
            this.completed = false;
            this.addTodo$ = this.addTodoSubject.asObservable();
            this.removeTodo$ = this.removeTodoSubject.asObservable();
            this.toggleTodo$ = this.toggleTodoSubject.asObservable();
            // Fetch initial todos (you can replace this with an API call)
            this.getInitialTodos();
        }
        getInitialTodos() {
            // Simulating initial todos
            let response = ajax_1.ajax('https://dummyjson.com/todos?limit=10');
            response.pipe(operators_1.map(data => data.response.todos)).subscribe(resulte => {
                this.todos = resulte;
                this.todos.forEach(todo => this.addTodoSubject.next(todo));
            });
        }
        getTodos() {
            console.log(this.todos);
            return this.todos;
        }
        addTodo(todo) {
            var _a;
            if (!todo.id)
                todo.id = ((_a = this.todos[this.todos.length - 1]) === null || _a === void 0 ? void 0 : _a.id) + 1;
            this.todos.push(todo);
            this.addTodoSubject.next(todo);
        }
        removeTodo(id) {
            const index = this.todos.findIndex(todo => todo.id === id);
            if (index !== -1) {
                const removedTodo = this.todos.splice(index, 1)[0];
                this.removeTodoSubject.next(removedTodo.id);
            }
        }
        toggleTodoStatus(id) {
            const index = this.todos.findIndex(todo => todo.id === id);
            if (index !== -1) {
                this.todos[index].completed = !this.todos[index].completed;
                this.toggleTodoSubject.next(id);
            }
        }
    }
    let todoService = new TodoService();
    todoService.addTodo$.subscribe(() => render());
    todoService.removeTodo$.subscribe(() => render());
    todoService.toggleTodo$.subscribe(() => render());
    let todoListContainer = document.querySelector('.todo-list');
    function render() {
        todoListContainer.innerHTML = '';
        todoService.getTodos().forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.id = `todo-${todo.id}`;
            todoItem.innerHTML = `<input type="checkbox" ${todo.completed ? 'checked' : ''}> ${todo.todo} `;
            todoItem.addEventListener('click', () => todoService.toggleTodoStatus(todo.id));
            var delBtn = document.createElement('button');
            delBtn.innerHTML = "Delete";
            rxjs_1.fromEvent(delBtn, 'click').subscribe(() => {
                todoService.removeTodo(todo.id);
            });
            todoItem.prepend(delBtn);
            todoListContainer.appendChild(todoItem);
        });
    }
    rxjs_1.fromEvent(document.querySelector('#todo-add'), 'click').subscribe(() => {
        let name = document.querySelector('#todo-name');
        var status = document.querySelector('#todo-status');
        todoService.addTodo({ todo: name.value, completed: status.checked });
    });
});
