package com.rajpipes.billing.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({
            "/",
            "/bills/**",
            "/sales",
            "/credit"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
