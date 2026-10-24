package com.koupreng.backend.admin.application;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.infrastructure.persistence.AdminReportReadRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.*;
import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/** Executes production SQL, service and file writers against an isolated database. */
class AdminReportingTests {
    JdbcTemplate jdbc;
    javax.sql.DataSource dataSource;
    AdminReportReadRepository repository;
    AdminReportingService reports;
    AdminReportSnapshotWriter writer;
    AdminReportExportService exports;
    AppUser admin;
    Authentication auth;
    static final Instant NOW = Instant.parse("2026-10-15T10:00:00Z");
    @BeforeEach void setup() {
        var data = new DriverManagerDataSource("jdbc:h2:mem:" + UUID.randomUUID() + ";MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE", "sa", "");
        dataSource=data;
        new ResourceDatabasePopulator(new ClassPathResource("admin-reporting-fixture.sql")).execute(data);
        jdbc = new JdbcTemplate(data);
        var current = mock(CurrentUserService.class);
        admin = new AppUser(); admin.setId(1L); admin.setFullName("Admin fixture"); admin.setRole(Role.ADMIN);
        auth = UsernamePasswordAuthenticationToken.authenticated("1", "unused", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        when(current.currentUser(any())).thenReturn(admin);
        repository=spy(new AdminReportReadRepository(new NamedParameterJdbcTemplate(data)));
        reports = new AdminReportingService(repository, current);
        writer = new AdminReportSnapshotWriter(reports); exports = new AdminReportExportService(reports, writer);
    }
    AdminReportQuery query() {
        var q = new AdminReportQuery(); q.setFrom(LocalDate.of(2026,10,15)); q.setTo(LocalDate.of(2026,10,16)); return q;
    }
    AdminReportFilter filter(String code, AdminReportQuery q) { return AdminReportFilter.of(AdminReportCatalog.definition(code),q,NOW); }
    AdminReportResponse report(String code, AdminReportQuery q) { return reports.snapshot(code,filter(code,q),"fixture-snapshot"); }
    @SuppressWarnings("unchecked") Map<String,Object> row(AdminReportResponse report, Object id) {
        return (Map<String,Object>) report.getRows().stream().filter(value -> ((Map<?,?>)value).get("id").toString().trim().equals(id.toString())).findFirst().orElseThrow();
    }
    BigDecimal money(AdminReportResponse report, String metric, String currency) { return new BigDecimal(((Map<?,?>)report.getFilteredSummary().get(metric)).get(currency).toString()); }
    @Test void everyFamilyExecutesRealSqlWithItsDeclaredProjection() {
        for (var definition : AdminReportCatalog.DEFINITIONS) {
            var response = report(definition.code(),query());
            try { var mapper = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules(); mapper.writeValue(evidence().resolve(definition.code()+".json").toFile(),response); }
            catch(IOException error) { throw new java.io.UncheckedIOException(error); }
            assertThat(response.getDefinition()).isEqualTo(definition);
            assertThat(response.getRows()).as(definition.code()).isNotEmpty();
            for (var value : response.getRows()) assertThat(((Map<?,?>)value).keySet().stream().map(Object::toString).toList())
                .containsExactlyInAnyOrderElementsOf(definition.columns().stream().map(AdminReportingModels.Column::key).toList());
        }
    }
    @Test void catalogEvidence() throws Exception {
        new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules().writeValue(evidence().resolve("definitions.json").toFile(),Map.of("definitions",AdminReportCatalog.DEFINITIONS,"metrics",AdminReportCatalog.METRICS));
        for(var definition:AdminReportCatalog.DEFINITIONS) for(String format:List.of("csv","html")) {
            try(var file=writer.generate(auth,new AdminReportExportService.Plan(definition.code(),format,filter(definition.code(),query()),"fixture-document"))) {
                Files.copy(file.path(),evidence().resolve(definition.code()+"."+format),StandardCopyOption.REPLACE_EXISTING);
            }
        }
        for(String currency:List.of("USD","KHR")) {
            var query=query();query.setCurrency(currency);
            var mapper=new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
            mapper.writeValue(evidence().resolve("payments-"+currency+".json").toFile(),report("payments",query));
            if(currency.equals("USD")) {query.setSort("expectedAmount");query.setDirection("ASC");}
            mapper.writeValue(evidence().resolve("payments-"+currency+"-sorted.json").toFile(),report("payments",query));
            for(String format:List.of("csv","html","xlsx")) try(var file=writer.generate(auth,new AdminReportExportService.Plan("payments",format,filter("payments",query),"currency-fixture"))) {
                Files.copy(file.path(),evidence().resolve("payments-"+currency+"."+format),StandardCopyOption.REPLACE_EXISTING);
                if(format.equals("csv")) assertThat(Files.readString(file.path())).doesNotContain(currency.equals("USD") ? ",\"KHR\"," : ",\"USD\",");
            }
        }
    }
    @Test void receiptsReconcileWithoutClaimsDuplicatesOrCrossCurrencyAddition() {
        var report = report("payments",query());
        assertThat(report.getTotalElements()).isEqualTo(14L);
        assertThat(money(report,"confirmedReceiptsByCurrency","USD")).isEqualByComparingTo("47");
        assertThat(money(report,"confirmedReceiptsByCurrency","KHR")).isEqualByComparingTo("40000");
        assertThat(money(report,"pendingValueByCurrency","USD")).isEqualByComparingTo("1044");
        assertThat(money(report,"failedValueByCurrency","USD")).isEqualByComparingTo("99");
        assertThat(row(report,"TEMPLATE-7").get("reconciliationOutcome")).isEqualTo("DUPLICATE");
        assertThat(row(report,"TEMPLATE-6").get("reconciliationOutcome")).isEqualTo("AMOUNT_MISMATCH");
        assertThat(row(report,"TEMPLATE-5").get("paidAmount")).isNull();
        assertThat(row(report,"SUBSCRIPTION-2").get("paidAmount")).isNull();
        assertThat(row(report,"TEMPLATE-2").get("reviewedBy")).isNull();
        assertThat(report.getSeries().getFirst().points()).allSatisfy(point -> { assertThat(point.get("suppressed")).isEqualTo(true); assertThat(point.get("amount")).isNull(); });
        assertThat(report("users",query()).getFilteredSummary().get("paidUsers").toString()).isEqualTo("1");
        jdbc.update("UPDATE template_payment_orders SET user_id=2,amount=0,paid_amount=0,confirm_source='MANUAL_ADMIN' WHERE id=5");
        assertThat(report("users",query()).getFilteredSummary().get("paidUsers").toString()).isEqualTo("1");
        assertThat(report("users",query()).getFilteredSummary().get("noVerifiedReceiptUsers").toString()).isEqualTo("1");
    }
    @Test void dateBoundariesArePhnomPenhInclusiveExclusiveAndDimensionSpecific() {
        var response=report("invitations",query());
        assertThat(response.getTotalElements()).isEqualTo(3);
        assertThat(row(response,1).get("createdAt")).isEqualTo(Instant.parse("2026-10-14T17:00:00Z"));
        var q=query();q.setDateDimension("eventDate");
        assertThat(report("invitations",q).getTotalElements()).isEqualTo(3);
        q=query();q.setDateDimension("createdAt");
        assertThat(money(report("payments",q),"confirmedReceiptsByCurrency","USD")).isEqualByComparingTo("35");
        q=query();q.setDateDimension("paidAt");
        assertThat(money(report("payments",q),"confirmedReceiptsByCurrency","USD")).isEqualByComparingTo("47");
    }
    @Test void guestRatesDeduplicateLatestScopedResponsesAndActiveCheckIns() {
        var response=report("engagement",query());var first=row(response,1);
        assertThat(((Number)first.get("rsvpCount")).intValue()).isEqualTo(1);
        assertThat(((Number)first.get("maybeCount")).intValue()).isEqualTo(1);
        assertThat(((Number)first.get("checkedInCount")).intValue()).isEqualTo(1);
        assertThat(new BigDecimal(first.get("rsvpRate").toString())).isEqualByComparingTo("0.5");
        assertThat(row(response,6).get("rsvpRate")).isNull();
        assertThat(first.get("deliveredCount")).isNull();
    }
    @Test void serverPaginationSearchAndTotalsPreserveFullFilterScope() {
        var q=query();q.setSize(1);q.setSort("id");q.setDirection("ASC");
        var page=report("invitations",q);assertThat(page.getRows()).hasSize(1);assertThat(page.getTotalElements()).isEqualTo(3);assertThat(page.getFilteredSummary().get("totalGuests").toString()).isEqualTo("3");
        q.setPage(1);assertThat(row(report("invitations",q),2)).isNotEmpty();
        q.setPage(0);q.setSearch("100%_");assertThat(report("invitations",q).getTotalElements()).isEqualTo(1);
        q.setSearch("' OR 1=1 --");assertThat(report("invitations",q).getTotalElements()).isZero();
        q=query();q.setCurrency("KHR");assertThat(report("payments",q).getTotalElements()).isEqualTo(1);
    }
    @Test void currentPageCsvUsesTheRequestedPageAndAuditsItsActualCount() throws Exception {
        var audit = mock(com.koupreng.backend.audit.application.AuditLogService.class);
        org.springframework.test.util.ReflectionTestUtils.setField(exports, "audit", audit);
        var q=query(); q.setSize(1); q.setPage(1); q.setSort("id"); q.setDirection("ASC");
        var plan=exports.plan(auth,"invitations","csv-page",q);
        assertThat(plan.currentPage()).isTrue();
        try(var file=writer.generate(auth,plan)) {
            assertThat(file.rowCount()).isEqualTo(1);
            var lines=Files.readAllLines(file.path());
            assertThat(lines).hasSize(2);
            assertThat(lines.get(1)).startsWith("\"2\",\"2\",");
        }
        var output=new ByteArrayOutputStream(); exports.stream(auth,plan,output);
        verify(audit).logAdminAction(eq(auth),eq("REPORT_EXPORT_COMPLETED"),eq("REPORT"),isNull(),anyString(),isNull(),argThat(values -> values instanceof Map<?,?> data && "CURRENT_PAGE".equals(data.get("scope")) && Long.valueOf(1).equals(data.get("rows"))));
    }
    @Test void effectiveSubscriptionsAndZeroBaselineGrowthAreTruthful() {
        assertThat(row(report("subscriptions",query()),1).get("activeState")).isEqualTo("ACTIVE");
        assertThat(row(report("subscriptions",query()),2).get("activeState")).isEqualTo("EXPIRED");
        jdbc.update("DELETE FROM invitations WHERE invitation_id=4");
        var summary=report("executive",query()).getFilteredSummary();
        assertThat(summary.get("periodGrowth")).isNull();assertThat(summary.get("growthState")).isEqualTo("NEW_ACTIVITY");
        assertThat(summary.get("activeUsers").toString()).isEqualTo("1");
        var earliest=new AdminReportQuery();earliest.setFrom(LocalDate.of(1970,1,1));earliest.setTo(LocalDate.of(1970,1,2));
        assertThat(report("executive",earliest).getFilteredSummary().get("growthState")).isEqualTo("NO_COMPARABLE_PERIOD");
    }
    @Test void duplicateOrdersAreExcludedBeforeProductFiltersAndFivePaymentGroupsAreVisible() {
        jdbc.update("UPDATE subscriptions SET order_code='ORDER-1' WHERE subscription_id=1");
        var q=query();q.setPaymentType("TEMPLATE");
        var snapshot=report("payments",q);
        assertThat(row(snapshot,"TEMPLATE-1").get("reconciliationOutcome")).isEqualTo("DUPLICATE");
        assertThat(money(snapshot,"confirmedReceiptsByCurrency","USD")).isEqualByComparingTo("12");
        var groups=AdminReportingService.suppressSmallGroups(List.of(Map.of("count",5,"amount",new BigDecimal("50"))));
        assertThat(groups.getFirst().get("suppressed")).isEqualTo(false);assertThat(groups.getFirst().get("amount")).isEqualTo(new BigDecimal("50"));
    }
    @Test void projectionsDoNotExposeContactsGuestIdentitiesOrRawBankEvidence() throws Exception {
        var mapper=new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
        for(var definition:AdminReportCatalog.DEFINITIONS) {
            String json=mapper.writeValueAsString(report(definition.code(),query()));
            assertThat(json).doesNotContain("private@example.test","\"passwordHash\"","\"email\"","\"phone\"","\"guestName\"","\"callbackPayload\"","\"telegramPayload\"","\"bankAccount\"");
        }
    }
    @Test void repeatableReadKeepsRowsAndSummaryConsistentAcrossConcurrentCommits() {
        var transaction = new org.springframework.transaction.support.TransactionTemplate(new org.springframework.jdbc.datasource.DataSourceTransactionManager(dataSource));
        transaction.setReadOnly(true);transaction.setIsolationLevel(org.springframework.transaction.TransactionDefinition.ISOLATION_REPEATABLE_READ);
        doAnswer(call -> {
            try(var connection=dataSource.getConnection();var statement=connection.createStatement()) { statement.executeUpdate("INSERT INTO invitations(invitation_id,title,event_type,status,moderation_status,created_at,deleted) VALUES(99,'Concurrent','WEDDING','DRAFT','ACTIVE','2026-10-15 00:00:00',false)"); }
            return call.callRealMethod();
        }).when(repository).rows(any(),any(),anyLong(),anyInt());
        transaction.executeWithoutResult(status -> {var snapshot=report("invitations",query());assertThat(snapshot.getTotalElements()).isEqualTo(3);assertThat(snapshot.getRows()).hasSize(3);});
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM invitations WHERE invitation_id=99",Long.class)).isEqualTo(1);
    }
    @Test void rejectsUntrustedFiltersAndInactiveOrNonAdminPrincipals() {
        var q=query();q.setSort("id;DROP TABLE users");assertThatThrownBy(() -> reports.report(auth,"invitations",q)).isInstanceOf(ApiException.class);
        var bad=query();bad.setDateDimension("eventDate");assertThatThrownBy(() -> reports.report(auth,"payments",bad)).isInstanceOf(ApiException.class);
        var unsupported=query();unsupported.setCurrency("USD");assertThatThrownBy(() -> exports.plan(auth,"all","xlsx",unsupported)).isInstanceOf(ApiException.class);
        var user=UsernamePasswordAuthenticationToken.authenticated("1","unused",List.of(new SimpleGrantedAuthority("ROLE_USER")));
        assertThatThrownBy(() -> reports.report(user,"payments",query())).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> exports.plan(user,"payments","xlsx",query())).isInstanceOf(ApiException.class);
        admin.setStatus(AppUser.STATUS_DISABLED);assertThatThrownBy(() -> reports.report(auth,"payments",query())).isInstanceOf(ApiException.class);
        admin.setStatus(AppUser.STATUS_ACTIVE);admin.setDeleted(true);assertThatThrownBy(() -> exports.plan(auth,"all","xlsx",query())).isInstanceOf(ApiException.class);
    }
    @Test void realWorkbookHasTypedDatesAmountsKhmerAndTrustedCurrencyFormulas() throws Exception {
        var plan=new AdminReportExportService.Plan("payments","xlsx",filter("payments",query()),"fixture-snapshot");
        try(var file=writer.generate(auth,plan);var book=new XSSFWorkbook(file.path().toFile())) {
            assertThat(book.getNumberOfSheets()).isEqualTo(4);
            var sheet=book.getSheet("Payments Ledger");assertThat(sheet.getLastRowNum()).isEqualTo(21);
            assertThat(sheet.getPaneInformation().isFreezePane()).isTrue();assertThat(sheet.getCTWorksheet().isSetAutoFilter()).isTrue();
            var columns=AdminReportCatalog.definition("payments").columns().stream().map(AdminReportingModels.Column::key).toList();
            assertThat(sheet.getRow(6).getCell(columns.indexOf("expectedAmount")+1).getCellType()).isEqualTo(CellType.NUMERIC);
            assertThat(DateUtil.isCellDateFormatted(sheet.getRow(6).getCell(columns.indexOf("createdAt")+1))).isTrue();
            var usd=sheet.getRow(20).getCell(2);assertThat(usd.getCellType()).isEqualTo(CellType.FORMULA);assertThat(usd.getNumericCellValue()).isEqualTo(47d);
            var evaluator=book.getCreationHelper().createFormulaEvaluator();assertThat(evaluator.evaluate(usd).getNumberValue()).isEqualTo(47d);
            assertThat(evaluator.evaluate(sheet.getRow(21).getCell(2)).getNumberValue()).isEqualTo(40000d);
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).contains("របាយការណ៍");
            Files.copy(file.path(), evidence().resolve("payments.xlsx"),StandardCopyOption.REPLACE_EXISTING);
        }
    }
    @Test void allWorkbookIncludesEveryFamilyAndExportsIgnoreUiPage() throws Exception {
        var q=query();q.setPage(20);q.setSize(1);
        var plan=new AdminReportExportService.Plan("all","xlsx",filter("executive",q),"full-fixture");
        try(var file=writer.generate(auth,plan);var book=new XSSFWorkbook(file.path().toFile())) {
            assertThat(book.getNumberOfSheets()).isEqualTo(11);
            for(var definition:AdminReportCatalog.DEFINITIONS) assertThat(book.getSheet(definition.sheetName())).isNotNull();
            assertThat(book.getSheet("Invitations").getLastRowNum()).isEqualTo(8);
            Files.copy(file.path(),evidence().resolve("all-reports.xlsx"),StandardCopyOption.REPLACE_EXISTING);
        }
    }
    @Test void csvAndHtmlPreserveScopeSanitizeAndCleanTemporaryFiles() throws Exception {
        jdbc.update("UPDATE invitations SET title=? WHERE invitation_id=1","\u200B =HYPERLINK(\"bad\") <script>alert(1)</script>");
        var q=query();q.setSize(1);q.setPage(2);
        for(String format:List.of("csv","html")) {
            Path temporary;
            try(var file=writer.generate(auth,new AdminReportExportService.Plan("invitations",format,filter("invitations",q),"safe-fixture"))) {
                temporary=file.path();var content=Files.readString(temporary,StandardCharsets.UTF_8);
                assertThat(content).contains("Birthday 100%_fixture");
                if(format.equals("html")) assertThat(content).contains("ALL FILTERED RECORDS");
                else assertThat(content.substring(1).lines().findFirst().orElseThrow()).startsWith("\"Row\",\"id\"");
                if(format.equals("csv")) { assertThat(content.charAt(0)).isEqualTo('\uFEFF');assertThat(content).contains("'\u200B =HYPERLINK"); }
                else { assertThat(content).doesNotContain("<script>").contains("&lt;script&gt;").contains("table-header-group"); }
                Files.copy(temporary,evidence().resolve("invitations."+format),StandardCopyOption.REPLACE_EXISTING);
            }
            assertThat(temporary).doesNotExist();
        }
    }
    @Test void legacyCsvPreservesHeaderOrderWithoutRetainingBufferedExports() throws Exception {
        for(String code:List.of("invitations","payments")) {
            try(var file=writer.generate(auth,exports.legacyCsvPlan(auth,code,query()))) {
                var content=Files.readString(file.path());
                assertThat(content).startsWith(code.equals("invitations") ? "\uFEFF\"ID\",\"Title\",\"Slug\",\"EventType\",\"Status\",\"ModerationStatus\",\"Owner\",\"EventDate\",\"Venue\",\"CreatedAt\",\"PublishedAt\"\r\n" : "\uFEFF\"Reference\",\"Type\",\"PackageName\",\"Amount\",\"Currency\",\"Status\",\"Provider\",\"CreatedAt\"\r\n");
                if(code.equals("payments")) assertThat(content).contains("\"ORDER-5\",\"TEMPLATE\",\"Legacy package\",\"\",\"USD\",\"PAID\"");
                else assertThat(content).contains("fixture-slug");
            }
        }
    }
    @Test void oversizedPrintAndDisconnectedClientCleanTheirSnapshotFiles() throws Exception {
        var spyReports=spy(reports);var snapshot=report("invitations",query());snapshot.setTotalElements(20_001L);
        doReturn(snapshot).when(spyReports).snapshot(anyString(),any(),anyString());
        var before=temporaryReports();
        assertThatThrownBy(() -> new AdminReportSnapshotWriter(spyReports).generate(auth,new AdminReportExportService.Plan("invitations","html",filter("invitations",query()),"too-large"))).isInstanceOf(ApiException.class).hasMessageContaining("20,000");
        assertThat(temporaryReports()).isEqualTo(before);
        assertThatThrownBy(() -> exports.stream(auth,exports.plan(auth,"invitations","csv",query()),new OutputStream(){@Override public void write(int value) throws IOException {throw new IOException("Client disconnected");}})).isInstanceOf(IOException.class);
        assertThat(temporaryReports()).isEqualTo(before);
    }
    Set<Path> temporaryReports() throws IOException {
        try(var files=Files.list(Path.of(System.getProperty("java.io.tmpdir")))) {return files.filter(path -> path.getFileName().toString().startsWith("koupreng-report-")).collect(java.util.stream.Collectors.toSet());}
    }
    @Test void largeWorkbookUsesAllBatchesAndContinuationSheetsWithoutTruncation() throws Exception {
        jdbc.batchUpdate("INSERT INTO invitations(invitation_id,title,user_id,template_id,event_type,status,moderation_status,created_at,deleted) VALUES(?, ?, 1, 1,'WEDDING','DRAFT','ACTIVE','2026-10-15 00:00:00',false)",
            java.util.stream.LongStream.range(100,2600).mapToObj(id -> new Object[]{id,id==100 ? "\u200B=1+1" : "កម្មវិធីវែង ".repeat(8)+id}).toList());
        var plan=new AdminReportExportService.Plan("invitations","xlsx",filter("invitations",query()),"large-fixture");
        var bytes=new ByteArrayOutputStream();new AdminReportWorkbookWriter(reports,506).write(plan,bytes);
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(bytes.toByteArray()))) {
            int count=0;boolean foundSafe=false;
            for(Sheet sheet:book) if(sheet.getSheetName().startsWith("Invitations")) for(int i=6;i<=sheet.getLastRowNum();i++) {
                count++;var title=sheet.getRow(i).getCell(2);if(title.getStringCellValue().contains("=1+1")) {assertThat(title.getCellType()).isEqualTo(CellType.STRING);assertThat(title.getStringCellValue()).startsWith("'");foundSafe=true;}
            }
            assertThat(count).isEqualTo(2503);assertThat(foundSafe).isTrue();
        }
        Files.write(evidence().resolve("large-invitations.xlsx"),bytes.toByteArray());
        jdbc.update("DELETE FROM invitations WHERE invitation_id>=160");
        try(var file=writer.generate(auth,new AdminReportExportService.Plan("invitations","html",plan.filter(),"large-print"))) { Files.copy(file.path(),evidence().resolve("large-invitations.html"),StandardCopyOption.REPLACE_EXISTING); }
    }
    @Test void financialContinuationSheetsHaveCorrectCachedAndCalculatedCurrencySubtotals() throws Exception {
        jdbc.batchUpdate("INSERT INTO template_payment_orders(id,order_code,payway_transaction_id,user_id,template_id,template_name,status,amount,paid_amount,currency,created_at,paid_at,confirm_source,confirmed_at) VALUES(?,?,?,1,1,'Large fixture','PAID',1,1,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00')",
            java.util.stream.LongStream.range(100,600).mapToObj(id -> new Object[]{id,"LARGE-"+id,"LARGE-REF-"+id}).toList());
        var plan=new AdminReportExportService.Plan("payments","xlsx",filter("payments",query()),"large-financial");
        var output=new ByteArrayOutputStream();new AdminReportWorkbookWriter(reports,106).write(plan,output);
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(output.toByteArray()))) {
            var keys=AdminReportCatalog.definition("payments").columns().stream().map(AdminReportingModels.Column::key).toList();
            var evaluator=book.getCreationHelper().createFormulaEvaluator();int records=0;double total=0;
            for(Sheet sheet:book) if(sheet.getSheetName().startsWith("Payments Ledger")) {
                double expected=0;Cell formula=null;
                for(int i=6;i<=sheet.getLastRowNum();i++) {
                    var row=sheet.getRow(i);
                    if(row.getCell(0).getCellType()==CellType.NUMERIC) {
                        records++;
                        if("MATCHED".equals(row.getCell(keys.indexOf("reconciliationOutcome")+1).getStringCellValue()) && "USD".equals(row.getCell(keys.indexOf("currency")+1).getStringCellValue())) expected+=row.getCell(keys.indexOf("paidAmount")+1).getNumericCellValue();
                    } else if(row.getCell(0).getStringCellValue().startsWith("Verified USD")) formula=row.getCell(2);
                }
                assertThat(formula).isNotNull();assertThat(formula.getNumericCellValue()).isEqualTo(expected);assertThat(evaluator.evaluate(formula).getNumberValue()).isEqualTo(expected);total+=expected;
            }
            assertThat(records).isEqualTo(514);assertThat(total).isEqualTo(547d);
        }
        Files.write(evidence().resolve("large-payments.xlsx"),output.toByteArray());
    }
    static Path evidence() throws IOException {
        Path root=Path.of("").toAbsolutePath();while(!Files.isDirectory(root.resolve("apps"))) root=root.getParent();
        Path directory=root.resolve("output/admin-reporting");Files.createDirectories(directory);return directory;
    }
}
