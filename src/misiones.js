// ============================================================================
//  MISIONES — Sistema de Pedidos y Clientes · Informática III (Grupo 1301)
// ============================================================================
//  Este es el ÚNICO archivo de lógica que vas a modificar.
//
//  Cada función está "vacía" a propósito. Tu sitio publicado en Vercel tiene un
//  panel de verificación que corre casos de prueba contra estas funciones y te
//  dice cuál falla, qué esperaba y qué obtuvo. Lee el caso que falla ANTES de
//  cambiar código: así se trabaja con pruebas unitarias (lo verás en 3.4).
//
//  Puedes verificar sin publicar con:  npm run verificar
//
//  Orden recomendado: 1 → 2 → 3 → 4 → 5. La 6 es para Destacado.
// ============================================================================

import { ESTADOS } from './datos.js'

// ----------------------------------------------------------------------------
// MISIÓN 1 · RF3 — ¿Cuánto paga el cliente?
// ----------------------------------------------------------------------------
export function totalPedido(pedido) {
  // 1. Si no hay pedido o no tiene items, retorna 0
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    return 0;
  }

  // 2. Calcular el subtotal sumando (cantidad × precioUnitario) de cada item
  const subtotal = pedido.items.reduce((acumulado, item) => {
    return acumulado + (item.cantidad * item.precioUnitario);
  }, 0);

  // 3. Obtener el descuento (si no viene o es undefined, por defecto es 0)
  const descuento = pedido.descuento ?? 0;

  // 4. Calcular el total sin redondear
  const totalSinRedondear = subtotal * (1 - descuento);

  // 5. Redondear a 2 decimales usando la pista del ejercicio
  const total = Math.round(totalSinRedondear * 100) / 100;

  return total;
}

// ----------------------------------------------------------------------------
// MISIÓN 2 · RF4 — ¿Este cambio de estado es válido?
// ----------------------------------------------------------------------------
export function puedeTransicionar(actual, nuevo) {
  const indexActual = ESTADOS.indexOf(actual);
  const indexNuevo = ESTADOS.indexOf(nuevo);

  // Si alguno de los estados no existe en el arreglo, su índice es -1
  if (indexActual === -1 || indexNuevo === -1) {
    return false;
  }

  // Debe ser exactamente el siguiente paso en orden
  return indexNuevo === indexActual + 1;
}

// ----------------------------------------------------------------------------
// MISIÓN 3 · RF1 — ¿Los datos del cliente son válidos?
// ----------------------------------------------------------------------------
export function validarCliente(cliente) {
  const errores = [];
  const nombre = cliente?.nombre;
  const telefono = cliente?.telefono;
  const email = cliente?.email;

  // 'nombre_requerido' → nombre vacío, no string o solo espacios
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    errores.push('nombre_requerido');
  }

  // 'telefono_invalido' → después de quitar espacios y guiones, no son exactamente 10 dígitos
  const telLimpio = telefono ? String(telefono).replace(/[\s-]/g, '') : '';
  if (!/^\d{10}$/.test(telLimpio)) {
    errores.push('telefono_invalido');
  }

  // 'email_invalido' → el email VIENE (no está vacío/null/undefined) y no tiene forma de correo: algo@algo.algo
  if (email && email.trim() !== '') {
    // Expresión regular estándar y robusta para validar correos
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      errores.push('email_invalido');
    }
  }

  return errores;
}

// ----------------------------------------------------------------------------
// MISIÓN 4 · RF5 — ¿Cuántos pedidos hay en cada estado?
// ----------------------------------------------------------------------------
export function resumenPorEstado(pedidos) {
  // Inicializamos un objeto con todos los estados en 0
  const resumen = {};
  ESTADOS.forEach(estado => {
    resumen[estado] = 0;
  });

  if (!Array.isArray(pedidos)) {
    return resumen;
  }

  // Contamos cada pedido según su estado
  pedidos.forEach(pedido => {
    if (pedido && pedido.estado && resumen.hasOwnProperty(pedido.estado)) {
      resumen[pedido.estado]++;
    }
  });

  return resumen;
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// MISIÓN 5 · RF5 — Buscar pedidos por nombre de cliente
// ----------------------------------------------------------------------------
export function buscarPedidos(pedidos, texto) {
  if (!Array.isArray(pedidos)) {
    return [];
  }

  // Si el texto está vacío o solo tiene espacios, devuelve todos
  if (!texto || texto.trim() === '') {
    return [...pedidos];
  }

  // Normalizamos el texto de búsqueda (sin acentos, minúsculas)
  const textoNormalizado = texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return pedidos.filter(pedido => {
    // Soportamos tanto si pedido.cliente es objeto o string
    let nombreCliente = '';
    if (typeof pedido?.cliente === 'string') {
      nombreCliente = pedido.cliente;
    } else if (pedido?.cliente && typeof pedido.cliente === 'object') {
      nombreCliente = pedido.cliente.nombre || '';
    }

    if (!nombreCliente) return false;

    // Normalizamos el nombre del cliente del pedido
    const nombreNormalizado = nombreCliente
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return nombreNormalizado.includes(textoNormalizado);
  });
}

// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
export function topClientes(pedidos, n) {
  if (!Array.isArray(pedidos) || n <= 0) {
    return [];
  }

  const acumuladoClientes = {};

  // Sumamos el total de los pedidos por cada cliente reutilizando totalPedido
  pedidos.forEach(pedido => {
    let nombreCliente = '';
    if (typeof pedido?.cliente === 'string') {
      nombreCliente = pedido.cliente;
    } else if (pedido?.cliente && typeof pedido.cliente === 'object') {
      nombreCliente = pedido.cliente.nombre || '';
    }

    if (!nombreCliente) return;

    const total = totalPedido(pedido);

    if (!acumuladoClientes[nombreCliente]) {
      acumuladoClientes[nombreCliente] = 0;
    }
    // Evitamos errores de precisión sumando enteros (centavos) o redondeando
    acumuladoClientes[nombreCliente] = Math.round((acumuladoClientes[nombreCliente] + total) * 100) / 100;
  });

  // Convertimos el objeto acumulador a un arreglo de objetos [{ cliente, total }]
  const listaClientes = Object.entries(acumuladoClientes).map(([cliente, total]) => {
    return {
      cliente,
      total: Math.round(total * 100) / 100
    };
  });

  // Ordenamos: total de mayor a menor; si empatan, por nombre alfabético (A-Z)
  listaClientes.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total; // Mayor a menor
    }
    return a.cliente.localeCompare(b.cliente, 'es', { sensitivity: 'base' }); // Alfabético con soporte en español
  });

  // Devolvemos únicamente los primeros `n` elementos
  return listaClientes.slice(0, n);
}