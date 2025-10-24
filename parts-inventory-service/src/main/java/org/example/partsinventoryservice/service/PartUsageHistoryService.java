package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.model.Part;
import org.example.partsinventoryservice.model.PartUsageHistory;
import org.example.partsinventoryservice.respository.PartRepository;
import org.example.partsinventoryservice.respository.PartUsageHistoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PartUsageHistoryService {

    private final PartUsageHistoryRepository usageHistoryRepository;
    private final PartRepository partRepository;

    public PartUsageHistoryService(PartUsageHistoryRepository usageHistoryRepository, PartRepository partRepository) {
        this.usageHistoryRepository = usageHistoryRepository;
        this.partRepository = partRepository;
    }

    public List<PartUsageHistory> getAllUsageHistory() {
        return usageHistoryRepository.findAll();
    }

    public List<PartUsageHistory> getHistoryByPartCode(String partCode) {
        Part part = partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ tùng có mã: " + partCode));
        return usageHistoryRepository.findByPart(part);
    }

    public List<PartUsageHistory> getHistoryByOrderId(Long orderId) {
        return usageHistoryRepository.findByOrderId(orderId);
    }

    public PartUsageHistory recordUsage(Long orderId, String partCode, int quantityUsed, String vehicleModel) {
        Part part = partRepository.findByPartCode(partCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ tùng có mã: " + partCode));

        PartUsageHistory history = PartUsageHistory.builder()
                .orderId(orderId)
                .part(part)
                .quantityUsed(quantityUsed)
                .vehicleModel(vehicleModel)
                .build();

        return usageHistoryRepository.save(history);
    }
}