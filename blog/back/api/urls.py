from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .modules.articles import ArticleViewSet, ArticleListCreateView, ArticleDetailView, ArticleSearchView, ArticleCommentView
from .modules.comments import CommentViewSet, CommentListCreateView, CommentDetailView
from .modules.categories import CategoryListCreateView, CategoryDetailView
from .modules.tags import TagListCreateView, TagDetailView
from .modules.users import UserListView, UserDetailView
from .modules.admin import SiteStatisticsView, ActivityLogListView
from api.views import (get_root, RegisterView, LoginView, LogoutView, TokenRefreshViewEx, UserProfileView)
from .views import GroupListView

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'comments', CommentViewSet, basename='comment')

comment_add_reply = CommentViewSet.as_view({
    'post': 'add_reply',
})

urlpatterns = [
    path('docs/', get_root, name='api-docs'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('tags/', TagListCreateView.as_view(), name='tag-list'),
    path('tags/<int:pk>/', TagDetailView.as_view(), name='tag-detail'),
    path('articles/', ArticleListCreateView.as_view(), name='article-list'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
    path('articles/search/', ArticleSearchView.as_view(), name='article-search'),
    path('articles/<int:article_id>/comments/', ArticleCommentView.as_view(), name='article-comments'),
    path('comments/', CommentListCreateView.as_view(), name='comment-list'),
    path('comments/<int:id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('users/me/', UserProfileView.as_view(), name='current-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshViewEx.as_view(), name='token_refresh'),
    path('admin/users/', UserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', UserDetailView.as_view(), name='admin-user-detail'),
    path('admin/groups/', UserListView.as_view(), name='admin-group-list'),
    path('admin/activity/', ActivityLogListView.as_view(), name='admin-activity-log'),
    path('admin/stats/', SiteStatisticsView.as_view(), name='admin-site-stats'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('api/', include(router.urls)),
    path('', include(router.urls)),
    path('api/comments/<int:id>/add_reply/', comment_add_reply, name='comment-add-reply'),
]
