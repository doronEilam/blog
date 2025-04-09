from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from api.models import User, Article, Comment

class SiteStatisticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        stats = {
            'total_users': User.objects.count(),
            'total_articles': Article.objects.count(),
            'total_comments': Comment.objects.count(),
        }
        return Response(stats)

class ActivityLogListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        # This is a placeholder for the actual activity log retrieval logic
        # You would typically query your database or log files to get this data
        activity_logs = [
            {'user': 'admin', 'action': 'created article', 'timestamp': '2023-10-01 12:00:00'},
            {'user': 'user1', 'action': 'commented on article', 'timestamp': '2023-10-02 14:30:00'},
        ]
        return Response(activity_logs)