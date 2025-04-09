import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageComments from "./pages/ManageComments";
import AddArticle from "./pages/Articles/AddArticle";
import ManageArticles from "./pages/Articles/ManageArticles";
import EditArticle from "./pages/Articles/EditArticle";
import EditUser from "./pages/EditUser";
import ManageTags from "./pages/ManageTags";
import ManageCategories from "./pages/ManageCategories";
import EditorRouter from "./components/ProtectedRoute";
import CommentPage from "./pages/CommentPage";
import ArticlePage from "./pages/Articles/ArticlePage";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        <Route path="/:commentId" element={<CommentPage />} />
        <Route path="/articles/:articleId" element={<ArticlePage />} />
        <Route path="*" element={<div>Page not found</div>} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/edit/:userId" element={<EditUser />} />
          <Route path="/admin/comments" element={<ManageComments />} />
          <Route path="/admin/articles" element={<ManageArticles />} />
          <Route path="/admin/articles/edit/:id" element={<EditArticle />} />
          <Route path="/admin/tags" element={<ManageTags />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
        </Route>

        {/* Editor Routes */}
        <Route element={<EditorRouter />}>
          <Route path="/editor/add" element={<AddArticle />} />
          <Route path="/editor/articles/edit/:id" element={<EditArticle />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
