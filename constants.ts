import { Category, Ingredient, MenuItem, Recipe, Role, Table, TableStatus, User, PreparationSector } from './types';

// Script para quem está instalando do zero
export const SQL_SCHEMA = `
-- Extensão necessária para gerar IDs únicos (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LIMPEZA: Remove tabelas antigas para recriar o esquema limpo (CUIDADO AO RODAR EM PRODUÇÃO)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Usuários (Garçons, Gerentes - Auth Customizado via PIN)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MANAGER', 'WAITER', 'CHEF')),
  pin TEXT NOT NULL -- O PIN fica salvo aqui. A validação é feita via query exata no backend.
);

-- 2. Mesas
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  seats INTEGER NOT NULL,
  status TEXT DEFAULT 'AVAILABLE',
  assigned_waiter_id UUID REFERENCES users(id),
  current_order_id UUID -- Será alterado para FK após criar a tabela orders
);

-- 3. Ingredientes do Estoque
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC(10,2) DEFAULT 0,
  min_stock_level NUMERIC(10,2) DEFAULT 0,
  cost_per_unit NUMERIC(10,2) NOT NULL
);

-- 4. Itens do Menu
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  preparation_sector TEXT DEFAULT 'KITCHEN'
);

-- 5. Receitas (Ficha Técnica)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_required NUMERIC(10,2) NOT NULL
);

-- 6. Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id),
  waiter_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING',
  total_amount NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Atualiza referência circular (Tabela aponta para Pedido Atual)
ALTER TABLE tables ADD CONSTRAINT fk_current_order FOREIGN KEY (current_order_id) REFERENCES orders(id);

-- 7. Itens do Pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price_at_order NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'PENDING'
);

-- 8. Transações Financeiras
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('REVENUE', 'EXPENSE')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Alertas do Sistema
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'LOW_STOCK',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Políticas de Segurança (RLS - Row Level Security)
-- Habilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Cria política permissiva para uso com ANON KEY (Para este ERP funcionar sem Supabase Auth complexo)
-- EM PRODUÇÃO REAL, VOCÊ RESTRINGIRIA ISSO, mas para este setup funcionar direto:
CREATE POLICY "Acesso total público" ON users FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON tables FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON ingredients FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON menu_items FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON recipes FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON orders FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON order_items FOR ALL USING (true);
CREATE POLICY "Acesso total público" ON financial_transactions FOR ALL USING (true);
`;

// Script para quem já tem o banco e quer apenas atualizar (KDS Update)
export const SQL_MIGRATION_KDS = `
-- MIGRAÇÃO KDS (Rode isso se já tiver as tabelas criadas e quiser atualizar)

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS preparation_sector TEXT DEFAULT 'KITCHEN';

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
`;

export const SQL_MIGRATION_PAYMENTS = `
-- MIGRAÇÃO PAGAMENTOS
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT;
`;

// Script para popular o banco com dados iniciais (Seed - LIMPO)
export const SQL_SEED_DATA = `
-- DADOS INICIAIS

-- 1. Gerente Inicial (PIN 1234)
INSERT INTO users (name, role, pin) VALUES 
('Admin (Gerente)', 'MANAGER', '1234');

-- 2. Mesas
INSERT INTO tables (number, seats, status) VALUES 
(1, 4, 'AVAILABLE'), (2, 2, 'AVAILABLE'), (3, 6, 'AVAILABLE'), 
(4, 4, 'AVAILABLE'), (5, 2, 'AVAILABLE'), (6, 8, 'AVAILABLE'),
(7, 4, 'AVAILABLE'), (8, 2, 'AVAILABLE'), (9, 4, 'AVAILABLE'), 
(10, 4, 'AVAILABLE'), (11, 6, 'AVAILABLE'), (12, 2, 'AVAILABLE');
`;

// --- DADOS MOCK (Mantidos apenas para Tipagem TS, não usados na lógica Supabase) ---

export const INITIAL_USERS: User[] = [];
export const INITIAL_TABLES: Table[] = [];
export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Entradas' },
  { id: 'c2', name: 'Pratos Principais' },
  { id: 'c3', name: 'Bebidas' },
  { id: 'c4', name: 'Sobremesas' },
];
export const INITIAL_INGREDIENTS: Ingredient[] = [];
export const INITIAL_MENU: MenuItem[] = [];
export const INITIAL_RECIPES: Recipe[] = [];