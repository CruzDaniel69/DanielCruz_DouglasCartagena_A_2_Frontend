import { UsuariosService } from "../services/usuariosService.js";

class UsuariosController {
  constructor() {
    this.service = new UsuariosService();
    this.tabla = document.querySelector("#tabla-usuarios");
    this.alertas = document.querySelector("#alertas");
  }

  init() {
    this.tabla.addEventListener("click", (e) => this.onClick(e));
    this.cargarUsuarios();
  }

  mostrarAlerta(mensaje, tipo = "success", codigo = "") {
    const prefijo = codigo ? `[${codigo}] ` : "";
    this.alertas.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${prefijo}${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  async cargarUsuarios() {
    try {
      const respuesta = await this.service.getAll();
      this.render(respuesta.data);
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }

  render(usuarios) {
    this.tabla.innerHTML = usuarios
      .map(
        (u) => `
      <tr>
        <td>${u.idUsuario}</td>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>${u.fechaRegistro}</td>
        <td>
          <a class="btn btn-sm btn-primary" href="cuentas.html?idUsuario=${u.idUsuario}">Ver cuentas</a>
          <button class="btn btn-sm btn-danger" data-eliminar="${u.idUsuario}">Eliminar</button>
        </td>
      </tr>`
      )
      .join("");
  }

  async onClick(e) {
    const id = e.target.dataset.eliminar;
    if (!id || !confirm("¿Eliminar este usuario?")) return;
    try {
      const respuesta = await this.service.remove(id);
      this.mostrarAlerta(respuesta.message, "success", respuesta.status);
      this.cargarUsuarios();
    } catch (error) {
      this.mostrarAlerta(error.message, "danger", error.status);
    }
  }
}

new UsuariosController().init();
