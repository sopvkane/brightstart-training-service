package com.example.brightstart.training.documentupload;

public record DocumentUploadReceipt(
        String uploadId,
        String fileName,
        String contentType,
        long size) {}
