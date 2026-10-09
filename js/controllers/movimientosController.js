import { CuentasService } from "../services/cuentasService.js";
import { MovimientosService } from "../services/movimientosService.js";

class MovimientosController {
  constructor() {
    this.cuentasService = new CuentasService();
    this.movimientosService = new MovimientosService();
    this.idCuenta = new URLSearchParams(window.location.search).get("idCuenta");
    this.tabla = document.querySelector("#tabla-movimientos");
    this.form = document.querySelector("#form-movimiento");
    this.filtros = document.querySelector("#form-filtros");
    this.alertas = document.querySelector("#alertas");
    this.cuenta = null;
    this.movimientos = [];
  }

  init() {
    if (!this.idCuenta) {
      this.mostrarAlerta("Selecciona una cuenta desde la sección Cuentas", "info");
      return;
    }
    this.form.addEventListener("submit", (e) => this.guardar(e));
    this.tabla.addEventListener("click", (e) => this.onClick(e));
    this.filtros.addEventListener("input", () => this.render());
    this.cargar();
  }

  mostrarAlerta(mensaje, tipo = "success", codigo = "") {
    const prefijo = codigo ? `[${codigo}] ` : "";
    this.alertas.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${prefijo}${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  async cargar() {
    try {
      this.cuenta = (await this.cuentasService.getById(this.idCuenta)).data;
      document.querySelector("#titulo").textContent = `Movimientos de ${this.cuenta.nombre}`;
      this.movimientos = (await this.movimientosService.getByCuenta(this.idCuenta)).data;
      this.render();
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }

  render() {
    const { tipo, categoria, desde, hasta } = this.filtros;
    const lista = this.movimientos.filter(
      (m) =>
        (!tipo.value || m.tipo === tipo.value) &&
        (!categoria.value || m.categoria.toLowerCase().includes(categoria.value.toLowerCase())) &&
        (!desde.value || m.fecha >= desde.value) &&
        (!hasta.value || m.fecha <= hasta.value)
    );

    this.tabla.innerHTML = lista
      .map(
        (m) => `
      <tr>
        <td>${m.fecha}</td>
        <td>${m.tipo}</td>
        <td>${m.categoria}</td>
        <td>$${Number(m.monto).toFixed(2)}</td>
        <td>${m.descripcion ?? ""}</td>
        <td>
          <button class="btn btn-sm btn-warning" data-editar="${m.idMovimiento}">Editar</button>
          <button class="btn btn-sm btn-danger" data-eliminar="${m.idMovimiento}">Eliminar</button>
        </td>
      </tr>`
      )
      .join("");

    this.mostrarTotales();
  }

  mostrarTotales() {
    const suma = (tipo) =>
      this.movimientos.filter((m) => m.tipo === tipo).reduce((acc, m) => acc + Number(m.monto), 0);
    const ingresos = suma("INGRESO");
    const gastos = suma("GASTO");
    const saldoActual = Number(this.cuenta.saldoInicial) + ingresos - gastos;

    document.querySelector("#total-ingresos").textContent = `$${ingresos.toFixed(2)}`;
    document.querySelector("#total-gastos").textContent = `$${gastos.toFixed(2)}`;
    document.querySelector("#saldo-actual").textContent = `$${saldoActual.toFixed(2)}`;
  }

  async guardar(e) {
    e.preventDefault();
    const id = this.form.idMovimiento.value;
    const data = {
      idCuenta: Number(this.idCuenta),
      fecha: this.form.fecha.value,
      tipo: this.form.tipo.value,
      categoria: this.form.categoria.value.trim(),
      monto: Number(this.form.monto.value),
      descripcion: this.form.descripcion.value.trim(),
    };

    if (this.cuenta.activa !== "S") return this.mostrarAlerta("La cuenta está inactiva", "warning");
    if (!data.fecha || !data.tipo || !data.categoria)
      return this.mostrarAlerta("Fecha, tipo y categoría son obligatorios", "warning");
    if (!(data.monto > 0)) return this.mostrarAlerta("El monto debe ser mayor a 0", "warning");

    try {
      const respuesta = id
        ? await this.movimientosService.update(id, data)
        : await this.movimientosService.create(data);
      this.mostrarAlerta(respuesta.message, "success", respuesta.status);
      this.form.reset();
      this.form.idMovimiento.value = "";
      this.cargar();
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }

  async onClick(e) {
    const { editar, eliminar } = e.target.dataset;
    try {
      if (editar) {
        const m = (await this.movimientosService.getById(editar)).data;
        this.form.idMovimiento.value = m.idMovimiento;
        this.form.fecha.value = m.fecha;
        this.form.tipo.value = m.tipo;
        this.form.categoria.value = m.categoria;
        this.form.monto.value = m.monto;
        this.form.descripcion.value = m.descripcion ?? "";
      }
      if (eliminar && confirm("¿Eliminar este movimiento?")) {
        const respuesta = await this.movimientosService.remove(eliminar);
        this.mostrarAlerta(respuesta.message, "success", respuesta.status);
        this.cargar();
      }
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }
}

new MovimientosController().init();
