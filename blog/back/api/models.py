from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
import logging
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)

USER_TYPES = (
    ('regular', 'Regular User'),
    ('editor', 'Editor'),
    ('admin', 'Administrator'),
)

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Article(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    categories = models.ManyToManyField(Category, related_name='articles')
    tags = models.ManyToManyField(Tag, related_name='articles', blank=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.article.title}"

    def delete(self, *args, **kwargs):
        try:
            logger.info(f"Deleting comment ID: {self.id} by user: {self.author.username}")
            super().delete(*args, **kwargs)
            logger.info(f"Comment ID: {self.id} deleted successfully")
        except Exception as e:
            logger.error(f"Error deleting comment ID: {self.id}: {str(e)}")
            raise

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='regular')
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True) 
    
    def __str__(self):
        return f"{self.user.username}'s profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'profile'):
        UserProfile.objects.create(
            user=instance, 
            user_type='regular', 
            bio=""
        )

@receiver(pre_delete, sender=Comment)
def log_comment_deletion(sender, instance, **kwargs):
    try:
        article_info = f"{instance.article.title} (ID: {instance.article.id})" if instance.article else "No article"
        author_info = f"{instance.author.username} (ID: {instance.author.id})" if instance.author else "No author"
        logger.info(f"PRE-DELETE COMMENT SIGNAL - Comment ID: {instance.id}")
        logger.info(f"  - Comment content: {instance.content[:50]}...")
        logger.info(f"  - Article: {article_info}")
        logger.info(f"  - Author: {author_info}")
    except Exception as e:
        logger.error(f"Error in pre_delete signal for comment {instance.id}: {str(e)}")

class ActivityLog(models.Model):
    ACTION_TYPES = [
        ('USER_REGISTERED', 'User Registered'),
        ('USER_UPDATED', 'User Updated'),
        ('USER_DELETED', 'User Deleted'),
        ('ARTICLE_CREATED', 'Article Created'),
        ('ARTICLE_UPDATED', 'Article Updated'),
        ('ARTICLE_DELETED', 'Article Deleted'),
        ('COMMENT_CREATED', 'Comment Created'),
        ('COMMENT_UPDATED', 'Comment Updated'),
        ('COMMENT_DELETED', 'Comment Deleted'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.TextField(blank=True, null=True) 

    def __str__(self):
        user_str = self.user.username if self.user else "System"
        return f"{user_str} - {self.get_action_type_display()} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

def log_activity(user, action_type, details=""):
    try:
        ActivityLog.objects.create(
            user=user, 
            action_type=action_type, 
            details=details
        )
    except Exception as e:
        logger.error(f"Failed to create activity log for action {action_type}: {str(e)}")

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def log_user_save(sender, instance, created, **kwargs):

    acting_user = instance 
    
    if created:
        log_activity(acting_user, 'USER_REGISTERED', f"User '{instance.username}' (ID: {instance.id}) registered.")
    else:
        log_activity(acting_user, 'USER_UPDATED', f"User '{instance.username}' (ID: {instance.id}) updated.")

@receiver(pre_delete, sender=settings.AUTH_USER_MODEL)
def log_user_delete(sender, instance, **kwargs):
    log_activity(None, 'USER_DELETED', f"User '{instance.username}' (ID: {instance.id}) deleted.")

@receiver(post_save, sender=Article)
def log_article_save(sender, instance, created, **kwargs):
    user = instance.author
    action = 'ARTICLE_CREATED' if created else 'ARTICLE_UPDATED'
    details = f"Article '{instance.title}' (ID: {instance.id}) by {user.username}"
    log_activity(user, action, details)

@receiver(pre_delete, sender=Article)
def log_article_delete(sender, instance, **kwargs):
    user = instance.author 
    details = f"Article '{instance.title}' (ID: {instance.id}) by {user.username}"
    log_activity(user, 'ARTICLE_DELETED', details)

@receiver(post_save, sender=Comment)
def log_comment_save(sender, instance, created, **kwargs):
    user = instance.author
    action = 'COMMENT_CREATED' if created else 'COMMENT_UPDATED'
    details = f"Comment (ID: {instance.id}) on article '{instance.article.title}' by {user.username}"
    log_activity(user, action, details)

@receiver(pre_delete, sender=Comment)
def log_comment_deletion_activity(sender, instance, **kwargs):
    try:
        article_info = f"{instance.article.title} (ID: {instance.article.id})" if instance.article else "No article"
        author_info = f"{instance.author.username} (ID: {instance.author.id})" if instance.author else "No author"
        
        logger.info(f"PRE-DELETE COMMENT SIGNAL - Comment ID: {instance.id}")
        logger.info(f"  - Comment content: {instance.content[:50]}...")
        logger.info(f"  - Article: {article_info}")
        logger.info(f"  - Author: {author_info}")
    except Exception as e:
        logger.error(f"Error in pre_delete signal (logger part) for comment {instance.id}: {str(e)}")

    user = instance.author
    details = f"Comment (ID: {instance.id}) on article '{instance.article.title}' by {user.username}"
    log_activity(user, 'COMMENT_DELETED', details)
