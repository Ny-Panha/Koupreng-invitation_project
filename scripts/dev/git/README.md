# ⚜️ Koupreng Team Git Automation (ប្រព័ន្ធគ្រប់គ្រង Git សុវត្ថិភាព)

ឧបករណ៍ស្វ័យប្រវត្តិនេះ ត្រូវបានបង្កើតឡើងដើម្បីជួយដល់ **Koupreng Team** ក្នុងការ Push & Pull code ដោយសុវត្ថិភាព មើលឃើញការផ្លាស់ប្តូរច្បាស់លាស់ និង**ដាច់ខាតមិនជាន់ ឬ overwrite code គ្នាឡើយ (Anti-Collision)**។

---

## 🚀 របៀបប្រើប្រាស់រហ័ស (Quick Start)

### 🖥️ សម្រាប់ Linux / macOS:
បើក Terminal ក្នុង project root ហើយរត់:
```bash
# ជម្រើសងាយស្រួលបំផុត: Menu Dashboard
./scripts/dev/git/menu.sh

# ឬរត់ Command ផ្ទាល់:
./scripts/dev/git/check.sh             # ពិនិត្យមើល team push អីខ្លះ & conflict
./scripts/dev/git/pull.sh              # ទាញ code ថ្មីចូលដោយសុវត្ថិភាព
./scripts/dev/git/push.sh "សារ commit" # Push code ដោយសុវត្ថិភាព
./scripts/dev/git/undo-push.sh         # ដក commit ចុងក្រោយវិញ
```

### 🪟 សម្រាប់ Windows (PowerShell):
បើក PowerShell ក្នុង project root ហើយរត់:
```powershell
# Menu Dashboard
.\scripts\dev\git\menu.ps1

# ឬរត់ Command ផ្ទាល់:
.\scripts\dev\git\check.ps1
.\scripts\dev\git\pull.ps1
.\scripts\dev\git\push.ps1 -Message "សារ commit"
.\scripts\dev\git\undo-push.ps1
```

---

## 🛡️ លក្ខណៈពិសេសការពារកុំឱ្យជាន់ Code គ្នា (Anti-Collision Features)

1. **Radar & Collision Detector (`check.sh` / `check.ps1`)**:
   - ពិនិត្យមើលថាតើ Teammates បាន push commit អ្វីខ្លះឡើង GitHub ដែលយើងមិនទាន់ pull
   - ស្កេនរកមើលថាតើ File ណាខ្លះដែល**ទាំងអ្នក និង Teammate បានកែប្រែស្របពេលគ្នា** (Overlap File Warning)
   - ផ្តល់ដំណោះស្រាយភ្លាមៗមុនពេលកើតមានបញ្ហា។

2. **Smart Safe Pull (`pull.sh` / `pull.ps1`)**:
   - ស្ទាបស្ទង់មើល commit ថ្មីនៅលើ GitHub ជាមុន
   - **Auto-Stash**: រក្សាទុក code ដែលអ្នកកំពុងសរសេរលើ local ទុកក្នុង Stash ដោយស្វ័យប្រវត្តិ
   - ទាញយក code ថ្មីចូល (Pull & Rebase)
   - Restore code របស់អ្នកមកវិញដោយសុវត្ថិភាព
   - ប្រសិនបើមាន conflict កើតឡើង នឹងបង្ហាញឈ្មោះ file យ៉ាងច្បាស់ រួមជាមួយជំហាន 3 ជំហានងាយៗក្នុងការដោះស្រាយ ដោយមិនបាត់បង់ code ឡើយ។

3. **Safe Anti-Collision Push (`push.sh` / `push.ps1`)**:
   - **Conflict Marker Blocker**: រារាំងដាច់ខាតមិនឱ្យ push ប្រសិនបើរករឃើញសញ្ញា conflict (`<<<<<<< HEAD`) ក្នុង code!
   - **Secret Blocker**: ព្រមានភ្លាមៗបើច្រឡំ stage file `.env` ឬ credentials!
   - **Collision Radar**: បើសិនជា Teammates បាន push ឡើង GitHub មុនយើង Script នឹង**ផ្អាកការ push ភ្លាម** រួចសួរថាតើចង់ Auto-Sync (ទាញ code គេចូលសិន) ដែរឬទេ ដើម្បីការពារកុំឱ្យ reject ឬជាន់ code គ្នា។

4. **Safety Undo (`undo-push.sh` / `undo-push.ps1`)**:
   - បើសិនជាច្រឡំ push ខុស អាចដក commit ចុងក្រោយចេញវិញភ្លាមៗដោយរក្សាទុក code ក្នុង staging ដដែល។
