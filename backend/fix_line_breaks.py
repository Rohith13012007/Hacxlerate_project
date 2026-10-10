import os

with open(r'c:\Users\ROHITH\Documents\hackathon projects\Hacxlerate_project\backend\app\agents\orchestrator.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace single quoted multi-line f-strings with triple quoted f-strings
content = content.replace('reply = f"⚠️ Possible Medical Emergency detected! Please seek immediate emergency medical care or call 108 / 911 immediately.\n\nEmergency Facility: {nearby_doc[\'hospital\']} ({nearby_doc[\'distance_km\']} km away, Phone: {nearby_doc[\'phone\']}).\n\n(Note: AI guidance only.)"',
                          'reply = f"""⚠️ Possible Medical Emergency detected! Please seek immediate emergency medical care or call 108 / 911 immediately.\n\nEmergency Facility: {nearby_doc["hospital"]} ({nearby_doc["distance_km"]} km away, Phone: {nearby_doc["phone"]}).\n\n(Note: AI guidance only.)"""')

with open(r'c:\Users\ROHITH\Documents\hackathon projects\Hacxlerate_project\backend\app\agents\orchestrator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed line breaks in orchestrator.py!")
