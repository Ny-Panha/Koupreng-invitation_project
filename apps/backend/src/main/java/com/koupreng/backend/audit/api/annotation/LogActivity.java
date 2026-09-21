package com.koupreng.backend.audit.api.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface LogActivity {
    String action();
    String targetEntity() default "";
    boolean captureRequestBody() default false;
}
