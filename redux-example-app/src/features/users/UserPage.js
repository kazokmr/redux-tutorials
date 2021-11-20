import React, {useMemo} from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {createSelector} from "@reduxjs/toolkit";
import {selectUserById} from "./usersSlice";
import {useGetPostsQuery} from "../api/apiSlice";

export const UserPage = ({match}) => {
  const {userId} = match.params;

  const user = useSelector(state => selectUserById(state, userId));

  // 抽出した結果を正しくメモ化するためにページ専用のセレクターを生成する
  const selectPostsForUser = useMemo(() => {
    return createSelector(
      res => res.data,
      (res, userId) => userId,
      (data, userId) => data.filter(post => post.user === userId)
    );
  }, []);

  // Postsクエリで検索される全記事から特定ユーザーが投稿した記事データだけを抽出する
  const {postsForUser} = useGetPostsQuery(undefined, {
    selectFromResult: result => ({
      ...result,
      postsForUser: selectPostsForUser(result, userId)
    })
  });

  const postTitles = postsForUser.map(post => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ));

  return (
    <section>
      <h2>{user.name}</h2>
      <ul>{postTitles}</ul>
    </section>
  );
};
