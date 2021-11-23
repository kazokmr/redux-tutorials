import {createSelector, createSlice} from "@reduxjs/toolkit";
import {client} from "../../api/client";
import {StatusFilters} from "../filters/filtersSlice";

const initialState = {
  status: 'idle',
  entities: {}
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload;
      state.entities[todo.id] = todo;
    },
    todoToggled(state, action) {
      const todoId = action.payload;
      const todo = state.entities[todoId];
      todo.completed = !todo.completed;
    },
    todoColorSelected: {
      reducer(state, action) {
        const {color, todoId} = action.payload;
        state.entities[todoId].color = color;
      },
      prepare(todoId, color) {
        return {
          payload: {todoId, color},
        };
      },
    },
    todoDeleted(state, action) {
      delete state.entities[action.payload];
    },
    allTodoCompleted(state) {
      Object.values(state.entities).forEach(todo => todo.completed = true);
    },
    completedCleared(state) {
      Object.values(state.entities).forEach(todo => {
        if (todo.completed) {
          delete state.entities[todo.id];
        }
      });
    },
    todosLoading(state) {
      state.status = "loading";
    },
    todosLoaded(state, action) {
      const newEntities = {}
      action.payload.forEach(todo => newEntities[todo.id] = todo);
      state.status = "idle";
      state.entities = newEntities;
    }
  }
});

// Thunk function
export const fetchTodos = () => async dispatch => {
  dispatch(todosLoading());
  const response = await client.get("/fakeApi/todos");
  dispatch(todosLoaded(response.todos));
};

export const saveNewTodo = (text) => async dispatch => {
  const initialTodo = {text};
  const response = await client.post("/fakeApi/todos", {todo: initialTodo});
  dispatch(todoAdded(response.todo));
};

// Create Selector
export const selectTodoEntities = state => state.todos.entities;

export const selectTodos = createSelector(selectTodoEntities, entities =>
  Object.values(entities)
);

export const selectTodoById = (state, todoId) =>
  selectTodoEntities(state)[todoId]

export const selectTodoIds = createSelector(
  selectTodos,
  todos => todos.map(todo => todo.id)
);

export const selectFilteredTodos = createSelector(
  selectTodos,
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

export const {
  todoAdded,
  todoToggled,
  todoColorSelected,
  todoDeleted,
  allTodoCompleted,
  completedCleared,
  todosLoading,
  todosLoaded,
} = todosSlice.actions

export default todosSlice.reducer;