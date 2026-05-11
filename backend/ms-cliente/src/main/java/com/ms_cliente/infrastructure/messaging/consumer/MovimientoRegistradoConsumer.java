package com.ms_cliente.infrastructure.messaging.consumer;

import com.ms_cliente.infrastructure.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class MovimientoRegistradoConsumer {

    /**
     * Consume eventos de movimiento-registrado publicados por MS-Cuenta.
     * Finalidad: auditoría en MS-Cliente (log INFO).
     * El payload se deserializa como Map para tolerancia a cambios de schema en MS-Cuenta.
     */
    @RabbitListener(queues = RabbitMQConfig.MOVIMIENTO_REGISTRADO_QUEUE)
    public void consume(Map<String, Object> payload) {
        log.info("Auditoria — movimiento-registrado recibido: movimientoId={}, cuentaId={}, valor={}, saldoActual={}, fecha={}",
                payload.get("movimientoId"),
                payload.get("cuentaId"),
                payload.get("valor"),
                payload.get("saldoActual"),
                payload.get("fecha"));
    }
}
