"""
Views for ElizaOS monitoring and milestone validation
"""
from django.shortcuts import render
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from elizaos.models import Agent, Memory, Room, CentralMessage, MessageServer
import json

class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'reporting/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Get active agents
        context['agents'] = Agent.objects.all()
        context['agent_count'] = context['agents'].count()
        
        # Get interaction counts
        context['total_memories'] = Memory.objects.count()
        context['total_messages'] = CentralMessage.objects.count()
        
        # Get interactions in last 24 hours
        yesterday = timezone.now() - timedelta(days=1)
        context['recent_memories'] = Memory.objects.filter(
            created_at__gte=yesterday
        ).count()
        context['recent_messages'] = CentralMessage.objects.filter(
            created_at__gte=yesterday
        ).count()
        
        # Get interaction breakdown by agent - optimized to reduce queries
        from django.db.models import Count, Q
        
        # Get all counts in a single query per model
        memory_counts = Memory.objects.values('agent_id').annotate(
            total=Count('id'),
            recent=Count('id', filter=Q(created_at__gte=yesterday))
        )
        
        # Build lookup dictionary
        memory_by_agent = {m['agent_id']: m for m in memory_counts}
        
        agent_interactions = {}
        for agent in context['agents']:
            agent_data = memory_by_agent.get(str(agent.id), {})
            agent_interactions[agent.name] = {
                'memories': agent_data.get('total', 0),
                'recent': agent_data.get('recent', 0)
            }
        context['agent_interactions'] = agent_interactions
        
        # Also provide a simpler structure for the template
        agent_stats = []
        for agent in context['agents']:
            stats = agent_interactions.get(agent.name, {'memories': 0, 'recent': 0})
            agent_stats.append({
                'agent': agent,
                'memories': stats['memories'],
                'recent': stats['recent']
            })
        context['agent_stats'] = agent_stats
        
        # Milestone tracking
        context['milestone_progress'] = self.calculate_milestone_progress()
        
        return context
    
    def calculate_milestone_progress(self):
        """Calculate progress towards contract milestones"""
        # Milestone 1.3: 30,000 interactions by Day 35
        # Milestone 1.6: 100,000 interactions by Day 60
        
        total_interactions = Memory.objects.count() + CentralMessage.objects.count()
        
        # Contract started July 16, 2025
        contract_start = datetime(2025, 7, 16).date()
        today = timezone.now().date()
        days_elapsed = (today - contract_start).days
        
        milestones = {
            '1.3': {
                'name': 'Scale Testing & Performance',
                'target': 30000,
                'deadline_days': 35,
                'payment': 6250,
                'current': total_interactions,
                'percentage': min(100, (total_interactions / 30000) * 100),
                'days_remaining': max(0, 35 - days_elapsed)
            },
            '1.6': {
                'name': 'Full Handoff',
                'target': 100000,
                'deadline_days': 60,
                'payment': 6250,
                'current': total_interactions,
                'percentage': min(100, (total_interactions / 100000) * 100),
                'days_remaining': max(0, 60 - days_elapsed)
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
