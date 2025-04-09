import os
import django
import sys

# הגדרת Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "content_management_system.settings")
django.setup()

from django.db import connection

def fix_schema():
    """
    סקריפט אוטומטי לתיקון בעיות סכמה בדאטאבייס
    """
    print("=== בודק ומתקן את סכמת הדאטאבייס ===\n")

    with connection.cursor() as cursor:
        # בדיקה אם הטבלה api_article קיימת
        print("בודק אם הטבלה 'api_article' קיימת...")
        cursor.execute("SELECT to_regclass('public.api_article');")
        table_exists = cursor.fetchone()[0]

        if not table_exists:
            print("✗ הטבלה 'api_article' לא קיימת! לא ניתן להמשיך בתיקון.")
            return
        print("✓ הטבלה 'api_article' קיימת.\n")

        # בדיקה האם שדה summary קיים בטבלה
        print("בודק אם השדה 'summary' קיים בטבלה 'api_article'...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'api_article' 
            AND column_name = 'summary';
        """)
        result = cursor.fetchone()

        if result:
            print("✗ נמצא שדה 'summary' בטבלה 'api_article'. מנסה להסיר אותו...")
            try:
                # ניסיון להסיר את העמודה
                cursor.execute("ALTER TABLE api_article DROP COLUMN summary;")
                print("✓ השדה 'summary' הוסר בהצלחה.")
            except Exception as e:
                print(f"✗ שגיאה בהסרת השדה: {e}")
                print("מנסה גישה אלטרנטיבית לשינוי שם השדה...")
                try:
                    # גישה אלטרנטיבית - שינוי שם העמודה למשהו זמני
                    cursor.execute("ALTER TABLE api_article RENAME COLUMN summary TO _deleted_summary;")
                    print("✓ שם השדה שונה ל-_deleted_summary. תוכל למחוק אותו מאוחר יותר.")
                except Exception as e:
                    print(f"✗ גם הגישה האלטרנטיבית נכשלה: {e}")
                    print("⚠️ לא ניתן להסיר או לשנות את השדה 'summary'. יש לבדוק את הבעיה באופן ידני.")
        else:
            print("✓ השדה 'summary' לא קיים בטבלה 'api_article'. לא נדרש תיקון.\n")

        print("=== התיקון הסתיים ===\n")

if __name__ == "__main__":
    fix_schema()
    # כפעולה אחרונה, ננסה לסמן מיגרציות כמבוצעות
    try:
        from django.core.management import call_command
        print("\nמסמן מיגרציות כמבוצעות...")
        call_command('migrate', 'api', '--fake')
        print("✓ מיגרציות סומנו בהצלחה.")
    except Exception as e:
        print(f"✗ שגיאה בסימון מיגרציות: {e}")
