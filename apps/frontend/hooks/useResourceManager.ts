import { useEffect, useRef, useCallback } from 'react';

interface ResourceManager {
  add: (type: 'timeout' | 'interval' | 'raf' | 'listener', id: any, cleanup?: () => void) => void;
  setTimeout: (handler: TimerHandler, timeout?: number) => number;
  setInterval: (handler: TimerHandler, timeout?: number) => number;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  addEventListener: <K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void;
  // Overload for generic EventTarget if needed, currently focusing on Window/Global mainly or passing target
  addEventListenerTo: (
      target: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
  ) => void;
  clearAll: () => void;
}

export function useResourceManager(): ResourceManager {
  const timeouts = useRef<Set<number>>(new Set());
  const intervals = useRef<Set<number>>(new Set());
  const rafs = useRef<Set<number>>(new Set());
  const listeners = useRef<Set<{ target: EventTarget; type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }>>(new Set());

  const addTimeout = useCallback((handler: TimerHandler, timeout?: number) => {
    const id = window.setTimeout(handler, timeout);
    timeouts.current.add(id);
    return id;
  }, []);

  const addInterval = useCallback((handler: TimerHandler, timeout?: number) => {
    const id = window.setInterval(handler, timeout);
    intervals.current.add(id);
    return id;
  }, []);

  const addRaf = useCallback((callback: FrameRequestCallback) => {
    const id = window.requestAnimationFrame(callback);
    rafs.current.add(id);
    return id;
  }, []);

  const addListener = useCallback(<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => {
    window.addEventListener(type, listener, options);
    listeners.current.add({ target: window, type, listener: listener as EventListener, options });
  }, []);

  const addListenerTo = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    listeners.current.add({ target, type, listener, options });
  }, []);

  const clearAll = useCallback(() => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    timeouts.current.clear();

    intervals.current.forEach((id) => window.clearInterval(id));
    intervals.current.clear();

    rafs.current.forEach((id) => window.cancelAnimationFrame(id));
    rafs.current.clear();

    listeners.current.forEach(({ target, type, listener, options }) => {
        target.removeEventListener(type, listener, options);
    });
    listeners.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    add: () => {}, // Placeholder if standard interface needed
    setTimeout: addTimeout,
    setInterval: addInterval,
    requestAnimationFrame: addRaf,
    addEventListener: addListener,
    addEventListenerTo: addListenerTo,
    clearAll
  };
}
