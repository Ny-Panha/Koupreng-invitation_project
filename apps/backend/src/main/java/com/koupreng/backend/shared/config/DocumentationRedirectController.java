package com.koupreng.backend.shared.config;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Preserve documentation bookmarks without shipping a second, vulnerable UI bundle. */
@Hidden
@Controller
@ConditionalOnProperty(name = {"springdoc.api-docs.enabled", "scalar.enabled", "springdoc.swagger-ui.enabled"}, havingValue = "true")
public class DocumentationRedirectController {

    @GetMapping({"/swagger-ui.html", "/swagger-ui/index.html"})
    public String documentation() {
        return "redirect:/docs";
    }
}
