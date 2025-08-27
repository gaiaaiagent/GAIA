from django import template
import json

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Get an item from a dictionary."""
    return dictionary.get(key)

@register.filter
def smart_content(content):
    """Extract readable content from memory content object."""
    if isinstance(content, str):
        return content
    
    if isinstance(content, dict):
        # Try different content fields in order of preference
        if 'text' in content and content['text']:
            return content['text']
        elif 'thought' in content and content['thought']:
            return content['thought']
        elif 'error' in content and content['error']:
            return f"Error: {content['error']}"
        elif 'type' in content:
            content_type = content['type']
            if content_type == 'action_result' and 'actionName' in content:
                return f"Action: {content['actionName']} - {content.get('thought', 'No details')}"
            else:
                return f"Type: {content_type}"
        else:
            # Fallback to first non-empty string value
            for key, value in content.items():
                if isinstance(value, str) and value.strip() and len(value) < 200:
                    return f"{key}: {value}"
    
    return str(content)