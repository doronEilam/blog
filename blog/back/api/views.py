import logging
logger = logging.getLogger(__name__)
from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from .models import UserProfile, ActivityLog
from .serializers import (
    UserProfileSerializer, RegisterSerializer,
    LoginSerializer, UserSerializer, GroupSerializer, ActivityLogSerializer
)
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login
from rest_framework.reverse import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import permission_classes as decorator_permission_classes
from .utils import get_tokens_for_user

@api_view(['GET'])
@decorator_permission_classes([permissions.AllowAny])
def get_root(request, format=None):
    endpoints = {
        'categories': reverse('category-list', request=request, format=format),
        'tags': reverse('tag-list', request=request, format=format),
        'articles': reverse('article-list', request=request, format=format),
        'comments': reverse('comment-list', request=request, format=format),
    }
    if request.accepted_renderer.format == 'html':
        return render(request, 'api_endpoints.html', {'endpoints': endpoints})
    return Response(endpoints)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "User registered successfully"})

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        if not user:
            return Response({"error": "Invalid username/password"}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        tokens = get_tokens_for_user(user)
        return Response({
            "access": tokens['access'],
            "refresh": tokens['refresh'],
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_staff,
            "is_superuser": user.is_superuser,
            "permissions": list(user.get_all_permissions()),
            "groups": list(user.groups.values('id', 'name')),
        })

class TokenRefreshViewEx(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            return Response({"error": "Failed to refresh token", "detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                logger.error(f"Failed to blacklist token: {str(e)}")
                return Response({"error": "Failed to logout", "detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class IsCommentAuthorOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        if hasattr(request.user, 'profile'):
            profile = request.user.profile
            data['profile'] = {
                'bio': profile.bio,
                'user_type': profile.user_type,
                'has_profile_pic': bool(profile.profile_pic)
            }
        return Response(data)

class GroupListView(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.select_related('user').all().order_by('-timestamp')[:20]
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAdminUser]

class UpdateUserView(APIView):
    def patch(self, request, pk):
        try:
            user = get_object_or_404(User, pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to update user: {str(e)}")
            return Response({"error": "Failed to update user", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
