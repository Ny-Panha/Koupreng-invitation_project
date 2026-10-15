import { reportText } from "../reportModel";
import ReportLedger from "./ReportLedger";

export default function SystemHealthSection({
  report,
  lang,
  children,
  ...props
}) {
  return (
    <div className="space-y-4">
      <p className="card report-scope-note">
        {reportText("systemScope", lang)}
      </p>
      {children}
      <ReportLedger report={report} lang={lang} {...props} />
    </div>
  );
}
