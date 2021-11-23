import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from "@reduxjs/toolkit";
import {client} from "../../api/client";
import {StatusFilters} from "../filters/filtersSlice";

const todosAdapter = createEntityAdapter();

const initialState = todosAdapter.getInitialState({
  status: 'idle',
});

// Thunk function
export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
  const response = await client.get("/fakeApi/todos");
  return response.todos;
});

export const saveNewTodo = createAsyncThunk("todos/saveNewTodo", async text => {
  const initialTodo = {text};
  const response = await client.post("/fakeApi/todos", {todo: initialTodo});
  return response.todo;
});

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
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
    todoDeleted: todosAdapter.removeOne,
    allTodoCompleted(state) {
      Object.values(state.entities).forEach(todo => todo.completed = true);
    },
    completedCleared(state) {
      const completedIs = Object.values(state.entities)
        .filter(todo => todo.completed)
        .map(todo => todo.id);
      todosAdapter.removeMany(state, completedIs);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        todosAdapter.setAll(state, action.payload);
        state.status = "idle";
      })
      .addCase(saveNewTodo.fulfilled, todosAdapter.addOne);
  }
});

export const {
  todoToggled,
  todoColorSelected,
  todoDeleted,
  allTodoCompleted,
  completedCleared,
} = todosSlice.actions

export default todosSlice.reducer;

// Create Selector
// todosAdapterのSelectorでselectAllやselectByIdがあるので、それらの別名を定義して外部から利用できるようにする
export const {selectAll: selectTodos, selectById: selectTodoById} =
  todosAdapter.getSelectors(state => state.todos);

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
