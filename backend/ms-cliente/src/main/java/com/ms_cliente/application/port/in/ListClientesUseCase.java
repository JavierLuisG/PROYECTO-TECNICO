package com.ms_cliente.application.port.in;

import com.ms_cliente.domain.model.Cliente;

import java.util.List;

public interface ListClientesUseCase {

    List<Cliente> listAll();
}
