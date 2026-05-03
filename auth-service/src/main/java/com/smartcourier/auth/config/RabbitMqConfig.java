package com.smartcourier.auth.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Bean
    public DirectExchange deliveryExchange() {
        return new DirectExchange("delivery.exchange");
    }

    @Bean
    public Queue bookingQueue() {
        return QueueBuilder.durable("booking_queue").build();
    }

    @Bean
    public Binding bookingBinding(Queue bookingQueue, DirectExchange deliveryExchange) {
        return BindingBuilder.bind(bookingQueue).to(deliveryExchange).with("booking.created");
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable("notification.queue").build();
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange deliveryExchange) {
        return BindingBuilder.bind(notificationQueue).to(deliveryExchange).with("tracking.update");
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        // This ensures the converter doesn't fail if the package names are different
        // across microservices (auth vs delivery).
        return converter;
    }
}
