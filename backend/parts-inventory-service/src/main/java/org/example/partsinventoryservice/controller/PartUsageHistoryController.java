package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.model.PartUsageHistory;
import org.example.partsinventoryservice.service.PartUsageHistoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usage-history")
@CrossOrigin(origins = "*")
public class PartUsageHistoryController {

    private final PartUsageHistoryService usageHistoryService;

    public PartUsageHistoryController(PartUsageHistoryService usageHistoryService) {
        this.usageHistoryService = usageHistoryService;
    }

    @GetMapping
    public List<PartUsageHistory> getAll() {
        return usageHistoryService.getAllUsageHistory();
    }

    @GetMapping("/part/{partCode}")
    public List<PartUsageHistory> getByPart(@PathVariable String partCode) {
        return usageHistoryService.getHistoryByPartCode(partCode);
    }

    @GetMapping("/order/{orderId}")
    public List<PartUsageHistory> getByOrder(@PathVariable Long orderId) {
        return usageHistoryService.getHistoryByOrderId(orderId);
    }

    @PostMapping("/record")
    public PartUsageHistory recordUsage(
            @RequestParam Long orderId,
            @RequestParam String partCode,
            @RequestParam int quantityUsed,
            @RequestParam String vehicleModel) {
        return usageHistoryService.recordUsage(orderId, partCode, quantityUsed, vehicleModel);
    }
}
