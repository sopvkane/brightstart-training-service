package com.example.brightstart.training.documentupload;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/document-uploads")
public class DocumentUploadController {

    private final DocumentUploadService documentUploadService;

    public DocumentUploadController(DocumentUploadService documentUploadService) {
        this.documentUploadService = documentUploadService;
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentUploadReceipt uploadDocument(
            @RequestParam(required = false) String documentType,
            @RequestPart(required = false) MultipartFile document) {
        return documentUploadService.acceptUpload(documentType, document);
    }

    @GetMapping("/{uploadId}/content")
    public ResponseEntity<byte[]> getDocumentContent(@PathVariable String uploadId) {
        StoredDocumentUpload upload = documentUploadService.findUpload(uploadId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(upload.contentType()))
                .cacheControl(CacheControl.noStore())
                .body(upload.content());
    }
}
