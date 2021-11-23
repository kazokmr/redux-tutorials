import React from "react";
import TodoListItem from "./TodoListItem";
import {useSelector} from "react-redux";

const selectTodos = state => state.todos;

const TodoList = () => {
  const todos = useSelector(selectTodos);

  const renderedListItems = todos.map(todo =>
    <TodoListItem key={todo.id} todo={todo}/>
  );

  return <ul className="todo-list">{renderedListItems}</ul>
};

export default TodoList;
