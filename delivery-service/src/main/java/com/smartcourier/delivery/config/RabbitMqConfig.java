package com.smartcourier.delivery.config;

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
    public Queue notificationQueue() {
        return QueueBuilder.durable("notification.queue").build();
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange deliveryExchange) {
        return BindingBuilder.bind(notificationQueue).to(deliveryExchange).with("tracking.update");
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
