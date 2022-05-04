import React from "react";
import {BrowserRouter, Navigate, Route, Routes,} from "react-router-dom";
import {Navbar} from "./app/Navbar";
import {PostsList} from "./features/posts/PostsList";
import {AddPostForm} from "./features/posts/AddPostForm";
import {SinglePostPage} from "./features/posts/SinglePostPage";
import {EditPostForm} from "./features/posts/EditPostForm";
import {UsersList} from "./features/users/UsersList";
import {UserPage} from "./features/users/UserPage";
import {NotificationList} from "./features/notifications/NotificationList";

function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            render={() => (
              <React.Fragment>
                <AddPostForm/>
                <PostsList/>
              </React.Fragment>
            )}
          />
          <Route exact path="/posts/:postId" element={<SinglePostPage/>}/>
          <Route exact path="/editPost/:postId" element={<EditPostForm/>}/>
          <Route exact path="/users" element={<UsersList/>}/>
          <Route exact path="/users/:userId" element={<UserPage/>}/>
          <Route exact path="/notifications" element={<NotificationList/>}/>
        </Routes>
        <Navigate to="/"/>
      </div>
    </BrowserRouter>
  );
}

export default App
