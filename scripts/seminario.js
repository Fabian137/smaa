// 1. Función para obtener y procesar el JSON
async function cargarSesionesSMAA() {
  const url = 'https://res.cloudinary.com/duwcgmivc/raw/upload/v1786174351/smaa-sessions_q6myxw.json';
  const tbody = document.querySelector('.sessions-table tbody');
  
  if (!tbody) {
    console.error('No se encontró el tbody de la tabla');
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
    const data = await response.json();
    const sessions = data.sessions || [];
    
    // 2. Vaciar el tbody actual (excepto cabecera)
    tbody.innerHTML = '';
    
    // 3. Generar filas
    sessions.forEach(session => {
      const tr = document.createElement('tr');
      
      // Clase condicional según confirmación
      if (session.confirmed === false) {
        tr.className = 'pending-session';
      } else {
        tr.className = 'confirmed-session';
      }
      
      // Crear celdas
      tr.innerHTML = `
        <td class="session-date">${session.displayDate || session.date}</td>
        <td class="session-presenter">${session.speaker}</td>
        <td>${session.topic}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // 4. (Opcional) Mostrar el semestre en algún lugar
    const semesterElement = document.getElementById('semester-display');
    if (semesterElement && data.semester) {
      semesterElement.textContent = `Semestre ${data.semester}`;
    }
    
  } catch (error) {
    console.error('Error al cargar las sesiones:', error);
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Error al cargar los datos. Intenta más tarde.</td></tr>`;
  }
}

// 5. Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarSesionesSMAA);