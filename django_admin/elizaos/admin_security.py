"""
Security-enhanced admin classes that restrict delete permissions.
Only superusers can delete records.
"""

from django.contrib import admin
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.utils.html import format_html
from django.utils import timezone
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType
import json


class SecureModelAdmin(admin.ModelAdmin):
    """
    Base admin class that restricts delete permissions to superusers only.
    """
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete"""
        if request.user.is_superuser:
            return super().has_delete_permission(request, obj)
        return False
    
    def has_add_permission(self, request):
        """Check if user is in 'admins' group or is superuser"""
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name='admins').exists():
            return super().has_add_permission(request)
        return False
    
    def has_change_permission(self, request, obj=None):
        """Check if user is in 'editors' or 'admins' group or is superuser"""
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name__in=['editors', 'admins']).exists():
            return super().has_change_permission(request, obj)
        # Viewers can see but not change
        if request.user.groups.filter(name='viewers').exists():
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        return False
    
    def delete_model(self, request, obj):
        """Log deletions with extra detail"""
        if not request.user.is_superuser:
            raise PermissionDenied("Only superusers can delete records")
        
        # Log the deletion
        LogEntry.objects.log_action(
            user_id=request.user.pk,
            content_type_id=ContentType.objects.get_for_model(obj).pk,
            object_id=obj.pk,
            object_repr=str(obj),
            action_flag=DELETION,
            change_message=json.dumps({
                'deleted_at': timezone.now().isoformat(),
                'deleted_by': request.user.username,
                'ip_address': request.META.get('REMOTE_ADDR', 'unknown')
            })
        )
        
        super().delete_model(request, obj)
        
        messages.warning(
            request,
            f"⚠️ Deleted {obj._meta.verbose_name}: {str(obj)}"
        )
    
    def delete_queryset(self, request, queryset):
        """Log bulk deletions"""
        if not request.user.is_superuser:
            raise PermissionDenied("Only superusers can delete records")
        
        count = queryset.count()
        model_name = queryset.model._meta.verbose_name_plural
        
        # Log each deletion
        for obj in queryset:
            LogEntry.objects.log_action(
                user_id=request.user.pk,
                content_type_id=ContentType.objects.get_for_model(obj).pk,
                object_id=obj.pk,
                object_repr=str(obj),
                action_flag=DELETION,
                change_message=json.dumps({
                    'bulk_delete': True,
                    'deleted_at': timezone.now().isoformat(),
                    'deleted_by': request.user.username,
                })
            )
        
        super().delete_queryset(request, queryset)
        
        messages.warning(
            request,
            f"⚠️ Bulk deleted {count} {model_name}"
        )
    
    def get_actions(self, request):
        """Remove delete action for non-superusers"""
        actions = super().get_actions(request)
        if not request.user.is_superuser and 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
    
    def save_model(self, request, obj, form, change):
        """Log all saves for audit trail"""
        super().save_model(request, obj, form, change)
        
        # Log the action
        LogEntry.objects.log_action(
            user_id=request.user.pk,
            content_type_id=ContentType.objects.get_for_model(obj).pk,
            object_id=obj.pk,
            object_repr=str(obj),
            action_flag=CHANGE if change else ADDITION,
            change_message=json.dumps({
                'modified_at': timezone.now().isoformat(),
                'modified_by': request.user.username,
                'ip_address': request.META.get('REMOTE_ADDR', 'unknown'),
                'changes': form.changed_data if change else 'new'
            })
        )


class ReadOnlyAdmin(SecureModelAdmin):
    """
    Admin class for complete read-only access.
    Useful for sensitive tables.
    """
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        # Allow viewing but not changing
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def get_actions(self, request):
        # Remove all actions
        return {}


class AuditLogAdmin(admin.ModelAdmin):
    """
    Special admin for viewing audit logs.
    No one can delete audit logs, not even superusers.
    """
    
    list_display = ['action_time', 'user', 'content_type', 'object_repr', 'action_flag', 'get_change_summary']
    list_filter = ['action_time', 'user', 'content_type', 'action_flag']
    search_fields = ['object_repr', 'change_message', 'user__username']
    date_hierarchy = 'action_time'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        # View only
        return request.method in ['GET', 'HEAD', 'OPTIONS']
    
    def has_delete_permission(self, request, obj=None):
        # No one can delete logs
        return False
    
    def get_change_summary(self, obj):
        """Parse and display change message nicely"""
        try:
            data = json.loads(obj.change_message)
            if 'deleted_by' in data:
                return format_html(
                    '<span style="color: red;">Deleted by {} at {}</span>',
                    data['deleted_by'],
                    data.get('deleted_at', 'unknown')
                )
            elif 'modified_by' in data:
                changes = data.get('changes', [])
                if isinstance(changes, list) and changes:
                    return f"Modified: {', '.join(changes)}"
                return f"Modified by {data['modified_by']}"
            return obj.change_message
        except:
            return obj.change_message or '-'
    
    get_change_summary.short_description = 'Change Summary'