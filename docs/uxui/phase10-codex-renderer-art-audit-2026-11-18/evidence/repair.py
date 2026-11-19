"""Exact source transformations applied by Codex; baseline copies are in raw evidence."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / 'apps/frontend-user/src/features/templates'

def change(name, replacements):
    path = BASE / name
    text = path.read_text(encoding='utf-8')
    for old, new in replacements:
        if old not in text:
            raise RuntimeError(f'Missing expected source in {name}: {old[:100]}')
        text = text.replace(old, new, 1)
    path.write_text(text, encoding='utf-8', newline='\n')

def replace_block(name, start, end, replacement):
    path = BASE / name
    text = path.read_text(encoding='utf-8')
    a = text.index(start)
    b = text.index(end, a)
    path.write_text(text[:a] + replacement + text[b:], encoding='utf-8', newline='\n')

boiler = 'layouts/TemplateBoilerplate/TemplateBoilerplateLayout.jsx'
change(boiler, [('import InvitationLabel', 'import InvitationLightbox from "../../shared/Gallery/InvitationLightbox";\nimport DemoRsvpNotice from "../../shared/RSVP/DemoRsvpNotice";\nimport InvitationLabel'), ('  X,\n  ChevronLeft,\n  ChevronRight,\n', ''), ('  const [lightboxImg, setLightboxImg] = useState(null);\n  const [lightboxIdx, setLightboxIdx] = useState(0);\n  const triggerRef = useRef(null);', '  const [lightboxIdx, setLightboxIdx] = useState(null);')])
replace_block(boiler, '  const openLightbox = ', '  // Local RSVP submission state', '  const openLightbox = (_img, index) => setLightboxIdx(index);\n  const closeLightbox = () => setLightboxIdx(null);\n\n')
change(boiler, [('{children ? (', '{children ? ('), ('                            <p className="text-sm font-bold text-amber-300">អរគុណសម្រាប់ការបញ្ជាក់ការចូលរួម!</p>\n                            <p className="text-xs text-zinc-400">យើងខ្ញុំទទួលបានការឆ្លើយតបរបស់លោកអ្នករួចរាល់ហើយ។</p>', '                            <DemoRsvpNotice completed />'), ('                          <form\n                            onSubmit=', '                          <form\n                            onSubmit='), ('                            className="space-y-3"\n                          >', '                            className="space-y-3"\n                          >\n                            <DemoRsvpNotice />')])
replace_block(boiler, '      {/* Accessible Lightbox Modal */}', '\n    </div>\n  );\n}', '      <InvitationLightbox images={galleryList} index={lightboxIdx} onIndexChange={setLightboxIdx} onClose={closeLightbox} />')

withjoy = 'layouts/WithJoyPortalLayout.jsx'
change(withjoy, [('import InvitationLabel', 'import InvitationLightbox from "../shared/Gallery/InvitationLightbox";\nimport DemoRsvpNotice from "../shared/RSVP/DemoRsvpNotice";\nimport InvitationLabel'), ('useState, useEffect, useRef, useCallback', 'useState, useEffect'), ('  X,\n', '')])
replace_block(withjoy, '  const triggerRef = ', '  // RSVP Form state', '  const openPhoto = index => setActivePhoto(index);\n  const closePhoto = () => setActivePhoto(null);\n\n')
change(withjoy, [('onClick={(e) => openPhoto(src, e)}', 'onClick={() => openPhoto(i)}'), ('                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--wj-primary)", marginBottom: "0.5rem" }}><InvitationLabel value={"សូមអរគុណសម្រាប់ការឆ្លើយតប!"} /></h3>\n                <p style={{ color: "var(--wj-text-muted)", lineHeight: "1.6" }}>\n                  យើងខ្ញុំទទួលបានការបញ្ជាក់របស់លោកអ្នករួចរាល់ហើយ។ រីករាយនឹងជួបលោកអ្នកក្នុងថ្ងៃមង្គលការ!\n                </p>', '                <DemoRsvpNotice completed />'), ('              <form onSubmit={handleRsvpSubmit}>', '              <form onSubmit={handleRsvpSubmit}>\n                <DemoRsvpNotice />')])
replace_block(withjoy, '      {/* Accessible Lightbox Modal */}', '      {/* Venue Section */}', '      <InvitationLightbox images={galleryImages} index={activePhoto} onIndexChange={setActivePhoto} onClose={closePhoto} />\n\n')

bliss = 'layouts/BlissEditorialLayout.jsx'
change(bliss, [('import InvitationLabel', 'import DemoRsvpNotice from "../shared/RSVP/DemoRsvpNotice";\nimport InvitationLabel'), ('            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}><InvitationLabel value={"សូមអរគុណសម្រាប់ការឆ្លើយតប!"} /></h3>\n            <p style={{ color: "var(--bliss-taupe)", fontSize: "0.9rem" }}>\n              យើងខ្ញុំទន្ទឹងរង់ចាំទទួលស្វាគមន៍លោកអ្នកក្នុងថ្ងៃមង្គលការ។\n            </p>', '            <DemoRsvpNotice completed />'), ('          <form onSubmit={handleRsvpSubmit}>', '          <form onSubmit={handleRsvpSubmit}>\n            <DemoRsvpNotice />')])

digital = 'layouts/DigitalYes/components/DigitalYesRsvpModal.jsx'
change(digital, [('import InvitationLabel', 'import DemoRsvpNotice from "../../../shared/RSVP/DemoRsvpNotice";\nimport InvitationLabel'), ('          <h5 className="text-sm font-bold text-emerald-300"><InvitationLabel value={"អរគុណសម្រាប់ការឆ្លើយតប!"} /></h5>\n          <p className="text-xs text-emerald-200/80 mt-1">\n            ព័ត៌មានត្រូវបានកត់ត្រាដោយជោគជ័យ។ ជួបគ្នាក្នុងថ្ងៃពិសេស!\n          </p>', '          <DemoRsvpNotice completed />'), ('        <form onSubmit={handleSubmit} className="space-y-4">', '        <form onSubmit={handleSubmit} className="space-y-4">\n          <DemoRsvpNotice />')])

shared = 'shared/RSVP/RsvpContainer.jsx'
change(shared, [('import { useState }', 'import DemoRsvpNotice from "./DemoRsvpNotice";\nimport { useState }'), ('          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "8px" }}>\n            {labels.thankYou}\n          </h3>\n          <p style={{ fontSize: "0.95rem", opacity: 0.8, marginBottom: "16px" }}>\n            {labels.thankYouDesc}\n          </p>', '          <DemoRsvpNotice completed />'), ('        <form onSubmit={handleSubmit} className="rsvp-form-grid"', '        <form onSubmit={handleSubmit} className="rsvp-form-grid"'), ('gap: "14px" }}>\n          <div>', 'gap: "14px" }}>\n          <DemoRsvpNotice />\n          <div>')])

canva = 'experience/components/canva-khmer/CanvaKhmerWeddingTemplate.jsx'
change(canva, [('        if (preview) setOpened(true);\n    }, [preview]);', '        if (preview) setOpened(!previewStartClosed);\n    }, [preview, previewStartClosed]);'), ('        if (!opened || preview) return undefined;\n        const frame = window.requestAnimationFrame(() => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));', '        if (!opened) return undefined;\n        const frame = window.requestAnimationFrame(() => {\n            canvasRef.current?.querySelector("main")?.focus({ preventScroll: true });\n            if (!preview) heroRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });\n        });'), ('    }, [opened, preview]);', '    }, [opened, preview, reduced]);'), ('<motion.main key="invitation" className="ck-invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>', '<motion.main key="invitation" tabIndex={-1} className="ck-invitation" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>')])

# Update an inherited assertion that explicitly required the false receipt.
change('layouts/TemplateBoilerplate/TemplateBoilerplateLayout.test.jsx', [('expect(screen.getByText(/អរគុណសម្រាប់ការបញ្ជាក់ការចូលរួម/)).toBeInTheDocument();', 'expect(screen.getByRole("status")).toHaveTextContent("Nothing has been sent to the host");')])
