from django.shortcuts import render
from django.template import Template, Context
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from .models import InteractionMetric, DocumentMetric, AgentMetric
from elizaos.models import Agent


def contract_compliance_view(request):
    """Custom view for contract compliance metrics"""
    
    # Calculate contract metrics
    total_interactions = InteractionMetric.objects.count()
    total_documents = DocumentMetric.objects.count()
    active_agents = AgentMetric.objects.filter(status='active').count()
    
    # Real ElizaOS agent count
    eliza_agents = Agent.objects.filter(enabled=True).count()
    
    # Daily interaction breakdown
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    recent_interactions = InteractionMetric.objects.filter(timestamp__gte=last_30_days)
    
    # Calculate daily average
    daily_average = int(recent_interactions.count() / 30) if recent_interactions.count() > 0 else 0
    
    context = {
        'title': 'RegenAI Contract Compliance Dashboard',
        'total_interactions': total_interactions,
        'total_documents': total_documents, 
        'active_agents': active_agents,
        'eliza_agents': eliza_agents,
        'recent_interactions_count': recent_interactions.count(),
        'daily_average': daily_average,
        'contract_target_interactions': 100000,  # From contract
        'contract_target_documents': 15000,      # From contract
        'contract_target_agents': 5,             # From contract
    }
    
    # Calculate completion percentages
    context['interaction_progress'] = min(100, (total_interactions / 100000) * 100) if total_interactions else 0
    context['document_progress'] = min(100, (total_documents / 15000) * 100) if total_documents else 0
    context['agent_progress'] = min(100, (eliza_agents / 5) * 100) if eliza_agents else 0
    
    # Simple HTML template for now
    template_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>{{ title }}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f8f9fa; }
            .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .metric { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric h3 { margin: 0 0 15px 0; color: #2c3e50; }
            .metric-value { font-size: 2em; font-weight: bold; color: #27ae60; margin: 10px 0; }
            .progress { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 15px 0; }
            .progress-bar { height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); transition: width 0.3s; }
            .progress-text { font-size: 0.9em; color: #7f8c8d; }
            .status-ok { color: #27ae60; } .status-warn { color: #f39c12; } .status-danger { color: #e74c3c; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{{ title }}</h1>
            <p>Real-time tracking of contract deliverables: 100k interactions, 15k documents, 5 agents in 60 days</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric">
                <h3>💬 Interactions</h3>
                <div class="metric-value">{{ total_interactions|floatformat:0 }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ interaction_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ interaction_progress|floatformat:1 }}% of 100,000 target
                    {% if interaction_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif interaction_progress >= 50 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
            
            <div class="metric">
                <h3>📚 Documents</h3>
                <div class="metric-value">{{ total_documents|floatformat:0 }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ document_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ document_progress|floatformat:1 }}% of 15,000 target
                    {% if document_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif document_progress >= 50 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
            
            <div class="metric">
                <h3>🤖 Agents</h3>
                <div class="metric-value">{{ eliza_agents }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ agent_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ agent_progress|floatformat:1 }}% of 5 target
                    {% if agent_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif agent_progress >= 60 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
        </div>
        
        <div class="metrics-grid" style="margin-top: 30px;">
            <div class="metric">
                <h3>📊 30-Day Activity</h3>
                <div class="metric-value">{{ recent_interactions_count|floatformat:0 }}</div>
                <p>Recent interactions tracked</p>
            </div>
            
            <div class="metric">
                <h3>📈 Daily Average</h3>
                <div class="metric-value">{{ daily_average }}</div>
                <p>Interactions per day (last 30 days)</p>
            </div>
            
            <div class="metric">
                <h3>⏱️ Time Remaining</h3>
                <div class="metric-value">~26 days</div>
                <p>To reach contract milestones</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            <p>Contract Compliance Dashboard - RegenAI x Symbiocene Labs Partnership</p>
            <p><a href="/admin/" style="color: #3498db;">← Back to Admin</a></p>
        </div>
    </body>
    </html>
    """
    
    template = Template(template_html)
    return HttpResponse(template.render(Context(context)))