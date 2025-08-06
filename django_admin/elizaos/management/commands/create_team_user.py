"""
Create team user with email and temporary password
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string


class Command(BaseCommand):
    help = 'Create a team user with email and temporary password'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email address')
        parser.add_argument('--username', type=str, help='Username (defaults to email prefix)')
        parser.add_argument('--first-name', type=str, help='First name')
        parser.add_argument('--last-name', type=str, help='Last name')
        parser.add_argument('--staff', action='store_true', help='Give staff access')

    def handle(self, *args, **options):
        email = options['email']
        username = options.get('username') or email.split('@')[0]
        
        # Check if user exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User {username} already exists'))
            return
        
        # Generate temporary password
        temp_password = get_random_string(12)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=temp_password,
            first_name=options.get('first_name', ''),
            last_name=options.get('last_name', ''),
        )
        
        # Set staff status if requested
        if options.get('staff'):
            user.is_staff = True
            user.save()
        
        # Note: User will need to change password via admin interface
        
        self.stdout.write(self.style.SUCCESS(
            f'\nUser created successfully!\n'
            f'Username: {username}\n'
            f'Email: {email}\n'
            f'Temporary Password: {temp_password}\n'
            f'Staff Access: {user.is_staff}\n'
            f'\nSend this password to the user securely.'
        ))