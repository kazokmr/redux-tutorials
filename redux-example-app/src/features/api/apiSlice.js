import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({baseUrl: "/fakeApi"}),
  tagTypes: ["Post"],
  endpoints: builder => ({
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: (result = []) => [
        "Post",
        ...result.map(({id}) => ({type: "Post", id}))
      ]
    }),
    getPost: builder.query({
      query: postId => `/posts/${postId}`,
      providesTags: (result, error, arg) => [{type: "Post", id: arg}]
    }),
    addNewPost: builder.mutation({
      query: initialPost => ({
        url: "/posts",
        method: "POST",
        body: initialPost
      }),
      invalidatesTags: ["Post"]
    }),
    editPost: builder.mutation({
      query: post => ({
        url: `/posts/${post.id}`,
        method: "PATCH",
        body: post
      }),
      invalidatesTags: (result, error, arg) => [{type: "Post", id: arg.id}]
    }),
    addReaction: builder.mutation({
      query: ({postId, reaction}) => ({
        url: `posts/${postId}/reactions`,
        method: "POST",
        body: {reaction}
      }),
      /*
      * Reactionボタンを押した時に対象の記事だけを更新するようにする
      * こうするとパージ全体が更新されずに済むらしい
      * またこれを実行する場合はinvalidatesTagsを追加しなくても指定の記事だけが更新される
      *  */
      async onQueryStarted({postId, reaction}, {dispatch, queryFulfilled}) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getPosts', undefined, draft => {
            const post = draft.find(post => post.id === postId)
            if (post) {
              post.reactions[reaction]++;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    })
  })
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  useEditPostMutation,
  useAddReactionMutation
} = apiSlice;