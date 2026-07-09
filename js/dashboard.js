/**
 * SOGE ZABANA Administration KPIs & Charts binder
 */
const Dashboard = {
    async init() {
        Auth.requireAdmin();

        const user = Auth.getCurrentUser();
        const response = await API.call('getAdminStats', { role: user.role });

        if (response.success) {
            this.populateKPIs(response.kpi);
            this.renderCharts(response.statsDaily);
            this.populateAuditLogs(response.logs);
        } else {
            console.error("Échec de chargement des statistiques", response.error);
        }
    },

    // Feed numeric targets
    populateKPIs(kpi) {
        document.getElementById('kpi-ads-val').innerText = kpi.totalAds || 0;
        document.getElementById('kpi-users-val').innerText = kpi.totalUsers || 0;
        document.getElementById('kpi-views-val').innerText = kpi.totalViews || 0;
        document.getElementById('kpi-reports-val').innerText = kpi.totalReports || 0;
    },

    // Render interactive stats graphs
    renderCharts(dailyStats) {
        if (!dailyStats || dailyStats.length === 0) return;

        // Map daily visits into values
        const visitsData = dailyStats.map(s => ({
            label: this.formatShortDate(s.Date),
            value: parseInt(s.Visites) || 0
        }));

        // Map daily new listings into values
        const adsData = dailyStats.map(s => ({
            label: this.formatShortDate(s.Date),
            value: parseInt(s.NouvellesAnnonces) || 0
        }));

        Charts.createLineChart('visites-chart-slot', visitsData);
        Charts.createBarChart('annonces-chart-slot', adsData);
    },

    // Populate security history log details
    populateAuditLogs(logs) {
        const body = document.getElementById('admin-audit-logs-body');
        if (!body) return;

        body.innerHTML = '';

        if (!logs || logs.length === 0) {
            body.innerHTML = `<tr><td colspan="4" style="text-align:center;">Aucune activité enregistrée</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const time = new Date(log.date).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const date = new Date(log.date).toLocaleDateString('fr-FR');
            
            body.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">#${log.id}</td>
                    <td>
                        <span class="badge ${this.getAuditBadgeClass(log.action)}">${log.action}</span>
                    </td>
                    <td>${log.details}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${date} - ${time}</td>
                </tr>
            `;
        });
    },

    // Map style color class rules to actions types
    getAuditBadgeClass(action) {
        switch (action) {
            case 'CONNEXION': return 'badge-primary';
            case 'INSCRIPTION': return 'badge-success';
            case 'CREATION_ANNONCE': return 'badge-success';
            case 'MODIFICATION_ANNONCE': return 'badge-primary';
            case 'SUPPRESSION_ANNONCE': return 'badge-danger';
            case 'SIGNALEMENT': return 'badge-danger';
            case 'PARAMETRES': return 'badge-primary';
            default: return 'badge-outline';
        }
    },

    formatShortDate(dString) {
        const d = new Date(dString);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
};
