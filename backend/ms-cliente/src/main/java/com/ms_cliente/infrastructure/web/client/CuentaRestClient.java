package com.ms_cliente.infrastructure.web.client;

import com.ms_cliente.application.port.out.CuentaQueryPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Slf4j
@Component
public class CuentaRestClient implements CuentaQueryPort {

    @Value("${ms-cuenta.url}")
    private String msCuentaUrl;

    @Override
    public boolean hasCuentas(UUID clienteId) {
        try {
            RestClient.create(msCuentaUrl)
                    .get()
                    .uri("/api/cuentas?clienteId=" + clienteId)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception ex) {
            log.debug("No se pudo consultar cuentas para clienteId={}: {}", clienteId, ex.getMessage());
            return false;
        }
    }
}
