import React from "react";
import {ReactComponent as TimesSolid} from "./times-solid.svg";
import {availableColors, capitalize} from "../filters/colors";

const TodoListItem = ({todo, onColorChange, onCompletedChange, onDelete}) => {
  const {text, completed, color} = todo;

  const handleCompletedChanged = e => onCompletedChange(e.target.checked);

  const handleColorChanged = e => onColorChange(e.target.value);

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
          <button className="destroy" onClick={onDelete}>
            <TimesSolid/>
          </button>
        </div>
      </div>
    </li>
  );
};

export default TodoListItem;