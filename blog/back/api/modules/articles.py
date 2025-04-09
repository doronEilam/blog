from venv import logger
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from api.models import Article, Comment
from api.serializers import ArticleSerializer, CommentSerializer
from api.permissions import IsAuthorOrReadOnly
from django.contrib.auth.models import User
from rest_framework import serializers

class ArticleListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.select_related('author').prefetch_related('categories', 'tags').all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_staff and 'author' in self.request.data:
            author = User.objects.get(pk=self.request.data['author'])
            serializer.save(author=author)
        else:
            serializer.save(author=self.request.user)

class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthorOrReadOnly]

class ArticleSearchView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Article.objects.all()
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(categories__name__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct()
        return queryset

class ArticleCommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        article_id = self.kwargs['article_id']
        return Comment.objects.filter(article_id=article_id, parent__isnull=True)

    def perform_create(self, serializer):
        article_id = self.kwargs['article_id']
        article = get_object_or_404(Article, pk=article_id)
        serializer.save(author=self.request.user, article=article)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('author').prefetch_related('categories', 'tags').all()
    serializer_class = ArticleSerializer
    # Apply IsAuthorOrReadOnly for standard operations, allow admins full access
    permission_classes = [IsAuthorOrReadOnly | IsAdminUser] 

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        Admins can do anything. Authors can modify/delete their own articles.
        Read is allowed for anyone (handled by IsAuthorOrReadOnly).
        """
        if self.request.user and self.request.user.is_staff:
            return [IsAdminUser()] # Admins bypass other checks
        return [IsAuthorOrReadOnly()] # Default check for non-admins

    def get_queryset(self):
        try:
            return super().get_queryset()
        except Exception as e:
            logger.error(f"Error in ArticleViewSet.get_queryset: {str(e)}")
            return Article.objects.none()

    def perform_create(self, serializer):
        if self.request.user.is_staff and 'author' in self.request.data:
            try:
                author = User.objects.get(pk=self.request.data['author'])
                serializer.save(author=author)
            except User.DoesNotExist:
                raise serializers.ValidationError("Author not found.")
        else:
            serializer.save(author=self.request.user)
