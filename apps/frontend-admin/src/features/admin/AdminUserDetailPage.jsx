import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading, ErrorState, Empty } from "../../components/States";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../lib/format";
import adminManagementService from "./adminManagementService";
import "./AdminFeature.css";

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const load = useCallback(async () => {
    const [user, invitations] = await Promise.all([
      adminManagementService.user(userId),
      adminManagementService.userInvitations(userId),
    ]);
    return { user, invitations };
  }, [userId]);
  const { data, loading, error, reload } = useResource(load);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState onRetry={reload} />;

  const { user, invitations } = data;

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{user.fullName || user.email || `User #${user.id}`}</h2>
          <p className="page-subtitle">User detail and owned invitations</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/users">Back</Link>
      </div>

      <section className="card" style={{ marginBottom: 18 }}>
        <div className="admin-detail-grid">
          <Cell label="Email" value={user.email} />
          <Cell label="Phone" value={user.phone} />
          <Cell label="Role" value={user.role} />
          <Cell label="Status" value={user.status} />
          <Cell label="Created" value={formatDate(user.createdAt)} />
          <Cell label="Updated" value={formatDate(user.updatedAt)} />
        </div>
      </section>

      <section className="card">
        <h3 className="page-title" style={{ fontSize: 16, marginBottom: 14 }}>Invitations</h3>
        {!invitations?.length ? <Empty label="No invitations" /> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Event date</th><th>Moderation</th></tr></thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>{invitation.id}</td>
                    <td><span className="font-medium text-slate-800 dark:text-zinc-200">{invitation.title || invitation.slug}</span></td>
                    <td>{invitation.status}</td>
                    <td>{formatDate(invitation.eventDate)}</td>
                    <td>{invitation.moderationStatus || "ACTIVE"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div className="admin-detail-cell">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}
