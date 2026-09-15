package com.koupreng.backend.guest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GuestRequest {

    @NotBlank(message = "Guest name is required")
    @Size(max = 255, message = "Guest name must be 255 characters or fewer")
    private String guestName;

    @Size(max = 50, message = "Phone must be 50 characters or fewer")
    private String phone;

    @Email(message = "Guest email is invalid")
    @Size(max = 255, message = "Guest email must be 255 characters or fewer")
    private String email;
    private String guestGroup;
    private String sideType;
    private String tableNumber;
    private String sendStatus;
    @Min(value = 1, message = "Seat count must be at least 1")
    private Integer seatCount;
    private String note;
    private String contributionStatus;
    @DecimalMin(value = "0.00", message = "Contribution amount cannot be negative")
    private BigDecimal totalContributed;
}
