// Enums
export enum TableStatus {
  AVAILABLE = 'AVAILABLE',       // Verde (Livre)
  WAITING_ORDER = 'WAITING_ORDER', // Amarelo (Aguardando Pedido)
  OCCUPIED = 'OCCUPIED',         // Vermelho (Ocupada)
  BILL_REQUESTED = 'BILL_REQUESTED', // Azul (Conta Solicitada)
  DIRTY = 'DIRTY'                // Cinza (Aguardando Limpeza)
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',           // Pronto para entrega (todos itens prontos)
  COMPLETED = 'COMPLETED',   // Entregue/Pago
  CANCELLED = 'CANCELLED'
}

export enum ItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED'
}

export enum PreparationSector {
  KITCHEN = 'KITCHEN', // Cozinha Geral
  GRILL = 'GRILL',     // Churrasqueira
  BAR = 'BAR',         // Bar / Copa
  DESSERT = 'DESSERT'  // Sobremesas
}

export enum Role {
  MANAGER = 'MANAGER',
  WAITER = 'WAITER',
  CHEF = 'CHEF'
}

export enum PaymentMethod {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  CASH = 'CASH',
  PIX = 'PIX',
  VOUCHER = 'VOUCHER'
}

// Entities
export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string; // Simplified auth
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedWaiterId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string; // kg, liters, units
  currentStock: number;
  minStockLevel: number;
  costPerUnit: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  preparationSector: PreparationSector; // Novo campo para roteamento KDS
}

export interface Recipe {
  menuItemId: string;
  ingredientId: string;
  quantityRequired: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  priceAtOrder: number;
  status: ItemStatus; // Status individual do item
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: PaymentMethod; // Novo campo
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'LOW_STOCK' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  orderId?: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  description: string;
  createdAt: string;
}