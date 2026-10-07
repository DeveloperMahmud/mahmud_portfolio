from pathlib import Path
p=Path('/mnt/data/work_admin/portfolio/admin.js')
s=p.read_text()
needle="$('#settingsForm')?.addEventListener('submit',async e=>"
insert='''function updateHeroCopyPreview(){const lead=$('#settingHeroLeadText')?.value.trim()||'I DESIGN';const raw=$('#settingHeroTypewriterPhrases')?.value||'';const phrases=raw.split(/\\n+/).map(v=>v.trim()).filter(Boolean).slice(0,12);if($('#heroCopyPreviewLead'))$('#heroCopyPreviewLead').textContent=lead;if($('#heroCopyPreviewPhrase'))$('#heroCopyPreviewPhrase').textContent=phrases[0]||'BRANDS THAT SELL.';if($('#heroLeadCount'))$('#heroLeadCount').textContent=lead.length;if($('#heroPhraseCount'))$('#heroPhraseCount').textContent=phrases.length}
$('#settingHeroLeadText')?.addEventListener('input',updateHeroCopyPreview);
$('#settingHeroTypewriterPhrases')?.addEventListener('input',updateHeroCopyPreview);
'''
if insert not in s:
    s=s.replace(needle, insert+needle)
# after loadMaintenance definition, ensure preview updates on load
s=s.replace("$('#settingHeroTypewriterPhrases').value=Array.isArray(x.heroTypewriterPhrases)?x.heroTypewriterPhrases.join('\\n'):'BRANDS THAT SELL.';const heroPreview", "$('#settingHeroTypewriterPhrases').value=Array.isArray(x.heroTypewriterPhrases)?x.heroTypewriterPhrases.join('\\n'):'BRANDS THAT SELL.';updateHeroCopyPreview();const heroPreview")
p.write_text(s)
