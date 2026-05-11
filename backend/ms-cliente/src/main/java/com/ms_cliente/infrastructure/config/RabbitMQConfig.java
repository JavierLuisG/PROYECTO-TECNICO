package com.ms_cliente.infrastructure.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CLIENTE_CREADO_EXCHANGE      = "cliente-creado-exchange";
    public static final String MOVIMIENTO_REGISTRADO_EXCHANGE = "movimiento-registrado-exchange";
    public static final String MOVIMIENTO_REGISTRADO_QUEUE  = "ms-cliente.movimiento-registrado";
    public static final String ROUTING_KEY_ALL              = "#";

    // ─── Exchanges ───────────────────────────────────────────────────────────

    @Bean
    public TopicExchange clienteCreadoExchange() {
        return ExchangeBuilder.topicExchange(CLIENTE_CREADO_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public TopicExchange movimientoRegistradoExchange() {
        return ExchangeBuilder.topicExchange(MOVIMIENTO_REGISTRADO_EXCHANGE)
                .durable(true)
                .build();
    }

    // ─── Cola consumida por MS-Cliente (auditoría de movimientos) ────────────

    @Bean
    public Queue movimientoRegistradoQueue() {
        return QueueBuilder.durable(MOVIMIENTO_REGISTRADO_QUEUE).build();
    }

    @Bean
    public Binding movimientoRegistradoBinding(Queue movimientoRegistradoQueue,
                                               TopicExchange movimientoRegistradoExchange) {
        return BindingBuilder.bind(movimientoRegistradoQueue)
                .to(movimientoRegistradoExchange)
                .with(ROUTING_KEY_ALL);
    }

    // ─── Serialización JSON ──────────────────────────────────────────────────

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
