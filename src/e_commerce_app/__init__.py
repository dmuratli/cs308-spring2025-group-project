from .celery import app as celery_app
from django.db.backends.signals import connection_created
from django.dispatch import receiver

__all__ = ["celery_app"]

@receiver(connection_created)
def activate_sqlite_wal(sender, connection, **kwargs):
    # only for SQLite backends
    if connection.vendor == "sqlite":
        cursor = connection.cursor()
        # switch to WAL (persists on the file)
        cursor.execute("PRAGMA journal_mode=WAL;")
        # relax fsync (safe under WAL)
        cursor.execute("PRAGMA synchronous=NORMAL;")