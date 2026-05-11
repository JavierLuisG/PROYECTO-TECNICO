--
-- PostgreSQL database dump
--

\restrict aSGCJekknJia7ffAf3kLQIsMHR6BQO6wgUfVetWPuUy0V5KXaRX0UD9WcVeL1uY

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    cliente_id uuid DEFAULT gen_random_uuid() NOT NULL,
    persona_id uuid NOT NULL,
    contrasena character varying(255) NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT cliente_contrasena_check CHECK ((length((contrasena)::text) >= 8))
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- Name: cliente_ref; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente_ref (
    cliente_id uuid NOT NULL,
    nombre character varying(100) NOT NULL,
    identificacion character varying(20) NOT NULL
);


ALTER TABLE public.cliente_ref OWNER TO postgres;

--
-- Name: cuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta (
    cuenta_id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid NOT NULL,
    numero_cuenta character varying(20) NOT NULL,
    tipo_cuenta character varying(20) NOT NULL,
    saldo_inicial numeric(12,2) DEFAULT 0.00 NOT NULL,
    saldo numeric(12,2) DEFAULT 0.00 NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT cuenta_saldo_check CHECK ((saldo >= (0)::numeric)),
    CONSTRAINT cuenta_saldo_inicial_check CHECK ((saldo_inicial >= (0)::numeric)),
    CONSTRAINT cuenta_tipo_cuenta_check CHECK (((tipo_cuenta)::text = ANY ((ARRAY['Ahorro'::character varying, 'Corriente'::character varying, 'Tarjeta'::character varying, 'Deposito'::character varying])::text[])))
);


ALTER TABLE public.cuenta OWNER TO postgres;

--
-- Name: flyway_schema_history_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history_cliente (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history_cliente OWNER TO postgres;

--
-- Name: flyway_schema_history_cuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history_cuenta (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history_cuenta OWNER TO postgres;

--
-- Name: movimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimiento (
    movimiento_id uuid DEFAULT gen_random_uuid() NOT NULL,
    cuenta_id uuid NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    tipo_movimiento character varying(20) NOT NULL,
    valor numeric(12,2) NOT NULL,
    saldo_anterior numeric(12,2) NOT NULL,
    saldo_actual numeric(12,2) NOT NULL,
    descripcion character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT movimiento_tipo_movimiento_check CHECK (((tipo_movimiento)::text = ANY ((ARRAY['Deposito'::character varying, 'Retiro'::character varying, 'Transferencia'::character varying, 'Pago'::character varying, 'Ajuste'::character varying])::text[]))),
    CONSTRAINT movimiento_valor_check CHECK ((valor <> (0)::numeric))
);


ALTER TABLE public.movimiento OWNER TO postgres;

--
-- Name: persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    genero character varying(1) NOT NULL,
    edad integer NOT NULL,
    identificacion character varying(20) NOT NULL,
    direccion character varying(255) NOT NULL,
    telefono character varying(20) NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT persona_edad_check CHECK (((edad >= 18) AND (edad <= 120))),
    CONSTRAINT persona_genero_check CHECK (((genero)::bpchar = ANY (ARRAY['M'::bpchar, 'F'::bpchar, 'O'::bpchar])))
);


ALTER TABLE public.persona OWNER TO postgres;

--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (cliente_id, persona_id, contrasena, estado, created_at, updated_at) FROM stdin;
00000000-0000-0000-0002-000000000001	00000000-0000-0000-0001-000000000001	password123	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
00000000-0000-0000-0002-000000000002	00000000-0000-0000-0001-000000000002	password123	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
00000000-0000-0000-0002-000000000003	00000000-0000-0000-0001-000000000003	password123	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
\.


--
-- Data for Name: cliente_ref; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente_ref (cliente_id, nombre, identificacion) FROM stdin;
00000000-0000-0000-0002-000000000001	Jose Lema	1234567890
00000000-0000-0000-0002-000000000002	Marianela Montalvo	1234567891
00000000-0000-0000-0002-000000000003	Juan Osorio	1234567892
\.


--
-- Data for Name: cuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta (cuenta_id, cliente_id, numero_cuenta, tipo_cuenta, saldo_inicial, saldo, estado, created_at, updated_at) FROM stdin;
00000000-0000-0000-0003-000000000001	00000000-0000-0000-0002-000000000001	478758	Ahorro	2000.00	1425.00	t	2026-05-11 07:54:24.217428	2026-05-11 07:54:24.217428
00000000-0000-0000-0003-000000000002	00000000-0000-0000-0002-000000000001	585545	Corriente	1000.00	1000.00	t	2026-05-11 07:54:24.217428	2026-05-11 07:54:24.217428
00000000-0000-0000-0003-000000000003	00000000-0000-0000-0002-000000000002	225487	Corriente	100.00	700.00	t	2026-05-11 07:54:24.217428	2026-05-11 07:54:24.217428
00000000-0000-0000-0003-000000000004	00000000-0000-0000-0002-000000000002	496825	Ahorro	540.00	0.00	t	2026-05-11 07:54:24.217428	2026-05-11 07:54:24.217428
00000000-0000-0000-0003-000000000005	00000000-0000-0000-0002-000000000003	495878	Ahorro	0.00	150.00	t	2026-05-11 07:54:24.217428	2026-05-11 07:54:24.217428
\.


--
-- Data for Name: flyway_schema_history_cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history_cliente (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	schema cliente	SQL	V1__schema_cliente.sql	-827649496	postgres	2026-05-11 07:54:18.475374	11	t
2	2	indexes cliente	SQL	V2__indexes_cliente.sql	958765773	postgres	2026-05-11 07:54:18.508652	9	t
3	3	test data cliente	SQL	V3__test_data_cliente.sql	892101292	postgres	2026-05-11 07:54:18.525685	1	t
4	4	fix genero column type	SQL	V4__fix_genero_column_type.sql	-1978665204	postgres	2026-05-11 07:54:18.534859	10	t
\.


--
-- Data for Name: flyway_schema_history_cuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history_cuenta (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	0	<< Flyway Baseline >>	BASELINE	<< Flyway Baseline >>	\N	postgres	2026-05-11 07:54:24.141609	0	t
2	1	schema cuenta	SQL	V1__schema_cuenta.sql	202637151	postgres	2026-05-11 07:54:24.16789	13	t
3	2	indexes cuenta	SQL	V2__indexes_cuenta.sql	-1372695877	postgres	2026-05-11 07:54:24.196089	12	t
4	3	test data cuenta	SQL	V3__test_data_cuenta.sql	-1150136070	postgres	2026-05-11 07:54:24.213836	2	t
\.


--
-- Data for Name: movimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimiento (movimiento_id, cuenta_id, fecha, tipo_movimiento, valor, saldo_anterior, saldo_actual, descripcion, created_at) FROM stdin;
00000000-0000-0000-0004-000000000001	00000000-0000-0000-0003-000000000001	2024-02-10 10:00:00	Retiro	-575.00	2000.00	1425.00	Retiro cajero automatico	2026-05-11 07:54:24.217428
00000000-0000-0000-0004-000000000002	00000000-0000-0000-0003-000000000003	2024-02-10 11:00:00	Deposito	600.00	100.00	700.00	Deposito ventanilla	2026-05-11 07:54:24.217428
00000000-0000-0000-0004-000000000003	00000000-0000-0000-0003-000000000005	2024-02-10 12:00:00	Deposito	150.00	0.00	150.00	Deposito apertura de cuenta	2026-05-11 07:54:24.217428
00000000-0000-0000-0004-000000000004	00000000-0000-0000-0003-000000000004	2024-02-10 13:00:00	Retiro	-540.00	540.00	0.00	Retiro total	2026-05-11 07:54:24.217428
\.


--
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.persona (id, nombre, genero, edad, identificacion, direccion, telefono, estado, created_at, updated_at) FROM stdin;
00000000-0000-0000-0001-000000000001	Jose Lema	M	30	1234567890	Otavalo sn/n y Los Ponticipes	098254785	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
00000000-0000-0000-0001-000000000002	Marianela Montalvo	F	28	1234567891	Amazonas y NNUU	097548965	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
00000000-0000-0000-0001-000000000003	Juan Osorio	M	35	1234567892	13 junio y Equinoccial	098874587	t	2026-05-11 07:54:18.52881	2026-05-11 07:54:18.52881
\.


--
-- Name: cliente cliente_persona_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_persona_id_key UNIQUE (persona_id);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cliente_id);


--
-- Name: cliente_ref cliente_ref_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente_ref
    ADD CONSTRAINT cliente_ref_pkey PRIMARY KEY (cliente_id);


--
-- Name: cuenta cuenta_numero_cuenta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_numero_cuenta_key UNIQUE (numero_cuenta);


--
-- Name: cuenta cuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_pkey PRIMARY KEY (cuenta_id);


--
-- Name: flyway_schema_history_cliente flyway_schema_history_cliente_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history_cliente
    ADD CONSTRAINT flyway_schema_history_cliente_pk PRIMARY KEY (installed_rank);


--
-- Name: flyway_schema_history_cuenta flyway_schema_history_cuenta_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history_cuenta
    ADD CONSTRAINT flyway_schema_history_cuenta_pk PRIMARY KEY (installed_rank);


--
-- Name: movimiento movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT movimiento_pkey PRIMARY KEY (movimiento_id);


--
-- Name: persona persona_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_identificacion_key UNIQUE (identificacion);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_cliente_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_cliente_s_idx ON public.flyway_schema_history_cliente USING btree (success);


--
-- Name: flyway_schema_history_cuenta_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_cuenta_s_idx ON public.flyway_schema_history_cuenta USING btree (success);


--
-- Name: idx_cliente_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cliente_created_at ON public.cliente USING btree (created_at);


--
-- Name: idx_cliente_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cliente_estado ON public.cliente USING btree (estado);


--
-- Name: idx_cliente_persona_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cliente_persona_id ON public.cliente USING btree (persona_id);


--
-- Name: idx_cuenta_cliente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuenta_cliente_id ON public.cuenta USING btree (cliente_id);


--
-- Name: idx_cuenta_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuenta_created_at ON public.cuenta USING btree (created_at);


--
-- Name: idx_cuenta_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuenta_estado ON public.cuenta USING btree (estado);


--
-- Name: idx_cuenta_numero_cuenta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuenta_numero_cuenta ON public.cuenta USING btree (numero_cuenta);


--
-- Name: idx_movimiento_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimiento_created_at ON public.movimiento USING btree (created_at);


--
-- Name: idx_movimiento_cuenta_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimiento_cuenta_fecha ON public.movimiento USING btree (cuenta_id, fecha DESC);


--
-- Name: idx_movimiento_cuenta_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimiento_cuenta_id ON public.movimiento USING btree (cuenta_id);


--
-- Name: idx_movimiento_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimiento_fecha ON public.movimiento USING btree (fecha);


--
-- Name: idx_persona_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_persona_created_at ON public.persona USING btree (created_at);


--
-- Name: idx_persona_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_persona_estado ON public.persona USING btree (estado);


--
-- Name: idx_persona_identificacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_persona_identificacion ON public.persona USING btree (identificacion);


--
-- Name: cliente trg_cliente_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cliente_updated_at BEFORE UPDATE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cuenta trg_cuenta_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cuenta_updated_at BEFORE UPDATE ON public.cuenta FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: persona trg_persona_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_persona_updated_at BEFORE UPDATE ON public.persona FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cliente cliente_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.persona(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cuenta cuenta_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente_ref(cliente_id) ON DELETE RESTRICT;


--
-- Name: movimiento movimiento_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT movimiento_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuenta(cuenta_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict aSGCJekknJia7ffAf3kLQIsMHR6BQO6wgUfVetWPuUy0V5KXaRX0UD9WcVeL1uY

