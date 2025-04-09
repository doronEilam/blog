from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from back.api.modules import TokenRefreshViewEx

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshViewEx.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),
]
