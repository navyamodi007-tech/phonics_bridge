import os
import sys
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas class to generate 'Page X of Y' page numbers dynamically."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#6b7280"))
        
        # Draw header on later pages
        if self._pageNumber > 1:
            self.drawString(54, 750, "Phonics Bridge Monthly School Progress Report")
            self.setStrokeColor(colors.HexColor("#e5e7eb"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Draw footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_text)
        self.drawString(54, 40, "Confidential • Phonics Bridge AI Analytics Dashboard")
        self.setStrokeColor(colors.HexColor("#e5e7eb"))
        self.setLineWidth(0.5)
        self.line(54, 52, 558, 52)
        
        self.restoreState()

def generate_pdf(json_path, output_pdf_path):
    # Load JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#ffffff'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f766e'),
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1f2937')
    )
    
    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f766e')
    )

    story = []

    # 1. Header Banner
    banner_data = [[
        Paragraph("<br/><b>PHONICS BRIDGE ENGINE</b><br/>Monthly School Progress Report<br/>", title_style)
    ]]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0d9488')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('CORNER_RADIUS', (0,0), (-1,-1), 12),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 15))

    # 2. Metadata Table
    meta_info = [
        [Paragraph("School Name:", meta_label_style), Paragraph(data.get('schoolName', 'N/A'), body_style),
         Paragraph("Report Month:", meta_label_style), Paragraph(data.get('month', 'N/A'), body_style)],
        [Paragraph("Principal:", meta_label_style), Paragraph(data.get('principalName', 'N/A'), body_style),
         Paragraph("Total Students:", meta_label_style), Paragraph(str(data.get('totalStudents', 0)), body_style)]
    ]
    meta_table = Table(meta_info, colWidths=[100, 152, 100, 152])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # 3. High-level Performance Metrics
    story.append(Paragraph("School Performance Overview", section_heading))
    overview_text = (
        f"During the month of {data.get('month', 'this month')}, {data.get('totalStudents', 0)} students actively practiced phonics "
        f"read-alouds. The school achieved an overall average pronunciation accuracy of <b>{data.get('averageAccuracy', 0.0)}%</b>. "
        "A summary of core strengths and phonemes requiring targeted practice is listed below."
    )
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 10))

    # Strengths / Weaknesses Table
    strengths_list = [f"/{item['phoneme']}/ ({item['accuracy']}% accuracy)" for item in data.get('strengths', [])]
    weaknesses_list = [f"/{item['phoneme']}/ ({item['accuracy']}% accuracy)" for item in data.get('weaknesses', [])]
    
    sw_data = [
        [Paragraph("Core Phonic Strengths", meta_label_style), Paragraph("Phonemes Requiring Practice", meta_label_style)],
        [Paragraph("<br/>".join(strengths_list) if strengths_list else "None recorded", body_style),
         Paragraph("<br/>".join(weaknesses_list) if weaknesses_list else "None recorded", body_style)]
    ]
    sw_table = Table(sw_data, colWidths=[252, 252])
    sw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#ffffff')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('LINEBELOW', (0,0), (-1,0), 1.5, colors.HexColor('#3b82f6')),
    ]))
    story.append(sw_table)
    story.append(Spacer(1, 25))

    # 4. Detailed Student Breakdown
    story.append(Paragraph("Student-by-Student Performance Directory", section_heading))
    
    # Table headers
    student_table_data = [[
        Paragraph("<b>Student Name</b>", meta_label_style),
        Paragraph("<b>Roll Number</b>", meta_label_style),
        Paragraph("<b>Sessions</b>", meta_label_style),
        Paragraph("<b>Avg. Accuracy</b>", meta_label_style),
        Paragraph("<b>Needs Focus On</b>", meta_label_style)
    ]]

    # Table rows
    for s in data.get('students', []):
        student_table_data.append([
            Paragraph(s.get('name', 'N/A'), body_style),
            Paragraph(s.get('rollNumber', 'N/A'), body_style),
            Paragraph(str(s.get('sessions', 0)), body_style),
            Paragraph(f"{s.get('accuracy', 0.0)}%", body_style),
            Paragraph(s.get('needsPractice', 'None'), body_style)
        ])

    student_table = Table(student_table_data, colWidths=[130, 90, 64, 90, 130])
    student_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(student_table)

    # Build PDF Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_pdf_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 generate_pdf_report.py <json_path> <output_pdf_path>")
        sys.exit(1)
        
    generate_pdf(sys.argv[1], sys.argv[2])
