import { createClient } from '@supabase/supabase-js'

// Check for Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to load/save from localStorage if Supabase is not configured
const getLocalData = (key, defaultVal = []) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultVal
}

const saveLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Initial mock data if localStorage is empty to show the user a premium experience immediately
const initMockData = () => {
  const existingUsers = localStorage.getItem('usuarios')
  if (existingUsers && !existingUsers.includes('permisos')) {
    localStorage.removeItem('usuarios')
  }

  if (!localStorage.getItem('proveedores')) {
    saveLocalData('proveedores', [
      { id: 1, nombre: 'Distribuidora La Meseta', contacto: '+506 8888-1111', correo: 'ventas@lameseta.com' },
      { id: 2, nombre: 'Textiles El Ángel', contacto: '+506 7777-2222', correo: 'contacto@elangel.com' },
      { id: 3, nombre: 'FarmaCentral', contacto: '+506 6666-3333', correo: 'pedidos@farmacentral.com' }
    ])
  }

  if (!localStorage.getItem('productos')) {
    saveLocalData('productos', [
      { id: 1, nombre: 'Galletas Chocochitas', existencia_minima: 10, existencia_actual: 25, costo: 450, precio: 600, clasificacion: 'Cafetería', proveedor_id: 1, codigos_barra: ['7501000111222', '7501000111223'] },
      { id: 2, nombre: 'Coca Cola 600ml', existencia_minima: 15, existencia_actual: 8, costo: 700, precio: 1000, clasificacion: 'Cafetería', proveedor_id: 1, codigos_barra: ['7501055300075'] },
      { id: 3, nombre: 'Jabón de Baño Floral', existencia_minima: 5, existencia_actual: 12, costo: 350, precio: 500, clasificacion: 'Pulpería', proveedor_id: 1, codigos_barra: ['7501025811005'] },
      { id: 4, nombre: 'Acetaminofén 500mg', existencia_minima: 20, existencia_actual: 18, costo: 100, precio: 250, clasificacion: 'Farmacia', proveedor_id: 3, codigos_barra: ['7501036922001'] },
      { id: 5, nombre: 'Camiseta Visión Jesús Blanca M', existencia_minima: 5, existencia_actual: 4, costo: 3500, precio: 5000, clasificacion: 'Textiles', proveedor_id: 2, codigos_barra: ['VJ-TEE-WHT-M'] }
    ])
  }

  if (!localStorage.getItem('ventas')) {
    saveLocalData('ventas', [
      { id: 'FAC-1001', fecha: new Date(Date.now() - 3600000 * 2).toISOString(), items: [{ producto_id: 1, nombre: 'Galletas Chocochitas', cantidad: 2, precio: 600 }], total: 1200, metodo_pago: 'Efectivo', detalles_pago: { pagado: 2000, vuelto: 800 } },
      { id: 'FAC-1002', fecha: new Date(Date.now() - 3600000).toISOString(), items: [{ producto_id: 5, nombre: 'Camiseta Visión Jesús Blanca M', cantidad: 1, precio: 5000 }], total: 5000, metodo_pago: 'SINPE Móvil', detalles_pago: { comprobante: '99827162' } }
    ])
  }

  if (!localStorage.getItem('movimientos_inventario')) {
    saveLocalData('movimientos_inventario', [
      { id: 1, fecha: new Date(Date.now() - 3600000 * 24).toISOString(), producto_id: 1, tipo: 'entrada', cantidad: 25, usuario: 'admin', motivo: 'Carga inicial de inventario', costo_unitario: 450 },
      { id: 2, fecha: new Date(Date.now() - 3600000 * 12).toISOString(), producto_id: 2, tipo: 'entrada', cantidad: 10, usuario: 'editor_tienda', motivo: 'Compra mensual', costo_unitario: 700 },
      { id: 3, fecha: new Date(Date.now() - 3600000 * 2).toISOString(), producto_id: 1, tipo: 'salida', cantidad: 2, usuario: 'caja_ventas', motivo: 'Venta Factura FAC-1001', costo_unitario: 450 },
      { id: 4, fecha: new Date(Date.now() - 3600000).toISOString(), producto_id: 5, tipo: 'salida', cantidad: 1, usuario: 'caja_ventas', motivo: 'Venta Factura FAC-1002', costo_unitario: 3500 }
    ])
  }

  if (!localStorage.getItem('usuarios')) {
    saveLocalData('usuarios', [
      { id: 1, usuario: 'admin', contrasena: 'admin123', nombre: 'Administrador Principal', permisos: ['facturar', 'productos', 'stock', 'proveedores', 'reportes', 'usuarios'] },
      { id: 2, usuario: 'cajero', contrasena: 'tienda123', nombre: 'Cajero Tienda', permisos: ['facturar'] },
      { id: 3, usuario: 'inventario', contrasena: 'inventario123', nombre: 'Encargado Stock', permisos: ['productos', 'stock', 'proveedores'] },
      { id: 4, usuario: 'reportes', contrasena: 'reportes123', nombre: 'Analista Reportes', permisos: ['reportes'] }
    ])
  }
}

initMockData()

export const db = {
  // --- USUARIOS & AUTH ---
  async getUsuarios() {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').select('*').order('nombre')
      if (error) throw error
      return data
    }
    return getLocalData('usuarios').sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  async addUsuario(user) {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').insert([user]).select()
      if (error) throw error
      return data[0]
    }
    const usuarios = getLocalData('usuarios')
    if (usuarios.some(u => u.usuario.toLowerCase() === user.usuario.toLowerCase())) {
      throw new Error('El nombre de usuario ya existe')
    }
    const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1
    const newU = { id: newId, ...user }
    saveLocalData('usuarios', [...usuarios, newU])
    return newU
  },

  async updateUsuario(id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').update(updates).eq('id', id).select()
      if (error) throw error
      return data[0]
    }
    const usuarios = getLocalData('usuarios')
    const idx = usuarios.findIndex(u => u.id === Number(id))
    if (idx !== -1) {
      if (updates.usuario && usuarios.some(u => u.id !== Number(id) && u.usuario.toLowerCase() === updates.usuario.toLowerCase())) {
        throw new Error('El nombre de usuario ya existe')
      }
      usuarios[idx] = { ...usuarios[idx], ...updates }
      saveLocalData('usuarios', usuarios)
      return usuarios[idx]
    }
    throw new Error('Usuario no encontrado')
  },

  async deleteUsuario(id) {
    if (supabase) {
      const { error } = await supabase.from('usuarios').delete().eq('id', id)
      if (error) throw error
      return true
    }
    const usuarios = getLocalData('usuarios')
    const filtered = usuarios.filter(u => u.id !== Number(id))
    saveLocalData('usuarios', filtered)
    return true
  },

  async login(username, password) {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').select('*').eq('usuario', username).eq('contrasena', password)
      if (error) throw error
      return data.length ? data[0] : null
    }
    const usuarios = getLocalData('usuarios')
    const match = usuarios.find(u => u.usuario.toLowerCase() === username.toLowerCase() && u.contrasena === password)
    return match || null
  },
  // --- PROVEEDORES ---
  async getProveedores() {
    if (supabase) {
      const { data, error } = await supabase.from('proveedores').select('*').order('nombre')
      if (error) throw error
      return data
    }
    return getLocalData('proveedores').sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  async addProveedor(proveedor) {
    if (supabase) {
      const { data, error } = await supabase.from('proveedores').insert([proveedor]).select()
      if (error) throw error
      return data[0]
    }
    const proveedores = getLocalData('proveedores')
    const newId = proveedores.length ? Math.max(...proveedores.map(p => p.id)) + 1 : 1
    const newProv = { id: newId, ...proveedor }
    saveLocalData('proveedores', [...proveedores, newProv])
    return newProv
  },

  async updateProveedor(id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('proveedores').update(updates).eq('id', id).select()
      if (error) throw error
      return data[0]
    }
    const proveedores = getLocalData('proveedores')
    const idx = proveedores.findIndex(p => p.id === Number(id))
    if (idx !== -1) {
      proveedores[idx] = { ...proveedores[idx], ...updates }
      saveLocalData('proveedores', proveedores)
      return proveedores[idx]
    }
    throw new Error('Proveedor no encontrado')
  },

  async deleteProveedor(id) {
    if (supabase) {
      const { error } = await supabase.from('proveedores').delete().eq('id', id)
      if (error) throw error
      return true
    }
    const proveedores = getLocalData('proveedores')
    const filtered = proveedores.filter(p => p.id !== Number(id))
    saveLocalData('proveedores', filtered)
    return true
  },

  // --- PRODUCTOS ---
  async getProductos() {
    if (supabase) {
      const { data: prods, error: err1 } = await supabase.from('productos').select('*')
      if (err1) throw err1
      
      const { data: codes, error: err2 } = await supabase.from('codigos_barra').select('*')
      if (err2) throw err2

      return prods.map(p => ({
        ...p,
        codigos_barra: codes.filter(c => c.producto_id === p.id).map(c => c.codigo)
      }))
    }
    return getLocalData('productos')
  },

  async addProducto(producto) {
    const { codigos_barra, ...rest } = producto
    if (supabase) {
      const { data, error } = await supabase.from('productos').insert([rest]).select()
      if (error) throw error
      const newProd = data[0]
      if (codigos_barra && codigos_barra.length) {
        const codesToInsert = codigos_barra.map(c => ({ producto_id: newProd.id, codigo: c }))
        const { error: err2 } = await supabase.from('codigos_barra').insert(codesToInsert)
        if (err2) throw err2
      }
      return { ...newProd, codigos_barra }
    }
    const productos = getLocalData('productos')
    const newId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1
    const newProd = { id: newId, ...producto }
    saveLocalData('productos', [...productos, newProd])

    // Log initial stock entry if stock > 0
    if (newProd.existencia_actual > 0) {
      const movimientos = getLocalData('movimientos_inventario')
      const newMovId = movimientos.length ? Math.max(...movimientos.map(m => m.id)) + 1 : 1
      movimientos.push({
        id: newMovId,
        fecha: new Date().toISOString(),
        producto_id: newProd.id,
        tipo: 'entrada',
        cantidad: newProd.existencia_actual,
        usuario: 'admin',
        motivo: 'Registro inicial de producto',
        costo_unitario: newProd.costo
      })
      saveLocalData('movimientos_inventario', movimientos)
    }

    return newProd
  },

  async updateProducto(id, updates) {
    const { codigos_barra, ...rest } = updates
    if (supabase) {
      const { data, error } = await supabase.from('productos').update(rest).eq('id', id).select()
      if (error) throw error
      
      if (codigos_barra) {
        const { error: errDel } = await supabase.from('codigos_barra').delete().eq('producto_id', id)
        if (errDel) throw errDel
        if (codigos_barra.length) {
          const codesToInsert = codigos_barra.map(c => ({ producto_id: id, codigo: c }))
          const { error: errAdd } = await supabase.from('codigos_barra').insert(codesToInsert)
          if (errAdd) throw errAdd
        }
      }
      return { ...data[0], codigos_barra }
    }
    const productos = getLocalData('productos')
    const idx = productos.findIndex(p => p.id === Number(id))
    if (idx !== -1) {
      const oldStock = productos[idx].existencia_actual
      productos[idx] = { ...productos[idx], ...updates }
      saveLocalData('productos', productos)

      // If stock changed directly in the edit modal, log a manual adjustment movement
      const diff = productos[idx].existencia_actual - oldStock
      if (diff !== 0) {
        const movimientos = getLocalData('movimientos_inventario')
        const newMovId = movimientos.length ? Math.max(...movimientos.map(m => m.id)) + 1 : 1
        movimientos.push({
          id: newMovId,
          fecha: new Date().toISOString(),
          producto_id: productos[idx].id,
          tipo: diff > 0 ? 'entrada' : 'salida',
          cantidad: Math.abs(diff),
          usuario: 'admin',
          motivo: 'Ajuste manual en edición de producto',
          costo_unitario: productos[idx].costo
        })
        saveLocalData('movimientos_inventario', movimientos)
      }

      return productos[idx]
    }
    throw new Error('Producto no encontrado')
  },

  async deleteProducto(id) {
    if (supabase) {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      return true
    }
    const productos = getLocalData('productos')
    const filtered = productos.filter(p => p.id !== Number(id))
    saveLocalData('productos', filtered)
    return true
  },

  // --- MOVIMIENTOS INVENTARIO ---
  async getMovimientos() {
    if (supabase) {
      const { data, error } = await supabase.from('movimientos_inventario').select('*').order('fecha', { ascending: false })
      if (error) throw error
      return data
    }
    return getLocalData('movimientos_inventario').sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  },

  async addMovimiento(mov) {
    if (supabase) {
      const { data, error } = await supabase.from('movimientos_inventario').insert([mov]).select()
      if (error) throw error
      return data[0]
    }

    const movimientos = getLocalData('movimientos_inventario')
    const productos = getLocalData('productos')
    const newId = movimientos.length ? Math.max(...movimientos.map(m => m.id)) + 1 : 1

    const newMov = {
      id: newId,
      fecha: new Date().toISOString(),
      ...mov
    }

    // Apply stock delta to product
    const pIdx = productos.findIndex(p => p.id === Number(mov.producto_id))
    if (pIdx !== -1) {
      const qty = parseInt(mov.cantidad)
      if (mov.tipo === 'entrada') {
        productos[pIdx].existencia_actual += qty
      } else {
        productos[pIdx].existencia_actual = Math.max(0, productos[pIdx].existencia_actual - qty)
      }
      newMov.costo_unitario = productos[pIdx].costo // Record cost snapshot
      saveLocalData('productos', productos)
    }

    movimientos.push(newMov)
    saveLocalData('movimientos_inventario', movimientos)
    return newMov
  },

  // --- VENTAS ---
  async getVentas() {
    if (supabase) {
      const { data, error } = await supabase.from('ventas').select('*').order('fecha', { ascending: false })
      if (error) throw error
      return data
    }
    return getLocalData('ventas').sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  },

  async addVenta(venta) {
    if (supabase) {
      const { data, error } = await supabase.from('ventas').insert([venta]).select()
      if (error) throw error
      return data[0]
    }
    const ventas = getLocalData('ventas')
    const nextNum = ventas.length ? Math.max(...ventas.map(v => parseInt(v.id.split('-')[1]) || 1000)) + 1 : 1001
    const newVenta = {
      id: `FAC-${nextNum}`,
      fecha: new Date().toISOString(),
      ...venta
    }

    // Decrement stock in product catalog and record inventory exit movement
    const productos = getLocalData('productos')
    const movimientos = getLocalData('movimientos_inventario')

    venta.items.forEach(item => {
      const pIdx = productos.findIndex(p => p.id === Number(item.producto_id))
      if (pIdx !== -1) {
        productos[pIdx].existencia_actual = Math.max(0, productos[pIdx].existencia_actual - item.cantidad)
        
        // Add Kardex movement
        const newMovId = movimientos.length ? Math.max(...movimientos.map(m => m.id)) + 1 : 1
        movimientos.push({
          id: newMovId,
          fecha: new Date().toISOString(),
          producto_id: item.producto_id,
          tipo: 'salida',
          cantidad: item.cantidad,
          usuario: 'caja_ventas',
          motivo: `Venta Factura ${newVenta.id}`,
          costo_unitario: productos[pIdx].costo
        })
      }
    })

    saveLocalData('productos', productos)
    saveLocalData('movimientos_inventario', movimientos)
    saveLocalData('ventas', [...ventas, newVenta])
    return newVenta
  }
}
