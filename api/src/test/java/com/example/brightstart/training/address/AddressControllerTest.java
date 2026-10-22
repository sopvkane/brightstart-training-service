package com.example.brightstart.training.address;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AddressController.class)
@Import({AddressLookupService.class, SyntheticAddressSource.class, AddressApiExceptionHandler.class})
class AddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsMultipleFictionalAddressesForBt9Postcode() throws Exception {
        mockMvc.perform(get("/api/addresses").param("postcode", "BT9 7EP"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.addresses.length()").value(3))
                .andExpect(jsonPath("$.addresses[0].line1").value("1 Apprentice Avenue"))
                .andExpect(jsonPath("$.addresses[0].postcode").value("BT9 7EP"));
    }

    @Test
    void returnsOneFictionalAddressForZz1Postcode() throws Exception {
        mockMvc.perform(get("/api/addresses").param("postcode", "zz1 1zz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addresses.length()").value(1))
                .andExpect(jsonPath("$.addresses[0].line1").value("1 Learning Lane"))
                .andExpect(jsonPath("$.addresses[0].town").value("Exampleton"));
    }

    @Test
    void returnsNoAddressesForAnUnknownPostcode() throws Exception {
        mockMvc.perform(get("/api/addresses").param("postcode", "AA1 1AA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.addresses").isEmpty());
    }

    @Test
    void returnsServiceUnavailableForTheControlledFailurePostcode() throws Exception {
        mockMvc.perform(get("/api/addresses").param("postcode", "ZZ9 9ZZ"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.title").value("Address lookup unavailable"))
                .andExpect(jsonPath("$.detail")
                        .value("Address lookup is temporarily unavailable. Try again later."))
                .andExpect(jsonPath("$.instance").value("/api/addresses"));
    }
    @Test
    void returnsTwoFictionalAddressesForZz2Postcode() throws Exception {
        mockMvc.perform(get("/api/addresses").param("postcode", "zz2 2zz"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.addresses.length()").value(2))
                .andExpect(jsonPath("$.addresses[0].id").value("zz2-2zz-1"))
                .andExpect(jsonPath("$.addresses[0].line1").value("4 Backend Boulevard"))
                .andExpect(jsonPath("$.addresses[0].line2").value("Service Quarter"))
                .andExpect(jsonPath("$.addresses[0].town").value("Exampleton"))
                .andExpect(jsonPath("$.addresses[0].postcode").value("ZZ2 2ZZ"))
                .andExpect(jsonPath("$.addresses[1].id").value("zz2-2zz-2"))
                .andExpect(jsonPath("$.addresses[1].line1").value("5 API Avenue"))
                .andExpect(jsonPath("$.addresses[1].line2").value("Service Quarter"))
                .andExpect(jsonPath("$.addresses[1].town").value("Exampleton"))
                .andExpect(jsonPath("$.addresses[1].postcode").value("ZZ2 2ZZ"));
    }
}
