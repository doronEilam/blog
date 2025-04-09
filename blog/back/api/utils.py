from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    logger.error(f"Exception: {str(exc)}, Type: {type(exc)}")

    if 'token_not_valid' in str(exc):
        logger.info(f"Token validation error: {str(exc)}")
        error_detail = {
            'error': 'Authentication credentials are invalid or expired',
            'detail': 'Please log in again to obtain new credentials',
            'code': 'token_invalid'
        }
        error_str = str(exc).lower()
        if 'signature' in error_str:
            error_detail['error'] = 'Token signature verification failed'
            logger.warning(f"Token signature validation failed: {str(exc)}")
        elif 'expired' in error_str:
            error_detail['error'] = 'Token has expired'
            error_detail['code'] = 'token_expired'
            logger.info(f"Token expired: {str(exc)}")
        
        return Response(
            error_detail, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    if response is None:
        logger.error(f"Unhandled API Exception: {str(exc)}")
        return Response(
            {'error': 'Internal server error', 'detail': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    logger.debug(f"API Error Response: {response.data}")
    return response

def get_tokens_for_user(user):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def decode_token(token):
    import jwt
    from django.conf import settings

    try:
        payload = jwt.decode(
            token, 
            settings.SIMPLE_JWT['SIGNING_KEY'],
            algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.info("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None
    except Exception as e:
        logger.error(f"Token decode error: {str(e)}")
        return None
