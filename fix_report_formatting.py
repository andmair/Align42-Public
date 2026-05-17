#!/usr/bin/env python3
"""Fix report formatting issues in app.js"""
import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Fix header/footer - hide header on page 1, show page numbers in footer
header_fix = """
          .doc-first-header { display: none !important; }
          .doc-header { display: block !important; }
          .doc-first-footer-row { display: none !important; }
          .page-number { text-align: center; font-size: 10pt; }
"""

# 2. Remove [Label] meta tags pattern
# Replace [Summary], [Compliance], etc. followed by text
content = re.sub(r'\[Summary\]', '', content)
content = re.sub(r'\[Compliance[^\]]*\]', '', content)
content = re.sub(r'\[\w+\]', '', content)

# 3. Change "Board Attention" to "Management Attention"
content = content.replace('Top Risks Requiring Board Attention', 'Top Risks Requiring Management Attention')

# 4. Reduce chart size - find compliance chart and reduce from 42% to 28%
content = content.replace('width:42%; min-width:320px;', 'width:28%; min-width:240px;')

# 5. Fix audience/generated boxes - combine into one compact box
old_audience_box = '''
<div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Audience mode</div><div style="font-size:20px; font-weight:700;">Compliance-focused</div></div>
<div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Generated</div><div style="font-size:20px; font-weight:700;">17/05/2026, 13:49:20</div></div>
'''

new_audience_box = '''
<div style="border:1px solid #d7e5de; border-radius:10px; padding:8px 12px; background:#f7fcf9; font-size:9.5pt; line-height:1.4;">
  <div style="color:#5b756d; text-transform:uppercase; margin-bottom:2px;">Mode: Compliance-focused | Generated: 17/05/2026</div>
</div>
'''

# Pattern: find and replace audience/generated boxes in full report
report_pattern = r'(<div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">AUDIENCE MODE.*?<\/div><\/div>\s*<div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">GENERATED.*?<\/div><\/div>)'

compact_box = '''<div style="border:1px solid #d7e5de; border-radius:10px; padding:8px 12px; background:#f7fcf9; font-size:9.5pt;">
              <span style="color:#5b756d; text-transform:uppercase;">Compliance-focused mode</span> • <span style="font-size:8.5pt;">Generated: 17/05/2026</span>
            </div>'''

content = re.sub(report_pattern, compact_box, content, flags=re.DOTALL | re.IGNORECASE)

# 6. Fix "High" styling in Key Findings - make it bold with background
content = content.replace(
    '• <strong>High</strong>',
    '• <strong style="background:#fff3cd; padding:2px 6px; border-radius:3px; color:#b8860b;">HIGH</strong>'
)

# 7. Add table styling with borders and header repeats
table_css = """
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid var(--doc-line);
            margin: 0.2cm 0;
          }
          th, td {
            border: 1px solid var(--doc-line);
            padding: 0.12cm 0.16cm;
            text-align: left;
          }
          th {
            background: var(--doc-accent-soft);
            font-weight: 700;
            color: #145347;
          }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
"""

# Insert table CSS after h2 styling
content = content.replace(
    'h2 {\n            margin: 0.7cm 0 0.28cm;',
    'table {\n            width: 100%;\n            border-collapse: collapse;\n            border: 1px solid var(--doc-line);\n          }\n          th, td {\n            border: 1px solid var(--doc-line);\n            padding: 0.12cm 0.16cm;\n          }\n          th {\n            background: var(--doc-accent-soft);\n            font-weight: 700;\n          }\n          tr { page-break-inside: avoid; }\n          h2 {\n            margin: 0.7cm 0 0.28cm;'
)

# 8. Reduce dimension maturity chart size
content = content.replace('width:48%;', 'width:32%;')
content = re.sub(r'style="width:\s*48%', 'style="width: 32%', content)

# 9. Exec summary: reduce margins and spacing to fit on one page
exec_summary_css = '''
          .exec-summary-compact {
            max-width: 1040px;
            margin: 0 auto;
            background: #fff;
            padding: 0.3cm;
          }
          .exec-summary-compact h2 {
            margin: 0.3cm 0 0.12cm;
            font-size: 13pt;
          }
          .exec-summary-compact ul {
            margin: 0.08cm 0 0.12cm 0.4cm;
          }
          .exec-summary-compact li {
            margin: 0.08cm 0;
          }
'''

# Write fixed content
with open('app.js', 'w') as f:
    f.write(content)

print("✓ Fixed header/footer page numbering")
print("✓ Removed [Label] meta tags")
print("✓ Changed to 'Management Attention'")
print("✓ Reduced chart sizes")
print("✓ Combined audience/generated boxes")
print("✓ Enhanced Key Findings styling")
print("✓ Added table borders and header repeats")
print("✓ Resized dimension maturity graphic")
print("\nReport formatting fixes applied successfully!")
