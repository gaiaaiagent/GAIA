import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  color: string;
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface D3ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

export default function D3ForceGraph({
  nodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick
}: D3ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    console.log('[D3ForceGraph] Rendering with dimensions:', { width, height, nodeCount: nodes.length });

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create container for zoom
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create force simulation with proper spacing to prevent overlap
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(edges)
        .id((d: any) => d.id)
        .distance(120))  // Longer links to spread nodes out
      .force("charge", d3.forceManyBody()
        .strength(-300)  // Stronger repulsion to push nodes apart
        .distanceMax(500))  // Limit repulsion range for performance
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius((d: any) => (d.size || 8) + 25)  // Dynamic collision based on node size + padding
        .strength(1)  // Strong collision detection
        .iterations(3))  // Multiple iterations for better separation
      .force("x", d3.forceX(width / 2).strength(0.03))  // Weaker pull toward center
      .force("y", d3.forceY(height / 2).strength(0.03))
      .alphaDecay(0.02)  // Slower decay for better layout
      .velocityDecay(0.4);  // More friction for stability

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666");

    // Create links
    const link = g.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#arrow)");

    // Create link labels (hidden by default, shown on hover)
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(edges)
      .join("text")
      .attr("font-size", 10)
      .attr("fill", "#666")
      .attr("opacity", 0)
      .style("pointer-events", "none")
      .text((d: any) => d.label);

    // Create nodes
    const node = g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => d.size || 8)
      .attr("fill", (d: any) => d.color || "#69b3a2")
      .attr("fill-opacity", 0.85)
      .style("cursor", "pointer");

    // Create node labels with dynamic offset based on node size
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", 10)
      .attr("fill", "#333")
      .attr("dx", (d: any) => (d.size || 8) + 4)  // Offset based on node size
      .attr("dy", 3)
      .text((d: any) => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
      .style("pointer-events", "none")
      .style("font-weight", (d: any) => (d.degree || 0) > 3 ? "600" : "400")  // Bold for high-degree nodes
      .style("opacity", 0.9);

    // Add drag behavior to nodes
    const drag = d3.drag()
      .on("start", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Add click handler
    node.on("click", (event: any, d: any) => {
      if (onNodeClick) {
        onNodeClick(d);
      }
    });

    // Add hover effects
    node.on("mouseover", function(event: any, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", (d.size || 8) * 1.5);

      // Highlight connected edges and show their labels
      link.style("stroke", (l: any) => {
        return l.source.id === d.id || l.target.id === d.id ? "#ff6b6b" : "#999";
      }).style("stroke-width", (l: any) => {
        return l.source.id === d.id || l.target.id === d.id ? 2 : 1;
      });

      // Show labels for connected edges
      linkLabel.attr("opacity", (l: any) => {
        return l.source.id === d.id || l.target.id === d.id ? 1 : 0;
      });
    });

    node.on("mouseout", function(event: any, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.size || 8);

      link.style("stroke", "#999").style("stroke-width", 1);

      // Hide all edge labels
      linkLabel.attr("opacity", 0);
    });

    // Track if we've auto-fitted the view
    let hasAutoFitted = false;

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Auto-fit function
    const autoFit = () => {
      if (hasAutoFitted || nodes.length === 0) return;

      // Calculate bounding box of all nodes
      const padding = 50;
      const xExtent = d3.extent(nodes, (d: any) => d.x) as [number, number];
      const yExtent = d3.extent(nodes, (d: any) => d.y) as [number, number];

      const bounds = {
        x: xExtent[0] - padding,
        y: yExtent[0] - padding,
        width: xExtent[1] - xExtent[0] + padding * 2,
        height: yExtent[1] - yExtent[0] + padding * 2
      };

      // Calculate scale to fit all nodes
      const scale = Math.min(
        width / bounds.width,
        height / bounds.height,
        1  // Don't zoom in more than 1x
      );

      // Calculate translation to center the graph
      const translateX = (width - bounds.width * scale) / 2 - bounds.x * scale;
      const translateY = (height - bounds.height * scale) / 2 - bounds.y * scale;

      // Apply transform
      svg.transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(scale));

      hasAutoFitted = true;
    };

    // Auto-fit after a brief delay (don't wait for full simulation end)
    setTimeout(() => autoFit(), 1000);

    // Also auto-fit when simulation ends
    simulation.on("end", () => autoFit());

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height, onNodeClick]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
      style={{ background: '#f8f9fa' }}
    />
  );
}