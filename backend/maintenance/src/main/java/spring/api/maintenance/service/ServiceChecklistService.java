package spring.api.maintenance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.ServiceChecklist;
import spring.api.maintenance.repository.ServiceChecklistRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceChecklistService {

    @Autowired
    private ServiceChecklistRepository serviceChecklistRepository;

    public List<ServiceChecklist> createChecklist(Integer orderId, List<String> items) {
        List<ServiceChecklist> checklist = items.stream()
                .map(itemName -> {
                    ServiceChecklist checklistItem = new ServiceChecklist();
                    checklistItem.setOrderId(orderId);
                    checklistItem.setItemName(itemName);
                    checklistItem.setIsCompleted(false);
                    return serviceChecklistRepository.save(checklistItem);
                })
                .toList();
        return checklist;
    }

    public List<ServiceChecklist> getChecklistByOrderId(Integer orderId) {
        return serviceChecklistRepository.findByOrderId(orderId);
    }

    public Optional<ServiceChecklist> getChecklistItemById(Integer checklistId) {
        return serviceChecklistRepository.findById(checklistId);
    }

    public ServiceChecklist completeChecklistItem(Integer checklistId, String notes, Integer completedBy) {
        Optional<ServiceChecklist> optionalItem = serviceChecklistRepository.findById(checklistId);
        if (optionalItem.isPresent()) {
            ServiceChecklist item = optionalItem.get();
            item.setIsCompleted(true);
            item.setNotes(notes);
            item.setCompletedBy(completedBy);
            item.setCompletedAt(LocalDateTime.now());
            return serviceChecklistRepository.save(item);
        }
        throw new RuntimeException("Checklist item not found with ID: " + checklistId);
    }

    public ServiceChecklist addChecklistItem(Integer orderId, String itemName) {
        ServiceChecklist checklistItem = new ServiceChecklist();
        checklistItem.setOrderId(orderId);
        checklistItem.setItemName(itemName);
        checklistItem.setIsCompleted(false);
        return serviceChecklistRepository.save(checklistItem);
    }

    public ServiceChecklist updateChecklistItem(Integer checklistId, String itemName, String notes) {
        Optional<ServiceChecklist> optionalItem = serviceChecklistRepository.findById(checklistId);
        if (optionalItem.isPresent()) {
            ServiceChecklist item = optionalItem.get();
            item.setItemName(itemName);
            item.setNotes(notes);
            return serviceChecklistRepository.save(item);
        }
        throw new RuntimeException("Checklist item not found with ID: " + checklistId);
    }

    public void deleteChecklistItem(Integer checklistId) {
        serviceChecklistRepository.deleteById(checklistId);
    }

    public List<ServiceChecklist> getPendingChecklistItems(Integer orderId) {
        return serviceChecklistRepository.findByOrderIdAndIsCompleted(orderId, false);
    }

    public List<ServiceChecklist> getCompletedChecklistItems(Integer orderId) {
        return serviceChecklistRepository.findByOrderIdAndIsCompleted(orderId, true);
    }
}