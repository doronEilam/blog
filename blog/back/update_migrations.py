"""
סקריפט ליצירת מיגרציה חדשה שתוסיף את שדה image במידה וחסר
"""
import os
import django

# הגדרת Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "content_management_system.settings")
django.setup()

from django.core.management import call_command

def create_migration():
    print("יוצר מיגרציה חדשה להוספת שדה image...")
    
    try:
        # יצירת מיגרציה חדשה
        call_command('makemigrations', 'api', '--name', 'add_image_field_if_missing')
        print("✓ נוצרה מיגרציה חדשה!")
        
        # הרצת המיגרציה עם fake אם כבר קיים שדה
        print("מריץ מיגרציה עם אופציית fake...")
        call_command('migrate', 'api')
        print("✓ המיגרציה הורצה בהצלחה!")
        
    except Exception as e:
        print(f"✗ שגיאה: {e}")
        print("מנסה להריץ עם fake-initial...")
        try:
            call_command('migrate', 'api', '--fake-initial')
            print("✓ פעולה הסתיימה בהצלחה!")
        except Exception as e2:
            print(f"✗ גם הניסיון השני נכשל: {e2}")

if __name__ == "__main__":
    create_migration()
