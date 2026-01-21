import { z } from 'zod';

// Regex para validação de senha forte
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      passwordRegex,
      'Senha deve conter pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (@$!%*?&)'
    ),
  // Campos opcionais para alunos existentes
  isExistingStudent: z.boolean().optional().default(false),
  groupName: z.string().max(255).optional(),
  instructor: z.string().max(255).optional(),
  corda: z.string().max(100).optional(),
  cordaColor: z.string().max(7).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

export const studentIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID deve ser um número válido')
    .transform((val) => parseInt(val, 10)),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentIdInput = z.infer<typeof studentIdSchema>;
