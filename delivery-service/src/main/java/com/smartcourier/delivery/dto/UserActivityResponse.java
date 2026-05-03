package com.smartcourier.delivery.dto;

import java.time.LocalDateTime;

public record UserActivityResponse(
    long totalBookings,
    long activeBookings,
    LocalDateTime lastBookingDate
) {}
