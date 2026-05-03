package com.smartcourier.tracking.config;

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
    public DirectExchange deliveryExchange(
            org.springframework.core.env.Environment environment) {
        return new DirectExchange(
                environment.getProperty(
                        "smartcourier.rabbitmq.exchange",
                        "delivery.exchange"));
    }

    @Bean
    public Queue deliveryNotificationQueue() {
        return QueueBuilder.durable("tracking_update_queue").build();
    }

    @Bean
    public Binding deliveryNotificationBinding(Queue deliveryNotificationQueue, DirectExchange deliveryExchange) {
        return BindingBuilder.bind(deliveryNotificationQueue).to(deliveryExchange).with("tracking.update");
    }

    @Bean
    public Queue bookingTrackingQueue() {
        return QueueBuilder.durable("booking_tracking_queue").build();
    }

    @Bean
    public Binding bookingTrackingBinding(Queue bookingTrackingQueue, DirectExchange deliveryExchange) {
        return BindingBuilder.bind(bookingTrackingQueue).to(deliveryExchange).with("booking.created");
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
