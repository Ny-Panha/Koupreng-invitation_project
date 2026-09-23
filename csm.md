# Koupreng Invitation — CMS & Media Architecture Guide

## 1. ស្ថាបត្យកម្ម Headless CMS សម្រាប់ Koupreng

Project **Koupreng-invitation_project** ត្រូវអនុវត្តតាមទម្រង់ **Headless CMS** (មិនមែន Traditional CMS ដូច WordPress ចាស់ទេ)៖

```
                    ┌────────────────────────┐
                    │      Spring Boot       │
                    │      Backend API       │
                    │ (PostgreSQL / Storage) │
                    └───────────┬────────────┘
                                │ REST API
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  frontend-admin  │  │  frontend-user   │  │   telegram-bot   │
│  (CMS Dashboard) │  │(Digital Invites) │  │  (Notification)  │
│  - Manage Posts  │  │  - View Theme    │  │  - RSVP Alerts   │
│  - Upload Media  │  │  - Submit RSVP   │  │  - QR Check-in   │
│  - Set Templates │  │  - View Music    │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

- **Backend (Spring Boot)**: ធ្វើជា **Content Hub** រក្សាទុកទិន្នន័យ (Templates, RSVPs, Guests, Media URLs) និងបាញ់ចេញតាម REST API។
- **Frontend Admin**: ដើរតួជា **CMS Admin Panel** សម្រាប់ Host/Admin គ្រប់គ្រង content, upload រូប, ជ្រើស template។
- **Frontend User**: ទទួលទិន្នន័យពី API មក Render សំបុត្រអញ្ជើញ (Mobile-first digital invitation)។

---

## 2. Image & Media Guidelines (ស្តង់ដារទំហំរូបភាព)

ដើម្បីឱ្យ Digital Invitation បើកលើទូរស័ព្ទលឿន (Fast Loading) និងច្បាស់ស្អាត៖

| ប្រភេទរូបភាព | ទំហំស្តង់ដារ (Width x Height) | Aspect Ratio | គោលបំណងក្នុង Koupreng |
|---|---|---|---|
| **Background / Hero Cover** | `1920 x 1080 px` | 16:9 | រូបផ្ទៃខាងក្រោយ ឬ Header Banner លើកុំព្យូទ័រ/Tablet |
| **Invitation Card (Portrait)** | `900 x 1200 px` | 3:4 | រូបគូស្នេហ៍ / សំបុត្រអញ្ជើញលើ Mobile Screen (សំខាន់បំផុត) |
| **Gallery / Venue (Landscape)**| `1200 x 900 px` | 4:3 | រូបថត Pre-wedding gallery, ប្លង់ទីតាំង Venue |
| **Thumbnail / Avatar** | `150 x 150 px` | 1:1 | រូប Profile ភ្ញៀវ, QR code avatar, icon |
| **Logo / Monogram** | `200 x 100 px` | 2:1 | អក្សរកាត់ឈ្មោះកូនកំលោះ-កូនក្រមុំ (PNG Transparent) |

---

## 3. វឌ្ឍនភាពអនុវត្តជាក់ស្តែង & អ្វីដែលត្រូវធ្វើបន្ត

### ក. បានអនុវត្តរួចរាល់ (Completed Fixes ✓)
1. **Frontend Admin Media Hardening**:
   - កែសម្រួលទំហំកំណត់អតិបរមាពី 8MB មកត្រឹម **5MB** ឱ្យត្រូវតាម Backend Security Policy ([AdminTemplatesPage.jsx](file:///home/kali/Desktop/Project/Koupreng-invitation_project/apps/frontend-admin/src/features/admin/AdminTemplatesPage.jsx), [AdminTemplateEditPage.jsx](file:///home/kali/Desktop/Project/Koupreng-invitation_project/apps/frontend-admin/src/features/admin/AdminTemplateEditPage.jsx))។
   - បិទការ Upload file `.svg` ដើម្បីការពារ XSS Vulnerability និងត្រូវតាម Backend `FileUploadValidator`។
   - បញ្ចូល Image Size Guide (Cover: 1920x1080/900x1200, Gallery: 1200x900, QR: 500x500)។

2. **Frontend User Media Optimization**:
   - បន្ថែម Client-side file validation (រូបភាព < 5MB, វីដេអូ < 50MB, តន្ត្រី < 15MB, reject SVG) ក្នុង [InvitationMediaManager.jsx](file:///home/kali/Desktop/Project/Koupreng-invitation_project/apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx)។
   - បង្ហាញ Image Size Guide Hints លើគ្រប់ Form Upload (Cover, Gallery, Video, Background Music)។

### ខ. ជំហានបន្តបន្ទាប់ (Next Steps)
1. **Backend Admin Template Upload API**:
   - បន្ថែម endpoint `POST /api/v1/admin/templates/media/upload` សម្រាប់ឱ្យ Admin upload រូប template ទៅរក្សាទុកក្នុង local storage/Cloudinary ផ្ទាល់ ជៀសវាងការប្រើ Base64 វែងៗក្នុង database។
2. **Auto WebP Compression**:
   - បន្ថែម Java ImageIO ឬ WebP converter ក្នុង Backend ដើម្បី auto-compress រូបមុន save ចូល storage។
