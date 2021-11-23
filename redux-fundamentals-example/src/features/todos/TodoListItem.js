import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ReactComponent as TimesSolid} from "./times-solid.svg";
import {availableColors, capitalize} from "../filters/colors";
import {
  selectTodoById,
  todoColorSelected,
  todoDeleted,
  todoToggled
} from "./todosSlice";

const TodoListItem = ({id}) => {
  const todo = useSelector(state => selectTodoById(state, id));
  const {text, completed, color} = todo;

  const dispatch = useDispatch();

  const handleCompletedChanged = () => dispatch(todoToggled(todo.id))
  const handleColorChanged = e => {
    const color = e.target.value;
    dispatch(todoColorSelected(todo.id, color));
  }
  const handleDeleted = () => dispatch(todoDeleted(todo.id));

  const colorOptions = availableColors.map(color => (
    <option key={color} value={color}>
      {capitalize(color)}
    </option>
  ));

  return (
    <li>
      <div className="view">
        <div className="segment label">
          <input
            className="toggle"
            type="checkbox"
            checked={completed}
            onChange={handleCompletedChanged}
          />
          <div className="todo-text">{text}</div>
        </div>
        <div className="segment buttons">
          <select
            className="colorPicker"
            value={color}
            style={{color}}
            onChange={handleColorChanged}
          >
            <option value=""/>
            {colorOptions}
          </select>
          <button className="destroy" onClick={handleDeleted}>
            <TimesSolid/>
          </button>
        </div>
      </div>
    </li>
  );
};

export default TodoListItem;