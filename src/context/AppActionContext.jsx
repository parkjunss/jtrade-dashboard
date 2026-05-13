import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { executeAppAction } from '../services/appActions';
import { downloadFile } from '../services/downloadUtils';

const AppActionContext = createContext(null);

const initialMockMutations = {
  exports: [],
  savedScreens: [],
  savedStrategies: [],
  watchlist: [],
};

function applyMockMutation(state, mutation) {
  if (!mutation) return state;

  if (mutation.type === 'export:add') {
    return { ...state, exports: [mutation.row, ...state.exports] };
  }

  if (mutation.type === 'screen:save') {
    const savedScreens = state.savedScreens.filter((row) => row.name !== mutation.row.name);
    return { ...state, savedScreens: [mutation.row, ...savedScreens] };
  }

  if (mutation.type === 'strategy:save') {
    const savedStrategies = state.savedStrategies.filter((row) => row.name !== mutation.row.name);
    return { ...state, savedStrategies: [mutation.row, ...savedStrategies] };
  }

  if (mutation.type === 'watchlist:add') {
    const watchlist = state.watchlist.filter((row) => row.symbol !== mutation.row.symbol);
    return { ...state, watchlist: [mutation.row, ...watchlist] };
  }

  return state;
}

export function AppActionProvider({ children }) {
  const [mockMutations, setMockMutations] = useState(initialMockMutations);
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback((nextToast) => {
    clearToastTimer();
    setToast(nextToast);

    const timeout = nextToast.tone === 'error' ? 5000 : 2500;
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, timeout);
  }, [clearToastTimer]);

  useEffect(() => clearToastTimer, [clearToastTimer]);

  const runAction = useCallback(async (action, payload = {}) => {
    setPendingAction(action);
    showToast({ tone: 'info', message: 'Working...' });

    try {
      const result = await executeAppAction(action, payload);
      if (result.download) {
        downloadFile(result.download);
      }
      setMockMutations((current) => applyMockMutation(current, result.mutation));
      showToast({ tone: 'success', message: result.message ?? 'Action completed.' });
      return result;
    } catch (error) {
      showToast({ tone: 'error', message: error.message ?? 'Action failed.' });
      throw error;
    } finally {
      setPendingAction(null);
    }
  }, [showToast]);

  const value = useMemo(
    () => ({ mockMutations, pendingAction, runAction }),
    [mockMutations, pendingAction, runAction],
  );

  return (
    <AppActionContext.Provider value={value}>
      {children}
      {toast ? (
        <div className={`app-toast ${toast.tone}`} role="status">
          {toast.message}
          <button onClick={() => { clearToastTimer(); setToast(null); }} type="button">Dismiss</button>
        </div>
      ) : null}
    </AppActionContext.Provider>
  );
}

export function useAppAction() {
  const context = useContext(AppActionContext);

  if (!context) {
    throw new Error('useAppAction must be used inside AppActionProvider.');
  }

  return context;
}
