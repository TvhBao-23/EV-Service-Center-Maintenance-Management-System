package spring.api.evservicecenter.controller;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/customers/subscriptions")
@CrossOrigin(origins = "*")
@Order(1)  // Higher priority than catch-all routes
public class SubscriptionGatewayController {

    private final WebClient.Builder webClientBuilder;
    private static final String CUSTOMER_SERVICE_URL = "http://customerservice:8082";

    public SubscriptionGatewayController(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @GetMapping("/packages")
    public Mono<ResponseEntity<Object>> getSubscriptionPackages(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        System.out.println("📦 Gateway: Getting subscription packages");
        return proxyGetRequest(CUSTOMER_SERVICE_URL + "/api/customers/subscriptions/packages", authHeader);
    }
    
    @GetMapping("/my-subscriptions")
    public Mono<ResponseEntity<Object>> getMySubscriptions(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        System.out.println("📋 Gateway: Getting my subscriptions");
        return proxyGetRequest(CUSTOMER_SERVICE_URL + "/api/customers/subscriptions/my-subscriptions", authHeader);
    }
    
    @PostMapping("/subscribe/{packageId}")
    public Mono<ResponseEntity<Map<String, Object>>> subscribe(
            @PathVariable Long packageId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        System.out.println("🔵 Gateway: Forwarding subscribe request for package " + packageId);
        return proxyPostRequestWithAuth(
            CUSTOMER_SERVICE_URL + "/api/customers/subscriptions/subscribe/" + packageId, 
            Map.of(), 
            authHeader
        );
    }
    
    @PostMapping("/{id}/cancel")
    public Mono<ResponseEntity<Map<String, Object>>> cancelSubscription(
            @PathVariable Long id,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        System.out.println("🔴 Gateway: Forwarding cancel request for subscription " + id);
        return proxyPostRequestWithAuth(
            CUSTOMER_SERVICE_URL + "/api/customers/subscriptions/" + id + "/cancel", 
            Map.of(), 
            authHeader
        );
    }

    // Helper methods
    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Object>> proxyGetRequest(String url, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .get()
            .uri(url)
            .accept(MediaType.APPLICATION_JSON);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Object.class)
            .map(entity -> (ResponseEntity<Object>) (ResponseEntity<?>) entity)
            .onErrorResume(e -> {
                System.err.println("❌ Gateway error: " + e.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Service unavailable: " + e.getMessage())));
            });
    }
    
    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyGetRequestWithAuth(String url, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .get()
            .uri(url)
            .accept(MediaType.APPLICATION_JSON);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorResume(e -> {
                System.err.println("❌ Gateway error: " + e.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Service unavailable: " + e.getMessage())));
            });
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyPostRequestWithAuth(
            String url, Map<String, Object> request, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorResume(e -> {
                System.err.println("❌ Gateway error: " + e.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Service unavailable: " + e.getMessage())));
            });
    }
}

