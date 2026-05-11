package com.ms_cuenta.infrastructure.web.controller;

import com.ms_cuenta.application.port.in.RegistrarMovimientoUseCase;
import com.ms_cuenta.domain.exception.SaldoInsuficienteException;
import com.ms_cuenta.domain.valueobject.TipoCuenta;
import com.ms_cuenta.infrastructure.persistence.entity.ClienteRefEntity;
import com.ms_cuenta.infrastructure.persistence.entity.CuentaEntity;
import com.ms_cuenta.infrastructure.persistence.repository.ClienteRefJpaRepository;
import com.ms_cuenta.infrastructure.persistence.repository.CuentaJpaRepository;
import com.ms_cuenta.infrastructure.persistence.repository.MovimientoJpaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TASK-17: Integration tests — Registro de Movimientos")
class RegistrarMovimientoIntegrationTest {

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @Autowired private RegistrarMovimientoUseCase registrarMovimientoUseCase;

    @Autowired private ClienteRefJpaRepository clienteRefJpaRepository;
    @Autowired private CuentaJpaRepository cuentaJpaRepository;
    @Autowired private MovimientoJpaRepository movimientoJpaRepository;

    private UUID cuentaId;
    private static final BigDecimal SALDO_INICIAL = new BigDecimal("1000.00");

    @BeforeEach
    void setUp() {
        movimientoJpaRepository.deleteAll();
        cuentaJpaRepository.deleteAll();
        clienteRefJpaRepository.deleteAll();

        UUID clienteId = UUID.randomUUID();
        clienteRefJpaRepository.save(ClienteRefEntity.builder()
                .clienteId(clienteId)
                .nombre("Cliente Test")
                .identificacion("TEST-001")
                .build());

        CuentaEntity cuenta = cuentaJpaRepository.save(CuentaEntity.builder()
                .clienteId(clienteId)
                .numeroCuenta("INT-TEST-001")
                .tipoCuenta(TipoCuenta.Ahorro)
                .saldoInicial(SALDO_INICIAL)
                .saldo(SALDO_INICIAL)
                .build());

        cuentaId = cuenta.getCuentaId();
    }

    @AfterEach
    void tearDown() {
        movimientoJpaRepository.deleteAll();
        cuentaJpaRepository.deleteAll();
        clienteRefJpaRepository.deleteAll();
    }

    @Test
    @DisplayName("Depósito actualiza el saldo y persiste el movimiento en BD")
    void deposito_actualizaSaldoEnBD() {
        BigDecimal valorDeposito = new BigDecimal("600.00");

        var movimiento = registrarMovimientoUseCase.registrar(cuentaId, "Deposito", valorDeposito, "Test integración");

        assertThat(movimiento.getSaldoAnterior()).isEqualByComparingTo(SALDO_INICIAL);
        assertThat(movimiento.getSaldoActual()).isEqualByComparingTo(new BigDecimal("1600.00"));
        assertThat(movimiento.getValor()).isEqualByComparingTo(valorDeposito);
        assertThat(movimiento.getMovimientoId()).isNotNull();

        CuentaEntity cuentaEnBD = cuentaJpaRepository.findById(cuentaId).orElseThrow();
        assertThat(cuentaEnBD.getSaldo()).isEqualByComparingTo(new BigDecimal("1600.00"));

        var movimientosEnBD = movimientoJpaRepository.findByCuentaId(cuentaId);
        assertThat(movimientosEnBD).hasSize(1);
        assertThat(movimientosEnBD.get(0).getValor()).isEqualByComparingTo(valorDeposito);
    }

    @Test
    @DisplayName("Retiro con saldo insuficiente lanza excepción con mensaje exacto y no modifica saldo")
    void retiro_saldoInsuficiente_lanzaExcepcionYSaldoSinCambio() {
        assertThatThrownBy(() ->
                registrarMovimientoUseCase.registrar(cuentaId, "Retiro", new BigDecimal("-9999.00"), null)
        )
                .isInstanceOf(SaldoInsuficienteException.class)
                .hasMessage("Saldo no disponible");

        CuentaEntity cuentaEnBD = cuentaJpaRepository.findById(cuentaId).orElseThrow();
        assertThat(cuentaEnBD.getSaldo()).isEqualByComparingTo(SALDO_INICIAL);

        assertThat(movimientoJpaRepository.findByCuentaId(cuentaId)).isEmpty();
    }

    @Test
    @DisplayName("Retiro que deja el saldo en exactamente cero es válido")
    void retiro_dejaSaldoEnCero_esValido() {
        var movimiento = registrarMovimientoUseCase.registrar(cuentaId, "Retiro", SALDO_INICIAL.negate(), null);

        assertThat(movimiento.getSaldoActual()).isEqualByComparingTo(BigDecimal.ZERO);

        CuentaEntity cuentaEnBD = cuentaJpaRepository.findById(cuentaId).orElseThrow();
        assertThat(cuentaEnBD.getSaldo()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Movimiento con valor cero lanza IllegalArgumentException")
    void movimiento_valorCero_lanzaExcepcion() {
        assertThatThrownBy(() ->
                registrarMovimientoUseCase.registrar(cuentaId, "Deposito", BigDecimal.ZERO, null)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El valor del movimiento no puede ser cero");
    }

    @Test
    @DisplayName("Múltiples depósitos acumulan el saldo correctamente")
    void multiplesDepositos_acumulanSaldo() {
        registrarMovimientoUseCase.registrar(cuentaId, "Deposito", new BigDecimal("200.00"), null);
        registrarMovimientoUseCase.registrar(cuentaId, "Deposito", new BigDecimal("300.00"), null);

        CuentaEntity cuentaEnBD = cuentaJpaRepository.findById(cuentaId).orElseThrow();
        assertThat(cuentaEnBD.getSaldo()).isEqualByComparingTo(new BigDecimal("1500.00"));

        assertThat(movimientoJpaRepository.findByCuentaId(cuentaId)).hasSize(2);
    }
}
