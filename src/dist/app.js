"use strict";
exports.__esModule = true;
// src/todo.service.ts
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var ajax_1 = require("rxjs/ajax");
var TodoService = /** @class */ (function () {
    function TodoService() {
        this.todos = [];
        this.addTodoSubject = new rxjs_1.Subject();
        this.removeTodoSubject = new rxjs_1.Subject();
        this.toggleTodoSubject = new rxjs_1.Subject();
        this.todo = '';
        this.completed = false;
        this.addTodo$ = this.addTodoSubject.asObservable();
        this.removeTodo$ = this.removeTodoSubject.asObservable();
        this.toggleTodo$ = this.toggleTodoSubject.asObservable();
        this.getInitialTodos();
    }
    TodoService.prototype.getInitialTodos = function () {
        var _this = this;
        // Simulating initial todos
        var response = ajax_1.ajax('https://dummyjson.com/todos?limit=10');
        response.pipe(operators_1.map(function (data) { return data.response.todos; })).subscribe(function (resulte) {
            _this.todos = resulte;
            _this.todos.forEach(function (todo) { return _this.addTodoSubject.next(todo); });
        });
    };
    TodoService.prototype.getTodos = function () {
        console.log(this.todos);
        return this.todos;
    };
    TodoService.prototype.addTodo = function (todo) {
        var _a;
        if (!todo.id)
            todo.id = ((_a = this.todos[this.todos.length - 1]) === null || _a === void 0 ? void 0 : _a.id) + 1;
        this.todos.push(todo);
        this.addTodoSubject.next(todo);
    };
    TodoService.prototype.removeTodo = function (id) {
        var index = this.todos.findIndex(function (todo) { return todo.id === id; });
        if (index !== -1) {
            var removedTodo = this.todos.splice(index, 1)[0];
            this.removeTodoSubject.next(removedTodo.id);
        }
    };
    TodoService.prototype.toggleTodoStatus = function (id) {
        var index = this.todos.findIndex(function (todo) { return todo.id === id; });
        if (index !== -1) {
            this.todos[index].completed = !this.todos[index].completed;
            this.toggleTodoSubject.next(id);
        }
    };
    return TodoService;
}());
var todoService = new TodoService();
todoService.addTodo$.subscribe(function () { return render(); });
todoService.removeTodo$.subscribe(function () { return render(); });
todoService.toggleTodo$.subscribe(function () { return render(); });
var todoListContainer = document.querySelector('.todo-list');
function render() {
    todoListContainer.innerHTML = '';
    todoService.getTodos().forEach(function (todo) {
        var todoItem = document.createElement('div');
        todoItem.id = "todo-" + todo.id;
        todoItem.innerHTML = "<input type=\"checkbox\" " + (todo.completed ? 'checked' : '') + "> " + todo.todo + " ";
        todoItem.addEventListener('click', function () { return todoService.toggleTodoStatus(todo.id); });
        var delBtn = document.createElement('button');
        delBtn.innerHTML = "Delete";
        rxjs_1.fromEvent(delBtn, 'click').subscribe(function () {
            todoService.removeTodo(todo.id);
        });
        todoItem.prepend(delBtn);
        todoListContainer.appendChild(todoItem);
    });
}
rxjs_1.fromEvent(document.querySelector('#todo-add'), 'click').subscribe(function () {
    var name = document.querySelector('#todo-name');
    var status = document.querySelector('#todo-status');
    todoService.addTodo({ todo: name.value, completed: status.checked });
});
