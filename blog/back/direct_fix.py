"""
פתרון ישיר לתיקון שדה image החסר וסנכרון המיגרציות
"""
import os
import sys
import django

# הגדרת Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "content_management_system.settings")
django.setup()

from django.db import connection

def direct_fix():
    print("=== פתרון מהיר לתיקון שדה image ===")

    with connection.cursor() as cursor:
        # ראשית, נבדוק אם יש טבלה api_article
        cursor.execute("SELECT to_regclass('public.api_article');")
        if not cursor.fetchone()[0]:
            print("✗ טבלת api_article לא קיימת!")
            return

        print("✓ טבלת api_article קיימת.")

        # נבדוק אילו עמודות קיימות בטבלה
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'api_article';")
        columns = [col[0] for col in cursor.fetchall()]
        print(f"עמודות קיימות: {', '.join(columns)}")

        # נבדוק אם עמודת image קיימת
        if 'image' not in columns:
            print("✗ עמודת image חסרה - מוסיף אותה...")
            try:
                cursor.execute("ALTER TABLE api_article ADD COLUMN image VARCHAR(100) NULL;")
                print("✓ נוספה עמודת image")
            except Exception as e:
                print(f"✗ שגיאה בהוספת עמודת image: {e}")
                return
        else:
            print("✓ עמודת image כבר קיימת")

        # עדכון טבלת django_migrations
        print("\nמעדכן את טבלת django_migrations...")
        try:
            cursor.execute("""
                SELECT * FROM django_migrations 
                WHERE app = 'api' AND name = '0001_initial';
            """)
            if cursor.fetchone():
                print("✓ מיגרציה 0001_initial כבר רשומה")
            else:
                cursor.execute("""
                    INSERT INTO django_migrations (app, name, applied)
                    VALUES ('api', '0001_initial', NOW());
                """)
                print("✓ הוספה רשומה עבור 0001_initial")
        except Exception as e:
            print(f"✗ שגיאה בעדכון טבלת migrations: {e}")

    print("\n=== סיום ===")
    print("נא להפעיל מחדש את השרת: python manage.py runserver")

if __name__ == "__main__":
    direct_fix()
