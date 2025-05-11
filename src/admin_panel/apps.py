from django.apps import AppConfig
from django.db.models.signals import post_migrate

class AdminPanelConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_panel'

    def ready(self):
        from .models import Genre

        def create_defaults(sender, **kwargs):
            default_names = [
                "Fiction",
                "Non-Fiction",
                "Mystery",
                "Sci-Fi",
                "Fantasy",
                "Biography",
            ]
            for name in default_names:
                Genre.objects.get_or_create(name=name)

        post_migrate.connect(create_defaults, sender=self)