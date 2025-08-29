import {REGEX_NAME} from '@/shared/constants/regex';
import {z} from 'zod';

export const roleCreateSchema = z.object({
  name: z
    .string({
      required_error: 'Tên không được để trống',
      invalid_type_error: 'Tên không hợp lệ',
    })
    .min(1, 'Tên không được để trống'),
  desc: z
    .string({
      required_error: 'Mô tả không được để trống',
      invalid_type_error: 'Mô tả không hợp lệ',
    })
    .optional(),
  role_permissions_id: z
    .number({
      required_error: 'Vui lòng chọn role',
      invalid_type_error: 'Quyền không hợp lệ',
    })
    .array(),
});

const rolePermissionSchema = z.object({
  role: z.object({
    name: z.string({
      required_error: 'Tên vai trò không được để trống',
    }),
    description: z.string().optional(),
  }),
  permissionList: z.array(
    z.object({
      code: z.string(),
      id: z.string(),
      isEdit: z.boolean(),
      isParent: z.boolean(),
      isView: z.boolean(),
      key: z.string(),
      labelChildren: z.string(),
      labelParent: z.string(),
      parent: z.string(),
    }),
  ),
});

export type RoleCreateData = z.infer<typeof roleCreateSchema>;
export type DataRolePermissionSchema = z.infer<typeof rolePermissionSchema>;
