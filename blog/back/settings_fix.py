"""
קובץ זה נועד לבדוק ולהתאים את הגדרות REST Framework בקובץ settings.py.
מטרתו לוודא שהגדרות ההרשאות אינן מגבילות מדי, במיוחד במהלך פיתוח או בדיקות.

שימוש:
- הרץ קובץ זה כדי לבדוק את ההגדרות הנוכחיות של REST Framework.
- אם נמצאות הגדרות מגבילות (כגון IsAuthenticated), הקובץ ימליץ על שינויים.
- השתמש בקובץ זה רק בעת הצורך, במיוחד אם יש בעיות גישה ל-API.

אזהרה:
- קובץ זה אינו מבצע שינויים אוטומטיים בקובץ settings.py. הוא מספק המלצות בלבד.
- ודא שאתה מבצע גיבוי של קובץ settings.py לפני ביצוע שינויים ידניים.
"""

import os
import django
from django.conf import settings

# הגדרת Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "content_management_system.settings")
django.setup()

def fix_permissions_settings():
    """
    פונקציה זו בודקת את הגדרות REST Framework וממליצה על שינויים אם יש הגדרות מגבילות.
    """
    print("בודק הגדרות REST Framework...\n")
    
    try:
        # קבלת הגדרות REST Framework מתוך settings.py
        rest_settings = settings.REST_FRAMEWORK
        print("הגדרות REST Framework נוכחיות:")
        for key, value in rest_settings.items():
            print(f"  - {key}: {value}")
        
        # בדיקה אם DEFAULT_PERMISSION_CLASSES מוגדר
        if 'DEFAULT_PERMISSION_CLASSES' in rest_settings:
            permissions = rest_settings['DEFAULT_PERMISSION_CLASSES']
            # בדיקה אם יש הרשאות מגבילות כמו IsAuthenticated
            if any('IsAuthenticated' in str(p) for p in permissions):
                print("\n⚠️ נמצאה הגדרת הרשאות מגבילה!")
                print("יש לשנות את DEFAULT_PERMISSION_CLASSES ל:")
                print("""
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
""")
            else:
                print("\n✓ ההגדרות נראות תקינות.")
        else:
            print("\n✓ לא נמצאו הגדרות הרשאה מגבילות.")
            
    except Exception as e:
        print(f"שגיאה: {e}")
    
    print("\nודא שהגדרות ה-REST Framework שלך מעודכנות בהתאם לצרכים שלך.")

if __name__ == "__main__":
    # הרצת הפונקציה לבדיקה
    fix_permissions_settings()
