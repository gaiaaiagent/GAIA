"""
Views for ElizaOS monitoring and milestone validation
"""
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import connection
from django.core.paginator import Paginator
from elizaos.models import Agent, Memory, Room, CentralMessage, Embedding

class DashboardView(LoginRequiredMixin, TemplateView):
    """Combined RegenAI Dashboard with all metrics and reports"""
    template_name = 'reporting/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get active agents
        context['agents'] = Agent.objects.all()
        context['agent_count'] = context['agents'].count()
        
        # Get current agent IDs as strings for filtering (calculated once)
        current_agent_ids = [str(agent.id) for agent in context['agents']]
        
        # Knowledge metrics: Count document vs message embeddings
        with connection.cursor() as cursor:
            # Count embeddings from knowledge documents (non-message memories)
            cursor.execute("""
                SELECT COUNT(e.id) 
                FROM embeddings e 
                JOIN memories m ON e.memory_id = m.id 
                WHERE m.type != 'messages'
            """)
            document_embeddings = cursor.fetchone()[0]
            
            # Count embeddings from messages  
            cursor.execute("""
                SELECT COUNT(e.id) 
                FROM embeddings e 
                JOIN memories m ON e.memory_id = m.id 
                WHERE m.type = 'messages'
            """)
            message_embeddings = cursor.fetchone()[0]
        
        context['total_embeddings'] = Embedding.objects.count()
        context['document_embeddings'] = document_embeddings
        context['message_embeddings'] = message_embeddings
        
        # GROUND TRUTH: CentralMessage contains all actual interactions
        # - Agent responses (20 from current agents)  
        # - User messages (10 from users)
        # - Total: 30 actual interactions between agents and users
        
        context['total_interactions'] = CentralMessage.objects.count()  # All actual interactions: 30
        
        # Get interactions in last 24 hours (from actual interactions)
        yesterday = timezone.now() - timedelta(days=1)
        context['recent_interactions'] = CentralMessage.objects.filter(
            created_at__gte=yesterday
        ).count()
        
        # Count unique users (excluding agents)
        all_unique_users = CentralMessage.objects.exclude(
            author_id__in=current_agent_ids
        ).values('author_id').distinct().count()
        
        unique_users_24h = CentralMessage.objects.filter(
            created_at__gte=yesterday
        ).exclude(
            author_id__in=current_agent_ids
        ).values('author_id').distinct().count()
        
        context['unique_users_total'] = all_unique_users
        context['unique_users_24h'] = unique_users_24h
        
        # Get interaction breakdown by agent with multiple time periods
        from django.db.models import Count, Q
        
        # Define time periods
        day_ago = timezone.now() - timedelta(days=1)
        week_ago = timezone.now() - timedelta(days=7)
        month_ago = timezone.now() - timedelta(days=30)
        
        # Get CentralMessage counts by agent (ground truth for actual interactions)
        # This includes both agent responses and any messages where agents are authors
        central_message_counts = CentralMessage.objects.filter(
            author_id__in=current_agent_ids
        ).values('author_id').annotate(
            total=Count('id'),
            last_24h=Count('id', filter=Q(created_at__gte=day_ago)),
            last_7d=Count('id', filter=Q(created_at__gte=week_ago)),
            last_30d=Count('id', filter=Q(created_at__gte=month_ago))
        )
        central_by_agent = {c['author_id']: c for c in central_message_counts}
        
        # Get all unique platforms first (excluding agent_response which is not a platform)
        all_platforms = Room.objects.values_list('source', flat=True).distinct()
        # Filter out None values and 'agent_response' (which is a message type, not a platform)
        platform_list = sorted([p for p in all_platforms if p and p != 'agent_response'])
        
        # Build agent stats using only CentralMessage data (ground truth)
        agent_stats = []
        for agent in context['agents']:
            # Get CentralMessage counts for this agent (convert UUID to string for lookup)
            central_data = central_by_agent.get(str(agent.id), {})
            
            # Get platform breakdown from CentralMessage for this agent
            platform_24h = {}
            platform_7d = {}
            platform_30d = {}
            platform_total = {}
            
            # Pre-calculate channel types to avoid repeated queries
            chat_channels = list(CentralMessage.objects.filter(
                source_type='client_chat'
            ).values_list('channel_id', flat=True).distinct())
            
            group_channels = list(CentralMessage.objects.filter(
                source_type='client_group_chat'
            ).values_list('channel_id', flat=True).distinct())
            
            # Calculate platform counts with channel awareness for agent responses
            for platform in platform_list:
                if platform == 'client_chat':
                    # Count agent responses in regular chat channels
                    base_query = Q(author_id=str(agent.id), source_type='client_chat') | \
                                Q(author_id=str(agent.id), source_type='agent_response', channel_id__in=chat_channels)
                    
                elif platform == 'client_group_chat':
                    # Count agent responses in group chat channels  
                    base_query = Q(author_id=str(agent.id), source_type='agent_response', channel_id__in=group_channels)
                    
                else:
                    # For other platforms, use simple source_type matching
                    base_query = Q(author_id=str(agent.id), source_type=platform)
                
                # Apply the same query logic to all time periods
                platform_24h[platform] = CentralMessage.objects.filter(
                    base_query, created_at__gte=day_ago
                ).count()
                
                platform_7d[platform] = CentralMessage.objects.filter(
                    base_query, created_at__gte=week_ago
                ).count()
                
                platform_30d[platform] = CentralMessage.objects.filter(
                    base_query, created_at__gte=month_ago
                ).count()
                
                platform_total[platform] = CentralMessage.objects.filter(
                    base_query
                ).count()
            
            agent_stats.append({
                'agent': agent,
                'last_24h': central_data.get('last_24h', 0),
                'last_7d': central_data.get('last_7d', 0),
                'last_30d': central_data.get('last_30d', 0),
                'total': central_data.get('total', 0),
                'platform_24h': platform_24h,
                'platform_7d': platform_7d,
                'platform_30d': platform_30d,
                'platform_total': platform_total,
                'direct_24h': 0,  # No direct messages in CentralMessage data
                'direct_7d': 0,
                'direct_30d': 0,
                'direct_total': 0
            })
        
        # Get user activity stats (non-agent CentralMessages)
        user_message_counts = CentralMessage.objects.exclude(
            author_id__in=current_agent_ids
        ).values('author_id').annotate(
            total=Count('id'),
            last_24h=Count('id', filter=Q(created_at__gte=day_ago)),
            last_7d=Count('id', filter=Q(created_at__gte=week_ago)),
            last_30d=Count('id', filter=Q(created_at__gte=month_ago))
        )
        
        # Build user stats for display with platform breakdown
        user_stats = []
        for user_data in user_message_counts:
            user_id = user_data['author_id']
            
            # Get platform breakdown from CentralMessage for this user
            user_platform_24h = {}
            user_platform_7d = {}
            user_platform_30d = {}
            user_platform_total = {}
            
            # Calculate platform counts from CentralMessage source_type for users
            for platform in platform_list:
                # Map platform names to CentralMessage source_types for users
                source_type_mapping = {
                    'client_chat': ['client_chat'],  # User messages only
                    'client_group_chat': ['client_group_chat'],
                    'elizaos': ['elizaos'],
                    'socketio': ['socketio']
                }
                
                source_types = source_type_mapping.get(platform, [platform])
                
                # Count CentralMessages for this user and platform
                user_platform_24h[platform] = CentralMessage.objects.filter(
                    author_id=user_id,
                    source_type__in=source_types,
                    created_at__gte=day_ago
                ).count()
                
                user_platform_7d[platform] = CentralMessage.objects.filter(
                    author_id=user_id,
                    source_type__in=source_types,
                    created_at__gte=week_ago
                ).count()
                
                user_platform_30d[platform] = CentralMessage.objects.filter(
                    author_id=user_id,
                    source_type__in=source_types,
                    created_at__gte=month_ago
                ).count()
                
                user_platform_total[platform] = CentralMessage.objects.filter(
                    author_id=user_id,
                    source_type__in=source_types
                ).count()
            
            user_stats.append({
                'user_id': user_data['author_id'],
                'user_name': f"User-{user_data['author_id'][:8]}",
                'last_24h': user_data['last_24h'],
                'last_7d': user_data['last_7d'],
                'last_30d': user_data['last_30d'],
                'total': user_data['total'],
                'platform_24h': user_platform_24h,
                'platform_7d': user_platform_7d,
                'platform_30d': user_platform_30d,
                'platform_total': user_platform_total,
                'direct_24h': 0,  # Users don't have separate direct messages
                'direct_7d': 0,
                'direct_30d': 0,
                'direct_total': 0
            })
        
        context['agent_stats'] = agent_stats
        context['user_stats'] = user_stats
        context['platform_list'] = platform_list
        
        # Calculate totals for Agent Performance table (agents only = 20 total)
        totals = {
            'total_24h': sum(stat['last_24h'] for stat in agent_stats),
            'total_7d': sum(stat['last_7d'] for stat in agent_stats), 
            'total_30d': sum(stat['last_30d'] for stat in agent_stats),
            'total_all': sum(stat['total'] for stat in agent_stats),
            'direct_24h': 0,  # No direct messages
            'direct_7d': 0,
            'direct_30d': 0,
            'direct_total': 0
        }
        
        # Platform totals for agents
        for platform in platform_list:
            totals[f'{platform}_24h'] = sum(stat['platform_24h'].get(platform, 0) for stat in agent_stats)
            totals[f'{platform}_7d'] = sum(stat['platform_7d'].get(platform, 0) for stat in agent_stats)
            totals[f'{platform}_30d'] = sum(stat['platform_30d'].get(platform, 0) for stat in agent_stats)
            totals[f'{platform}_total'] = sum(stat['platform_total'].get(platform, 0) for stat in agent_stats)
        
        context['totals'] = totals
        
        # Calculate totals for Active Users table (users only = 10 total)
        user_totals = {
            'total_24h': sum(stat['last_24h'] for stat in user_stats),
            'total_7d': sum(stat['last_7d'] for stat in user_stats), 
            'total_30d': sum(stat['last_30d'] for stat in user_stats),
            'total_all': sum(stat['total'] for stat in user_stats),
            'direct_24h': 0,  # No direct messages
            'direct_7d': 0,
            'direct_30d': 0,
            'direct_total': 0
        }
        
        # Platform totals for users
        for platform in platform_list:
            user_totals[f'{platform}_24h'] = sum(stat['platform_24h'].get(platform, 0) for stat in user_stats)
            user_totals[f'{platform}_7d'] = sum(stat['platform_7d'].get(platform, 0) for stat in user_stats)
            user_totals[f'{platform}_30d'] = sum(stat['platform_30d'].get(platform, 0) for stat in user_stats)
            user_totals[f'{platform}_total'] = sum(stat['platform_total'].get(platform, 0) for stat in user_stats)
        
        context['user_totals'] = user_totals
        
        # Simple milestone tracking without payment details
        context['milestone_progress'] = self.calculate_milestone_progress(current_agent_ids)
        
        # Get platform breakdown
        platform_stats = Room.objects.values('source').annotate(
            count=Count('id')
        ).order_by('-count')
        context['platform_stats'] = platform_stats
        
        # Get recent interactions from CentralMessage only (no duplication)
        # CentralMessage contains the actual platform interactions without internal duplicates
        # Get ALL interactions for pagination
        all_centrals = CentralMessage.objects.order_by('-created_at')
        
        # Add pagination (100 items per page)
        page_number = self.request.GET.get('page', 1)
        paginator = Paginator(all_centrals, 100)  # 100 items per page
        page_obj = paginator.get_page(page_number)
        recent_centrals = page_obj.object_list
        
        # Get agent names lookup
        agents_dict = {str(agent.id): agent.name for agent in context['agents']}
        
        # Format for display using actual database field names
        recent_interactions_list = []
        # Calculate the starting number for this page
        start_num = (page_obj.number - 1) * 100
        
        for idx, central in enumerate(recent_centrals):
            # Determine if this is from an agent or user
            is_agent = central.author_id in current_agent_ids
            
            # Get entity information (agent or user)
            if is_agent:
                entity_name = agents_dict.get(central.author_id, 'Unknown Agent')
                entity_id = central.author_id
                entity_type = 'agent'
            else:
                # For users, use the author_id as the user identifier
                entity_name = f'User-{central.author_id[:8]}'  # Use first 8 chars of user ID
                entity_id = central.author_id
                entity_type = 'user'
            
            # Map CentralMessage source_type to platform names with channel awareness
            if central.source_type == 'agent_response':
                # For agent responses, determine platform based on channel context
                # Check if this channel has group chat messages
                has_group_messages = CentralMessage.objects.filter(
                    channel_id=central.channel_id,
                    source_type='client_group_chat'
                ).exists()
                
                if has_group_messages:
                    platform = 'client_group_chat'
                else:
                    platform = 'client_chat'
            else:
                # For other message types, use direct mapping
                platform_mapping = {
                    'client_chat': 'client_chat',
                    'client_group_chat': 'client_group_chat'
                }
                platform = platform_mapping.get(central.source_type, central.source_type or 'unknown')
            
            recent_interactions_list.append({
                'created_at': central.created_at,
                'entity_name': entity_name,
                'entity_id': entity_id,
                'entity_type': entity_type,
                'room_name': f'Channel {central.channel_id[:8]}...' if central.channel_id else 'Direct',
                'room_id': central.channel_id,  # Always include for linking to Channel admin
                'platform': platform,
                'content': central.content[:200] if central.content else '',
                'interaction_number': paginator.count - start_num - idx,  # Global interaction number
                'interaction_id': central.id
            })
        
        context['recent_interactions_list'] = recent_interactions_list
        context['page_obj'] = page_obj
        context['paginator'] = paginator
        context['total_interactions_count'] = paginator.count
        
        return context
    
    def calculate_milestone_progress(self, current_agent_ids):
        """Calculate progress towards interaction and document milestones"""
        # Use CentralMessage as ground truth for all actual interactions
        total_interactions = CentralMessage.objects.count()
        
        # Count unique documents (document embeddings)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(DISTINCT m.id) 
                FROM memories m 
                WHERE m.type != 'messages'
            """)
            total_documents = cursor.fetchone()[0]
        
        milestones = {
            'interactions': {
                'phase1': {
                    'name': 'Initial Target',
                    'target': 30000,
                    'current': total_interactions,
                    'percentage': min(100, (total_interactions / 30000) * 100)
                },
                'phase2': {
                    'name': 'Scale Target',
                    'target': 100000,
                    'current': total_interactions,
                    'percentage': min(100, (total_interactions / 100000) * 100)
                }
            },
            'documents': {
                'phase1': {
                    'name': 'Initial Target',
                    'target': 15000,
                    'current': total_documents,
                    'percentage': min(100, (total_documents / 15000) * 100)
                },
                'phase2': {
                    'name': 'Scale Target',
                    'target': 15000,
                    'current': total_documents,
                    'percentage': min(100, (total_documents / 15000) * 100)
                }
            }
        }
        
        return milestones

class InteractionReportView(LoginRequiredMixin, TemplateView):
    template_name = 'reporting/interaction_report.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get date range from query params
        days = int(self.request.GET.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get daily interaction counts
        daily_stats = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            next_date = date + timedelta(days=1)
            
            memories = Memory.objects.filter(
                created_at__gte=date,
                created_at__lt=next_date
            ).count()
            
            messages = CentralMessage.objects.filter(
                created_at__gte=date,
                created_at__lt=next_date
            ).count()
            
            daily_stats.append({
                'date': date.strftime('%Y-%m-%d'),
                'memories': memories,
                'messages': messages,
                'total': memories + messages
            })
        
        context['daily_stats'] = daily_stats
        context['days'] = days
        
        # Get platform breakdown
        platform_stats = Room.objects.values('source').annotate(
            count=Count('id')
        ).order_by('-count')
        context['platform_stats'] = platform_stats
        
        # Get recent interactions for audit
        context['recent_memories'] = Memory.objects.select_related().order_by(
            '-created_at'
        )[:50]
        
        return context

class AgentDetailView(LoginRequiredMixin, TemplateView):
    template_name = 'reporting/agent_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        agent_id = kwargs.get('agent_id')
        
        # Get agent
        agent = Agent.objects.get(id=agent_id)
        context['agent'] = agent
        
        # Get agent statistics
        context['total_memories'] = Memory.objects.filter(agent_id=agent_id).count()
        
        # Get memory types breakdown
        memory_types = Memory.objects.filter(agent_id=agent_id).values(
            'type'
        ).annotate(count=Count('id')).order_by('-count')
        context['memory_types'] = memory_types
        
        # Get recent memories
        context['recent_memories'] = Memory.objects.filter(
            agent_id=agent_id
        ).order_by('-created_at')[:100]
        
        # Parse agent configuration
        context['bio'] = agent.bio if isinstance(agent.bio, list) else []
        context['topics'] = agent.topics if isinstance(agent.topics, list) else []
        context['style'] = agent.style if isinstance(agent.style, dict) else {}
        
        return context
