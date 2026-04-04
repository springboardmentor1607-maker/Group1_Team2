import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional Visual Impact Report PDF for CleanStreet
 * @param {Object} summaryData - The summary statistics and breakdowns
 * @param {Object} volunteerData - The volunteer performance data
 */
export const generateVisualImpactReport = (summaryData, volunteerData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Helper for colors
    const colors = {
        primary: [0, 113, 227], // Apple/CleanStreet Blue
        secondary: [100, 116, 139], // Slate Gray
        success: [25, 135, 84],
        warning: [255, 193, 7],
        danger: [220, 53, 69],
        text: [30, 41, 59],
        lightText: [100, 116, 139]
    };

    // 1. Header Section
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CleanStreet', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Visual Impact & Community Report', margin, 33);
    
    const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.text(dateStr, pageWidth - margin - 40, 25, { align: 'right' });

    // 2. Executive Summary Section
    let currentY = 55;
    doc.setTextColor(...colors.text);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, currentY);
    
    currentY += 10;
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);

    // Summary Cards (Manual layout)
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cardHeight = 30;
    
    const stats = [
        { label: 'Total Reports', value: summaryData?.totalComplaints || 0, color: colors.primary },
        { label: 'Resolved Cases', value: summaryData?.statusBreakdown?.resolved || 0, color: colors.success },
        { label: 'Active Volunteers', value: volunteerData?.summary?.active_volunteers || 0, color: colors.secondary }
    ];

    stats.forEach((stat, i) => {
        const x = margin + (i * (cardWidth + 5));
        doc.setFillColor(248, 250, 252); // Light bg
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');
        
        doc.setTextColor(...stat.color);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text((stat.value || 0).toString(), x + (cardWidth / 2), currentY + 15, { align: 'center' });
        
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label.toUpperCase(), x + (cardWidth / 2), currentY + 24, { align: 'center' });
    });

    currentY += cardHeight + 20;

    // 3. Impact by Zone (Table)
    doc.setTextColor(...colors.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Neighborhood Impact Breakdown', margin, currentY);
    currentY += 8;

    const zoneData = (summaryData?.zoneBreakdown || []).map(z => [
        z.zone_name || 'General',
        z.count || 0,
        (summaryData?.totalComplaints > 0) 
            ? ((z.count / summaryData.totalComplaints) * 100).toFixed(1) + '%' 
            : '0%'
    ]);

    if (zoneData.length === 0) {
        zoneData.push(['No zones data available', '0', '0%']);
    }

    autoTable(doc, {
        startY: currentY,
        head: [['Zone/Area', 'Report Count', '% of Total']],
        body: zoneData,
        theme: 'striped',
        headStyles: { fillColor: colors.primary },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    currentY = doc.lastAutoTable.finalY + 20;

    // 4. Monthly Achievement Section
    if (pageHeight - currentY < 60) {
        doc.addPage();
        currentY = 20;
    }

    doc.setTextColor(...colors.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Achievements & Top Contributors', margin, currentY);
    currentY += 8;

    const topVolunteers = (volunteerData?.volunteers || [])
        .slice(0, 5)
        .map(v => [v.name, v.location || 'N/A', v.resolved_count]);

    if (topVolunteers.length === 0) {
        topVolunteers.push(['No volunteers found', 'N/A', '0']);
    }

    autoTable(doc, {
        startY: currentY,
        head: [['Volunteer Name', 'Primary Zone', 'Tasks Completed']],
        body: topVolunteers,
        theme: 'grid',
        headStyles: { fillColor: colors.success },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    currentY = doc.lastAutoTable.finalY + 25;

    // 5. Environmental Impact Note
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 35, 4, 4, 'F');
    
    doc.setTextColor(...colors.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Environmental Impact Statement', margin + 10, currentY + 12);
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const mission = "Through collaborative efforts, CleanStreet has successfully mitigated urban waste and improved safety across local sectors. Our data-driven approach ensures that high-priority hazards are addressed with record-breaking efficiency.";
    const splitMission = doc.splitTextToSize(mission, pageWidth - (margin * 2) - 20);
    doc.text(splitMission, margin + 10, currentY + 20);

    // 6. Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(...colors.lightText);
        doc.setFontSize(9);
        doc.text(
            `CleanStreet Internal Report - Page ${i} of ${totalPages}`, 
            pageWidth / 2, 
            pageHeight - 10, 
            { align: 'center' }
        );
    }

    // Save the PDF
    doc.save(`CleanStreet_Impact_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
