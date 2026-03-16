export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'me'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const
}

export const blockKeys = {
  all: ['blocks'] as const,
  myBlocks: () => [...blockKeys.all, 'me'] as const,
  detail: (id: string) => [...blockKeys.all, 'detail', id] as const
}
