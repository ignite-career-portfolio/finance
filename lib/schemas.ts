import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  password_hash: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Transaction schemas
export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int().positive(),
  category: z.string(),
  description: z.string().nullable(),
  type: z.enum(['income', 'expense']),
  transaction_date: z.date(),
  created_at: z.date(),
});

export const createTransactionSchema = z.object({
  amount: z.number().int().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  type: z.enum(['income', 'expense']),
  transaction_date: z.date().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Fixed charges schemas
export const fixedChargeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  amount: z.number().int().positive(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  due_date: z.number().int(),
  created_at: z.date(),
});

export const createFixedChargeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  due_date: z.number().int().min(1).max(31),
});

export const updateFixedChargeSchema = createFixedChargeSchema.partial();

// Credits schemas
export const creditSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  amount: z.number().int().positive(),
  interest_rate: z.number().nonnegative(),
  due_date: z.string().nullable(),
  created_at: z.date(),
});

export const createCreditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
  interest_rate: z.number().nonnegative('Interest rate cannot be negative'),
  due_date: z.string().optional(),
});

export const updateCreditSchema = createCreditSchema.partial();

// Reminders schemas
export const reminderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.date(),
  is_completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  created_at: z.date(),
});

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string(),
  is_completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  is_completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Todo schemas
export const todoSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean(),
  created_at: z.date(),
});

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  is_completed: z.boolean().default(false),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  is_completed: z.boolean().optional(),
});

// Savings goals schemas
export const savingsGoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  target_amount: z.number().int().positive(),
  current_amount: z.number().int().nonnegative(),
  deadline: z.date().nullable(),
  created_at: z.date(),
});

export const createSavingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  target_amount: z.number().int().positive('Target amount must be greater than 0'),
  current_amount: z.number().int().nonnegative().default(0),
  deadline: z.string().optional(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().min(1).optional(),
  target_amount: z.number().int().positive().optional(),
  current_amount: z.number().int().nonnegative().optional(),
  deadline: z.string().optional(),
});

// Budget category schemas
export const budgetCategorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: z.string(),
  budgeted_amount: z.number().int().positive(),
  month_year: z.string(),
  created_at: z.date(),
});

export const createBudgetCategorySchema = z.object({
  category: z.string().min(1, 'Category is required'),
  budgeted_amount: z.number().int().positive('Budgeted amount must be greater than 0'),
  month_year: z.string().regex(/^\d{4}-\d{2}$/, 'Format should be YYYY-MM'),
});

export const updateBudgetCategorySchema = z.object({
  budgeted_amount: z.number().int().positive().optional(),
});

// Balance prediction schemas
export const balancePredictionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  prediction_date: z.date(),
  predicted_balance: z.number().int(),
  created_at: z.date(),
});

export const createBalancePredictionSchema = z.object({
  prediction_date: z.string(),
  predicted_balance: z.number().int(),
});
