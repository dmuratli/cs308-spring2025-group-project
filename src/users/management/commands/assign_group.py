from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Assigns a user to a specified group'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to update')
        parser.add_argument('group', type=str, help='The group (role) to assign to the user')

    def handle(self, *args, **options):
        username = options['username']
        group_name = options['group']
        User = get_user_model()

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User '{username}' does not exist."))
            return

        group, created = Group.objects.get_or_create(name=group_name)

        user.groups.add(group)
        self.stdout.write(self.style.SUCCESS(f"User '{username}' has been assigned to group '{group_name}'"))