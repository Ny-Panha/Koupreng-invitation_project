package com.koupreng.backend.shared.security.waf;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import org.springframework.http.MediaType;

class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {

    private final byte[] body;

    CachedBodyHttpServletRequest(HttpServletRequest request, byte[] body) {
        super(request);
        this.body = body.clone();
    }

    @Override
    public ServletInputStream getInputStream() {
        return new CachedBodyServletInputStream(body);
    }

    @Override
    public BufferedReader getReader() {
        return new BufferedReader(new InputStreamReader(getInputStream(), requestCharset()));
    }

    private Charset requestCharset() {
        String contentType = getContentType();
        if (contentType == null || contentType.isBlank()) {
            return StandardCharsets.UTF_8;
        }

        try {
            MediaType mediaType = MediaType.parseMediaType(contentType);
            Charset charset = mediaType.getCharset();
            return charset == null ? StandardCharsets.UTF_8 : charset;
        } catch (RuntimeException ignored) {
            return StandardCharsets.UTF_8;
        }
    }

    private static class CachedBodyServletInputStream extends ServletInputStream {

        private final ByteArrayInputStream inputStream;

        private CachedBodyServletInputStream(byte[] body) {
            this.inputStream = new ByteArrayInputStream(body);
        }

        @Override
        public int read() {
            return inputStream.read();
        }

        @Override
        public boolean isFinished() {
            return inputStream.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener readListener) {
            if (readListener == null) {
                return;
            }

            try {
                if (isFinished()) {
                    readListener.onAllDataRead();
                } else {
                    readListener.onDataAvailable();
                }
            } catch (IOException exception) {
                readListener.onError(exception);
            }
        }
    }
}
