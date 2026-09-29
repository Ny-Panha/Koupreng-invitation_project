import { useNavigate, useParams } from "react-router-dom";
import AdminReportOverview from "../../features/reports/AdminReportOverview";
import FinancialReport from "../../features/reports/FinancialReport";

export default function AdminReportsPage() {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  return invitationId
    ? <FinancialReport
        initialInvitationId={invitationId}
        onInvitationChange={(selectedId) => navigate(selectedId ? `/reports/${encodeURIComponent(selectedId)}` : "/reports")}
      />
    : <AdminReportOverview />;
}
