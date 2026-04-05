import type {
  DashboardStats, RevenuePoint, PendingVendor, Vendor,
  Product, Order, Transaction, Payout, SpotlightSub,
} from '@/types/admin'

export const STATS: DashboardStats = {
  revenue: 8_274_500, prevRevenue: 7_120_000,
  orders: 1247,       prevOrders:  1102,
  users:  3841,       prevUsers:   3456,
  vendors: 62,        pendingVendors: 7,
  platformCut: 621_000,
  spotRevenue: 300_000,
}

export const REVENUE_CHART: RevenuePoint[] = [
  { month: 'Jan', revenue: 4_200_000,  orders: 45  },
  { month: 'Feb', revenue: 3_800_000,  orders: 52  },
  { month: 'Mar', revenue: 5_100_000,  orders: 61  },
  { month: 'Apr', revenue: 6_200_000,  orders: 78  },
  { month: 'May', revenue: 5_400_000,  orders: 65  },
  { month: 'Jun', revenue: 7_100_000,  orders: 89  },
  { month: 'Jul', revenue: 6_800_000,  orders: 82  },
  { month: 'Aug', revenue: 7_900_000,  orders: 95  },
  { month: 'Sep', revenue: 7_200_000,  orders: 88  },
  { month: 'Oct', revenue: 8_100_000,  orders: 103 },
  { month: 'Nov', revenue: 7_600_000,  orders: 97  },
  { month: 'Dec', revenue: 8_274_500,  orders: 112 },
]

export const CATEGORY_CHART = {
  labels: ['Phones','Laptops','Fashion','Beauty','Groceries','Sports','Decor','Fragrances'],
  data:   [32, 19, 15, 11, 9, 6, 5, 3],
  colors: ['#0A6E3F','#2563EB','#7C3AED','#D97706','#EA580C','#059669','#DC2626','#0891B2'],
}

export const PENDING_VENDORS: PendingVendor[] = [
  { id:'pv1', name:'Kemi Adeyemi',   biz:'FreshBakes NG',     cat:'Food & Meals',      email:'kemi@freshbakes.ng',  phone:'08012345678', nin:'12345678901', sub:'3 hours ago',  doc:'ID verified'  },
  { id:'pv2', name:'Tunde Okafor',   biz:'GadgetHub Lagos',   cat:'Electronics',       email:'tunde@gadgethub.ng',  phone:'08098765432', nin:'98765432109', sub:'1 day ago',    doc:'Pending NIN'  },
  { id:'pv3', name:'Amaka Nwosu',    biz:'Beauty by Amaka',   cat:'Beauty & Wellness', email:'amaka@bba.ng',        phone:'07034567890', nin:'45678901234', sub:'2 days ago',   doc:'ID verified'  },
  { id:'pv4', name:'Chidi Obi',      biz:'Campus Eats',       cat:'Food & Meals',      email:'chidi@campuseats.ng', phone:'09012345678', nin:'11223344556', sub:'3 days ago',   doc:'Pending NIN'  },
  { id:'pv5', name:'Ngozi Eze',      biz:'Vintage Threads',   cat:'Fashion',           email:'ngozi@vt.ng',         phone:'08176543210', nin:'99887766554', sub:'4 days ago',   doc:'ID verified'  },
  { id:'pv6', name:'Emeka Peters',   biz:'TechZone Abuja',    cat:'Electronics',       email:'emeka@tz.ng',         phone:'07098765432', nin:'33221100998', sub:'5 days ago',   doc:'ID verified'  },
  { id:'pv7', name:'Fatima Bello',   biz:'Halal Grocers',     cat:'Groceries',         email:'fat@hg.ng',           phone:'08012009900', nin:'77665544332', sub:'6 days ago',   doc:'Pending NIN'  },
]

export const VENDORS: Vendor[] = [
  { id:'v1',  user_id:'u10', store_name:'TechDeals NG',         slug:'techdeals-ng',         description:null, logo_url:null, category:'Electronics',   status:'active',    spotlight_active:true,  spotlight_ends_at:'2025-01-01', rating:4.8, review_count:512, total_sales:5100, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-01-15', owner_name:'Tunde Okafor',  owner_email:'tunde@techdeals.ng',   product_count:48, order_count:312, revenue:4_250_000 },
  { id:'v2',  user_id:'u11', store_name:"Mama Titi's Kitchen",  slug:'mama-titi',            description:null, logo_url:null, category:'Food & Meals',  status:'active',    spotlight_active:true,  spotlight_ends_at:'2025-01-01', rating:4.9, review_count:380, total_sales:1890, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-02-10', owner_name:'Titilayo A.',    owner_email:'titi@kitchen.ng',      product_count:23, order_count:189, revenue:1_870_000 },
  { id:'v3',  user_id:'u12', store_name:'Campus Threads',       slug:'campus-threads',       description:null, logo_url:null, category:'Fashion',       status:'active',    spotlight_active:false, spotlight_ends_at:null,          rating:4.7, review_count:210, total_sales:2540, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-03-05', owner_name:'Ngozi E.',       owner_email:'ngozi@threads.ng',     product_count:67, order_count:254, revenue:1_540_000 },
  { id:'v4',  user_id:'u13', store_name:'Beauty by Amaka',      slug:'beauty-by-amaka',      description:null, logo_url:null, category:'Beauty',        status:'active',    spotlight_active:true,  spotlight_ends_at:'2025-01-01', rating:4.9, review_count:290, total_sales:1980, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-04-12', owner_name:'Amaka N.',       owner_email:'amaka@bba.ng',         product_count:34, order_count:198, revenue:1_120_000 },
  { id:'v5',  user_id:'u14', store_name:'GadgetHub Lagos',      slug:'gadgethub-lagos',      description:null, logo_url:null, category:'Electronics',   status:'suspended', spotlight_active:false, spotlight_ends_at:null,          rating:3.2, review_count:87,  total_sales:870,  is_verified:false, paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-05-20', owner_name:'Emeka P.',       owner_email:'emeka@gadgethub.ng',   product_count:29, order_count:87,  revenue:870_000   },
  { id:'v6',  user_id:'u15', store_name:'ChillHub Drinks',      slug:'chillhub',             description:null, logo_url:null, category:'Beverages',     status:'active',    spotlight_active:false, spotlight_ends_at:null,          rating:4.6, review_count:145, total_sales:1450, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-06-08', owner_name:'Bayo A.',        owner_email:'bayo@chillhub.ng',     product_count:18, order_count:145, revenue:540_000   },
  { id:'v7',  user_id:'u16', store_name:'SportCity NG',         slug:'sportcity-ng',         description:null, logo_url:null, category:'Sports',        status:'active',    spotlight_active:true,  spotlight_ends_at:'2025-01-01', rating:4.7, review_count:178, total_sales:1780, is_verified:true,  paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-09-14', owner_name:'Kola B.',        owner_email:'kola@sportcity.ng',    product_count:42, order_count:178, revenue:790_000   },
  { id:'v8',  user_id:'u17', store_name:'Style House',          slug:'style-house',          description:null, logo_url:null, category:'Fashion',       status:'banned',    spotlight_active:false, spotlight_ends_at:null,          rating:1.8, review_count:34,  total_sales:112,  is_verified:false, paystack_sub_id:null, bank_code:null, bank_account:null, created_at:'2024-08-01', owner_name:'Sade F.',        owner_email:'sade@stylehouse.ng',   product_count:55, order_count:112, revenue:430_000   },
]

export const PRODUCTS: Product[] = [
  { id:'p1',  vendor_id:'v1', category_id:'c1', title:'iPhone 14 Pro Max 256GB',        slug:'iphone-14-pro-max',     description:'A16 Bionic, 48MP camera.',  price:1_048_500, compare_price:1_191_480, discount_percentage:12, sku:'APL-IP14PM', stock:45,  weight_grams:240, icon_key:'smartphone', icon_color:'#1c1c1e', bg_gradient:'linear-gradient(135deg,#1c1c1e,#3a3a3c)', rating:4.9, review_count:487, sales_count:87,  is_active:true,  is_featured:true,  tags:['phones','apple'],    created_at:'2024-01-20', vendor_name:'TechDeals NG',      category_name:'Phones'    },
  { id:'p2',  vendor_id:'v1', category_id:'c1', title:'Samsung Galaxy S23 Ultra',        slug:'samsung-s23-ultra',     description:'200MP camera, S Pen.',      price:898_650,   compare_price:1_096_140, discount_percentage:18, sku:'SAM-S23U',   stock:32,  weight_grams:234, icon_key:'smartphone', icon_color:'#1B2A4A', bg_gradient:'linear-gradient(135deg,#1B2A4A,#2d4a8a)', rating:4.8, review_count:363, sales_count:63,  is_active:true,  is_featured:true,  tags:['phones','samsung'],  created_at:'2024-01-22', vendor_name:'TechDeals NG',      category_name:'Phones'    },
  { id:'p3',  vendor_id:'v1', category_id:'c2', title:'MacBook Pro 14" M3 Pro',          slug:'macbook-pro-m3',        description:'M3 Pro, 18GB, 18hr battery.',price:2_998_500, compare_price:null,       discount_percentage:0,  sku:'APL-MBP14',  stock:20,  weight_grams:1600,icon_key:'laptop',     icon_color:'#374151', bg_gradient:'linear-gradient(135deg,#1c1c1e,#3a3a3c)', rating:4.9, review_count:144, sales_count:24,  is_active:true,  is_featured:true,  tags:['laptops','apple'],   created_at:'2024-01-25', vendor_name:'TechDeals NG',      category_name:'Laptops'   },
  { id:'p4',  vendor_id:'v3', category_id:'c3', title:'Ankara Print Maxi Dress',         slug:'ankara-maxi-dress',     description:'Hand-woven Ankara print.',  price:73_500,    compare_price:null,       discount_percentage:0,  sku:'LC-AND01',   stock:80,  weight_grams:350, icon_key:'shirt',      icon_color:'#BE185D', bg_gradient:'linear-gradient(135deg,#FF6B35,#F7C59F)', rating:4.8, review_count:312, sales_count:112, is_active:true,  is_featured:false, tags:['fashion','ankara'],  created_at:'2024-03-10', vendor_name:'Campus Threads',    category_name:'Fashion'   },
  { id:'p5',  vendor_id:'v4', category_id:'c5', title:'Neutrogena Hydro Boost Serum',    slug:'neutrogena-hydro-boost',description:'Hyaluronic acid serum.',    price:42_000,    compare_price:49_412,     discount_percentage:15, sku:'NEU-HBS01',  stock:200, weight_grams:90,  icon_key:'sparkles',   icon_color:'#0891B2', bg_gradient:'linear-gradient(135deg,#00BCD4,#4DD0E1)', rating:4.7, review_count:445, sales_count:145, is_active:true,  is_featured:false, tags:['beauty','skincare'],  created_at:'2024-04-15', vendor_name:'Beauty by Amaka',   category_name:'Beauty'    },
  { id:'p6',  vendor_id:'v2', category_id:'c6', title:'Indomie Chicken Noodles (40 pcs)',slug:'indomie-chicken-40',    description:"Nigeria's favourite.",      price:18_000,    compare_price:19_565,     discount_percentage:8,  sku:'IND-BOX40',  stock:300, weight_grams:3000,icon_key:'shoppingBag',icon_color:'#92400E', bg_gradient:'linear-gradient(135deg,#E53935,#FF7043)', rating:4.8, review_count:812, sales_count:289, is_active:true,  is_featured:false, tags:['groceries','food'],  created_at:'2024-02-15', vendor_name:"Mama Titi's Kitchen",category_name:'Groceries' },
  { id:'p7',  vendor_id:'v7', category_id:'c7', title:'Nike Air Max 270 Sneakers',       slug:'nike-air-max-270',      description:'Max Air heel unit.',        price:301_725,   compare_price:335_250,    discount_percentage:10, sku:'NK-AM270',   stock:75,  weight_grams:900, icon_key:'dumbbell',   icon_color:'#B45309', bg_gradient:'linear-gradient(135deg,#212121,#F85606)', rating:4.8, review_count:254, sales_count:54,  is_active:true,  is_featured:false, tags:['sports','nike'],     created_at:'2024-09-20', vendor_name:'SportCity NG',      category_name:'Sports'    },
  { id:'p8',  vendor_id:'v8', category_id:'c3', title:'Suspicious Item XYZ',             slug:'suspicious-item',       description:'Unknown origin product.',   price:9_999,     compare_price:null,       discount_percentage:0,  sku:'SUS-001',    stock:999, weight_grams:null,icon_key:'package',    icon_color:'#555',    bg_gradient:'linear-gradient(135deg,#374151,#6B7280)', rating:1.2, review_count:3,   sales_count:3,   is_active:false, is_featured:false, tags:[],                    created_at:'2024-12-01', vendor_name:'Style House',       category_name:'Fashion'   },
  { id:'p9',  vendor_id:'v1', category_id:'c2', title:'HP Pavilion 15 Intel i7',         slug:'hp-pavilion-15',        description:'12th Gen i7, 16GB RAM.',    price:974_220,   compare_price:1_248_487,  discount_percentage:22, sku:'HP-PAV15',   stock:40,  weight_grams:1750,icon_key:'laptop',     icon_color:'#1E40AF', bg_gradient:'linear-gradient(135deg,#003087,#0079C2)', rating:4.5, review_count:228, sales_count:38,  is_active:true,  is_featured:true,  tags:['laptops','hp'],      created_at:'2024-01-28', vendor_name:'TechDeals NG',      category_name:'Laptops'   },
  { id:'p10', vendor_id:'v4', category_id:'c5', title:"Fenty Beauty Pro Filt'r Foundation",slug:'fenty-filtR',         description:'40 shades for all tones.',  price:58_500,    compare_price:null,       discount_percentage:0,  sku:'FEN-PFSF',   stock:120, weight_grams:120, icon_key:'sparkles',   icon_color:'#9D174D', bg_gradient:'linear-gradient(135deg,#880E4F,#F06292)', rating:4.9, review_count:390, sales_count:121, is_active:true,  is_featured:false, tags:['beauty','makeup'],   created_at:'2024-04-20', vendor_name:'Beauty by Amaka',   category_name:'Beauty'    },
]

export const ORDERS: Order[] = [
  { id:'o1',  user_id:'u1', guest_email:null, reference:'VND-A9F2K3', status:'confirmed',       payment_status:'success', payment_ref:'PSK-001', subtotal:1_048_500, delivery_fee:1_500, total:1_050_000, note:null, created_at:'2024-12-03T11:42:00', user_name:'Adaeze M.',   vendor_name:'TechDeals NG'       },
  { id:'o2',  user_id:'u2', guest_email:null, reference:'VND-B3X8L2', status:'preparing',       payment_status:'success', payment_ref:'PSK-002', subtotal:24_000,    delivery_fee:1_500, total:25_500,    note:null, created_at:'2024-12-03T10:15:00', user_name:'Emeka O.',    vendor_name:"Mama Titi's Kitchen"},
  { id:'o3',  user_id:'u3', guest_email:null, reference:'VND-C7M4P1', status:'out_for_delivery',payment_status:'success', payment_ref:'PSK-003', subtotal:147_000,   delivery_fee:1_500, total:148_500,   note:null, created_at:'2024-12-03T09:30:00', user_name:'Funmi B.',    vendor_name:'Campus Threads'     },
  { id:'o4',  user_id:'u4', guest_email:null, reference:'VND-D2N6R5', status:'delivered',       payment_status:'success', payment_ref:'PSK-004', subtotal:84_000,    delivery_fee:1_500, total:85_500,    note:null, created_at:'2024-12-02T14:20:00', user_name:'Ngozi K.',    vendor_name:'Beauty by Amaka'    },
  { id:'o5',  user_id:'u5', guest_email:null, reference:'VND-E5Q9S4', status:'delivered',       payment_status:'success', payment_ref:'PSK-005', subtotal:301_725,   delivery_fee:1_500, total:303_225,   note:null, created_at:'2024-12-02T11:00:00', user_name:'Chidi A.',    vendor_name:'SportCity NG'       },
  { id:'o6',  user_id:'u1', guest_email:null, reference:'VND-F1T7V3', status:'delivered',       payment_status:'success', payment_ref:'PSK-006', subtotal:898_650,   delivery_fee:1_500, total:900_150,   note:null, created_at:'2024-12-01T16:45:00', user_name:'Tobi L.',     vendor_name:'TechDeals NG'       },
  { id:'o7',  user_id:'u6', guest_email:null, reference:'VND-G4W2X6', status:'cancelled',       payment_status:'refunded',payment_ref:'PSK-007', subtotal:15_000,    delivery_fee:1_500, total:16_500,    note:null, created_at:'2024-12-01T08:30:00', user_name:'Sade R.',     vendor_name:'ChillHub Drinks'    },
  { id:'o8',  user_id:'u7', guest_email:null, reference:'VND-H8Y5Z7', status:'refunded',        payment_status:'refunded',payment_ref:'PSK-008', subtotal:120_000,   delivery_fee:1_500, total:121_500,   note:null, created_at:'2024-11-30T20:00:00', user_name:'Kemi O.',     vendor_name:'Aroma Boutique'     },
  { id:'o9',  user_id:null, guest_email:'guest@test.ng', reference:'VND-I6A3B8', status:'delivered', payment_status:'success', payment_ref:'PSK-009', subtotal:73_500, delivery_fee:1_500, total:75_000, note:null, created_at:'2024-11-30T15:10:00', user_name:'Guest',       vendor_name:'Campus Threads'     },
  { id:'o10', user_id:'u2', guest_email:null, reference:'VND-J2C1D9', status:'delivered',       payment_status:'success', payment_ref:'PSK-010', subtotal:48_000,    delivery_fee:1_500, total:49_500,    note:null, created_at:'2024-11-29T12:00:00', user_name:'Bola T.',     vendor_name:'Golden Spoon'       },
]

export const TRANSACTIONS: Transaction[] = [
  { ref:'PSK-20241203-001', vendor:'TechDeals NG',         type:'product',   amount:1_050_000, cut:52_500,  date:'Today',       status:'success'  },
  { ref:'PSK-20241203-002', vendor:"Mama Titi's Kitchen",  type:'product',   amount:25_500,   cut:1_275,   date:'Today',       status:'success'  },
  { ref:'PSK-20241203-003', vendor:'TechDeals NG',          type:'spotlight', amount:100_000,  cut:100_000, date:'Today',       status:'success'  },
  { ref:'PSK-20241202-004', vendor:'Campus Threads',        type:'product',   amount:148_500,  cut:7_425,   date:'Yesterday',   status:'success'  },
  { ref:'PSK-20241202-005', vendor:'Beauty by Amaka',       type:'spotlight', amount:100_000,  cut:100_000, date:'Yesterday',   status:'success'  },
  { ref:'PSK-20241201-006', vendor:'SportCity NG',          type:'product',   amount:303_225,  cut:15_161,  date:'2 days ago',  status:'success'  },
  { ref:'PSK-20241201-007', vendor:'ChillHub Drinks',       type:'product',   amount:16_500,   cut:825,     date:'2 days ago',  status:'refunded' },
  { ref:'PSK-20241130-008', vendor:'Aroma Boutique',        type:'product',   amount:121_500,  cut:6_075,   date:'3 days ago',  status:'refunded' },
]

export const PAYOUTS: Payout[] = [
  { id:'po1', vendor_id:'v1', vendor_name:'TechDeals NG',        amount:3_825_000, fee:191_250, net:3_633_750, reference:'PO-001', status:'done',       bank_code:'058', bank_account:'****2341', created_at:'2024-12-01', processed_at:'2024-12-01' },
  { id:'po2', vendor_id:'v2', vendor_name:"Mama Titi's Kitchen", amount:1_683_000, fee:84_150,  net:1_598_850, reference:'PO-002', status:'done',       bank_code:'044', bank_account:'****7823', created_at:'2024-11-28', processed_at:'2024-11-28' },
  { id:'po3', vendor_id:'v3', vendor_name:'Campus Threads',      amount:1_386_000, fee:69_300,  net:1_316_700, reference:'PO-003', status:'processing', bank_code:'057', bank_account:'****1234', created_at:'2024-12-03', processed_at:null         },
  { id:'po4', vendor_id:'v7', vendor_name:'SportCity NG',        amount:711_000,   fee:35_550,  net:675_450,   reference:'PO-004', status:'pending',    bank_code:'033', bank_account:'****5678', created_at:'2024-12-03', processed_at:null         },
  { id:'po5', vendor_id:'v4', vendor_name:'Beauty by Amaka',     amount:1_008_000, fee:50_400,  net:957_600,   reference:'PO-005', status:'pending',    bank_code:'011', bank_account:'****9012', created_at:'2024-12-03', processed_at:null         },
]

export const SPOTLIGHT_SUBS: SpotlightSub[] = [
  { id:'ss1', vendor_id:'v1', vendor:'TechDeals NG',        owner:'Tunde O.',   paid:'Dec 1, 2024',  exp:'Jan 1, 2025',  ref:'PSK-SP-001', status:'active'  },
  { id:'ss2', vendor_id:'v2', vendor:"Mama Titi's Kitchen", owner:'Titilayo A.',paid:'Dec 1, 2024',  exp:'Jan 1, 2025',  ref:'PSK-SP-002', status:'active'  },
  { id:'ss3', vendor_id:'v4', vendor:'Beauty by Amaka',     owner:'Amaka N.',   paid:'Dec 1, 2024',  exp:'Jan 1, 2025',  ref:'PSK-SP-003', status:'active'  },
  { id:'ss4', vendor_id:'v7', vendor:'SportCity NG',        owner:'Kola B.',    paid:'Nov 1, 2024',  exp:'Dec 1, 2024',  ref:'PSK-SP-004', status:'expired' },
  { id:'ss5', vendor_id:'v3', vendor:'Campus Threads',      owner:'Ngozi E.',   paid:'Oct 1, 2024',  exp:'Nov 1, 2024',  ref:'PSK-SP-005', status:'expired' },
]

export const RECENT_ACTIVITY = [
  { icon:'check', color:'#E8F5EE', msg:'Vendor <b>TechDeals NG</b> approved and activated.',        time:'5 min ago'  },
  { icon:'cart', color:'#EFF6FF', msg:'New order <b>VND-A9F2K3</b> placed — ₦1,050,000.',         time:'18 min ago' },
  { icon:'user', color:'#F5F3FF', msg:'New user <b>Chidi Aneke</b> registered.',                   time:'32 min ago' },
  { icon:'card', color:'#EFF6FF', msg:'Spotlight payment from <b>Beauty by Amaka</b>.',            time:'1 hr ago'   },
  { icon:'warn', color:'#FFF7ED', msg:'Vendor <b>GadgetHub Lagos</b> suspended — policy violation.',time:'2 hrs ago' },
  { icon:'store', color:'#FEF2F2', msg:'New vendor application: <b>FreshBakes NG</b>.',             time:'3 hrs ago'  },
  { icon:'trash', color:'#FEF2F2', msg:'Product flagged and hidden: <b>Suspicious Item XYZ</b>.',  time:'4 hrs ago'  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const ngn = (kobo: number): string =>
  '₦' + Math.round(kobo / 100).toLocaleString('en-NG')

export const ngnKobo = (kobo: number): string =>
  '₦' + Math.round(kobo).toLocaleString('en-NG')

export const pctChange = (cur: number, prev: number): number =>
  prev ? parseFloat(((cur - prev) / prev * 100).toFixed(1)) : 0
