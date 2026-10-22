import path from 'node:path';
import process from 'node:process';

export function phase2EvidencePath(testInfo, filename) {
  return process.env.PHASE2_EVIDENCE_DIR
    ? path.join(process.env.PHASE2_EVIDENCE_DIR, filename)
    : testInfo.outputPath(filename);
}
