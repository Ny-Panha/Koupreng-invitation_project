"""Inspect actual Chromium PDFs; PyMuPDF is a local QA tool, not an app dependency."""
import json
import csv
import zipfile
import sys
from decimal import Decimal
from xml.etree import ElementTree
from pathlib import Path

root = Path(__file__).resolve().parents[2]
directory = root / "output/admin-reporting"
sys.path.insert(0, str(directory / "pdf-tools"))
import pymupdf as fitz

results = []
for path in sorted(directory.glob("*.pdf")):
    document = fitz.open(path)
    pages = []
    for index, page in enumerate(document):
        text = page.get_text()
        assert len(text.strip()) > 100, (path.name, index + 1, "blank or nearly blank page")
        clipped = [block[:4] for block in page.get_text("blocks") if block[0] < -1 or block[1] < -1 or block[2] > page.rect.width + 1 or block[3] > page.rect.height + 1]
        assert not clipped, (path.name, index + 1, "text outside paper", clipped)
        assert abs(page.rect.width - (595.28 if "portrait" in path.name else 841.89)) < 1, (path.name, "wrong A4 orientation")
        pages.append({"page": index + 1, "textCharacters": len(text), "tableHeader": "Invitation ID" in text, "width": page.rect.width, "height": page.rect.height})
    all_text = "\n".join(page.get_text() for page in document)
    assert any("\u1780" <= char <= "\u17ff" for char in all_text), (path.name, "Khmer text absent")
    fonts = {item[3]: len(document.extract_font(item[0])[3]) for page in document for item in page.get_fonts()}
    assert any("Kantumruy" in name and size > 0 for name, size in fonts.items()), (path.name, "Khmer font not embedded", fonts)
    if path.name.startswith("large"):
        assert len(document) >= 3
        assert sum(page["tableHeader"] for page in pages) >= 3, "Table headers did not repeat"
    for index in sorted({0, min(1, len(document) - 1), min(2, len(document) - 1), len(document) - 1}):
        document[index].get_pixmap(matrix=fitz.Matrix(1.4, 1.4)).save(directory / f"{path.stem}-page-{index + 1}.png")
    results.append({"file": path.name, "pageCount": len(document), "embeddedFonts": fonts, "selectableKhmerText": True, "outsidePaperBlocks": 0, "pages": pages})
assert results, "No PDFs found; run admin-reporting-browser.mjs first"
(directory / "pdf-inspection.json").write_text(json.dumps(results, indent=2), encoding="utf8")
print(json.dumps([{key: value for key, value in item.items() if key != "pages"} for item in results], indent=2))

# Reopen the bytes downloaded by the browser, independently of the source files.
workbooks = []
namespace = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
for name, expected_sheets in [("browser-xlsx.xlsx", 4), ("browser-all-reports.xlsx", 11)]:
    with zipfile.ZipFile(directory / name) as archive:
        assert archive.testzip() is None, (name, "corrupt ZIP member")
        workbook = ElementTree.fromstring(archive.read("xl/workbook.xml"))
        sheets = [sheet.attrib["name"] for sheet in workbook.findall("s:sheets/s:sheet", namespace)]
        assert len(sheets) == expected_sheets, (name, sheets)
        workbooks.append({"file": name, "sheets": sheets, "zipCrcValid": True})
with (directory / "browser-csv.csv").open(encoding="utf-8-sig", newline="") as stream:
    rows = list(csv.reader(stream))
header = next(index for index, row in enumerate(rows) if row and row[0] == "Row")
columns = rows[header]
records = [dict(zip(columns, row)) for row in rows[header + 1:] if row]
assert len(records) == 12
assert {record["currency"] for record in records} == {"USD"}
receipts = sum(Decimal(record["paidAmount"]) for record in records if record["reconciliationOutcome"] == "MATCHED")
assert receipts == Decimal("47")
for name in ["browser-csv.csv", "browser-current-page.csv"]:
    assert (directory / name).read_bytes().startswith(b"\xef\xbb\xbf")
(directory / "download-inspection.json").write_text(json.dumps({"workbooks": workbooks, "filteredCsvRecords": len(records), "verifiedUsdFromCsv": str(receipts), "csvBomValid": True}, indent=2), encoding="utf8")
print("Browser downloads: valid native workbooks, complete 12-row USD CSV, matched receipts 47 USD, UTF-8 BOMs")
