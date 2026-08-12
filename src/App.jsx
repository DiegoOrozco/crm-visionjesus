import React, { useState, useEffect, useRef } from 'react'
import { 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  Plus, 
  Search, 
  Trash2, 
  Minus, 
  Camera, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  X, 
  Check, 
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Phone,
  Barcode,
  Lock,
  User,
  LogOut,
  UserCheck,
  Download
} from 'lucide-react'
import { db } from './db'
import { Html5QrcodeScanner } from 'html5-qrcode'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('facturar')
  
  // App data states
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [ventas, setVentas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [alerts, setAlerts] = useState([])

  // Login states
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')

  // Load Data
  const loadData = async () => {
    try {
      const prods = await db.getProductos()
      const provs = await db.getProveedores()
      const vts = await db.getVentas()
      const movs = await db.getMovimientos()
      const usrs = await db.getUsuarios()
      
      setProductos(prods)
      setProveedores(provs)
      setVentas(vts)
      setMovimientos(movs)
      setUsuarios(usrs)

      // Calculate low stock alerts
      const stockAlerts = prods.filter(p => p.existencia_actual <= p.existencia_minima)
      setAlerts(stockAlerts)
    } catch (err) {
      console.error("Error loading data", err)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUser])

  // Handle Login submission
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!loginUser.trim() || !loginPass.trim()) return

    try {
      const matchedUser = await db.login(loginUser.trim(), loginPass)
      if (matchedUser) {
        setCurrentUser(matchedUser)
        // Select first available tab matching permissions
        const perms = matchedUser.permisos || []
        if (perms.includes('facturar')) {
          setActiveTab('facturar')
        } else if (perms.includes('productos') || perms.includes('stock')) {
          setActiveTab('productos')
        } else if (perms.includes('proveedores')) {
          setActiveTab('proveedores')
        } else if (perms.includes('reportes')) {
          setActiveTab('reportes')
        } else if (perms.includes('usuarios')) {
          setActiveTab('usuarios')
        } else {
          setActiveTab('')
        }
      } else {
        setLoginError('Usuario o contraseña incorrectos.')
      }
    } catch (err) {
      setLoginError('Error de servidor al intentar iniciar sesión.')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setLoginUser('')
    setLoginPass('')
    setLoginError('')
  }

  // --- RENDER LOGIN VIEW IF NO USER IS LOGGED IN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 font-sans">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo_oficial_transparente.png" className="w-16 h-16 object-contain mb-4" alt="Visión Jesús Logo" />
            <h1 className="text-xl font-bold text-white leading-tight">Visión Jesús</h1>
            <p className="text-xs text-sky-400 font-semibold tracking-wider uppercase mt-1">Ingreso al Sistema CRM</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-semibold">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-gray-500 w-4.5 h-4.5" />
                <input 
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="Ingrese su usuario..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-semibold">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500 w-4.5 h-4.5" />
                <input 
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Ingrese su contraseña..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-semibold text-center">
                {loginError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 mt-2"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] text-gray-600">
            &copy; {new Date().getFullYear()} Iglesia Visión Jesús &bull; Todos los derechos reservados.
          </div>
        </div>
      </div>
    )
  }

  // --- GRANULAR PERMISSION CHECKS ---
  const canAccessTab = (tab) => {
    const perms = currentUser.permisos || []
    if (tab === 'facturar') return perms.includes('facturar')
    if (tab === 'productos') return perms.includes('productos') || perms.includes('stock')
    if (tab === 'proveedores') return perms.includes('proveedores')
    if (tab === 'reportes') return perms.includes('reportes')
    if (tab === 'usuarios') return perms.includes('usuarios')
    return false
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0c1220] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand/Logo & Logged User Info */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo_oficial_transparente.png" className="w-10 h-10 object-contain" alt="Visión Jesús Logo" />
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">Visión Jesús</h1>
                <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase">CRM Inventario</p>
              </div>
            </div>
            
            {/* Logged user badge */}
            <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 flex flex-col">
              <span className="text-xs text-white font-bold truncate flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                {currentUser.nombre}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 ml-5">
                Acceso Personalizado
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {canAccessTab('facturar') && (
              <button
                onClick={() => setActiveTab('facturar')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'facturar'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                Facturar
              </button>
            )}

            {canAccessTab('productos') && (
              <button
                onClick={() => setActiveTab('productos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'productos'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Package className="w-5 h-5" />
                Productos
                {alerts.length > 0 && (
                  <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/30 font-bold animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
            )}

            {canAccessTab('proveedores') && (
              <button
                onClick={() => setActiveTab('proveedores')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'proveedores'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Users className="w-5 h-5" />
                Proveedores
              </button>
            )}

            {canAccessTab('reportes') && (
              <button
                onClick={() => setActiveTab('reportes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'reportes'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Reportes
              </button>
            )}

            {canAccessTab('usuarios') && (
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'usuarios'
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Users className="w-5 h-5 text-indigo-400" />
                Gestionar Usuarios
              </button>
            )}
          </nav>
        </div>

        {/* Sync Footer & Logout */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>Base de datos:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              Local (Gratis)
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-2 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 font-bold transition"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
        {/* Render Tab Component */}
        {activeTab === 'facturar' && canAccessTab('facturar') && (
          <FacturacionTab productos={productos} refreshStock={loadData} currentUser={currentUser} />
        )}
        {activeTab === 'productos' && canAccessTab('productos') && (
          <ProductosTab productos={productos} proveedores={proveedores} movimientos={movimientos} refresh={loadData} currentUser={currentUser} />
        )}
        {activeTab === 'proveedores' && canAccessTab('proveedores') && (
          <ProveedoresTab proveedores={proveedores} refresh={loadData} currentUser={currentUser} />
        )}
        {activeTab === 'reportes' && canAccessTab('reportes') && (
          <ReportesTab ventas={ventas} productos={productos} movimientos={movimientos} />
        )}
        {activeTab === 'usuarios' && canAccessTab('usuarios') && (
          <UsuariosTab usuarios={usuarios} refresh={loadData} />
        )}
      </main>

    </div>
  )
}

/* ==========================================================================
   MÓDULO: FACTURACIÓN
   ========================================================================== */
function FacturacionTab({ productos, refreshStock, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  // Payment specifics
  const [amountPaid, setAmountPaid] = useState('')
  const [voucherNumber, setVoucherNumber] = useState('')
  const [sinpeNumber, setSinpeNumber] = useState('')

  // Ref for manual product barcode scans (USB/Bluetooth)
  const barcodeScanBuffer = useRef('')
  const lastKeyTime = useRef(Date.now())

  // USB/Bluetooth Barcode Reader Global Listener
  useEffect(() => {
    const handleKeyPress = (e) => {
      const currentTime = Date.now()
      
      if (currentTime - lastKeyTime.current > 60) {
        barcodeScanBuffer.current = ''
      }
      lastKeyTime.current = currentTime

      if (e.key === 'Enter') {
        if (barcodeScanBuffer.current.length > 2) {
          handleBarcodeScanned(barcodeScanBuffer.current)
          barcodeScanBuffer.current = ''
        }
      } else if (e.key !== 'Shift') {
        barcodeScanBuffer.current += e.key
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [productos, cart])

  // Camera scanner integration
  useEffect(() => {
    let qrScanner = null
    if (isCameraActive) {
      qrScanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      }, false)

      qrScanner.render((decodedText) => {
        handleBarcodeScanned(decodedText)
        setIsCameraActive(false)
        qrScanner.clear()
      }, (err) => {
        // Silent error
      })
    }

    return () => {
      if (qrScanner) {
        qrScanner.clear().catch(e => console.error("Error clearing scanner", e))
      }
    }
  }, [isCameraActive])

  // Trigger search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const matches = productos.filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      p.clasificacion.toLowerCase().includes(q) ||
      (p.codigos_barra && p.codigos_barra.some(code => code.includes(q)))
    )
    setSearchResults(matches)
  }, [searchQuery, productos])

  const handleBarcodeScanned = (code) => {
    const match = productos.find(p => p.codigos_barra && p.codigos_barra.includes(code))
    if (match) {
      addToCart(match)
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = audioCtx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, audioCtx.currentTime)
        osc.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.1)
      } catch (e) {}
    } else {
      alert(`Código de barra "${code}" no está asociado a ningún producto.`)
    }
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.producto_id === product.id)
    if (existing) {
      if (existing.cantidad >= product.existencia_actual) {
        alert("Existencias insuficientes para agregar más unidades.")
        return
      }
      setCart(cart.map(item => 
        item.producto_id === product.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      if (product.existencia_actual <= 0) {
        alert("Este producto no tiene stock disponible.")
        return
      }
      setCart([...cart, {
        producto_id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1
      }])
    }
  }

  const updateCartQty = (prodId, delta) => {
    const match = cart.find(i => i.producto_id === prodId)
    const product = productos.find(p => p.id === prodId)
    if (!match || !product) return

    const newQty = match.cantidad + delta
    if (newQty <= 0) {
      removeFromCart(prodId)
    } else if (newQty > product.existencia_actual) {
      alert("Excede existencias en inventario.")
    } else {
      setCart(cart.map(i => i.producto_id === prodId ? { ...i, cantidad: newQty } : i))
    }
  }

  const removeFromCart = (prodId) => {
    setCart(cart.filter(item => item.producto_id !== prodId))
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

  const processPayment = async () => {
    if (cart.length === 0) return

    const paymentDetails = {}
    if (paymentMethod === 'efectivo') {
      const cash = parseFloat(amountPaid)
      if (isNaN(cash) || cash < cartTotal) {
        alert("El monto pagado es insuficiente.")
        return
      }
      paymentDetails.pagado = cash
      paymentDetails.vuelto = cash - cartTotal
    } else if (paymentMethod === 'tarjeta') {
      if (!voucherNumber.trim()) {
        alert("Ingrese el número de comprobante/voucher.")
        return
      }
      paymentDetails.comprobante = voucherNumber
    } else if (paymentMethod === 'sinpe') {
      if (!sinpeNumber.trim()) {
        alert("Ingrese el comprobante del SINPE Móvil.")
        return
      }
      paymentDetails.comprobante = sinpeNumber
    }

    try {
      await db.addVenta({
        items: cart,
        total: cartTotal,
        metodo_pago: paymentMethod === 'efectivo' ? 'Efectivo' : paymentMethod === 'tarjeta' ? 'Tarjeta' : 'SINPE Móvil',
        detalles_pago: paymentDetails,
        usuario: currentUser.usuario
      })

      setCart([])
      setShowPaymentModal(false)
      setAmountPaid('')
      setVoucherNumber('')
      setSinpeNumber('')
      setPaymentMethod('')
      refreshStock()

      alert("¡Venta facturada y procesada con éxito!")
    } catch (err) {
      console.error(err)
      alert("Error al procesar la venta.")
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Facturación y Caja</h2>
          <p className="text-gray-400 text-sm">Cajero activo: <span className="text-sky-400 font-semibold">{currentUser.nombre}</span></p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsCameraActive(!isCameraActive)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#121c30] hover:bg-[#1a2842] text-sky-400 border border-sky-500/30 px-4 py-2.5 rounded-xl font-semibold transition"
          >
            <Camera className="w-5 h-5" />
            {isCameraActive ? 'Cerrar Cámara' : 'Escanear Celular'}
          </button>
        </div>
      </div>

      {/* Camera scanner wrapper */}
      {isCameraActive && (
        <div className="max-w-md mx-auto p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl relative">
          <button 
            onClick={() => setIsCameraActive(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div id="reader" className="overflow-hidden rounded-xl bg-black"></div>
          <p className="text-xs text-gray-400 text-center mt-3">Coloca el código de barras frente a la cámara.</p>
        </div>
      )}

      {/* MAIN BILLING LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Search & Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por nombre, código de barras o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1220] border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Results Grid */}
          <div className="glass-panel rounded-2xl p-6 border border-gray-800/80 min-h-[300px] flex flex-col">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Resultados de búsqueda</h3>
            
            {searchResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-center p-8">
                <Search className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="text-sm">Escribe algo en el buscador o usa un lector de códigos de barra para ver coincidencias.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {searchResults.map(p => (
                  <div 
                    key={p.id} 
                    className="p-4 bg-gray-900/60 border border-gray-800/80 hover:border-sky-500/40 rounded-xl flex flex-col justify-between transition cursor-pointer"
                    onClick={() => addToCart(p)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white line-clamp-1">{p.nombre}</h4>
                        <span className="text-xs bg-[#121c30] text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
                          {p.clasificacion}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-gray-500" />
                        {p.codigos_barra && p.codigos_barra.length > 0 ? p.codigos_barra[0] : 'Sin código'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/60">
                      <div>
                        <span className="text-xs text-gray-500 block">Precio</span>
                        <span className="text-base font-bold text-emerald-400">¢{p.precio}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Stock</span>
                        <span className={`text-xs font-semibold ${p.existencia_actual <= p.existencia_minima ? 'text-amber-400' : 'text-gray-300'}`}>
                          {p.existencia_actual} disp.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Factura / Cart */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-2xl border border-gray-800/80 flex flex-col sticky top-6">
            
            {/* Header Factura */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Cuenta Nueva</h3>
                <p className="text-xs text-gray-400">Detalle de tiquete actual</p>
              </div>
              <button 
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="text-gray-500 hover:text-red-400 text-xs font-semibold disabled:opacity-40 transition"
              >
                Limpiar todo
              </button>
            </div>

            {/* List */}
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto min-h-[200px]">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 stroke-[1.5]" />
                  <p className="text-sm">Agrega productos escaneando o buscando arriba.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.producto_id} className="flex justify-between items-center gap-4 bg-gray-950/40 p-3 rounded-xl border border-gray-900">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{item.nombre}</h4>
                      <span className="text-xs text-emerald-400 font-bold">¢{item.precio} c/u</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateCartQty(item.producto_id, -1)}
                        className="p-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-200">{item.cantidad}</span>
                      <button 
                        onClick={() => updateCartQty(item.producto_id, 1)}
                        className="p-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-gray-200 block">¢{item.precio * item.cantidad}</span>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.producto_id)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total Area */}
            <div className="p-6 bg-gray-950/60 border-t border-gray-800 space-y-4 rounded-b-2xl">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>¢{cartTotal}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-xl border-t border-gray-800 pt-3">
                <span>Total a Pagar</span>
                <span className="text-emerald-400">¢{cartTotal}</span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                Continuar a Pagar
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL DE PAGOS */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Método de Pago</h3>
            <p className="text-xs text-gray-400 mb-6">Selecciona cómo cancelará el cliente la suma de <span className="text-emerald-400 font-bold">¢{cartTotal}</span>.</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  paymentMethod === 'efectivo'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:bg-gray-800/40'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Efectivo
              </button>

              <button
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  paymentMethod === 'tarjeta'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:bg-gray-800/40'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Tarjeta
              </button>

              <button
                onClick={() => setPaymentMethod('sinpe')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  paymentMethod === 'sinpe'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:bg-gray-800/40'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                SINPE Móvil
              </button>
            </div>

            {paymentMethod === 'efectivo' && (
              <div className="space-y-4 bg-gray-950/50 p-4 rounded-xl border border-gray-900 mb-6">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Monto Entregado (Paga con)</label>
                  <input 
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="¢0"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                {parseFloat(amountPaid) >= cartTotal && (
                  <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                    <span className="text-gray-400">Vuelto:</span>
                    <span className="text-emerald-400 font-extrabold text-lg">¢{parseFloat(amountPaid) - cartTotal}</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'tarjeta' && (
              <div className="space-y-4 bg-gray-950/50 p-4 rounded-xl border border-gray-900 mb-6">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Número de Voucher / Comprobante</label>
                  <input 
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder="Ej: 998822"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'sinpe' && (
              <div className="space-y-4 bg-gray-950/50 p-4 rounded-xl border border-gray-900 mb-6">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Número de Transacción / Comprobante</label>
                  <input 
                    type="text"
                    value={sinpeNumber}
                    onChange={(e) => setSinpeNumber(e.target.value)}
                    placeholder="Ej: 54930128"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                onClick={processPayment}
                disabled={!paymentMethod}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-40"
              >
                Procesar Venta
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

/* ==========================================================================
   MÓDULO: PRODUCTOS (INVENTARIO)
   ========================================================================== */
function ProductosTab({ productos, proveedores, movimientos, refresh, currentUser }) {
  const [filterQuery, setFilterQuery] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  // Stock Adjustment State (Kardex)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustProduct, setAdjustProduct] = useState(null)
  const [adjustType, setAdjustType] = useState('entrada')
  const [adjustQty, setAdjustQty] = useState(1)
  const [adjustReason, setAdjustReason] = useState('Ingreso de mercadería')

  // Form states
  const [nombre, setNombre] = useState('')
  const [existenciaMinima, setExistenciaMinima] = useState(5)
  const [existenciaActual, setExistenciaActual] = useState(0)
  const [costo, setCosto] = useState('')
  const [precio, setPrecio] = useState('')
  const [clasificacion, setClasificacion] = useState('Cafetería')
  const [proveedorId, setProveedorId] = useState('')
  const [barcodes, setBarcodes] = useState([])
  const [newBarcode, setNewBarcode] = useState('')

  const perms = currentUser.permisos || []
  const canModifyProducts = perms.includes('productos')
  const canAdjustStock = perms.includes('stock')

  const resetForm = () => {
    setNombre('')
    setExistenciaMinima(5)
    setExistenciaActual(0)
    setCosto('')
    setPrecio('')
    setClasificacion('Cafetería')
    setProveedorId('')
    setBarcodes([])
    setNewBarcode('')
    setEditProduct(null)
  }

  const openAddModal = () => {
    if (!canModifyProducts) {
      alert("No tienes permisos para agregar productos.")
      return
    }
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (p) => {
    if (!canModifyProducts) {
      alert("No tienes permisos para modificar productos.")
      return
    }
    setEditProduct(p)
    setNombre(p.nombre)
    setExistenciaMinima(p.existencia_minima)
    setExistenciaActual(p.existencia_actual)
    setCosto(p.costo)
    setPrecio(p.precio)
    setClasificacion(p.clasificacion)
    setProveedorId(p.proveedor_id || '')
    setBarcodes(p.codigos_barra || [])
    setIsModalOpen(true)
  }

  const addBarcode = () => {
    if (newBarcode.trim() && !barcodes.includes(newBarcode.trim())) {
      setBarcodes([...barcodes, newBarcode.trim()])
      setNewBarcode('')
    }
  }

  const removeBarcode = (code) => {
    setBarcodes(barcodes.filter(c => c !== code))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canModifyProducts) return
    if (!nombre.trim() || !costo || !precio) {
      alert("Complete los campos obligatorios.")
      return
    }

    const payload = {
      nombre,
      existencia_minima: parseInt(existenciaMinima),
      existencia_actual: parseInt(existenciaActual),
      costo: parseFloat(costo),
      precio: parseFloat(precio),
      clasificacion,
      proveedor_id: proveedorId ? parseInt(proveedorId) : null,
      codigos_barra: barcodes
    }

    try {
      if (editProduct) {
        await db.updateProducto(editProduct.id, payload)
      } else {
        await db.addProducto(payload)
      }
      setIsModalOpen(false)
      refresh()
      resetForm()
    } catch (err) {
      console.error(err)
      alert("Error guardando el producto.")
    }
  }

  const handleDelete = async (id) => {
    if (!canModifyProducts) {
      alert("No tienes permisos para eliminar productos.")
      return
    }
    if (confirm("¿Está seguro de eliminar este producto?")) {
      try {
        await db.deleteProducto(id)
        refresh()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const openAdjustModal = (product) => {
    if (!canAdjustStock) {
      alert("No tienes permisos para realizar ajustes de inventario.")
      return
    }
    setAdjustProduct(product)
    setAdjustType('entrada')
    setAdjustQty(1)
    setAdjustReason('Ingreso de mercadería')
    setShowAdjustModal(true)
  }

  const handleAdjustSubmit = async (e) => {
    e.preventDefault()
    if (!canAdjustStock) return
    if (!adjustProduct || adjustQty <= 0) return

    try {
      await db.addMovimiento({
        producto_id: adjustProduct.id,
        tipo: adjustType,
        customStockOnly: true,
        cantidad: parseInt(adjustQty),
        usuario: currentUser.usuario,
        motivo: adjustReason
      })
      setShowAdjustModal(false)
      refresh()
    } catch (err) {
      console.error(err)
      alert("Error al registrar el ajuste de stock.")
    }
  }

  const [sortField, setSortField] = useState('nombre')
  const [sortDirection, setSortDirection] = useState('asc')

  // Filter products logic
  const filteredProducts = productos.filter(p => {
    const q = filterQuery.toLowerCase()
    const matchesQuery = p.nombre.toLowerCase().includes(q) || 
      (p.codigos_barra && p.codigos_barra.some(c => c.toLowerCase().includes(q)))
    const matchesClass = filterClass === '' || p.clasificacion === filterClass
    return matchesQuery && matchesClass
  })

  // Sort products logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]

    if (sortField === 'codigos_barra') {
      valA = a.codigos_barra ? a.codigos_barra.length : 0
      valB = b.codigos_barra ? b.codigos_barra.length : 0
    }

    if (valA === undefined || valA === null) valA = ''
    if (valB === undefined || valB === null) valB = ''

    if (typeof valA === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA)
    } else {
      return sortDirection === 'asc' 
        ? valA - valB 
        : valB - valA
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventario de Productos</h2>
          <p className="text-gray-400 text-sm">Gestiona el catálogo de productos, existencias mínimas y códigos de barra.</p>
        </div>
        {canModifyProducts && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-5 h-5" /> Agregar Producto
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#0c1220] p-4 rounded-2xl border border-gray-800/80">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Filtrar por nombre o código de barras..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#11192a] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="bg-[#11192a] border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-sky-500"
        >
          <option value="">Todas las Clasificaciones</option>
          <option value="Cafetería">Cafetería</option>
          <option value="Pulpería">Pulpería</option>
          <option value="Farmacia">Farmacia</option>
          <option value="Textiles">Textiles</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800/80 bg-gray-900/30 text-gray-400 text-xs font-semibold uppercase tracking-wider select-none">
                <th onClick={() => handleSort('nombre')} className="p-4 cursor-pointer hover:text-white transition">
                  Producto {renderSortIndicator('nombre')}
                </th>
                <th onClick={() => handleSort('clasificacion')} className="p-4 cursor-pointer hover:text-white transition">
                  Clasificación {renderSortIndicator('clasificacion')}
                </th>
                <th onClick={() => handleSort('codigos_barra')} className="p-4 cursor-pointer hover:text-white transition">
                  Códigos Asociados {renderSortIndicator('codigos_barra')}
                </th>
                <th onClick={() => handleSort('existencia_actual')} className="p-4 cursor-pointer hover:text-white transition">
                  Existencias {renderSortIndicator('existencia_actual')}
                </th>
                <th onClick={() => handleSort('precio')} className="p-4 cursor-pointer hover:text-white transition">
                  Costo / Venta {renderSortIndicator('precio')}
                </th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm text-gray-300">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                sortedProducts.map(p => {
                  const isLow = p.existencia_actual <= p.existencia_minima
                  const provider = proveedores.find(pr => pr.id === p.proveedor_id)
                  return (
                    <tr key={p.id} className="hover:bg-gray-800/20 transition">
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-white block">{p.nombre}</span>
                          <span className="text-xs text-gray-500">
                            Prov: {provider ? provider.nombre : 'Ninguno'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#121c30] text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-xs font-semibold">
                          {p.clasificacion}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {p.codigos_barra && p.codigos_barra.map(code => (
                            <span key={code} className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 border border-gray-800">
                              {code}
                            </span>
                          ))}
                          {(!p.codigos_barra || p.codigos_barra.length === 0) && (
                            <span className="text-xs text-gray-600">Ninguno</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>
                            {p.existencia_actual}
                          </span>
                          <span className="text-xs text-gray-500 block">Min. {p.existencia_minima}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="text-xs text-gray-500 block">Venta: <strong className="text-emerald-400">¢{p.precio}</strong></span>
                          <span className="text-xs text-gray-500">Costo: ¢{p.costo}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {canAdjustStock && (
                            <button 
                              onClick={() => openAdjustModal(p)}
                              className="px-2 py-1.5 bg-[#121c30] hover:bg-[#1a2842] text-sky-400 border border-sky-500/20 rounded-lg text-xs font-semibold transition"
                            >
                              Ajustar Stock
                            </button>
                          )}
                          {canModifyProducts && (
                            <button 
                              onClick={() => openEditModal(p)}
                              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition"
                            >
                              Modificar
                            </button>
                          )}
                          {canModifyProducts && (
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-500 hover:text-red-400 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0c1220] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editProduct ? 'Modificar Producto' : 'Agregar Nuevo Producto'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre del Producto *</label>
                <input 
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Galletas Chocochitas"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Clasificación</label>
                  <select
                    value={clasificacion}
                    onChange={(e) => setClasificacion(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  >
                    <option value="Cafetería">Cafetería</option>
                    <option value="Pulpería">Pulpería</option>
                    <option value="Farmacia">Farmacia</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Proveedor</label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  >
                    <option value="">Ninguno</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Costo Unitario *</label>
                  <input 
                    type="number"
                    required
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    placeholder="¢0.00"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Precio de Venta *</label>
                  <input 
                    type="number"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="¢0.00"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Existencia Mínima</label>
                  <input 
                    type="number"
                    value={existenciaMinima}
                    onChange={(e) => setExistenciaMinima(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Stock Actual (Existencias)</label>
                  <input 
                    type="number"
                    value={existenciaActual}
                    onChange={(e) => setExistenciaActual(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>
              </div>

              <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900">
                <label className="text-xs text-gray-400 block mb-1 font-semibold">Códigos de Barra Asociados</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newBarcode.trim() && !barcodes.includes(newBarcode.trim())) {
                          setBarcodes([...barcodes, newBarcode.trim()])
                          setNewBarcode('')
                        }
                      }
                    }}
                    placeholder="Escanear o ingresar código..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                  />
                  <button 
                    type="button"
                    onClick={addBarcode}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    Asociar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {barcodes.map(c => (
                    <span key={c} className="flex items-center gap-1 text-[11px] bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-800">
                      {c}
                      <button 
                        type="button" 
                        onClick={() => removeBarcode(c)}
                        className="text-red-400 hover:text-red-300 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {barcodes.length === 0 && (
                    <span className="text-xs text-gray-600 italic">No hay códigos de barra asociados.</span>
                  )}
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition text-sm"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustModal && adjustProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAdjustSubmit} className="bg-[#0c1220] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              type="button"
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Ajustar Inventario</h3>
            <p className="text-xs text-sky-400 font-semibold mb-4">Producto: {adjustProduct.nombre}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('entrada')}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    adjustType === 'entrada'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-800 bg-gray-900/40 text-gray-400'
                  }`}
                >
                  Entrada (Ingreso)
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('salida')}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    adjustType === 'salida'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-gray-800 bg-gray-900/40 text-gray-400'
                  }`}
                >
                  Salida (Egreso)
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Cantidad *</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Operador Activo</label>
                <input 
                  type="text"
                  disabled
                  value={currentUser.nombre}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-gray-500 text-sm cursor-not-allowed font-semibold"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Motivo del Ajuste *</label>
                <input 
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: Compra de inventario, Pérdida..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
              <button 
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition text-sm"
              >
                Registrar Ajuste
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

/* ==========================================================================
   MÓDULO: PROVEEDORES
   ========================================================================== */
function ProveedoresTab({ proveedores, refresh, currentUser }) {
  const [filterQuery, setFilterQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editProveedor, setEditProveedor] = useState(null)

  // Form states
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [correo, setCorreo] = useState('')

  const perms = currentUser.permisos || []
  const canModifyProviders = perms.includes('proveedores')

  const resetForm = () => {
    setNombre('')
    setContacto('')
    setCorreo('')
    setEditProveedor(null)
  }

  const openAddModal = () => {
    if (!canModifyProviders) {
      alert("No tienes permisos para agregar proveedores.")
      return
    }
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (p) => {
    if (!canModifyProviders) {
      alert("No tienes permisos para modificar proveedores.")
      return
    }
    setEditProveedor(p)
    setNombre(p.nombre)
    setContacto(p.contacto || '')
    setCorreo(p.correo || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canModifyProviders) return
    if (!nombre.trim()) return

    const payload = { nombre, contacto, correo }

    try {
      if (editProveedor) {
        await db.updateProveedor(editProveedor.id, payload)
      } else {
        await db.addProveedor(payload)
      }
      setIsModalOpen(false)
      refresh()
      resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!canModifyProviders) {
      alert("No tienes permisos para eliminar proveedores.")
      return
    }
    if (confirm("¿Está seguro de eliminar este proveedor?")) {
      try {
        await db.deleteProveedor(id)
        refresh()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const filtered = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.correo && p.correo.toLowerCase().includes(filterQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Directorio de Proveedores</h2>
          <p className="text-gray-400 text-sm">Organiza los contactos y correos de tus distribuidores principales.</p>
        </div>
        {canModifyProviders && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-5 h-5" /> Agregar Proveedor
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-gray-400 w-4.5 h-4.5" />
        <input 
          type="text"
          placeholder="Buscar proveedor por nombre o correo..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full bg-[#0c1220] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
            No se encontraron proveedores.
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="glass-panel p-5 rounded-2xl border border-gray-800/80 flex flex-col justify-between hover:border-sky-500/35 transition">
              <div>
                <h3 className="font-bold text-white text-lg line-clamp-1">{p.nombre}</h3>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-400" />
                    {p.contacto || 'Sin contacto'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400 font-light" />
                    {p.correo || 'Sin correo electrónico'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800/80 flex justify-end gap-2">
                {canModifyProviders && (
                  <button 
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition"
                  >
                    Modificar
                  </button>
                )}
                {canModifyProviders && (
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-500 hover:text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0c1220] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editProveedor ? 'Modificar Proveedor' : 'Agregar Nuevo Proveedor'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre o Razón Social *</label>
                <input 
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Distribuidora El Sol"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Número de Contacto</label>
                <input 
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Ej: +506 8888-2222"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Correo Electrónico</label>
                <input 
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ej: info@proveedor.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition text-sm"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

/* ==========================================================================
   MÓDULO: REPORTES
   ========================================================================== */
function ReportesTab({ ventas, productos, movimientos }) {
  const totalSalesCount = ventas.length
  const totalRevenue = ventas.reduce((acc, v) => acc + v.total, 0)
  
  // Calculate total investment (sum of all entry movements)
  const totalInvestment = (movimientos || [])
    .filter(m => m.tipo === 'entrada')
    .reduce((acc, m) => acc + (m.cantidad * m.costo_unitario), 0)

  // Calculate Cost of Goods Sold (COGS) from all output movements
  const totalCOGS = (movimientos || [])
    .filter(m => m.tipo === 'salida')
    .reduce((acc, m) => acc + (m.cantidad * m.costo_unitario), 0)

  // Calculate Net Profit
  const netProfit = totalRevenue - totalCOGS

  // Calculate sales by payment methods
  const paymentMethods = ventas.reduce((acc, v) => {
    acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + v.total
    return acc
  }, {})

  // Calculate sales by product classification
  const classSales = ventas.reduce((acc, v) => {
    v.items.forEach(item => {
      const prod = productos.find(p => p.id === item.producto_id)
      const cls = prod ? prod.clasificacion : 'Otros'
      acc[cls] = (acc[cls] || 0) + (item.precio * item.cantidad)
    })
    return acc
  }, {})

  // --- CSV EXPORTER HELPER ---
  const exportToCSV = (data, filename, columns) => {
    const csvRows = []
    csvRows.push(columns.map(c => c.label).join(','))
    
    data.forEach(item => {
      const values = columns.map(c => {
        const rawValue = typeof c.value === 'function' ? c.value(item) : item[c.value]
        const escaped = ('' + (rawValue || '')).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    })

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportKardex = () => {
    const columns = [
      { label: 'Fecha y Hora', value: (m) => new Date(m.fecha).toLocaleString() },
      { label: 'Producto', value: (m) => {
          const p = productos.find(prod => prod.id === m.producto_id)
          return p ? p.nombre : `ID: ${m.producto_id}`
        }
      },
      { label: 'Tipo', value: 'tipo' },
      { label: 'Cantidad', value: 'cantidad' },
      { label: 'Costo Unitario', value: 'costo_unitario' },
      { label: 'Operador', value: 'usuario' },
      { label: 'Motivo', value: 'motivo' }
    ]
    exportToCSV(movimientos, 'Kardex_Inventario.csv', columns)
  }

  const handleExportVentas = () => {
    const columns = [
      { label: 'ID Factura', value: 'id' },
      { label: 'Fecha', value: (v) => new Date(v.fecha).toLocaleString() },
      { label: 'Items Vendidos', value: (v) => v.items.map(i => `${i.nombre} (x${i.cantidad})`).join(' | ') },
      { label: 'Metodo de Pago', value: 'metodo_pago' },
      { label: 'Cajero / Operador', value: (v) => v.usuario || 'Caja' },
      { label: 'Total', value: 'total' }
    ]
    exportToCSV(ventas, 'Historial_Ventas.csv', columns)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes y Analítica</h2>
          <p className="text-gray-400 text-sm">Revisa el rendimiento diario, ingresos, inversiones y ganancias del negocio.</p>
        </div>
        
        {/* CSV export buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportKardex}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#121c30] hover:bg-[#1a2842] text-sky-400 border border-sky-500/25 px-4 py-2 rounded-xl font-bold text-xs transition"
          >
            <Download className="w-4 h-4" /> Exportar Kardex CSV
          </button>
          <button 
            onClick={handleExportVentas}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#121c30] hover:bg-[#1a2842] text-sky-400 border border-sky-500/25 px-4 py-2 rounded-xl font-bold text-xs transition"
          >
            <Download className="w-4 h-4" /> Exportar Ventas CSV
          </button>
        </div>
      </div>

      {/* Top statistics cards (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Ventas Totales (Ingresos)</span>
          <span className="text-2xl font-bold text-emerald-400 mt-2 block">¢{totalRevenue}</span>
          <span className="text-xs text-gray-500 block mt-1">{totalSalesCount} transacciones realizadas</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Inversión Realizada (Compras)</span>
          <span className="text-2xl font-bold text-amber-500 mt-2 block">¢{totalInvestment}</span>
          <span className="text-xs text-gray-500 block mt-1">Costo total de artículos comprados</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Ganancia Neta</span>
          <span className={`text-2xl font-bold mt-2 block ${netProfit >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
            ¢{netProfit}
          </span>
          <span className="text-xs text-gray-500 block mt-1">Ventas Totales - Costo de Artículos Vendidos</span>
        </div>
      </div>

      {/* Row 2: Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-gray-800/60 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 block">Costo de Mercadería Vendida (COGS)</span>
            <span className="text-lg font-bold text-gray-300">¢{totalCOGS}</span>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <span>Ticket Promedio</span>
            <strong className="block text-white text-sm">¢{totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0}</strong>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-gray-800/60 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 block">Margen de Ganancia Promedio</span>
            <span className="text-lg font-bold text-sky-400">
              {totalRevenue > 0 ? `${Math.round((netProfit / totalRevenue) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-xs text-gray-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-lg">
            Rentabilidad Saludable
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
          <h3 className="font-bold text-white">Ventas por Clasificación</h3>
          <div className="space-y-3">
            {Object.entries(classSales).map(([cls, amount]) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-300">{cls}</span>
                  <span className="text-emerald-400">¢{amount}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full" 
                    style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(classSales).length === 0 && (
              <p className="text-sm text-gray-600">No hay ventas registradas por categoría.</p>
            )}
          </div>
        </div>

        {/* Sales by Payment Method */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
          <h3 className="font-bold text-white">Ventas por Forma de Pago</h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, amount]) => (
              <div key={method} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-300">{method}</span>
                  <span className="text-sky-400">¢{amount}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(paymentMethods).length === 0 && (
              <p className="text-sm text-gray-600">No hay transacciones registradas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Kardex Log */}
      <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white">Kardex: Historial de Movimientos de Inventario</h3>
            <p className="text-xs text-gray-500 mt-0.5">Seguimiento de entradas, salidas y ajustes manuales.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900/30 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Costo Histórico</th>
                <th className="p-4">Operador</th>
                <th className="p-4">Motivo / Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-gray-300">
              {(movimientos || []).map(m => {
                const prod = productos.find(p => p.id === m.producto_id)
                return (
                  <tr key={m.id} className="hover:bg-gray-800/10 transition">
                    <td className="p-4 text-xs text-gray-400">{new Date(m.fecha).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-white">{prod ? prod.nombre : `ID Producto: ${m.producto_id}`}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        m.tipo === 'entrada'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}>
                        {m.tipo === 'entrada' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{m.cantidad} uds</td>
                    <td className="p-4 text-gray-400">¢{m.costo_unitario}</td>
                    <td className="p-4 text-xs">
                      <span className="bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-lg">
                        {m.usuario}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{m.motivo}</td>
                  </tr>
                )
              })}
              {(!movimientos || movimientos.length === 0) && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">No hay movimientos registrados en el inventario.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

/* ==========================================================================
   MÓDULO: GESTIÓN DE USUARIOS (ACCESO EXCLUSIVO ADMIN)
   ========================================================================== */
function UsuariosTab({ usuarios, refresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  
  // Form states
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [nombre, setNombre] = useState('')

  // Checkbox granular permissions states
  const [permFacturar, setPermFacturar] = useState(false)
  const [permProductos, setPermProductos] = useState(false)
  const [permStock, setPermStock] = useState(false)
  const [permProveedores, setPermProveedores] = useState(false)
  const [permReportes, setPermReportes] = useState(false)
  const [permUsuarios, setPermUsuarios] = useState(false)

  const resetForm = () => {
    setUsuario('')
    setContrasena('')
    setNombre('')
    setPermFacturar(false)
    setPermProductos(false)
    setPermStock(false)
    setPermProveedores(false)
    setPermReportes(false)
    setPermUsuarios(false)
    setEditUser(null)
  }

  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (u) => {
    setEditUser(u)
    setUsuario(u.usuario)
    setContrasena(u.contrasena)
    setNombre(u.nombre)
    
    const perms = u.permisos || []
    setPermFacturar(perms.includes('facturar'))
    setPermProductos(perms.includes('productos'))
    setPermStock(perms.includes('stock'))
    setPermProveedores(perms.includes('proveedores'))
    setPermReportes(perms.includes('reportes'))
    setPermUsuarios(perms.includes('usuarios'))
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario.trim() || !contrasena.trim() || !nombre.trim()) {
      alert("Por favor complete todos los campos.")
      return
    }

    // Build permissions list from checkbox checks
    const activePerms = []
    if (permFacturar) activePerms.push('facturar')
    if (permProductos) activePerms.push('productos')
    if (permStock) activePerms.push('stock')
    if (permProveedores) activePerms.push('proveedores')
    if (permReportes) activePerms.push('reportes')
    if (permUsuarios) activePerms.push('usuarios')

    if (activePerms.length === 0) {
      alert("Debes seleccionar al menos un permiso para el usuario.")
      return
    }

    const payload = { 
      usuario, 
      contrasena, 
      nombre, 
      permisos: activePerms 
    }

    try {
      if (editUser) {
        await db.updateUsuario(editUser.id, payload)
      } else {
        await db.addUsuario(payload)
      }
      setIsModalOpen(false)
      refresh()
      resetForm()
    } catch (err) {
      alert(err.message || "Error al guardar el usuario.")
    }
  }

  const handleDelete = async (id) => {
    if (id === 1) {
      alert("No se puede eliminar al Administrador Principal.")
      return
    }
    if (confirm("¿Está seguro de eliminar esta cuenta de usuario?")) {
      try {
        await db.deleteUsuario(id)
        refresh()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Cuentas y Permisos de Usuarios</h2>
          <p className="text-gray-400 text-sm">Gestiona el personal, contraseñas y asigna permisos específicos por celda.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-5 h-5" /> Agregar Cuenta
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800/80 bg-gray-900/30 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Permisos Habilitados</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm text-gray-300">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/20 transition">
                  <td className="p-4 font-semibold text-white">{u.nombre}</td>
                  <td className="p-4 font-mono text-sky-400">{u.usuario}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-lg">
                      {(u.permisos || []).map(p => (
                        <span key={p} className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-[#121c30] text-sky-400 border border-sky-500/25">
                          {p === 'facturar' && 'Facturar (Caja)'}
                          {p === 'productos' && 'Productos (Catálogo)'}
                          {p === 'stock' && 'Ajustar Inventario'}
                          {p === 'proveedores' && 'Proveedores'}
                          {p === 'reportes' && 'Reportes & CSV'}
                          {p === 'usuarios' && 'Usuarios (Admin)'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition"
                      >
                        Modificar
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === 1}
                        className="p-1.5 bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-500 hover:text-red-400 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0c1220] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editUser ? 'Modificar Cuenta' : 'Agregar Nueva Cuenta'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre Completo *</label>
                <input 
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre de Usuario *</label>
                <input 
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ej: jperez"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Contraseña *</label>
                <input 
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Contraseña de ingreso..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-white text-sm"
                />
              </div>

              {/* PERMISSION CHECKBOX MATRIX */}
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-semibold">Permisos Habilitados *</label>
                <div className="grid grid-cols-1 gap-2.5 bg-gray-950/50 p-4 rounded-xl border border-gray-900 max-h-[180px] overflow-y-auto">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permFacturar}
                      onChange={(e) => setPermFacturar(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Facturar (Acceso a Caja)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permProductos}
                      onChange={(e) => setPermProductos(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Productos (Crear / Modificar Catálogo)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permStock}
                      onChange={(e) => setPermStock(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Ajustar Inventario (Kardex Entradas/Salidas)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permProveedores}
                      onChange={(e) => setPermProveedores(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Proveedores (Directorio de Distribuidoras)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permReportes}
                      onChange={(e) => setPermReportes(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Ver Reportes y Exportar a CSV
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition">
                    <input 
                      type="checkbox" 
                      checked={permUsuarios}
                      onChange={(e) => setPermUsuarios(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded border-gray-800 bg-gray-900"
                    />
                    Administrar Usuarios y Permisos
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition text-sm"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

export default App
