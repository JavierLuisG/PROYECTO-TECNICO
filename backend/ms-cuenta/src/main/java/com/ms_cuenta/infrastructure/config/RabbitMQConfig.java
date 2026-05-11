package com.ms_cuenta.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CLIENTE_CREADO_EXCHANGE        = "cliente-creado-exchange";
    public static final String MOVIMIENTO_REGISTRADO_EXCHANGE = "movimiento-registrado-exchange";

    public static final String CLIENTE_CREADO_QUEUE           = "ms-cuenta.cliente-creado";
    public static final String ROUTING_KEY_ALL                = "#";

    // ─── Exchanges ────────────────────────────────────────────────────────────

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

    // ─── Cola consumida por MS-Cuenta (sincronización ClienteRef) ────────────

    @Bean
    public Queue clienteCreadoQueue() {
        return QueueBuilder.durable(CLIENTE_CREADO_QUEUE).build();
    }

    @Bean
    public Binding clienteCreadoBinding(Queue clienteCreadoQueue,
                                        TopicExchange clienteCreadoExchange) {
        return BindingBuilder.bind(clienteCreadoQueue)
                .to(clienteCreadoExchange)
                .with(ROUTING_KEY_ALL);
    }

    // ─── Serialización JSON ───────────────────────────────────────────────────

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
