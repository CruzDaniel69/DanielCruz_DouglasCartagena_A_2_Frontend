const API_URL = 'http://localhost:8080/api/Movimientos';

async function obtenerMovimientos() {
    const response = await fetch(`${API_URL}`);  

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  
    const productos = await response.json();
    console.log(productos);
  }
  
  obtenerProductos();

  async function crearMovimiento(nombre, correo, telefono) {
    const response = await fetch(`${API_URL}`);
  
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  
    const nuevoUsuario = await response.json();
    console.log('Creado con ID:', nuevoUsuario.id);
    return nuevoUsuario;
  }
  
crearMovimiento(nombre, correo, telefono);

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