export type MockUserRole = 'trabajador' | 'contratante';

export type MockUser = {
  id: string;
  role: MockUserRole;
  name: string;
};

export const MOCK_CURRENT_USER: MockUser = {
  id: 'worker-001',
  role: 'trabajador',
  name: 'María Rodríguez',
};