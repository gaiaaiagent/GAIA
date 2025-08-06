"""
Management command to set up proper permissions for team access.
Only superusers can delete, others can view and edit.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from django.db import transaction


class Command(BaseCommand):
    help = 'Set up permission groups for safe team access'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all permissions to defaults',
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create groups
            viewer_group, _ = Group.objects.get_or_create(name='viewers')
            editor_group, _ = Group.objects.get_or_create(name='editors')
            admin_group, _ = Group.objects.get_or_create(name='admins')
            
            self.stdout.write("Created/verified groups: viewers, editors, admins")
            
            if options['reset']:
                viewer_group.permissions.clear()
                editor_group.permissions.clear()
                admin_group.permissions.clear()
                self.stdout.write("Cleared existing permissions")
            
            # Get all permissions
            all_permissions = Permission.objects.all()
            
            # Categorize permissions
            view_perms = []
            change_perms = []
            add_perms = []
            delete_perms = []
            
            for perm in all_permissions:
                if perm.codename.startswith('view_'):
                    view_perms.append(perm)
                elif perm.codename.startswith('change_'):
                    change_perms.append(perm)
                elif perm.codename.startswith('add_'):
                    add_perms.append(perm)
                elif perm.codename.startswith('delete_'):
                    delete_perms.append(perm)
            
            # Assign permissions to groups
            # Viewers: Can only view
            viewer_group.permissions.set(view_perms)
            self.stdout.write(f"Viewers: {len(view_perms)} view permissions")
            
            # Editors: Can view and change, but NOT delete
            editor_group.permissions.set(view_perms + change_perms)
            self.stdout.write(f"Editors: {len(view_perms)} view + {len(change_perms)} change permissions")
            
            # Admins: Can view, change, add, but NOT delete (only superusers can delete)
            admin_group.permissions.set(view_perms + change_perms + add_perms)
            self.stdout.write(f"Admins: {len(view_perms)} view + {len(change_perms)} change + {len(add_perms)} add permissions")
            
            # Note: Delete permissions are reserved for superusers only
            self.stdout.write(
                self.style.WARNING(
                    f"\n⚠️  Delete permissions ({len(delete_perms)} total) are reserved for superusers only"
                )
            )
            
            # Create example users if in development
            if options.get('verbosity', 1) > 1:
                self.stdout.write("\nExample user setup commands:")
                self.stdout.write("python manage.py shell")
                self.stdout.write(">>> from django.contrib.auth.models import User, Group")
                self.stdout.write(">>> user = User.objects.get(username='someuser')")
                self.stdout.write(">>> user.groups.add(Group.objects.get(name='editors'))")
            
            # Summary
            self.stdout.write(
                self.style.SUCCESS(
                    "\n✅ Permission groups configured successfully!\n"
                    "Group hierarchy:\n"
                    "  - viewers: Read-only access\n"
                    "  - editors: Can edit existing records (no delete)\n"
                    "  - admins: Can add new records (no delete)\n"
                    "  - superusers: Full access including delete\n"
                )
            )