import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminService from "../../shared/api/adminService";

export default function AdminUserDetailFeature() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.user(userId).then(setUser).catch((loadError) => setError(loadError.message || "Could not load user."));
  }, [userId]);

  return (
    <main className="admin-page">
      <h1 className="page-title">User Details</h1>
      {error && <p role="alert">{error}</p>}
      {user && <p>{user.fullName || user.email}</p>}
    </main>
  );
}