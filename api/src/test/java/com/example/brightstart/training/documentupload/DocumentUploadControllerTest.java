package com.example.brightstart.training.documentupload;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentUploadController.class)
@Import({
    DocumentUploadService.class,
    DocumentUploadExceptionHandler.class,
    InMemoryDocumentUploadStore.class
})
class DocumentUploadControllerTest {

    private static final byte[] JPEG_CONTENT = {
        (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xD9
    };
    private static final byte[] PNG_CONTENT = {
        (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DocumentUploadStore uploadStore;

    @Test
    void acceptsAJpegUsingItsContentSignature() throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "passport.jpg", "text/plain", JPEG_CONTENT);

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "passport"))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.uploadId").isNotEmpty())
                .andExpect(jsonPath("$.fileName").value("passport.jpg"))
                .andExpect(jsonPath("$.contentType").value("image/jpeg"))
                .andExpect(jsonPath("$.size").value(JPEG_CONTENT.length));
    }

    @Test
    void acceptsAPngUsingItsContentSignature() throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "licence.png", "image/jpeg", PNG_CONTENT);

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "driving-licence"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andExpect(jsonPath("$.size").value(PNG_CONTENT.length));
    }

    @Test
    void rejectsAMissingFile() throws Exception {
        mockMvc.perform(multipart("/api/document-uploads").param("documentType", "passport"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Document image required"))
                .andExpect(jsonPath("$.detail").value("Select a non-empty document image to upload."));
    }

    @Test
    void rejectsAnEmptyFile() throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "empty.jpg", "image/jpeg", new byte[0]);

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "passport"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Document image required"));
    }

    @Test
    void rejectsUnsupportedContentEvenWhenTheNameAndMimeTypeSayJpeg() throws Exception {
        MockMultipartFile document = new MockMultipartFile(
                "document", "not-an-image.jpg", "image/jpeg", "plain text".getBytes());

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "passport"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Unsupported document image"))
                .andExpect(jsonPath("$.detail").value("Upload a JPEG or PNG document image."));
    }

    @Test
    void rejectsAnOversizedFile() throws Exception {
        byte[] oversizedContent = new byte[(int) DocumentUploadService.MAXIMUM_FILE_SIZE_BYTES + 1];
        oversizedContent[0] = (byte) 0xFF;
        oversizedContent[1] = (byte) 0xD8;
        oversizedContent[2] = (byte) 0xFF;
        MockMultipartFile document =
                new MockMultipartFile("document", "large.jpg", "image/jpeg", oversizedContent);

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "passport"))
                .andExpect(status().isContentTooLarge())
                .andExpect(jsonPath("$.title").value("Document image too large"))
                .andExpect(jsonPath("$.detail").value("The document image must be 5 MB or smaller."));
    }

    @Test
    void rejectsAnInvalidDocumentType() throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "card.jpg", "image/jpeg", JPEG_CONTENT);

        mockMvc.perform(multipart("/api/document-uploads")
                        .file(document)
                        .param("documentType", "library-card"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid identity document type"));
    }

    @Test
    void returnsStoredJpegContentWithoutCaching() throws Exception {
        uploadStore.save(new StoredDocumentUpload(
                "stored-jpeg",
                IdentityDocumentType.PASSPORT,
                "passport.jpg",
                "image/jpeg",
                JPEG_CONTENT));

        mockMvc.perform(get("/api/document-uploads/stored-jpeg/content"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().bytes(JPEG_CONTENT));
    }

    @Test
    void returnsStoredPngContent() throws Exception {
        uploadStore.save(new StoredDocumentUpload(
                "stored-png",
                IdentityDocumentType.DRIVING_LICENCE,
                "licence.png",
                "image/png",
                PNG_CONTENT));

        mockMvc.perform(get("/api/document-uploads/stored-png/content"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"))
                .andExpect(content().bytes(PNG_CONTENT));
    }

    @Test
    void reportsAnUnknownUploadAsNotFound() throws Exception {
        mockMvc.perform(get("/api/document-uploads/unknown/content"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Document upload not found"));
    }
}
