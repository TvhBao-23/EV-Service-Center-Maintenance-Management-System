package spring.api.evservicecenter.controller;

import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Order(100)  // Lower priority than SubscriptionGatewayController
public class GatewayController {

    private final WebClient.Builder webClientBuilder;

    // Service URLs
    private static final String AUTH_SERVICE_URL = "http://authservice:8081";
    private static final String CUSTOMER_SERVICE_URL = "http://customerservice:8082";
    private static final String STAFF_SERVICE_URL = "http://staffservice:8083";
    private static final String PAYMENT_SERVICE_URL = "http://paymentservice:8084";

    public GatewayController(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    // ==================== AUTH SERVICE ====================
    
    @PostMapping("/auth/register")
    public Mono<ResponseEntity<Map<String, Object>>> register(@RequestBody Map<String, Object> request) {
        return proxyPostRequest(AUTH_SERVICE_URL + "/api/auth/register", request);
    }

    @PostMapping("/auth/login")
    public Mono<ResponseEntity<Map<String, Object>>> login(@RequestBody Map<String, Object> request) {
        return proxyPostRequest(AUTH_SERVICE_URL + "/api/auth/login", request);
    }

    @PostMapping("/auth/forgot-password/send-otp")
    public Mono<ResponseEntity<Map<String, Object>>> sendOtp(@RequestBody Map<String, Object> request) {
        return proxyPostRequest(AUTH_SERVICE_URL + "/api/auth/forgot-password/send-otp", request);
    }

    @PostMapping("/auth/forgot-password/verify-otp")
    public Mono<ResponseEntity<Map<String, Object>>> verifyOtp(@RequestBody Map<String, Object> request) {
        return proxyPostRequest(AUTH_SERVICE_URL + "/api/auth/forgot-password/verify-otp", request);
    }

    @PostMapping("/auth/forgot-password/reset")
    public Mono<ResponseEntity<Map<String, Object>>> resetPassword(@RequestBody Map<String, Object> request) {
        return proxyPostRequest(AUTH_SERVICE_URL + "/api/auth/forgot-password/reset", request);
    }

    @GetMapping("/auth/health")
    public Mono<ResponseEntity<Map<String, Object>>> authHealth() {
        return proxyGetRequest(AUTH_SERVICE_URL + "/api/auth/health");
    }

    // ==================== CUSTOMER SERVICE ====================
    
    // Note: Subscription routes are handled by SubscriptionGatewayController
    
    // Catch-all routes for other customer endpoints
    @GetMapping("/customers/**")
    public Mono<ResponseEntity<Object>> getCustomers(
            HttpServletRequest servletRequest,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyGetRequestWithAuthObject(CUSTOMER_SERVICE_URL + "/api" + path, authHeader);
    }

    @PostMapping("/customers/**")
    public Mono<ResponseEntity<Map<String, Object>>> createCustomer(
            HttpServletRequest servletRequest,
            @RequestBody(required = false) Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI();
        
        // Subscription routes are handled by SubscriptionGatewayController
        if (path.contains("/subscriptions/")) {
            System.err.println("⚠️ Gateway: Subscription request matched catch-all route, this shouldn't happen!");
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "This route should be handled by SubscriptionGatewayController")));
        }
        
        String apiPath = path.replace("/api", "");
        return proxyPostRequestWithAuth(CUSTOMER_SERVICE_URL + "/api" + apiPath, request != null ? request : Map.of(), authHeader);
    }

    @PatchMapping("/customers/**")
    public Mono<ResponseEntity<Map<String, Object>>> patchCustomer(
            HttpServletRequest servletRequest,
            @RequestBody(required = false) Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyPatchRequestWithAuth(CUSTOMER_SERVICE_URL + "/api" + path, request, authHeader);
    }

    @PutMapping("/customers/**")
    public Mono<ResponseEntity<Map<String, Object>>> updateCustomer(
            HttpServletRequest servletRequest,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyPutRequestWithAuth(CUSTOMER_SERVICE_URL + "/api" + path, request, authHeader);
    }

    @DeleteMapping("/customers/**")
    public Mono<ResponseEntity<Map<String, Object>>> deleteCustomer(
            HttpServletRequest servletRequest,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyDeleteRequestWithAuth(CUSTOMER_SERVICE_URL + "/api" + path, authHeader);
    }

    // ==================== STAFF SERVICE ====================
    
    // Staff registration (no auth required)
    @PostMapping("/staff/auth/register")
    public Mono<ResponseEntity<Map<String, Object>>> staffRegister(@RequestBody Map<String, Object> request) {
        System.out.println("🟢 Gateway: Routing staff registration to staffservice");
        System.out.println("   Request: " + request);
        return proxyPostRequest(STAFF_SERVICE_URL + "/api/auth/register", request);
    }
    
    // Staff login (no auth required)
    @PostMapping("/staff/auth/login")
    public Mono<ResponseEntity<Map<String, Object>>> staffLogin(@RequestBody Map<String, Object> request) {
        System.out.println("🔐 Gateway: Routing staff login to staffservice");
        return proxyPostRequest(STAFF_SERVICE_URL + "/api/auth/login", request);
    }
    
    @GetMapping("/staff/**")
    public Mono<ResponseEntity<Map<String, Object>>> getStaff(
            HttpServletRequest servletRequest,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        String targetUrl = STAFF_SERVICE_URL + "/api" + path;
        System.out.println("🔵 Gateway: Routing GET request to staff service");
        System.out.println("   Path: " + path);
        System.out.println("   Target URL: " + targetUrl);
        return proxyGetRequestWithAuth(targetUrl, authHeader);
    }

    @PostMapping("/staff/**")
    public Mono<ResponseEntity<Map<String, Object>>> createStaff(
            HttpServletRequest servletRequest,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyPostRequestWithAuth(STAFF_SERVICE_URL + "/api" + path, request, authHeader);
    }

    @PutMapping("/staff/**")
    public Mono<ResponseEntity<Map<String, Object>>> updateStaff(
            HttpServletRequest servletRequest,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyPutRequestWithAuth(STAFF_SERVICE_URL + "/api" + path, request, authHeader);
    }

    @DeleteMapping("/staff/**")
    public Mono<ResponseEntity<Map<String, Object>>> deleteStaff(
            HttpServletRequest servletRequest,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyDeleteRequestWithAuth(STAFF_SERVICE_URL + "/api" + path, authHeader);
    }

    // ==================== PAYMENT SERVICE ====================
    
    @GetMapping("/payments/**")
    public Mono<ResponseEntity<Map<String, Object>>> getPayments(
            HttpServletRequest servletRequest,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyGetRequestWithAuth(PAYMENT_SERVICE_URL + "/api" + path, authHeader);
    }

    @PostMapping("/payments/**")
    public Mono<ResponseEntity<Map<String, Object>>> createPayment(
            HttpServletRequest servletRequest,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        String path = servletRequest.getRequestURI().replace("/api", "");
        return proxyPostRequestWithAuth(PAYMENT_SERVICE_URL + "/api" + path, request, authHeader);
    }

    // ==================== HELPER METHODS ====================

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyGetRequest(String url) {
        return webClientBuilder.build()
            .get()
            .uri(url)
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
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
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Object>> proxyGetRequestWithAuthObject(String url, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .get()
            .uri(url)
            .accept(MediaType.APPLICATION_JSON);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Object.class)
            .map(entity -> (ResponseEntity<Object>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyPostRequest(String url, Map<String, Object> request) {
        return webClientBuilder.build()
            .post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
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
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyPatchRequestWithAuth(
            String url, Map<String, Object> request, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .patch()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON);

        if (request != null && !request.isEmpty()) {
            spec = ((WebClient.RequestBodySpec) spec).bodyValue(request);
        }

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyPutRequestWithAuth(
            String url, Map<String, Object> request, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }

    @SuppressWarnings("unchecked")
    private Mono<ResponseEntity<Map<String, Object>>> proxyDeleteRequestWithAuth(
            String url, String authHeader) {
        WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
            .delete()
            .uri(url)
            .accept(MediaType.APPLICATION_JSON);

        if (authHeader != null && !authHeader.isEmpty()) {
            spec = spec.header(HttpHeaders.AUTHORIZATION, authHeader);
        }

        return spec.retrieve()
            .toEntity(Map.class)
            .map(entity -> (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) entity)
            .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable")));
    }
}

