const noopAsync = async (result = null) => result;

const createEntityHandler = (entityName) => new Proxy({}, {
  get: (_target, method) => {
    if (method === 'subscribe') {
      return () => ({ unsubscribe: () => {} });
    }
    if (method === 'list' || method === 'filter') {
      return async () => [];
    }
    if (method === 'create') {
      return async (data) => ({ id: data?.id ?? null, ...data });
    }
    if (method === 'update') {
      return async (id, data) => ({ id, ...data });
    }
    if (method === 'delete') {
      return async () => ({ success: true });
    }
    return noopAsync;
  }
});

export const legacyApi = {
  auth: {
    me: async () => null,
    logout: async (redirect = '/') => {
      if (typeof window !== 'undefined') {
        window.location.href = redirect;
      }
      return { success: true };
    },
    redirectToLogin: async (redirect = '/') => {
      if (typeof window !== 'undefined') {
        window.location.href = redirect;
      }
      return { success: true };
    },
    updateMe: async () => null,
  },
  entities: new Proxy({}, {
    get: (_target, entityName) => createEntityHandler(entityName),
  }),
  functions: {
    invoke: async (_functionName, _payload) => ({ data: null, error: null }),
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
      InvokeLLM: async () => ({ clear: true, reason: '', card_name: '', set_name: '', year: '', card_number: '', sport: 'other' }),
      SendEmail: async () => ({ success: true }),
    },
  },
};
