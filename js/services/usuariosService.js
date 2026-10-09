const API_URL = 'http://localhost:8080/api/Usuarios';

async function obtenerUsuarios() {
    const response = await fetch(`${API_URL}`);  
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  
    const productos = await response.json();
    console.log(productos);
}
  
obtenerProductos();

async function obtenerUsuariosPorId(id) {
    const response = await fetch(`${API_URL}/${id}`);
  
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  
    const data = await response.json();
    console.log(data);
}
  
obtenerUsuariosPorId(id);

async function eliminarUsuario(id) {
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
  