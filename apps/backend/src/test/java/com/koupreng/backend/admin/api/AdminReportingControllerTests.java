package com.koupreng.backend.admin.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.application.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties={"app.waf.max-requests-per-minute=1000"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminReportingControllerTests {
    @Autowired MockMvc mvc;
    @MockitoBean AdminReportingService reports;
    @MockitoBean AdminReportExportService exports;
    @MockitoBean com.koupreng.backend.audit.application.AuditLogService audit;
    static final String BASE="/api/v1/admin/reports/management";
    @Test void anonymousCannotReadOrExportReports() throws Exception {
        for(String path:List.of("/definitions","/payments","/payments/export/xlsx","/all/export/xlsx")) mvc.perform(get(BASE+path)).andExpect(status().isUnauthorized());
        verifyNoInteractions(reports,exports);
    }
    @Test @WithMockUser(roles="USER") void customersCannotReadOrExportReports() throws Exception {
        for(String path:List.of("/definitions","/payments","/payments/export/csv","/invitations/export/html")) mvc.perform(get(BASE+path)).andExpect(status().isForbidden());
        verifyNoInteractions(reports,exports);
    }
    @Test @WithMockUser(roles="STAFF") void staffDoesNotInheritFinancialAdministratorAccess() throws Exception {
        mvc.perform(get(BASE+"/payments")).andExpect(status().isForbidden());
        mvc.perform(get(BASE+"/all/export/xlsx")).andExpect(status().isForbidden());
        verifyNoInteractions(reports,exports);
    }
    @Test @WithMockUser(roles="ADMIN") void adminGetsVersionedDefinitionsAndBoundQueryParameters() throws Exception {
        mvc.perform(get(BASE+"/definitions")).andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
            .andExpect(jsonPath("$.data.definitions.length()").value(10));
        when(reports.report(any(),eq("payments"),any())).thenReturn(AdminReportResponse.builder().report("payments").rows(List.of()).build());
        mvc.perform(get(BASE+"/payments").param("from","2026-10-15").param("to","2026-10-16").param("dateDimension","paidAt").param("currency","KHR").param("sort","paidAt").param("direction","ASC").param("page","2").param("size","50"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.report").value("payments"));
        var query=org.mockito.ArgumentCaptor.forClass(AdminReportQuery.class);verify(reports).report(any(),eq("payments"),query.capture());
        org.assertj.core.api.Assertions.assertThat(query.getValue().getFrom()).isEqualTo(LocalDate.of(2026,10,15));
        org.assertj.core.api.Assertions.assertThat(query.getValue().getCurrency()).isEqualTo("KHR");
        org.assertj.core.api.Assertions.assertThat(query.getValue().getPage()).isEqualTo(2);
    }
    @Test @WithMockUser(roles="ADMIN") void exportsUseSafeMimeAndAttachmentHeadersAndStreamAfterPlanning() throws Exception {
        var filter=AdminReportFilter.of(AdminReportCatalog.definition("payments"),new AdminReportQuery(),Instant.parse("2026-10-15T10:00:00Z"));
        var plan=new AdminReportExportService.Plan("payments","csv",filter,"http-snapshot");
        when(exports.plan(any(),eq("payments"),eq("csv"),any())).thenReturn(plan);
        doAnswer(call -> { ((java.io.OutputStream)call.getArgument(2)).write("\uFEFF\"id\"\r\n\"1\"".getBytes(java.nio.charset.StandardCharsets.UTF_8)); return null; }).when(exports).stream(any(),eq(plan),any());
        var result=mvc.perform(get(BASE+"/payments/export/csv")).andExpect(request().asyncStarted()).andReturn();
        mvc.perform(asyncDispatch(result)).andExpect(status().isOk()).andExpect(content().contentType("text/csv;charset=UTF-8"))
            .andExpect(header().string("X-Content-Type-Options","nosniff"))
            .andExpect(header().string("X-Report-Snapshot-Id","http-snapshot"))
            .andExpect(header().string("Content-Disposition","attachment; filename=\"koupreng-payments-2026-10-15.csv\""))
            .andExpect(content().string("\uFEFF\"id\"\r\n\"1\""));
    }
}
