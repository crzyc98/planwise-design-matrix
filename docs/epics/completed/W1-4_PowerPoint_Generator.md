# Epic W1-4: PowerPoint Generator

**Epic ID:** W1-4
**Epic Name:** PowerPoint Generator (The Deliverable That Sells)
**Priority:** Critical - Week 1 Value Proof
**Estimated Effort:** 1 day
**Phase:** Week 1 - Prove the Concept
**Dependencies:** W1-1 (Database), W1-2 (Peer Benchmarking Engine)

---

## Epic Summary

Build an automated PowerPoint generator that creates professional peer comparison decks using python-pptx. Generate 5 sample decks to demonstrate the platform's ability to transform hours of manual work into minutes of automated deliverable creation.

**Key Principle:** This is what sells the vision—a polished client deliverable that would take 4-6 hours manually, generated in 30 seconds.

## Business Value

- **Time Savings:** Eliminate 4-6 hours of manual PowerPoint creation per client
- **Consistency:** Standardized deck format across all AEs and consultants
- **Quality:** Professional, data-driven presentations vs. ad-hoc slides
- **Proof of Concept:** Tangible deliverable that demonstrates platform ROI

## User Story

**As an** Account Executive or Consultant
**I want** an automatically-generated PowerPoint deck with peer comparisons and charts
**So that** I can deliver professional client presentations without spending hours in Excel and PowerPoint

---

## Acceptance Criteria

### Deck Structure
- [ ] 3-slide template: Title, Plan Overview + Peer Comparison, Recommendations
- [ ] Professional design with consistent branding
- [ ] All content auto-populated from database and peer benchmarking engine
- [ ] Charts generated programmatically (not static images)

### Slide 1: Title Slide
- [ ] Plan name as title
- [ ] Sponsor name as subtitle
- [ ] "Peer Benchmarking Analysis" label
- [ ] Date generated
- [ ] PlanWise branding (if available)

### Slide 2: Plan Overview & Peer Comparison
- [ ] Plan details table (type, industry, participants, assets)
- [ ] Peer cohort description (size, selection criteria)
- [ ] Participant count comparison chart (bar chart with percentile markers)
- [ ] Feature adoption comparison (match, auto-enrollment)

### Slide 3: Key Findings & Recommendations
- [ ] 2-3 bullet points highlighting competitive gaps
- [ ] 2-3 bullet points with recommendations
- [ ] Generated using simple rules-based logic
- [ ] Professional formatting

### Technical Requirements
- [ ] Function: `generate_powerpoint(plan_id)` creates .pptx file
- [ ] Uses python-pptx library for deck generation
- [ ] Charts created with matplotlib and embedded as images
- [ ] Output file named: `{plan_sponsor_name}_Peer_Analysis_{date}.pptx`
- [ ] Generation time: <30 seconds per deck

### Testing
- [ ] Generate decks for 5 sample clients
- [ ] Manual review: All data accurate, no formatting errors
- [ ] Charts readable and professional
- [ ] Recommendations logical and relevant

---

## Slide Templates

### Slide 1: Title Slide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                   ABC Corporation                           │
│                  401(k) Plan Analysis                       │
│                                                             │
│                Peer Benchmarking Report                     │
│                                                             │
│                  Generated: January 2025                    │
│                                                             │
│                                                             │
│                     [PlanWise Logo]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Slide 2: Plan Overview & Peer Comparison

```
┌─────────────────────────────────────────────────────────────┐
│  Plan Overview & Peer Comparison                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PLAN DETAILS                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Plan Type:     401(k)                              │    │
│  │ Industry:      Higher Education (NAICS 611)        │    │
│  │ Participants:  2,400                               │    │
│  │ Total Assets:  $125,000,000                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  PEER COHORT (n=12 similar plans)                          │
│  Selected based on industry, plan type, and size            │
│                                                             │
│  PARTICIPANT COUNT COMPARISON                               │
│  [Bar chart showing P25, P50, P75 with your value marked]  │
│                                                             │
│  Your Plan: 2,400 participants (58th percentile)           │
│  Above Average compared to peers                            │
│                                                             │
│  FEATURE ADOPTION                                           │
│  ✓ Employer Match:      Your Plan | 92% of peers          │
│  ✓ Auto-Enrollment:     Your Plan | 75% of peers          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Slide 3: Key Findings & Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│  Key Findings & Recommendations                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  KEY FINDINGS                                               │
│                                                             │
│  • Your plan is above average in size (58th percentile)    │
│    compared to similar higher education institutions        │
│                                                             │
│  • Match rate of 50% is below peer median (50th vs. 58th   │
│    percentile among peers offering match)                   │
│                                                             │
│  • 75% of peer plans have adopted auto-enrollment,         │
│    positioning it as an industry standard                   │
│                                                             │
│  RECOMMENDATIONS                                            │
│                                                             │
│  • Consider increasing match rate to align with top        │
│    quartile peers (100% match up to 4-6% of pay)          │
│                                                             │
│  • Maintain current auto-enrollment design (3% default)    │
│    which aligns with peer practices                        │
│                                                             │
│  • Review vesting schedule against peers in next analysis  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

```python
# powerpoint_generator.py
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from datetime import datetime
import matplotlib.pyplot as plt
import io
from peer_benchmarking import generate_peer_comparison

def generate_powerpoint(client_id: str, output_dir: str = 'output') -> str:
    """
    Generate PowerPoint deck with peer comparison analysis.

    Returns: Path to generated .pptx file
    """

    # Get peer comparison data
    comparison = generate_peer_comparison(client_id)
    target = comparison['target_client']
    cohort_size = comparison['peer_cohort']['size']

    # Create presentation
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    # SLIDE 1: Title Slide
    slide1 = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

    # Title
    title_box = slide1.shapes.add_textbox(Inches(1), Inches(2.5), Inches(8), Inches(1))
    title_frame = title_box.text_frame
    title_frame.text = target['plan_sponsor_name']
    title_para = title_frame.paragraphs[0]
    title_para.font.size = Pt(44)
    title_para.font.bold = True
    title_para.alignment = PP_ALIGN.CENTER

    # Subtitle
    subtitle_box = slide1.shapes.add_textbox(Inches(1), Inches(3.5), Inches(8), Inches(0.8))
    subtitle_frame = subtitle_box.text_frame
    subtitle_frame.text = f"{target['plan_name']}"
    subtitle_para = subtitle_frame.paragraphs[0]
    subtitle_para.font.size = Pt(28)
    subtitle_para.alignment = PP_ALIGN.CENTER

    # Report type
    report_box = slide1.shapes.add_textbox(Inches(1), Inches(4.5), Inches(8), Inches(0.6))
    report_frame = report_box.text_frame
    report_frame.text = "Peer Benchmarking Report"
    report_para = report_frame.paragraphs[0]
    report_para.font.size = Pt(20)
    report_para.alignment = PP_ALIGN.CENTER

    # Date
    date_box = slide1.shapes.add_textbox(Inches(1), Inches(5.5), Inches(8), Inches(0.5))
    date_frame = date_box.text_frame
    date_frame.text = f"Generated: {datetime.now().strftime('%B %Y')}"
    date_para = date_frame.paragraphs[0]
    date_para.font.size = Pt(16)
    date_para.alignment = PP_ALIGN.CENTER

    # SLIDE 2: Plan Overview & Peer Comparison
    slide2 = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide2.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "Plan Overview & Peer Comparison"
    title_para = title_frame.paragraphs[0]
    title_para.font.size = Pt(32)
    title_para.font.bold = True

    # Plan Details
    details_box = slide2.shapes.add_textbox(Inches(0.5), Inches(1.0), Inches(4), Inches(2))
    details_frame = details_box.text_frame
    details_frame.text = "PLAN DETAILS\n"

    details_frame.add_paragraph()
    p = details_frame.paragraphs[1]
    p.text = f"Plan Type: {target['plan_type'].upper()}"
    p.font.size = Pt(14)

    details_frame.add_paragraph()
    p = details_frame.paragraphs[2]
    p.text = f"Industry: {target['industry']}"
    p.font.size = Pt(14)

    details_frame.add_paragraph()
    p = details_frame.paragraphs[3]
    p.text = f"Participants: {target['total_participants']:,}"
    p.font.size = Pt(14)

    details_frame.add_paragraph()
    p = details_frame.paragraphs[4]
    p.text = f"Total Assets: ${target['total_assets']:,.0f}"
    p.font.size = Pt(14)

    # Peer Cohort Info
    cohort_box = slide2.shapes.add_textbox(Inches(0.5), Inches(3.2), Inches(4), Inches(0.8))
    cohort_frame = cohort_box.text_frame
    cohort_frame.text = f"PEER COHORT (n={cohort_size} similar plans)\nSelected based on industry, plan type, and size"
    cohort_frame.paragraphs[0].font.size = Pt(12)
    cohort_frame.paragraphs[0].font.bold = True

    # Generate chart: Participant Count Comparison
    participants_comparison = comparison['numeric_comparisons']['total_participants']

    fig, ax = plt.subplots(figsize=(6, 2))

    # Peer percentiles
    p25 = participants_comparison['peer_p25']
    p50 = participants_comparison['peer_median']
    p75 = participants_comparison['peer_p75']
    your_value = participants_comparison['your_value']

    # Bar for peer range
    ax.barh([0], [p75 - p25], left=p25, height=0.5, color='lightgray', label='Peer Range (P25-P75)')

    # Median line
    ax.axvline(p50, color='red', linestyle='--', linewidth=2, label='Peer Median')

    # Your value marker
    ax.scatter([your_value], [0], s=200, color='blue', marker='D', zorder=3, label='Your Plan')

    ax.set_yticks([])
    ax.set_xlabel('Participants', fontsize=12)
    ax.set_title('Participant Count Comparison', fontsize=14, fontweight='bold')
    ax.legend(loc='upper right', fontsize=9)
    ax.grid(axis='x', alpha=0.3)

    # Save chart to bytes
    chart_stream = io.BytesIO()
    plt.tight_layout()
    plt.savefig(chart_stream, format='png', dpi=150, bbox_inches='tight')
    chart_stream.seek(0)
    plt.close()

    # Add chart to slide
    slide2.shapes.add_picture(chart_stream, Inches(5), Inches(1), width=Inches(4.5))

    # Participant rank text
    rank = participants_comparison['percentile_rank']
    rank_box = slide2.shapes.add_textbox(Inches(5), Inches(3.5), Inches(4.5), Inches(0.8))
    rank_frame = rank_box.text_frame
    rank_frame.text = f"Your Plan: {your_value:,} participants ({rank['percentile']}th percentile)\n{rank['label']}"
    rank_frame.paragraphs[0].font.size = Pt(12)
    rank_frame.paragraphs[0].font.bold = True

    # Feature Adoption
    adoption_box = slide2.shapes.add_textbox(Inches(0.5), Inches(4.5), Inches(9), Inches(1.5))
    adoption_frame = adoption_box.text_frame
    adoption_frame.text = "FEATURE ADOPTION\n"
    adoption_frame.paragraphs[0].font.size = Pt(14)
    adoption_frame.paragraphs[0].font.bold = True

    match_adoption = comparison['adoption_comparisons']['has_match']
    ae_adoption = comparison['adoption_comparisons']['has_auto_enrollment']

    adoption_frame.add_paragraph()
    p = adoption_frame.paragraphs[1]
    match_symbol = "✓" if match_adoption['your_value'] else "✗"
    p.text = f"{match_symbol} Employer Match: {'Your Plan' if match_adoption['your_value'] else 'Not Offered'} | {match_adoption['peer_adoption_rate']*100:.0f}% of peers"
    p.font.size = Pt(12)

    adoption_frame.add_paragraph()
    p = adoption_frame.paragraphs[2]
    ae_symbol = "✓" if ae_adoption['your_value'] else "✗"
    p.text = f"{ae_symbol} Auto-Enrollment: {'Your Plan' if ae_adoption['your_value'] else 'Not Offered'} | {ae_adoption['peer_adoption_rate']*100:.0f}% of peers"
    p.font.size = Pt(12)

    # SLIDE 3: Key Findings & Recommendations
    slide3 = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide3.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "Key Findings & Recommendations"
    title_para = title_frame.paragraphs[0]
    title_para.font.size = Pt(32)
    title_para.font.bold = True

    # Generate findings and recommendations using simple rules
    findings = generate_findings(comparison)
    recommendations = generate_recommendations(comparison)

    # Key Findings
    findings_box = slide3.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(9), Inches(2.5))
    findings_frame = findings_box.text_frame
    findings_frame.text = "KEY FINDINGS\n"
    findings_frame.paragraphs[0].font.size = Pt(18)
    findings_frame.paragraphs[0].font.bold = True

    for finding in findings:
        findings_frame.add_paragraph()
        p = findings_frame.paragraphs[-1]
        p.text = f"• {finding}"
        p.font.size = Pt(14)
        p.level = 0

    # Recommendations
    rec_box = slide3.shapes.add_textbox(Inches(0.5), Inches(4.0), Inches(9), Inches(2.5))
    rec_frame = rec_box.text_frame
    rec_frame.text = "RECOMMENDATIONS\n"
    rec_frame.paragraphs[0].font.size = Pt(18)
    rec_frame.paragraphs[0].font.bold = True

    for rec in recommendations:
        rec_frame.add_paragraph()
        p = rec_frame.paragraphs[-1]
        p.text = f"• {rec}"
        p.font.size = Pt(14)
        p.level = 0

    # Save presentation
    import os
    os.makedirs(output_dir, exist_ok=True)

    filename = f"{target['plan_sponsor_name'].replace(' ', '_')}_Peer_Analysis_{datetime.now().strftime('%Y%m%d')}.pptx"
    filepath = os.path.join(output_dir, filename)

    prs.save(filepath)

    return filepath


def generate_findings(comparison: dict) -> list:
    """Generate key findings using simple rules-based logic"""
    findings = []
    target = comparison['target_client']

    # Participant count finding
    participants_rank = comparison['numeric_comparisons']['total_participants']['percentile_rank']
    findings.append(
        f"Your plan has {target['total_participants']:,} participants "
        f"({participants_rank['label'].lower()}, {participants_rank['percentile']}th percentile) "
        f"compared to similar plans"
    )

    # Match finding
    if target['has_match']:
        match_rank = comparison['numeric_comparisons']['match_rate']['percentile_rank']
        findings.append(
            f"Match rate of {target['match_rate']*100:.0f}% is {match_rank['label'].lower()} "
            f"({match_rank['percentile']}th percentile) among peers offering match"
        )
    else:
        match_adoption = comparison['adoption_comparisons']['has_match']['peer_adoption_rate']
        findings.append(
            f"Your plan does not offer employer match, while {match_adoption*100:.0f}% of peer plans do"
        )

    # Auto-enrollment finding
    ae_adoption = comparison['adoption_comparisons']['has_auto_enrollment']['peer_adoption_rate']
    if target['has_auto_enrollment']:
        findings.append(
            f"{ae_adoption*100:.0f}% of peer plans have adopted auto-enrollment, "
            f"positioning it as an industry standard"
        )
    else:
        findings.append(
            f"Your plan has not adopted auto-enrollment, though {ae_adoption*100:.0f}% of peers have"
        )

    return findings


def generate_recommendations(comparison: dict) -> list:
    """Generate recommendations using simple rules-based logic"""
    recommendations = []
    target = comparison['target_client']

    # Match recommendation
    if target['has_match']:
        match_rank = comparison['numeric_comparisons']['match_rate']['percentile_rank']
        if match_rank['percentile'] < 50:
            recommendations.append(
                "Consider increasing match rate to align with peer median or top quartile"
            )
        else:
            recommendations.append(
                "Maintain current match rate which is competitive with peers"
            )
    else:
        match_adoption = comparison['adoption_comparisons']['has_match']['peer_adoption_rate']
        if match_adoption > 0.7:
            recommendations.append(
                "Consider adding employer match, as it is offered by majority of peer plans"
            )

    # Auto-enrollment recommendation
    ae_adoption = comparison['adoption_comparisons']['has_auto_enrollment']['peer_adoption_rate']
    if not target['has_auto_enrollment'] and ae_adoption > 0.5:
        recommendations.append(
            "Consider implementing auto-enrollment to align with peer practices and improve participation"
        )
    elif target['has_auto_enrollment']:
        recommendations.append(
            f"Maintain current auto-enrollment design ({target['auto_enrollment_rate']*100:.0f}% default) "
            "which aligns with peer practices"
        )

    # Generic recommendation
    recommendations.append(
        "Continue monitoring peer trends and consider annual benchmarking reviews"
    )

    return recommendations
```

---

## Testing Script

```python
# test_powerpoint_generator.py
from powerpoint_generator import generate_powerpoint

# Generate decks for 5 sample clients
test_client_ids = ['CLIENT-001', 'CLIENT-002', 'CLIENT-003', 'CLIENT-004', 'CLIENT-005']

for client_id in test_client_ids:
    print(f"Generating PowerPoint for {client_id}...")
    try:
        filepath = generate_powerpoint(client_id)
        print(f"  ✓ Success: {filepath}")
    except Exception as e:
        print(f"  ✗ Error: {e}")

print("\nAll decks generated. Review files in output/ directory.")
```

---

## Success Metrics

- [ ] 5 sample decks generated successfully
- [ ] All data accurate (spot-check against database)
- [ ] Charts readable and professional
- [ ] Recommendations logical and relevant
- [ ] Generation time <30 seconds per deck
- [ ] File size reasonable (<5MB per deck)

---

## Deliverables

1. **powerpoint_generator.py** - PowerPoint generation engine
2. **test_powerpoint_generator.py** - Testing script
3. **output/** - 5 sample PowerPoint decks for review
4. **template_documentation.md** - Slide template specifications

---

## Stakeholder Demo Script

**Setup:** Have 5 generated decks ready to show

**Script:**
1. "We manually extracted 20 clients into our database (Week 1)"
2. "Our peer benchmarking engine automatically identifies similar plans and calculates percentiles"
3. "Here's what used to take 4-6 hours manually..." [Open Excel, show complexity]
4. "Now it takes 30 seconds..." [Run generation, show timer]
5. [Open generated deck] "Professional, data-driven, ready for client review"
6. "This is just Week 1. Imagine when we automate extraction and add 850 clients..."

---

## Future Enhancements (Post Week 1)

- Add compliance disclaimers and watermarks
- Support multiple template options (1-pager, full report, board deck)
- Embed actual chart objects (not images) for editability
- Add custom branding (logos, colors, fonts)
- Generate recommendations using more sophisticated logic
- Include trend analysis (if historical data available)
- Export to PDF option

---

**Epic Owner:** [Engineer Name]
**Status:** Ready to Start (blocked by W1-2)
**Next Epic:** W1-5 (Demo & Iterate)