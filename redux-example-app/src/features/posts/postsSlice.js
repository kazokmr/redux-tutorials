import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice
} from "@reduxjs/toolkit";
import {client} from "../../api/client";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
});

const initialState = postsAdapter.getInitialState({
  status: "idle",
  error: null
});

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await client.get("/fakeApi/posts");
  return response.data;
});

export const addNewPost = createAsyncThunk("posts/addNewPost",
  async initialPost => {
    const response = await client.post("/fakeApi/posts", initialPost);
    return response.data;
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reactionAdded(state, action) {
      const {postId, reaction} = action.payload;
      const existingPost = state.entities[postId];
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },
    postUpdated(state, action) {
      const {id, title, content} = action.payload;
      const existingPost = state.entities[id];
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
      }
    }
  },
  extraReducers(builder) {
    // fetchPosts(AsyncThunk)の状態によってstateのプロパティを設定する
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        postsAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne);
  }
});

export const {postUpdated, reactionAdded} = postSlice.actions

export default postSlice.reducer

/*createEntityAdapterは内部のID配列とEntitiesを基に、
selectAll, selectById, selectIds の３つの関数を持つ（名称から意味はわかると思う）ので、
関数にSelector名を付けて、外部からSelectorから呼び出す
* */
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
} = postsAdapter.getSelectors(state => state.posts);

/* createSelector でメモ化する
* 第一引数で必要なパラメータを定義する。この場合は全てのpostsとuserIdなので、
* postsは内部でselectAllPostsセレクタを利用し、userIdは外部から渡してもらう
* 第二引数は受け取ったpostsとuserIdを使って必要な戻り値を返す(この場合はuserIdでフィルタリングした記事一覧)
*  */
export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.user === userId)
);
