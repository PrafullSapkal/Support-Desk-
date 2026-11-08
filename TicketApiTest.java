package com.prafull.supportdesk;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TicketApiTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String VALID_TICKET = """
            {
              "title": "Printer not working",
              "description": "Office printer shows offline.",
              "priority": "LOW",
              "category": "Hardware",
              "reportedBy": "Test User"
            }
            """;

    @Test
    void createTicket_returnsCreatedWithOpenStatus() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TICKET))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.title").value("Printer not working"));
    }

    @Test
    void createTicket_withMissingTitle_returnsBadRequest() throws Exception {
        String invalid = """
                {
                  "title": "",
                  "description": "No title given",
                  "priority": "LOW",
                  "category": "Hardware",
                  "reportedBy": "Test User"
                }
                """;
        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void getUnknownTicket_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/tickets/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listTickets_andStats_areAvailable() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/tickets/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").exists());
    }
}
