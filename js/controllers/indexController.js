import { UsuariosService } from "../services/usuariosService.js";
import { CuentasService } from "../services/cuentasService.js";
import { MovimientosService } from "../services/movimientosService.js";

class CuentasController {
  constructor() {
    this.usuariosService = new UsuariosService();
    this.cuentasService = new CuentasService();
    this.movimientosService = new MovimientosService();
    this.idUsuario = new URLSearchParams(window.location.search).get("idUsuario");
    this.tabla = document.querySelector("#tabla-cuentas");
    this.form = document.querySelector("#form-cuenta");
    this.titulo = document.querySelector("#titulo");
    this.alertas = document.querySelector("#alertas");
  }

  init() {
    if (!this.idUsuario) {
      this.mostrarAlerta("Selecciona un usuario desde la sección Usuarios", "info");
      return;
    }
    this.form.addEventListener("submit", (e) => this.guardar(e));
    this.tabla.addEventListener("click", (e) => this.onClick(e));
    this.cargarCuentas();
  }

  mostrarAlerta(mensaje, tipo = "success", codigo = "") {
    const prefijo = codigo ? `[${codigo}] ` : "";
    this.alertas.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${prefijo}${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  calcularSaldoActual(saldoInicial, movimientos) {
    const suma = (tipo) =>
      movimientos.filter((m) => m.tipo === tipo).reduce((acc, m) => acc + Number(m.monto), 0);
    return Number(saldoInicial) + suma("INGRESO") - suma("GASTO");
  }

  async cargarCuentas() {
    try {
      const usuario = await this.usuariosService.getById(this.idUsuario);
      this.titulo.textContent = `Cuentas de ${usuario.data.nombre}`;

      const respuesta = await this.cuentasService.getByUsuario(this.idUsuario);
      const filas = await Promise.all(
        respuesta.data.map(async (c) => {
          const movs = await this.movimientosService.getByCuenta(c.idCuenta);
          return this.crearFila(c, this.calcularSaldoActual(c.saldoInicial, movs.data));
        })
      );
      this.tabla.innerHTML = filas.join("");
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }

  crearFila(c, saldoActual) {
    return `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.tipo}</td>
        <td>$${Number(c.saldoInicial).toFixed(2)}</td>
        <td>$${saldoActual.toFixed(2)}</td>
        <td>${c.activa === "S" ? "Activa" : "Inactiva"}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="movimientos.html?idCuenta=${c.idCuenta}">Movimientos</a>
          <button class="btn btn-sm btn-warning" data-editar="${c.idCuenta}">Editar</button>
          <button class="btn btn-sm btn-secondary" data-desactivar="${c.idCuenta}" data-saldo="${saldoActual}">Desactivar</button>
          <button class="btn btn-sm btn-danger" data-eliminar="${c.idCuenta}">Eliminar</button>
        </td>
      </tr>`;
  }

  async guardar(e) {
    e.preventDefault();
    const id = this.form.idCuenta.value;
    const data = {
      idUsuario: Number(this.idUsuario),
      nombre: this.form.nombre.value.trim(),
      tipo: this.form.tipo.value,
      saldoInicial: Number(this.form.saldoInicial.value),
      activa: this.form.activa.value,
    };

    if (!data.nombre || !data.tipo) return this.mostrarAlerta("Nombre y tipo son obligatorios", "warning");
    if (this.form.saldoInicial.value === "" || data.saldoInicial < 0)
      return this.mostrarAlerta("El saldo inicial debe ser un número mayor o igual a 0", "warning");

    try {
      const respuesta = id
        ? await this.cuentasService.update(id, data)
        : await this.cuentasService.create(data);
      this.mostrarAlerta(respuesta.message, "success", respuesta.status);
      this.form.reset();
      this.form.idCuenta.value = "";
      this.cargarCuentas();
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }

  async onClick(e) {
    const { editar, eliminar, desactivar, saldo } = e.target.dataset;
    try {
      if (editar) {
        const c = (await this.cuentasService.getById(editar)).data;
        this.form.idCuenta.value = c.idCuenta;
        this.form.nombre.value = c.nombre;
        this.form.tipo.value = c.tipo;
        this.form.saldoInicial.value = c.saldoInicial;
        this.form.activa.value = c.activa;
      }
      if (desactivar) {
        if (Number(saldo) !== 0)
          return this.mostrarAlerta("Solo se puede desactivar una cuenta con saldo $0.00", "warning");
        const c = (await this.cuentasService.getById(desactivar)).data;
        const respuesta = await this.cuentasService.update(desactivar, { ...c, activa: "N" });
        this.mostrarAlerta(respuesta.message, "success", respuesta.status);
        this.cargarCuentas();
      }
      if (eliminar && confirm("¿Eliminar esta cuenta?")) {
        const respuesta = await this.cuentasService.remove(eliminar);
        this.mostrarAlerta(respuesta.message, "success", respuesta.status);
        this.cargarCuentas();
      }
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }
}

new CuentasController().init();
