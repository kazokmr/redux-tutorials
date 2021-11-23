import {client} from "../../api/client";
import {createSelector} from "reselect";
import {StatusFilters} from "../filters/filtersSlice";

const initialState = [];

const todosReducer = (state = initialState, action) => {
  switch (action.type) {
    case "todos/todoAdded":
      return [...state, action.payload]
    case "todos/todoToggled": {
      return state.map(todo => {
        if (todo.id !== action.payload) {
          return todo;
        }
        return {
          ...todo,
          completed: !todo.completed
        };
      })
    }
    case "todos/colorSelected": {
      const {color, todoId} = action.payload;
      return state.map(todo => {
        if (todo.id !== todoId) {
          return todo;
        }
        return {
          ...todo,
          color,
        }
      });
    }
    case "todos/todoDeleted": {
      return state.filter(todo => todo.id !== action.payload);
    }
    case "todos/allCompleted": {
      return state.map(todo => {
        return {...todo, completed: true}
      });
    }
    case "todos/completedCleared": {
      return state.filter(todo => !todo.completed);
    }
    case "todos/todosLoaded": {
      return action.payload;
    }
    default:
      return state;
  }
};

// Action Creators
export const todoAdded = todo => ({
  type: "todos/todoAdded",
  payload: todo
});

export const todoToggled = todoId => ({
  type: "todos/todoToggled",
  payload: todoId
});

export const todoColorSelected = (todoId, color) => ({
  type: "todos/colorSelected",
  payload: {color, todoId}
});

export const todoDeleted = todoId => ({
  type: "todos/todoDeleted",
  payload: todoId
});

export const allTodoCompleted = () => ({type: "todos/allCompleted"});

export const completedCleared = () => ({type: "todos/completedCleared"});

export const todosLoaded = todos => ({
  type: "todos/todosLoaded",
  payload: todos
});

// Create Selector
export const selectFilteredTodos = createSelector(
  state => state.todos,
  state => state.filters,
  (todos, filters) => {
    const {status, colors} = filters;
    const showAllCompletions = status === StatusFilters.All;
    if (showAllCompletions && colors.length === 0) {
      return todos;
    }
    const completedStatus = status === StatusFilters.Completed;
    return todos.filter(todo => {
      const statusMatches = showAllCompletions || todo.completed === completedStatus;
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches;
    });
  }
);

export const selectFilteredTodoIds = createSelector(
  selectFilteredTodos,
  filteredTodos => filteredTodos.map(todo => todo.id)
);

// Thunk function
export const fetchTodos = () =>
  async dispatch => {
    const response = await client.get("/fakeApi/todos");
    dispatch(todosLoaded(response.todos));
  };

export const saveNewTodo = (text) =>
  async dispatch => {
    const initialTodo = {text};
    const response = await client.post("/fakeApi/todos", {todo: initialTodo});
    dispatch(todoAdded(response.todo));
  };

export const selectTodos = state => state.todos;

export const selectTodoById = (state, todoId) =>
  selectTodos(state).find(todo => todo.id === todoId);

export default todosReducer;