const coloresPorCategoria = {
  'taller': '#3c0035e7',
  'evento': '#5235a1e5',
  'seminario': '#7e28bbde',
};
const colorGenerico = '#604d7eff';

// =====  OBTENER EVENTOS =====
const calendarUrl = 'https://script.google.com/macros/s/AKfycbzdYFrNOSjFpp324OvxW7KplRvZNzrp6ZPbcsv1FhTMAHNPnQd8I_pq0zh9V0FHi2vf/exec';

// Estado del calendario
let fechaActual = new Date();
const mesActual = new Date().getMonth();
const anioActual = new Date().getFullYear();
let eventosAgrupadosGlobal = new Map();

// ===== FETCH Y PROCESAMIENTO =====
fetch(calendarUrl)
  .then(response => response.text())
  .then(data => {
    const jcalData = ICAL.parse(data);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
  // const eventosExpandidos = [];

  // vevents.forEach(event => {
    // const expandidos = expandirRecurrencias(event);
    // eventosExpandidos.push(...expandidos);
  // });

    const eventos = vevents.map(event => {
      const summary = event.getFirstPropertyValue('summary');
      const dtstart = event.getFirstPropertyValue('dtstart');
      const dtend = event.getFirstPropertyValue('dtend');
      const location = event.getFirstPropertyValue('location');
      const description = event.getFirstPropertyValue('description');

      return {
        summary: summary || 'Evento sin título',
        startDate: dtstart ? dtstart.toJSDate() : null,
        endDate: dtend ? dtend.toJSDate() : null,
        location: location || '',
        description: description || ''
      };
    });

    // Agrupar eventos por fecha (considerando rangos)
    eventosAgrupadosGlobal = agruparEventosPorFecha(eventos);
    
    // Renderizar calendario
    renderizarCalendario(eventosAgrupadosGlobal, fechaActual.getMonth(), fechaActual.getFullYear());
  })
  .catch(error => {
    console.error('Error al obtener el calendario:', error);
    document.getElementById('calendario-grid').innerHTML = 
      '<p style="text-align:center; color:red;">No se pudieron cargar los eventos.</p>';
  });

// =====  AGRUPAR EVENTOS POR FECHA (CON RANGOS) =====
function agruparEventosPorFecha(eventos) {
  const mapa = new Map();
//   eventos.forEach(e => {
  // console.log('Descripción:', e.description);
//   console.log(':', extraerCategoriaDeHashtags(e.description));
// });
  eventos.forEach(evento => {
    if (!evento.startDate) return;
    
    const start = new Date(evento.startDate);
    const end = evento.endDate ? new Date(evento.endDate) : new Date(start);
    
    // Iterar día por día en el rango
    let current = new Date(start);
    while (current <= end) {
      const clave = current.toDateString();
      if (!mapa.has(clave)) {
        mapa.set(clave, []);
      }
      mapa.get(clave).push(evento);
      current.setDate(current.getDate() + 1);
    }
  });
  
  return mapa;
}

// =====  RENDERIZAR CALENDARIO =====
function renderizarCalendario(eventosAgrupados, mes, anio) {
  const grid = document.getElementById('calendario-grid');
  const titulo = document.getElementById('calendario-mes');
  
  if (!grid || !titulo) {
    console.error('No se encontraron elementos del calendario');
    return;
  }
  
  // Actualizar título
  const nombreMes = new Date(anio, mes).toLocaleString('es-ES', { month: 'long' });
  titulo.textContent = `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${anio}`;
  
  // Obtener primer día del mes y cantidad de días
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const diaInicioSemana = primerDia.getDay(); // 0 = domingo
  
  // Días del mes anterior para rellenar
  const diasMesAnterior = new Date(anio, mes, 0).getDate();
  
  grid.innerHTML = '';
  
  // Rellenar días vacíos del mes anterior
  for (let i = diaInicioSemana - 1; i >= 0; i--) {
    const dia = diasMesAnterior - i;
    const celda = crearCelda(dia, true);
    grid.appendChild(celda);
  }
  
  // Días del mes actual
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(anio, mes, dia);
    const fechaStr = fecha.toDateString();
    const eventosDelDia = eventosAgrupados.get(fechaStr) || [];
    const celda = crearCelda(dia, false, eventosDelDia, fecha);
    grid.appendChild(celda);
  }
  
  // Rellenar días del mes siguiente (para completar la última semana)
  const totalCeldas = diaInicioSemana + diasEnMes;
  const celdasRestantes = (7 - (totalCeldas % 7)) % 7;
  for (let dia = 1; dia <= celdasRestantes; dia++) {
    const celda = crearCelda(dia, true);
    grid.appendChild(celda);
  }
  
  // Gestionar navegación
  gestionarNavegacion(mes, anio);
}

// =====  CREAR CELDA INDIVIDUAL =====
function crearCelda(numero, esOtroMes, eventos = [], fecha = null) {
  const celda = document.createElement('div');
  celda.className = 'calendario-dia';
  if (esOtroMes) {
    celda.classList.add('otro-mes');
  }
  
  // Número del día
  const numeroDiv = document.createElement('div');
  numeroDiv.className = 'dia-numero';
  numeroDiv.textContent = numero;
  celda.appendChild(numeroDiv);
  
  // Si tiene eventos y no es de otro mes
  if (!esOtroMes && eventos.length > 0) {
    celda.classList.add('con-evento');
    
    // Determinar colores para el degradado
      const colores = eventos.map(e => {
        const categoria = extraerCategoriaDeHashtags(e.description);
        return coloresPorCategoria[categoria] || colorGenerico;
      });
    
    // Crear degradado con los colores (si hay más de uno)
    if (colores.length === 1) {
      celda.style.background = colores[0];
    } else if (colores.length > 1) {
      const coloresUnicos = [...new Set(colores)];
      const gradiente = `linear-gradient(135deg, ${coloresUnicos.join(', ')})`;
      celda.style.background = gradiente;
    }
    
    // Agregar etiquetas de eventos (máximo 2)
    const maxEtiquetas = 2;
    eventos.slice(0, maxEtiquetas).forEach(e => {
      const etiqueta = document.createElement('div');
      etiqueta.className = 'evento-etiqueta';
      etiqueta.textContent = e.summary || 'Evento';
      celda.appendChild(etiqueta);
    });
    
    if (eventos.length > maxEtiquetas) {
      const mas = document.createElement('div');
      mas.className = 'evento-etiqueta-multiple';
      mas.textContent = `+${eventos.length - maxEtiquetas} más`;
      celda.appendChild(mas);
    }
    
    // Evento click para abrir modal
    celda.addEventListener('click', () => {
      abrirModalEventos(eventos, fecha);
    });
  }
  
  return celda;
}

// =====  ABRIR MODAL CON BOOTSTRAP =====
function abrirModalEventos(eventos, fecha) {
  const modalBody = document.getElementById('eventoModalBody');
  const modalTitle = document.getElementById('eventoModalLabel');
  
  if (!modalBody || !modalTitle) {
    console.error('Elementos del modal no encontrados');
    return;
  }
  
  // Formatear fecha
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = fecha.toLocaleDateString('es-ES', opciones);
  
  if (eventos.length === 1) {
    // Un solo evento: mostrar todo
    const e = eventos[0];
    modalTitle.textContent = e.summary || 'Evento';
    modalBody.innerHTML = `
      <p><strong>Fecha:</strong> ${fechaStr}</p>
      <p><strong>Hora:</strong> ${e.startDate ? e.startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'No especificada'}</p>
      ${e.endDate ? `<p><strong>Fin:</strong> ${e.endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
      ${e.location ? `<p><strong>Ubicación:</strong> ${e.location}</p>` : ''}
      ${e.description ? `<p><strong>Descripción:</strong> ${e.description}</p>` : ''}
    `;
  } else {
    // Múltiples eventos: mostrar lista con botones "Ver más"
    modalTitle.textContent = `Eventos del ${fechaStr}`;
    let html = `<p><strong>${eventos.length} eventos en esta fecha:</strong></p><ul class="list-group">`;
    
    // Ordenar por hora (si existe)
    eventos.sort((a, b) => (a.startDate || 0) - (b.startDate || 0));
    
    eventos.forEach(e => {
      const hora = e.startDate ? e.startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Hora no especificada';
      // Escapar caracteres especiales para JSON
      const eventoJSON = JSON.stringify(e).replace(/'/g, "&#39;");
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>${e.summary || 'Evento'}</strong>
            <br><small>${hora}</small>
          </div>
          <button class="btn btn-sm btn-outline-primary ver-detalle" data-evento='${eventoJSON}'>
            Ver más
          </button>
        </li>
      `;
    });
    
    html += '</ul>';
    modalBody.innerHTML = html;
    
    // Delegar eventos a los botones "Ver más"
    modalBody.querySelectorAll('.ver-detalle').forEach(btn => {
      btn.addEventListener('click', function() {
        const evento = JSON.parse(this.dataset.evento);
        mostrarDetalleEvento(evento, fechaStr);
      });
    });
  }
  
  // modal
  if (typeof bootstrap !== 'undefined') {
    const modalElement = document.getElementById('eventoModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    console.error('Bootstrap no está disponible');
  }
}

// ===== MOSTRAR DETALLE DE UN EVENTO =====
function mostrarDetalleEvento(e, fechaStr) {
  const modalBody = document.getElementById('eventoModalBody');
  const modalTitle = document.getElementById('eventoModalLabel');
  
  modalTitle.textContent = e.summary || 'Evento';
  modalBody.innerHTML = `
    <p><strong>Fecha:</strong> ${fechaStr}</p>
    <p><strong>Hora:</strong> ${e.startDate ? new Date(e.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'No especificada'}</p>
    ${e.endDate ? `<p><strong>Fin:</strong> ${new Date(e.endDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
    ${e.location ? `<p><strong>Ubicación:</strong> ${e.location}</p>` : ''}
    ${e.description ? `<p><strong>Descripción:</strong> ${e.description}</p>` : ''}
  `;
}

// ===== GESTIONAR NAVEGACIÓN =====
function gestionarNavegacion(mes, anio) {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  
  if (!prevBtn || !nextBtn) return;
  
  const diffMeses = (anio - anioActual) * 12 + (mes - mesActual);
  
  prevBtn.disabled = diffMeses <= -2;
  nextBtn.disabled = diffMeses >= 3;
}

// =====  CAMBIAR MES =====
function cambiarMes(delta) {
  let nuevoMes = fechaActual.getMonth() + delta;
  let nuevoAnio = fechaActual.getFullYear();
  
  if (nuevoMes < 0) {
    nuevoMes = 11;
    nuevoAnio--;
  } else if (nuevoMes > 11) {
    nuevoMes = 0;
    nuevoAnio++;
  }
  
  // Verificar límites
  const diffMeses = (nuevoAnio - anioActual) * 12 + (nuevoMes - mesActual);
  if (diffMeses < -2 || diffMeses > 3) return;
  
  fechaActual = new Date(nuevoAnio, nuevoMes, 1);
  
  // Re-renderizar con los eventos agrupados
  if (eventosAgrupadosGlobal.size > 0) {
    renderizarCalendario(eventosAgrupadosGlobal, nuevoMes, nuevoAnio);
  }
}

// =====  EVENT LISTENERS PARA NAVEGACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => cambiarMes(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => cambiarMes(1));
  }
});

// Función para extraer hashtags de la descripción y aplicar colores según la categoría
function extraerCategoriaDeHashtags(descripcion) {
  if (!descripcion) return 'generico';
  
  // Buscar palabras que comiencen con # en la descripción
  const hashtags = descripcion.match(/#([a-zA-Z0-9_]+)/g);
  
  if (!hashtags) return 'generico';
  
  // Convertir a minúsculas y limpiar el #
  const categoriasEncontradas = hashtags.map(tag => tag.toLowerCase().replace('#', ''));
  
  // Prioridad: si hay varios, usar el primero que coincida con tus colores
  const prioridad = ['taller', 'seminario', 'evento'];
  
  for (const prioridadTag of prioridad) {
    if (categoriasEncontradas.includes(prioridadTag)) {
      return prioridadTag;
    }
  }
  
  // Si no coincide con ninguna prioridad, usar el primer hashtag encontrado
  return categoriasEncontradas[0] || 'generico';
}
