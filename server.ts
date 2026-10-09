import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Full-Stack Store (mirroring the Java Spring Boot JPA Entities)
interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'RESELLER' | 'SUPPLIER';
  resellerEarnings: number;
  createdAt: string;
}

interface OrderTrackingStep {
  stage: 'ORDER_PLACED' | 'HARVESTED_QC' | 'PACKED_HUB' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

interface OrderRecord {
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: 'UPI' | 'CARD' | 'COD' | 'NETBANKING';
  paymentStatus: 'PAID' | 'COD_PENDING' | 'REFUNDED';
  transactionId: string;
  isResellOrder: boolean;
  resellerMargin: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  finalCustomerTotal: number;
  currentStageIndex: number;
  status: 'ACTIVE' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
  courierPartner: string;
  awbNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    packLabel: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  trackingSteps: OrderTrackingStep[];
}

const users: UserAccount[] = [
  {
    id: 'usr-101',
    fullName: 'Shirisha Gogu',
    email: 'shirisha@verdureloam.org',
    phone: '9876543210',
    passwordHash: 'organic123',
    role: 'RESELLER',
    resellerEarnings: 485,
    createdAt: '2026-09-15T08:00:00Z',
  },
  {
    id: 'usr-102',
    fullName: 'Aarav Sharma',
    email: 'customer@verdureloam.org',
    phone: '9123456780',
    passwordHash: 'organic123',
    role: 'CUSTOMER',
    resellerEarnings: 0,
    createdAt: '2026-09-20T10:30:00Z',
  },
];

function createTrackingSteps(stageIdx: number): OrderTrackingStep[] {
  const now = new Date();
  const fmt = (minsAgo: number) =>
    new Date(now.getTime() - minsAgo * 60000).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const definitions: {
    stage: OrderTrackingStep['stage'];
    title: string;
    description: string;
  }[] = [
    {
      stage: 'ORDER_PLACED',
      title: 'Order Confirmed & Lot Reserved',
      description: 'Order verified by Verdure & Loam Spring Boot OrderService and assigned to organic farm parcel.',
    },
    {
      stage: 'HARVESTED_QC',
      title: 'Dawn Harvested & Brix Quality Checked',
      description: 'Freshly picked at 05:15 AM, hydro-cooled, and tested for 0.00 ppm pesticide residue.',
    },
    {
      stage: 'PACKED_HUB',
      title: 'Packed in Breathable Cedar Box at Regional Hub',
      description: 'Packed with plant-based cold packs and handed over to cold-chain courier.',
    },
    {
      stage: 'OUT_FOR_DELIVERY',
      title: 'Out for Doorstep Delivery',
      description: 'Courier partner (Ramesh K. · EV Cold Van) is en route to your delivery pincode.',
    },
    {
      stage: 'DELIVERED',
      title: 'Delivered Fresh at Doorstep',
      description: 'Package handed over and verified. Reseller margin (if applicable) credited to wallet.',
    },
  ];

  return definitions.map((def, idx) => ({
    ...def,
    completed: idx <= stageIdx,
    timestamp: idx <= stageIdx ? fmt((stageIdx - idx) * 95) : null,
  }));
}

const orders: OrderRecord[] = [
  {
    orderId: 'ORD-VL-89412',
    userId: 'usr-101',
    customerName: 'Shirisha Gogu',
    customerPhone: '9876543210',
    shippingAddress: 'Flat 402, Green Lotus Enclave, Jubilee Hills, Hyderabad',
    pincode: '500033',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    transactionId: 'UPI-62819402841',
    isResellOrder: true,
    resellerMargin: 65,
    subtotal: 345,
    discount: 35,
    deliveryCharge: 0,
    finalCustomerTotal: 375,
    currentStageIndex: 2,
    status: 'ACTIVE',
    courierPartner: 'Verdure Cold-Chain Express',
    awbNumber: 'VCE908172635IN',
    estimatedDelivery: 'Today by 06:30 PM',
    createdAt: '2026-10-08T05:10:00Z',
    items: [
      {
        productId: 'prod-heirloom-tomatoes',
        name: 'Brandywine & Cherokee Purple Vine Tomatoes',
        packLabel: '1.0 kg Farm Pack',
        price: 145,
        quantity: 1,
        image: '/src/assets/images/product_heirloom_tomatoes_1791478379349.jpg',
      },
      {
        productId: 'prod-orchard-citrus-figs',
        name: 'Meyer Lemons, Ruby Blood Oranges & Black Figs',
        packLabel: '1.5 kg Orchard Combo',
        price: 200,
        quantity: 1,
        image: '/src/assets/images/product_orchard_citrus_figs_1791478402983.jpg',
      },
    ],
    trackingSteps: createTrackingSteps(2),
  },
];

// --- REST API ENDPOINTS (Mirrors Spring Boot @RestController routes) ---

// 1. POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: 'Email/Mobile and password are required.' });
    return;
  }

  const normalized = String(identifier).trim().toLowerCase();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      u.phone === normalized
  );

  if (!user || user.passwordHash !== password) {
    res.status(401).json({
      error: 'Invalid credentials. Use the Demo Login buttons or register a new account.',
    });
    return;
  }

  res.json({
    token: `jwt-spring-sim-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      resellerEarnings: user.resellerEarnings,
    },
  });
});

// 2. POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phone, password, role } = req.body;
  if (!fullName || !email || !phone || !password) {
    res.status(400).json({ error: 'All fields are required for registration.' });
    return;
  }

  const existing = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() || u.phone === String(phone)
  );
  if (existing) {
    res.status(409).json({ error: 'An account with this email or mobile number already exists.' });
    return;
  }

  const newUser: UserAccount = {
    id: `usr-${100 + users.length + 1}`,
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    passwordHash: String(password),
    role: role === 'RESELLER' || role === 'SUPPLIER' ? role : 'CUSTOMER',
    resellerEarnings: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.status(201).json({
    token: `jwt-spring-sim-${newUser.id}-${Date.now()}`,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      resellerEarnings: newUser.resellerEarnings,
    },
  });
});

// 3. POST /api/auth/logout
app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Session invalidated successfully.' });
});

// 4. GET /api/pincode/:pin
app.get('/api/pincode/:pin', (req, res) => {
  const pin = String(req.params.pin || '').trim();
  if (!/^\d{5,6}$/.test(pin)) {
    res.status(400).json({
      serviceable: false,
      message: 'Please enter a valid 6-digit delivery pincode.',
    });
    return;
  }

  res.json({
    serviceable: true,
    pincode: pin,
    estimatedDelivery: 'Tomorrow by 08:30 AM (Cold-Chain Express)',
    codAvailable: true,
    freeDeliveryAbove: 199,
  });
});

// 5. GET /api/orders
app.get('/api/orders', (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (userId) {
    const userOrders = orders.filter((o) => o.userId === userId || o.userId === 'usr-101');
    res.json(userOrders);
    return;
  }
  res.json(orders);
});

// 6. POST /api/orders
app.post('/api/orders', (req, res) => {
  const {
    userId,
    customerName,
    customerPhone,
    shippingAddress,
    pincode,
    paymentMethod,
    transactionId,
    isResellOrder,
    resellerMargin,
    subtotal,
    discount,
    deliveryCharge,
    finalCustomerTotal,
    items,
  } = req.body;

  const newOrder: OrderRecord = {
    orderId: `ORD-VL-${Math.floor(10000 + Math.random() * 89999)}`,
    userId: userId || 'usr-101',
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone || '9876543210',
    shippingAddress: shippingAddress || '12 Organic Farm Road',
    pincode: pincode || '500033',
    paymentMethod: paymentMethod || 'COD',
    paymentStatus: paymentMethod === 'COD' ? 'COD_PENDING' : 'PAID',
    transactionId:
      transactionId ||
      (paymentMethod === 'COD' ? `COD-${Date.now()}` : `TXN-${Date.now()}`),
    isResellOrder: Boolean(isResellOrder),
    resellerMargin: Number(resellerMargin || 0),
    subtotal: Number(subtotal || 0),
    discount: Number(discount || 0),
    deliveryCharge: Number(deliveryCharge || 0),
    finalCustomerTotal: Number(finalCustomerTotal || 0),
    currentStageIndex: 0,
    status: 'ACTIVE',
    courierPartner: 'Verdure Cold-Chain Express',
    awbNumber: `VCE${Math.floor(100000000 + Math.random() * 899999999)}IN`,
    estimatedDelivery: 'Tomorrow, 07:30 AM – 10:30 AM',
    createdAt: new Date().toISOString(),
    items: Array.isArray(items) ? items : [],
    trackingSteps: createTrackingSteps(0),
  };

  orders.unshift(newOrder);

  // Credit reseller earnings if applicable
  if (newOrder.isResellOrder && newOrder.resellerMargin > 0) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.resellerEarnings += newOrder.resellerMargin;
    }
  }

  res.status(201).json(newOrder);
});

// 7. POST /api/orders/:orderId/advance-status (Interactive Live Order Tracker Simulator)
app.post('/api/orders/:orderId/advance-status', (req, res) => {
  const order = orders.find((o) => o.orderId === req.params.orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.status === 'CANCELLED') {
    res.status(400).json({ error: 'Cannot advance a cancelled order.' });
    return;
  }

  const nextStage = Math.min(4, order.currentStageIndex + 1);
  order.currentStageIndex = nextStage;
  order.trackingSteps = createTrackingSteps(nextStage);
  if (nextStage === 4) {
    order.status = 'DELIVERED';
    order.paymentStatus = 'PAID';
  }

  res.json(order);
});

// 8. POST /api/orders/:orderId/cancel
app.post('/api/orders/:orderId/cancel', (req, res) => {
  const order = orders.find((o) => o.orderId === req.params.orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  order.status = order.status === 'DELIVERED' ? 'RETURN_REQUESTED' : 'CANCELLED';
  if (order.paymentStatus === 'PAID') {
    order.paymentStatus = 'REFUNDED';
  }
  res.json(order);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Verdure & Loam Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
