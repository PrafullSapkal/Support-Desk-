package com.prafull.supportdesk.config;

import com.prafull.supportdesk.dto.CommentRequest;
import com.prafull.supportdesk.dto.TicketRequest;
import com.prafull.supportdesk.dto.TicketResponse;
import com.prafull.supportdesk.model.Priority;
import com.prafull.supportdesk.model.Status;
import com.prafull.supportdesk.repository.TicketRepository;
import com.prafull.supportdesk.service.TicketService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Adds a few sample tickets on first start so the dashboard is not empty. */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(TicketRepository repository, TicketService service) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            TicketResponse t1 = service.create(new TicketRequest(
                    "Unable to log in to customer portal",
                    "User gets 'invalid credentials' even after password reset.",
                    Priority.HIGH, "Login", "Amit Kulkarni", "Prafull"));
            service.addComment(t1.id(), new CommentRequest("Prafull",
                    "Checked the user record in the database. Account was locked after 5 failed attempts."));
            service.updateStatus(t1.id(), Status.IN_PROGRESS);

            service.create(new TicketRequest(
                    "Reports page loading very slowly",
                    "Monthly report takes more than 40 seconds to open.",
                    Priority.MEDIUM, "Performance", "Neha Joshi", null));

            TicketResponse t3 = service.create(new TicketRequest(
                    "Production database connection errors",
                    "Application throws connection timeout errors during peak hours.",
                    Priority.CRITICAL, "Database", "Ops Team", "Prafull"));
            service.addComment(t3.id(), new CommentRequest("Prafull",
                    "Connection pool size was too small. Increased it and monitoring."));
            service.updateStatus(t3.id(), Status.RESOLVED);

            service.create(new TicketRequest(
                    "Add export to CSV button",
                    "Support team needs to export the ticket list for weekly reviews.",
                    Priority.LOW, "Feature Request", "Rohan Patil", null));
        };
    }
}
