from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from api.models import Comment
from api.serializers import CommentSerializer
from api.permissions import IsCommentAuthorOrAdminOrReadOnly
from rest_framework.generics import RetrieveUpdateDestroyAPIView

class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsCommentAuthorOrAdminOrReadOnly]
    lookup_field = 'id'

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    lookup_field = 'id'

    @action(detail=True, methods=['post'])
    def add_reply(self, request, id=None):  # Changed pk to id to match lookup_field
        parent_comment = self.get_object()  # This method uses the lookup_field ('id')

        # Create context with the parent comment
        context = self.get_serializer_context()
        serializer = self.get_serializer(data=request.data, context=context)

        print("Parent comment:", parent_comment)  # בדוק את התגובה האב
        print("Request data:", request.data)  # בדוק את הנתונים שנשלחים
        # בדוק את ההקשר שנוצר
        print("Serializer context:", self.get_serializer_context())

        serializer = self.get_serializer(
            data=request.data, context=self.get_serializer_context())
        if serializer.is_valid():
            try:
                serializer.save(
                    author=request.user,
                    article=parent_comment.article,
                    parent=parent_comment
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error during reply creation:", str(e))
                return Response({"error": "Failed to add reply", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # בדוק את השגיאות שמוחזרות מה-serializer
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_permissions(self):
        if self.action in ['destroy', 'update', 'partial_update']:
            return [IsCommentAuthorOrAdminOrReadOnly()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        try:
            print("Request data:", self.request.data)  # בדוק את הנתונים שנשלחים לשרת
            serializer.save(author=self.request.user)
        except Exception as e:
            print("Error during comment creation:", str(e))
            raise

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        comment = self.get_object()
        replies = Comment.objects.filter(parent=comment)

        # Pass context with depth 0 to start fresh nesting count
        context = self.get_serializer_context()
        context['depth'] = 0

        serializer = self.get_serializer(replies, many=True, context=context)
        return Response(serializer.data)


