/**
 * SOGE ZABANA SVG Analytics Charts Engine
 * 100% Free, light, responsive and styled with HSL definitions
 */
const Charts = {
    // Render curved gradient Area line chart
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 600;
        const height = 240;
        const padding = 40;

        const maxVal = Math.max(...data.map(d => d.value)) * 1.15 || 10;
        const minVal = 0;

        const points = data.map((d, i) => {
            const x = padding + (i * ((width - (padding * 2)) / (data.length - 1)));
            const y = height - padding - (((d.value - minVal) / (maxVal - minVal)) * (height - (padding * 2)));
            return { x, y, label: d.label, val: d.value };
        });

        // Construct bezier curves path
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX1 = current.x + (next.x - current.x) / 2;
            const controlY1 = current.y;
            const controlX2 = current.x + (next.x - current.x) / 2;
            const controlY2 = next.y;
            pathD += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
        }

        // Closed path for fill gradient
        const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        // Generate SVG string
        let svg = `
            <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="font-family: inherit; overflow: visible;">
                <defs>
                    <linearGradient id="chart-fill-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>

                <!-- Grid lines -->
                <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border)" stroke-dasharray="4"/>
                <line x1="${padding}" y1="${(height / 2)}" x2="${width - padding}" y2="${(height / 2)}" stroke="var(--border)" stroke-dasharray="4"/>
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border)"/>

                <!-- Area Fill Gradient -->
                <path d="${fillD}" fill="url(#chart-fill-grad)"/>

                <!-- Curved Line path -->
                <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>

                <!-- Render circles and markers -->
                ${points.map((p, i) => `
                    <g class="chart-point-group" style="cursor: pointer;">
                        <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--surface)" stroke="var(--primary)" stroke-width="2" />
                        <circle cx="${p.x}" cy="${p.y}" r="9" fill="var(--primary)" opacity="0" class="hover-circle" style="transition:all 0.2s;" />
                        
                        <!-- Tooltip text (shown on point hover) -->
                        <text x="${p.x}" y="${p.y - 12}" font-size="10" font-weight="700" text-anchor="middle" fill="var(--secondary)" opacity="0" class="point-tooltip">${p.val}</text>
                        
                        <!-- X Label -->
                        <text x="${p.x}" y="${height - padding + 20}" font-size="10" font-weight="500" text-anchor="middle" fill="var(--text-muted)">${p.label}</text>
                    </g>
                `).join('')}
            </svg>
        `;

        container.innerHTML = svg;

        // Attach hover event selectors
        const svgEl = container.querySelector('svg');
        const groups = svgEl.querySelectorAll('.chart-point-group');
        groups.forEach(g => {
            const hc = g.querySelector('.hover-circle');
            const tooltip = g.querySelector('.point-tooltip');

            g.addEventListener('mouseenter', () => {
                hc.style.opacity = '0.15';
                tooltip.style.opacity = '1';
                tooltip.setAttribute('transform', 'translate(0, -2)');
            });
            g.addEventListener('mouseleave', () => {
                hc.style.opacity = '0';
                tooltip.style.opacity = '0';
                tooltip.setAttribute('transform', 'translate(0, 0)');
            });
        });
    },

    // Render bar chart
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 600;
        const height = 240;
        const padding = 40;

        const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 10;
        const minVal = 0;

        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const barWidth = (chartWidth / data.length) * 0.55;
        const colWidth = chartWidth / data.length;

        let svg = `
            <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="font-family: inherit; overflow:visible;">
                <!-- Grid Horizontal Lines -->
                <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border)" stroke-dasharray="4"/>
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border)"/>

                <!-- Loop bars -->
                ${data.map((d, i) => {
                    const x = padding + (i * colWidth) + (colWidth - barWidth) / 2;
                    const h = (d.value / maxVal) * chartHeight;
                    const y = height - padding - h;
                    return `
                        <g class="chart-bar-group" style="cursor: pointer;">
                            <!-- Bar rectangle with rounded path -->
                            <path d="M ${x} ${y + 6} Q ${x} ${y} ${x + 6} ${y} L ${x + barWidth - 6} ${y} Q ${x + barWidth} ${y} ${x + barWidth} ${y + 6} L ${x + barWidth} ${height - padding} L ${x} ${height - padding} Z" fill="var(--secondary)" opacity="0.85" style="transition:all 0.2s;" />
                            
                            <!-- Label values above bar -->
                            <text x="${x + (barWidth / 2)}" y="${y - 8}" font-size="10" font-weight="700" text-anchor="middle" fill="var(--secondary)" opacity="0" class="bar-tooltip">${d.value}</text>
                            
                            <!-- X Label -->
                            <text x="${x + (barWidth / 2)}" y="${height - padding + 20}" font-size="10" font-weight="500" text-anchor="middle" fill="var(--text-muted)">${d.label}</text>
                        </g>
                    `;
                }).join('')}
            </svg>
        `;

        container.innerHTML = svg;

        // Bar Hover actions bindings
        const svgEl = container.querySelector('svg');
        const groups = svgEl.querySelectorAll('.chart-bar-group');
        groups.forEach(g => {
            const bar = g.querySelector('path');
            const tooltip = g.querySelector('.bar-tooltip');

            g.addEventListener('mouseenter', () => {
                bar.style.opacity = '1';
                bar.setAttribute('fill', 'var(--primary)');
                tooltip.style.opacity = '1';
            });
            g.addEventListener('mouseleave', () => {
                bar.style.opacity = '0.85';
                bar.setAttribute('fill', 'var(--secondary)');
                tooltip.style.opacity = '0';
            });
        });
    }
};
