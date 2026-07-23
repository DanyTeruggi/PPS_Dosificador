import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/getInitials.ts',
        'src/utils/formatBusinessName.ts',
        'src/utils/apiError.ts',
        'src/components/Dashboard/UsersPanel/assignmentUtils.ts',
        'src/components/Dashboard/UsersPanel/userStatusUtils.ts',
      ],
    },
  },
})
