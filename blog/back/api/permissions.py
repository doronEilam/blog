from rest_framework import permissions
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            logger.debug(f"READ access granted for {request.user} on {obj}")
            return True

        return request.user and request.user.is_authenticated and obj.author == request.user

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            logger.debug(f"READ permission granted at view level for {request.user}")
            return True
        return request.user and request.user.is_authenticated

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsBlogUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

class IsCommentAuthorOrArticleAuthorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False

        if obj.author.id == request.user.id:
            print("  - Permission granted: User is comment author")
            return True

        try:
            if hasattr(obj, 'article') and obj.article and obj.article.author:
                if obj.article.author.id == request.user.id:
                    print("  - Permission granted: User is article author")
                    return True
        except Exception as e:
            print(f"  - Error checking article author: {str(e)}")

        if request.user.is_staff:
            print("  - Permission granted: User is admin")
            return True
            
        print("  - Permission denied: No valid permission")
        return False

class DebugPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user_status = "Anonymous" if request.user.is_anonymous else f"User: {request.user.username}"
        method = request.method
        path = request.path
        
        logger.info(f"DEBUG PERMISSION: {user_status} | Method: {method} | Path: {path}")
        
        if request.method in permissions.SAFE_METHODS:
            logger.info(f"READ permission granted - returning True")
            return True
        
        is_authenticated = request.user and request.user.is_authenticated
        logger.info(f"WRITE permission check - authenticated: {is_authenticated}")
        return is_authenticated
    
    def has_object_permission(self, request, view, obj):
        user_status = "Anonymous" if request.user.is_anonymous else f"User: {request.user.username}"
        
        logger.info(f"DEBUG OBJECT PERMISSION: {user_status} | Object: {obj}")
        
        if request.method in permissions.SAFE_METHODS:
            logger.info(f"READ object permission granted - returning True")
            return True
        
        is_author = hasattr(obj, 'author') and obj.author == request.user
        logger.info(f"WRITE object permission check - is author: {is_author}")
        return is_author

class IsCommentAuthorOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of a comment or admins to edit/delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the comment or an admin.
        return obj.author == request.user or request.user.is_staff