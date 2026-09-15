# API contracts

`openapi.yaml` is a generated, reviewable snapshot of the backend's runtime springdoc document.
The backend verification suite fails when the snapshot drifts from `/v3/api-docs.yaml`.

From `apps/backend`, regenerate it after an intentional API change:

```bash
./mvnw -Dtest=OpenApiIntegrationTests -Dopenapi.contract.update=true test
```

On Windows PowerShell, use `./mvnw.cmd` instead. Always review the resulting contract diff before committing it.
