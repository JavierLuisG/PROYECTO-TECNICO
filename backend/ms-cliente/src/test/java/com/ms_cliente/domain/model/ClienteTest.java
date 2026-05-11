package com.ms_cliente.domain.model;

import com.ms_cliente.domain.valueobject.Contrasena;
import com.ms_cliente.domain.valueobject.Identificacion;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios del dominio de Cliente.
 * Sin Spring context — puro JUnit 5.
 */
class ClienteTest {

    // ─── Contrasena ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Contrasena value object")
    class ContrasenaTests {

        @Test
        @DisplayName("Debe lanzar excepción cuando la contraseña tiene menos de 8 caracteres")
        void debeRechazarContrasenaCorta() {
            IllegalArgumentException ex = assertThrows(
                    IllegalArgumentException.class,
                    () -> new Contrasena("abc123")
            );
            assertTrue(ex.getMessage().contains("8 caracteres"));
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando la contraseña está vacía")
        void debeRechazarContrasenaVacia() {
            assertThrows(
                    IllegalArgumentException.class,
                    () -> new Contrasena("")
            );
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando la contraseña está en blanco")
        void debeRechazarContrasenaEnBlanco() {
            assertThrows(
                    IllegalArgumentException.class,
                    () -> new Contrasena("   ")
            );
        }

        @Test
        @DisplayName("Debe lanzar NullPointerException cuando la contraseña es nula")
        void debeRechazarContrasenaNula() {
            assertThrows(
                    NullPointerException.class,
                    () -> new Contrasena(null)
            );
        }

        @Test
        @DisplayName("Debe aceptar contraseña con exactamente 8 caracteres")
        void debeAceptarContrasenaDeOchoCaracteres() {
            assertDoesNotThrow(() -> new Contrasena("12345678"));
        }

        @Test
        @DisplayName("Debe aceptar contraseña con más de 8 caracteres")
        void debeAceptarContrasenaLarga() {
            Contrasena contrasena = new Contrasena("password123");
            assertEquals("password123", contrasena.valor());
        }
    }

    // ─── Identificacion ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("Identificacion value object")
    class IdentificacionTests {

        @Test
        @DisplayName("Debe lanzar excepción cuando la identificación está vacía")
        void debeRechazarIdentificacionVacia() {
            assertThrows(
                    IllegalArgumentException.class,
                    () -> new Identificacion("")
            );
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando la identificación supera 20 caracteres")
        void debeRechazarIdentificacionDemasiadoLarga() {
            String valorLargo = "123456789012345678901"; // 21 chars
            IllegalArgumentException ex = assertThrows(
                    IllegalArgumentException.class,
                    () -> new Identificacion(valorLargo)
            );
            assertTrue(ex.getMessage().contains("20 caracteres"));
        }

        @Test
        @DisplayName("Debe lanzar NullPointerException cuando la identificación es nula")
        void debeRechazarIdentificacionNula() {
            assertThrows(
                    NullPointerException.class,
                    () -> new Identificacion(null)
            );
        }

        @Test
        @DisplayName("Debe aceptar identificación válida")
        void debeAceptarIdentificacionValida() {
            Identificacion id = new Identificacion("1234567890");
            assertEquals("1234567890", id.valor());
        }
    }

    // ─── Cliente ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Cliente domain model")
    class ClienteModelTests {

        @Test
        @DisplayName("El estado inicial de un Cliente debe ser true")
        void estadoInicialDebeSerTrue() {
            Cliente cliente = Cliente.builder()
                    .clienteId(UUID.randomUUID())
                    .persona(personaBase())
                    .contrasena("password123")
                    .estado(true)
                    .build();

            assertTrue(cliente.isEstado(), "El estado inicial del cliente debe ser true");
        }

        @Test
        @DisplayName("El Cliente debe contener la referencia a su Persona")
        void clienteDebeContenersPersona() {
            Persona persona = personaBase();
            Cliente cliente = Cliente.builder()
                    .clienteId(UUID.randomUUID())
                    .persona(persona)
                    .contrasena("password123")
                    .estado(true)
                    .build();

            assertNotNull(cliente.getPersona());
            assertEquals("Jose Lema", cliente.getPersona().getNombre());
            assertEquals("1234567890", cliente.getPersona().getIdentificacion());
        }

        @Test
        @DisplayName("El Cliente debe almacenar la contraseña proporcionada")
        void clienteDebeAlmacenarContrasena() {
            Cliente cliente = Cliente.builder()
                    .clienteId(UUID.randomUUID())
                    .persona(personaBase())
                    .contrasena("miContrasena123")
                    .estado(true)
                    .build();

            assertEquals("miContrasena123", cliente.getContrasena());
        }

        @Test
        @DisplayName("El ClienteId debe ser asignado correctamente")
        void clienteDebeAsignarId() {
            UUID id = UUID.randomUUID();
            Cliente cliente = Cliente.builder()
                    .clienteId(id)
                    .persona(personaBase())
                    .contrasena("password123")
                    .estado(true)
                    .build();

            assertEquals(id, cliente.getClienteId());
        }

        // helper
        private Persona personaBase() {
            return Persona.builder()
                    .id(UUID.randomUUID())
                    .nombre("Jose Lema")
                    .genero("M")
                    .edad(30)
                    .identificacion("1234567890")
                    .direccion("Otavalo sn/n")
                    .telefono("098254785")
                    .estado(true)
                    .build();
        }
    }
}
