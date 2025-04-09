from rest_framework import serializers
from .models import Category, Tag, Article, Comment, UserProfile, ActivityLog
from django.contrib.auth.models import User, Group
from rest_framework.fields import CurrentUserDefault
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all()
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'groups']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'profile_pic', 'user_type']
        read_only_fields = ['id', 'user']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except TokenError as e:
            raise serializers.ValidationError({
                'refresh': ['Token is invalid or expired'],
                'detail': str(e),
                'code': 'token_not_valid'
            })

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, data):
        if not data.get('username') or not data.get('password'):
            raise serializers.ValidationError('Both username and password required.', code='authorization')
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source='author.username', read_only=True)
    is_author = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField(read_only=True)
    reply_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_name', 'article', 'parent', 'content', 'created_at', 'updated_at',
                  'replies', 'reply_count', 'is_author', 'is_admin', 'can_delete']
        # Make 'author' read-only as it's set by the view.
        # article is required by model, parent is optional (null=True, blank=True)
        # SerializerMethodFields are implicitly read-only.
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
        # Note: SerializerMethodFields (author_name, replies, etc.) are automatically read-only

    # Removed custom __init__ - rely on default ModelSerializer behavior + view providing data

    def get_is_author(self, obj):
        # Ensure request exists in context, handle potential None user
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return user.is_authenticated and obj.author.id == user.id

    def get_is_admin(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user and user.is_staff

    def get_can_delete(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.author.id == user.id or user.is_staff

    def get_replies(self, obj):
        depth = self.context.get('depth', 0)
        if depth > 2:
            return []
        serializer = CommentSerializer(Comment.objects.filter(parent=obj), many=True, context={**self.context, 'depth': depth + 1})
        return serializer.data

    def get_reply_count(self, obj):
        return Comment.objects.filter(parent=obj).count()

    def validate(self, data):
        parent = data.get('parent')
        article = data.get('article')
        if parent and article and parent.article != article:
            raise serializers.ValidationError("Parent comment must belong to the same article")
        if parent and not article:
            data['article'] = parent.article
        return data

class ArticleSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='categories', many=True, read_only=True)
    tag_details = TagSerializer(source='tags', many=True, read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'author', 'author_name',
            'categories', 'tags', 'category_details', 'tag_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'author_name', 'created_at', 'updated_at']

class ActivityLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_username', 'action_type', 'action_display', 'timestamp', 'details']
        read_only_fields = ['id', 'user_username', 'action_display', 'timestamp']
