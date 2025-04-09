import jwt
import json
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import logging

logger = logging.getLogger(__name__)

class JWTMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response

    def process_request(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        try:
            token = auth_header.split(' ')[1]
            jwt.decode(token, settings.SIMPLE_JWT['SIGNING_KEY'], algorithms=[settings.SIMPLE_JWT['ALGORITHM']])
        except jwt.ExpiredSignatureError:
            logger.info(f"Token expired: {auth_header[:30]}...")
            return JsonResponse({
                'error': 'Token expired',
                'code': 'token_expired',
                'detail': 'Your authentication token has expired, please refresh it'
            }, status=401)
        except jwt.InvalidTokenError:
            logger.warning(f"Invalid token: {auth_header[:30]}...")
            return JsonResponse({
                'error': 'Invalid token',
                'code': 'token_invalid',
                'detail': 'Your authentication token is invalid'
            }, status=401)
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return JsonResponse({
                'error': 'Token validation failed',
                'code': 'token_validation_error',
                'detail': 'Authentication error'
            }, status=401)
        
        return None

    def process_response(self, request, response):
        if response.status_code == 401 and hasattr(response, 'content'):
            try:
                content = json.loads(response.content)
                if content.get('code') == 'token_not_valid':
                    logger.warning(f"Token validation failed: {content.get('detail', 'No details')}")
            except:
                pass
        return response
