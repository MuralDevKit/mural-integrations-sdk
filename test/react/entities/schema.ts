import { z } from 'zod';

/**
 * Factory to create a schema validation function.
 *
 * @param schema Zod schema
 * @returns A function that validates data against the schema. The function
 * throws a ZodError when schema validate fails.
 */
export const validateTypeFactory =
  <T extends z.ZodTypeAny>(schema: T) =>
  (data: unknown): z.infer<T> =>
    schema.parse(data);

//
// Zod schemas corresponding to Mural API types delcared in mural-client
//

export const MuralSchema = z.object({
  id: z.string(),
  createdBy: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      id: z.string(),
    })
    .optional(),
  createdOn: z.number().int(),
  favorite: z.boolean().optional(),
  title: z.string(),
  thumbnailUrl: z.string().optional(),
  roomId: z.number().int(),
  updatedBy: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      id: z.string(),
    })
    .optional(),
  updatedOn: z.number().int(),
  visitorsSettings: z
    .object({
      link: z.string(),
      visitors: z.string(),
      workspaceMembers: z.string(),
    })
    .optional(),
  workspaceId: z.string(),
  _canvasLink: z.string(),
});

export const RoomSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.string(),
  workspaceId: z.string(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  description: z.string(),
  name: z.string(),
  publicHash: z.string(),
  thumbUrl: z.string(),
  type: z.enum(['default', 'custom']),
  updatedOn: z.number().int(),
  viewLink: z.string(),
  workspaceId: z.string(),
});

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
});
