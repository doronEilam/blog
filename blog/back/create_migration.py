# Run this file with: python manage.py shell < create_migration.py
from django.db.migrations.writer import MigrationWriter
from django.db import migrations, models

# Create a migration operation
operations = [
    migrations.AddField(
        model_name='article',
        name='summary',
        field=models.TextField(blank=True, null=True),
    ),
]

# Define the migration
migration = type('Migration', (migrations.Migration,), {
    "dependencies": [('api', '0001_initial')],  # Adjust as needed
    "operations": operations,
})

# Write the migration
writer = MigrationWriter(migration)
with open('api/migrations/0002_add_article_summary.py', 'w') as fh:
    fh.write(writer.as_string())

print("Migration file created at api/migrations/0002_add_article_summary.py")
