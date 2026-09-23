import { useEffect, useState } from "react";
import adminService from "../../shared/api/adminService";

export default function AdminPackagesFeature() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminService.packages()
      .then((data) => active && setPackages(Array.isArray(data) ? data : []))
      .catch((loadError) => active && setError(loadError.message || "Could not load packages."));
    return () => { active = false; };
  }, []);

  return (
    <main className="admin-page">
      <header className="page-head">
        <div>
          <h1 className="page-title">Packages</h1>
          <p className="page-subtitle">Manage subscription packages and limits.</p>
        </div>
      </header>
      {error && <p role="alert">{error}</p>}
      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Code</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {packages.map((item) => (
              <tr key={item.id}><td>{item.packageName}</td><td>{item.code}</td><td>{item.price} {item.currency}</td><td>{item.active ? "Active" : "Inactive"}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}