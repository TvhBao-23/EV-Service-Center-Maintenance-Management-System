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

    // Methods for ServiceChecklistDirectController
    public ServiceChecklist createServiceChecklist(Integer orderId, String itemName, boolean isCompleted, String notes, Integer completedBy) {
        ServiceChecklist checklist = new ServiceChecklist();
        checklist.setOrderId(orderId);
        checklist.setItemName(itemName);
        checklist.setIsCompleted(isCompleted);
        checklist.setNotes(notes);
        checklist.setCompletedBy(completedBy);
        if (isCompleted && completedBy != null) {
            checklist.setCompletedAt(LocalDateTime.now());
        }
        return serviceChecklistRepository.save(checklist);
    }

    public List<ServiceChecklist> getAllServiceChecklists() {
        return serviceChecklistRepository.findAll();
    }

    public Optional<ServiceChecklist> getServiceChecklistById(Integer checklistId) {
        return serviceChecklistRepository.findById(checklistId);
    }

    public ServiceChecklist updateServiceChecklist(Integer checklistId, String itemName, Boolean isCompleted, String notes, Integer completedBy) {
        Optional<ServiceChecklist> optionalItem = serviceChecklistRepository.findById(checklistId);
        if (optionalItem.isPresent()) {
            ServiceChecklist item = optionalItem.get();
            if (itemName != null) {
                item.setItemName(itemName);
            }
            if (isCompleted != null) {
                item.setIsCompleted(isCompleted);
                if (isCompleted && completedBy != null) {
                    item.setCompletedBy(completedBy);
                    if (item.getCompletedAt() == null) {
                        item.setCompletedAt(LocalDateTime.now());
                    }
                }
            }
            if (notes != null) {
                item.setNotes(notes);
            }
            if (completedBy != null) {
                item.setCompletedBy(completedBy);
            }
            return serviceChecklistRepository.save(item);
        }
        throw new RuntimeException("Service checklist not found with ID: " + checklistId);
    }

    public void deleteServiceChecklist(Integer checklistId) {
        serviceChecklistRepository.deleteById(checklistId);
    }
}