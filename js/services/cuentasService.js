const API_URL = 'http://localhost:8080/api/Cuentas';

async function obtenerCuentas() {
    const response = await fetch(`${API_URL}`);  
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  
    const data = await response.json();
    console.log(data);
}
obtenerCuentas();

async function crearCuenta(nombre, correo, telefono) {
    const response = await fetch(`${API_URL}`);
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  
    const nuevoUsuario = await response.json();
    console.log('Creado con ID:', nuevoUsuario.id);
    return nuevoUsuario;
  }
  
crearUsuario(nombre, correo, telefono);

async function eliminarCuenta(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  
    if (response.status === 204) {
      console.log(`Post ${id} eliminado.`);
      return null;
    }
  
    const eliminado = await response.json();
    return eliminado;
  }
  
  eliminarPost(1);
  